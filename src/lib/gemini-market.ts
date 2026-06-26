/**
 * Gemini-powered market insights for agricultural crops.
 * Falls back to realistic mock data when API key is unavailable.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

export interface MarketInsight {
  crop: string;
  insight: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  recommendation: string;
}

export interface DemandForecast {
  month: string;
  historical: number;
  forecast: number;
  confidenceLow: number;
  confidenceHigh: number;
}

const MOCK_INSIGHTS: Record<string, MarketInsight> = {
  Cassava: {
    crop: 'Cassava',
    insight: 'Processing demand from flour mills is rising ahead of the festive season. Prices expected to remain firm with 5-7% upside potential.',
    trend: 'up',
    confidence: 0.87,
    recommendation: 'Hold inventory for 2 more weeks before selling to large processors.',
  },
  Maize: {
    crop: 'Maize',
    insight: 'Poultry feed demand is driving consistent buying. Supply from northern regions remains steady but warehouse reserves are declining.',
    trend: 'up',
    confidence: 0.82,
    recommendation: 'Sell 60% now, reserve 40% for mid-month price rally.',
  },
  Rice: {
    crop: 'Rice',
    insight: 'Import parity pricing is creating downward pressure on local paddy. Millers are offering lower prices due to high carry-over stock.',
    trend: 'down',
    confidence: 0.79,
    recommendation: 'Sell immediately if storage costs are high; prices may soften further.',
  },
  Yam: {
    crop: 'Yam',
    insight: 'Early harvest volumes from Benue and Niger states are lower than expected. Strong export demand to UK and US diaspora markets.',
    trend: 'up',
    confidence: 0.91,
    recommendation: 'Excellent time to sell. Export premiums are 15-20% above local prices.',
  },
  Tomato: {
    crop: 'Tomato',
    insight: 'Harmattan season approaching in the North will reduce supply. Current glut from wet season harvest is temporary.',
    trend: 'stable',
    confidence: 0.75,
    recommendation: 'Process into paste or dried form if storage is available. Fresh prices will recover in 3 weeks.',
  },
  Cocoa: {
    crop: 'Cocoa',
    insight: 'Global cocoa deficit and Cote d\'Ivoire supply issues are driving record prices. Nigerian cocoa is attracting premium bids.',
    trend: 'up',
    confidence: 0.94,
    recommendation: 'Delay sales if possible. Prices could reach N5,200/kg by next month.',
  },
  Groundnut: {
    crop: 'Groundnut',
    insight: 'Oil mill demand consistent. Kano and Borno markets showing strong offtake. Export demand to Asian markets increasing.',
    trend: 'up',
    confidence: 0.84,
    recommendation: 'Grade and bag properly for export market access. Premiums available for aflatoxin-tested lots.',
  },
  Sorghum: {
    crop: 'Sorghum',
    insight: 'Brewery demand stable. Competitive pricing vs maize in feed rations supporting prices. Supply adequate for current demand.',
    trend: 'stable',
    confidence: 0.71,
    recommendation: 'Sell as needed; no major price movement expected in near term.',
  },
  Millet: {
    crop: 'Millet',
    insight: 'Steady demand from traditional food processors and breweries. Limited price volatility expected.',
    trend: 'stable',
    confidence: 0.68,
    recommendation: 'Good liquidity; sell when cash flow is needed.',
  },
  Beans: {
    crop: 'Beans',
    insight: 'Cowpea supply from Borno and Yobe is ample. Import competition from neighboring markets is limiting price growth.',
    trend: 'down',
    confidence: 0.77,
    recommendation: 'Aggregate into larger lots for better bargaining power with wholesalers.',
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateMockForecast(crop: string): DemandForecast[] {
  const baseDemand: Record<string, number> = {
    Cassava: 850, Maize: 1200, Rice: 1500, Yam: 600, Tomato: 900,
    Cocoa: 400, Groundnut: 700, Sorghum: 550, Millet: 500, Beans: 800,
  };
  const base = baseDemand[crop] || 700;
  const now = new Date();
  const forecasts: DemandForecast[] = [];

  for (let i = -3; i <= 3; i++) {
    const monthIdx = (now.getMonth() + i + 12) % 12;
    const variation = Math.sin((monthIdx / 12) * Math.PI * 2) * 0.15;
    const randomFactor = 0.9 + Math.random() * 0.2;
    const forecast = Math.round(base * (1 + variation) * randomFactor);

    forecasts.push({
      month: MONTHS[monthIdx],
      historical: i <= 0 ? Math.round(forecast * (0.95 + Math.random() * 0.1)) : 0,
      forecast: i >= 0 ? forecast : 0,
      confidenceLow: Math.round(forecast * 0.88),
      confidenceHigh: Math.round(forecast * 1.12),
    });
  }

  return forecasts;
}

/**
 * Get AI-powered market insight for a specific crop.
 * Attempts Gemini API call, falls back to realistic mock data.
 */
export async function getMarketInsights(crop: string): Promise<MarketInsight> {
  const normalizedCrop = crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();

  if (!GEMINI_API_KEY) {
    return MOCK_INSIGHTS[normalizedCrop] || MOCK_INSIGHTS.Cassava;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As an agricultural market analyst focused on Nigerian markets, provide a brief market insight for ${normalizedCrop}. 
            Include: trend direction (up/down/stable), confidence level (0-1), a 2-sentence insight, and a one-sentence recommendation.
            Return ONLY valid JSON with keys: crop, trend, confidence, insight, recommendation.`
          }]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
      }),
    });

    if (!response.ok) throw new Error('Gemini API error');

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from possible markdown code block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        crop: normalizedCrop,
        insight: parsed.insight || MOCK_INSIGHTS[normalizedCrop]?.insight || '',
        trend: (parsed.trend as 'up' | 'down' | 'stable') || 'stable',
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.8)),
        recommendation: parsed.recommendation || MOCK_INSIGHTS[normalizedCrop]?.recommendation || '',
      };
    }

    throw new Error('Failed to parse Gemini response');
  } catch {
    return MOCK_INSIGHTS[normalizedCrop] || MOCK_INSIGHTS.Cassava;
  }
}

/**
 * Get demand forecast data for charting.
 */
export async function getDemandForecast(crop: string): Promise<DemandForecast[]> {
  if (!GEMINI_API_KEY) {
    return generateMockForecast(crop);
  }

  // In a real implementation, this would call Gemini for structured forecast data
  // For now, return generated mock data that looks realistic
  return generateMockForecast(crop);
}

/**
 * Get all AI insights for the sidebar panel.
 */
export async function getAllMarketInsights(): Promise<MarketInsight[]> {
  const crops = Object.keys(MOCK_INSIGHTS);
  const insights = await Promise.all(crops.map(c => getMarketInsights(c)));
  return insights;
}
