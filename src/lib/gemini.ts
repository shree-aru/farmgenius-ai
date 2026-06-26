/**
 * Gemini API Integration for Crop Disease Diagnosis
 * FUTMINNA 2026 Hackathon — FarmGenius AI
 */

export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
export const GEMINI_MODEL = 'gemini-1.5-flash';

export interface DiagnosisResult {
  diseaseName: string;
  confidence: number;
  severity: 'critical' | 'moderate' | 'low';
  description: string;
  treatment: string[];
  prevention: string[];
}

const DIAGNOSIS_PROMPT = `You are Dr. CropGenius, an expert agricultural diagnostician with 30+ years of experience identifying crop diseases across West Africa, with special expertise in Nigerian farming conditions. Your task is to analyze crop images and provide accurate, actionable diagnoses.

Analyze the provided crop image carefully. Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks, no extra text):

{
  "diseaseName": "Full common name of the disease (or 'Healthy Plant' if no disease)",
  "confidence": 92,
  "severity": "moderate",
  "description": "2-3 sentences describing what this disease is, its causal agent (fungus/bacterium/virus), and how it affects crop yield in Nigerian growing conditions.",
  "treatment": [
    "Step 1: Immediate action (e.g., remove infected leaves)",
    "Step 2: Chemical or organic treatment with specific product names where possible",
    "Step 3: Application instructions and timing"
  ],
  "prevention": [
    "Prevention tip 1: Cultural practice to avoid recurrence",
    "Prevention tip 2: Monitoring or maintenance advice"
  ]
}

RULES:
- "severity" MUST be exactly one of: "critical", "moderate", or "low"
- "confidence" MUST be a number between 50 and 100
- Focus on diseases common in Nigeria: Cassava Mosaic Disease, Maize Streak Virus, Tomato Blight, Yam Rot, Rice Blast, Cocoa Black Pod, Groundnut Rosette, etc.
- If the plant appears healthy, set diseaseName to "Healthy Plant", confidence above 90, severity "low"
- Treatment should be practical and affordable for smallholder farmers
- Include specific, actionable advice — not generic platitudes
- Respond with ONLY the JSON object, nothing else before or after`;

/**
 * Analyze a crop image using the Gemini API.
 * @param imageBase64 — Base64-encoded image data (may include data URI prefix)
 * @returns Structured diagnosis result
 */
export async function analyzeCropImage(imageBase64: string): Promise<DiagnosisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new GeminiError(
      'Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.',
      'MISSING_API_KEY'
    );
  }

  // Strip data URI prefix if present
  const base64Data = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  const response = await fetch(
    `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: DIAGNOSIS_PROMPT },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.15,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new GeminiError(
      `Gemini API request failed (${response.status}): ${errorBody}`,
      'API_ERROR',
      response.status
    );
  }

  const data = (await response.json()) as GeminiApiResponse;

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new GeminiError('No response candidates from Gemini API', 'EMPTY_RESPONSE');
  }

  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    throw new GeminiError(
      `Gemini generation stopped: ${candidate.finishReason}`,
      'GENERATION_STOPPED'
    );
  }

  const text = candidate.content?.parts?.[0]?.text;
  if (!text) {
    throw new GeminiError('Empty text in Gemini response', 'EMPTY_TEXT');
  }

  return parseDiagnosisJson(text);
}

/**
 * Parse the JSON response from Gemini, handling various wrapping formats.
 */
function parseDiagnosisJson(text: string): DiagnosisResult {
  let cleanText = text.trim();

  // Remove markdown code block wrappers if present
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText
      .replace(/^```json\s*/, '')
      .replace(/\s*```\s*$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText
      .replace(/^```\s*/, '')
      .replace(/\s*```\s*$/, '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanText);
  } catch {
    // Try extracting JSON object from surrounding text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new GeminiError(
          'Failed to parse Gemini response as JSON',
          'PARSE_ERROR'
        );
      }
    } else {
      throw new GeminiError(
        'Failed to parse Gemini response as JSON',
        'PARSE_ERROR'
      );
    }
  }

  // Validate and normalize the parsed result
  const result = parsed as Partial<DiagnosisResult>;

  if (!result.diseaseName || typeof result.diseaseName !== 'string') {
    throw new GeminiError('Invalid response: missing diseaseName', 'VALIDATION_ERROR');
  }

  const normalized: DiagnosisResult = {
    diseaseName: result.diseaseName,
    confidence: clampNumber(result.confidence, 50, 100),
    severity: normalizeSeverity(result.severity),
    description: result.description || 'No description available.',
    treatment: Array.isArray(result.treatment) ? result.treatment : ['Consult a local agricultural extension officer.'],
    prevention: Array.isArray(result.prevention) ? result.prevention : ['Monitor crops regularly for early signs of disease.'],
  };

  return normalized;
}

function clampNumber(value: unknown, min: number, max: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return 85;
  return Math.max(min, Math.min(max, num));
}

function normalizeSeverity(value: unknown): 'critical' | 'moderate' | 'low' {
  const str = String(value).toLowerCase().trim();
  if (str === 'critical' || str === 'high' || str === 'severe') return 'critical';
  if (str === 'moderate' || str === 'medium') return 'moderate';
  return 'low';
}

// ─── Error Class ─────────────────────────────────────────────────────────────

export class GeminiError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ─── Type Definitions ────────────────────────────────────────────────────────

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

// ─── Demo Data (for hackathon presentation / fallback) ───────────────────────

export const DEMO_DIAGNOSIS: DiagnosisResult = {
  diseaseName: 'Cassava Mosaic Disease (CMD)',
  confidence: 94,
  severity: 'critical',
  description:
    'Cassava Mosaic Disease is caused by a group of geminiviruses transmitted primarily by the whitefly vector (Bemisia tabaci) and through infected stem cuttings. In Nigerian growing conditions, CMD can cause yield losses of 20–95% depending on the variety and infection timing. The virus interferes with chlorophyll production, leading to the characteristic mosaic pattern on leaves, stunted growth, and severely reduced root tuber formation.',
  treatment: [
    'Step 1: Immediately uproot and destroy severely infected plants (burn or bury deeply) to prevent spread to healthy plants.',
    'Step 2: Apply imidacloprid-based insecticide (e.g., Confidor) to control whitefly vectors — spray early morning or late evening.',
    'Step 3: For mildly affected plants, prune infected leaves and apply a foliar feed rich in nitrogen and potassium to boost plant vigor.',
  ],
  prevention: [
    'Plant CMD-resistant varieties like TMS 30572, NR 8082, or Poundgyam developed by IITA for Nigerian conditions.',
    'Use certified disease-free stem cuttings from reputable sources; never plant cuttings from visibly infected plants.',
    'Establish plantings during periods of low whitefly population (early rainy season) and maintain 5m spacing between fields.',
  ],
};

export const DEMO_HISTORY: ScanHistoryItem[] = [
  {
    id: 'scan-001',
    image: '/img-crop-scan.jpg',
    diseaseName: 'Cassava Mosaic Disease',
    confidence: 94,
    severity: 'critical',
    date: '2026-01-15',
  },
  {
    id: 'scan-002',
    image: '/img-crop-scan.jpg',
    diseaseName: 'Maize Streak Virus',
    confidence: 88,
    severity: 'moderate',
    date: '2026-01-10',
  },
  {
    id: 'scan-003',
    image: '/img-crop-scan.jpg',
    diseaseName: 'Tomato Early Blight',
    confidence: 91,
    severity: 'moderate',
    date: '2026-01-05',
  },
  {
    id: 'scan-004',
    image: '/img-crop-scan.jpg',
    diseaseName: 'Healthy Plant',
    confidence: 97,
    severity: 'low',
    date: '2025-12-28',
  },
];

export interface ScanHistoryItem {
  id: string;
  image: string;
  diseaseName: string;
  confidence: number;
  severity: 'critical' | 'moderate' | 'low';
  date: string;
}
