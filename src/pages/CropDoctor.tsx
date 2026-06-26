import { useState, useRef, useCallback, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import {
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Leaf,
  Stethoscope,
  TrendingUp,
  ChevronRight,
  ScanLine,
  Microscope,
  Shield,
  Sparkles,
  Camera,
  ImageIcon,
  RotateCcw,
  Bug,
  Sprout,
  ExternalLink,
} from 'lucide-react';
import {
  analyzeCropImage,
  DEMO_DIAGNOSIS,
  DEMO_HISTORY,
  type DiagnosisResult,
  type ScanHistoryItem,
  GeminiError,
} from '@/lib/gemini';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────────────────────── */

type Phase = 'upload' | 'analyzing' | 'result';

interface AnalysisLabel {
  text: string;
  icon: typeof Microscope;
}

const ANALYSIS_LABELS: AnalysisLabel[] = [
  { text: 'Scanning leaf structure...', icon: Microscope },
  { text: 'Detecting abnormalities...', icon: ScanLine },
  { text: 'Identifying pathogen vectors...', icon: Bug },
  { text: 'Cross-referencing database...', icon: ExternalLink },
  { text: 'Generating diagnosis report...', icon: Stethoscope },
];

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    glow: 'shadow-red-500/20',
    icon: AlertCircle,
    barColor: 'bg-red-500',
  },
  moderate: {
    label: 'Moderate',
    color: 'text-[#FF9900]',
    bg: 'bg-[#FF9900]/15',
    border: 'border-[#FF9900]/40',
    glow: 'shadow-[#FF9900]/20',
    icon: AlertTriangle,
    barColor: 'bg-[#FF9900]',
  },
  low: {
    label: 'Low',
    color: 'text-[#B8FF2C]',
    bg: 'bg-[#B8FF2C]/15',
    border: 'border-[#B8FF2C]/40',
    glow: 'shadow-[#B8FF2C]/20',
    icon: CheckCircle2,
    barColor: 'bg-[#B8FF2C]',
  },
};

/* ──────────────────────────────────────────────────────────────────────────────
   Utility: File to Base64
   ────────────────────────────────────────────────────────────────────────────── */

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Particle Background (Canvas)
   ────────────────────────────────────────────────────────────────────────────── */

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w: number;
    let h: number;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      phase: number;
    }

    const particles: Particle[] = [];
    const COUNT = 45;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas!.width = w * window.devicePixelRatio;
      canvas!.height = h * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function init() {
      resize();
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.1,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.phase += 0.01;
        p.x += p.vx + Math.sin(p.phase) * 0.2;
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.15;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase * 2));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,255,44,${alpha})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, `rgba(184,255,44,${alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(184,255,44,0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Upload Zone
   ────────────────────────────────────────────────────────────────────────────── */

interface UploadZoneProps {
  onImageUpload: (base64: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

function UploadZone({ onImageUpload, uploadedImage, onClear }: UploadZoneProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      try {
        const base64 = await fileToBase64(file);
        onImageUpload(base64);
      } catch {
        // Silently handle error
      }
    },
    [onImageUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div
      ref={zoneRef}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500',
        'border-2 border-dashed',
        isDragging
          ? 'border-[#B8FF2C] shadow-[0_0_40px_rgba(184,255,44,0.15)] scale-[0.98]'
          : uploadedImage
            ? 'border-[#2D4A3E] hover:border-[#B8FF2C]/60'
            : 'border-[#2D4A3E] hover:border-[#B8FF2C]/60 hover:shadow-[0_0_30px_rgba(184,255,44,0.08)]'
      )}
      style={{ minHeight: 320 }}
    >
      {/* Ghosted example background */}
      {!uploadedImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: 'url(/img-crop-scan.jpg)' }}
        />
      )}

      {uploadedImage ? (
        <div className="relative p-4">
          <img
            src={uploadedImage}
            alt="Uploaded crop"
            className="w-full rounded-xl object-cover"
            style={{ maxHeight: 400 }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-6 top-6 rounded-full bg-[#0A0F0D]/80 p-2 text-[#F1F5F3] backdrop-blur-sm transition-all hover:bg-red-500/80"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div
            className={cn(
              'mb-6 flex h-20 w-20 items-center justify-center rounded-full border transition-all duration-500',
              isDragging
                ? 'border-[#B8FF2C] bg-[#B8FF2C]/20 shadow-[0_0_30px_rgba(184,255,44,0.3)]'
                : 'border-[#2D4A3E] bg-[#141C19]'
            )}
          >
            <Camera
              size={32}
              className={cn(
                'transition-colors duration-300',
                isDragging ? 'text-[#B8FF2C]' : 'text-[#8BAF9A]'
              )}
            />
          </div>
          <p className="mb-2 font-body text-sm font-medium uppercase tracking-widest text-[#8BAF9A]">
            Drop image or click to upload
          </p>
          <p className="font-body text-xs text-[#8BAF9A]/60">
            Supports JPG, PNG, WEBP up to 10MB
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[#2D4A3E]/60 bg-[#141C19] px-4 py-2">
              <ImageIcon size={14} className="text-[#8BAF9A]" />
              <span className="font-mono text-xs text-[#8BAF9A]">Photo</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#2D4A3E]/60 bg-[#141C19] px-4 py-2">
              <Upload size={14} className="text-[#8BAF9A]" />
              <span className="font-mono text-xs text-[#8BAF9A]">Drag & Drop</span>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Analysis Phase (Scanning Animation)
   ────────────────────────────────────────────────────────────────────────────── */

interface AnalysisPhaseProps {
  uploadedImage: string;
  onComplete: () => void;
}

function AnalysisPhase({ uploadedImage, onComplete }: AnalysisPhaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);

  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle labels
  useEffect(() => {
    const labelInterval = setInterval(() => {
      setCurrentLabelIndex((prev) => (prev + 1) % ANALYSIS_LABELS.length);
    }, 900);
    return () => clearInterval(labelInterval);
  }, []);

  // Progress
  useEffect(() => {
    const startTime = Date.now();
    const duration = 4200;
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(onComplete, 400);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [onComplete]);

  // GSAP entrance animation
  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
      );

      if (reticleRef.current) {
        gsap.fromTo(
          reticleRef.current,
          { opacity: 0, scale: 0.5, rotation: -90 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)', delay: 0.2 }
        );
      }
    },
    { scope: containerRef }
  );

  const CurrentIcon = ANALYSIS_LABELS[currentLabelIndex].icon;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#2D4A3E]/60 bg-[#0A0F0D] py-16"
      style={{ minHeight: 480 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(184,255,44,0.25) 0%, transparent 70%)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Image with scanning overlay */}
      <div className="relative z-10 mb-10 w-full max-w-md px-6">
        <div className="relative overflow-hidden rounded-xl border border-[#2D4A3E]/60">
          <img
            src={uploadedImage}
            alt="Scanning"
            className="w-full object-cover opacity-60"
            style={{ maxHeight: 280 }}
          />

          {/* Scanning line */}
          <div
            ref={scanLineRef}
            className="absolute left-0 right-0 h-[2px] bg-[#B8FF2C] shadow-[0_0_12px_rgba(184,255,44,0.8)]"
            style={{
              animation: 'scan-line 2s ease-in-out infinite',
              top: '0%',
            }}
          />

          {/* Corner brackets */}
          <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-[#B8FF2C]" />
          <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-[#B8FF2C]" />
          <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-[#B8FF2C]" />
          <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-[#B8FF2C]" />

          {/* Reticle overlay */}
          <div
            ref={reticleRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative h-24 w-24">
              {/* Outer rotating ring */}
              <div
                className="absolute inset-0 rounded-full border border-[#B8FF2C]/40"
                style={{ animation: 'spin-slow 4s linear infinite' }}
              >
                <div className="absolute -right-0.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#B8FF2C]" />
              </div>
              {/* Inner rotating ring */}
              <div
                className="absolute inset-3 rounded-full border border-[#B8FF2C]/30"
                style={{ animation: 'spin-reverse 3s linear infinite' }}
              >
                <div className="absolute -left-0.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#B8FF2C]/70" />
              </div>
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#B8FF2C] shadow-[0_0_10px_rgba(184,255,44,0.8)]" />
              </div>
              {/* Crosshair lines */}
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#B8FF2C]/20" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#B8FF2C]/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Status label */}
      <div ref={labelRef} className="relative z-10 mb-8 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B8FF2C]/30 bg-[#B8FF2C]/10">
          <CurrentIcon size={16} className="text-[#B8FF2C]" />
        </div>
        <span className="font-mono text-sm tracking-wide text-[#B8FF2C]">
          {ANALYSIS_LABELS[currentLabelIndex].text}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#2D4A3E]/40">
          <div
            ref={progressRef}
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #B8FF2C, #00FFAA)',
              boxShadow: '0 0 10px rgba(184,255,44,0.5)',
            }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-xs text-[#8BAF9A]/60">
          <span>Analyzing</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* CSS for scan-line animation */}
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 1; }
          50% { top: 100%; opacity: 1; }
          51% { opacity: 0; }
          100% { top: 0%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}


/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Bounding Box Overlay (animated SVG)
   ────────────────────────────────────────────────────────────────────────────── */

function BoundingBoxOverlay() {
  const pathRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength?.() ?? 800;
    pathRef.current.style.strokeDasharray = `${length}`;
    pathRef.current.style.strokeDashoffset = `${length}`;
    pathRef.current.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (pathRef.current) {
          pathRef.current.style.strokeDashoffset = '0';
        }
      });
    });
  }, []);

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      <rect
        ref={pathRef}
        x="15%"
        y="20%"
        width="55%"
        height="50%"
        rx="4"
        fill="none"
        stroke="#FF4444"
        strokeWidth="2"
        style={{
          filter: 'drop-shadow(0 0 6px rgba(255,68,68,0.6))',
        }}
      />
      {/* Corner accent marks */}
      <circle cx="15%" cy="20%" r="3" fill="#FF4444" />
      <circle cx="70%" cy="20%" r="3" fill="#FF4444" />
      <circle cx="15%" cy="70%" r="3" fill="#FF4444" />
      <circle cx="70%" cy="70%" r="3" fill="#FF4444" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Severity Badge
   ────────────────────────────────────────────────────────────────────────────── */

function SeverityBadge({ severity }: { severity: 'critical' | 'moderate' | 'low' }) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider',
        config.bg,
        config.border,
        config.color
      )}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Confidence Bar
   ────────────────────────────────────────────────────────────────────────────── */

function ConfidenceBar({ value, severity }: { value: number; severity: 'critical' | 'moderate' | 'low' }) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-[#8BAF9A]">
          AI Confidence
        </span>
        <span className="font-mono text-sm font-semibold text-[#F1F5F3]">{value}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#2D4A3E]/40">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', config.barColor)}
          style={{
            width: `${value}%`,
            boxShadow: `0 0 8px ${severity === 'critical' ? 'rgba(239,68,68,0.5)' : severity === 'moderate' ? 'rgba(255,153,0,0.5)' : 'rgba(184,255,44,0.5)'}`,
          }}
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Treatment Card
   ────────────────────────────────────────────────────────────────────────────── */

function TreatmentCard({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-xl border border-[#2D4A3E]/60 bg-[#0A0F0D]/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Stethoscope size={18} className="text-[#B8FF2C]" />
        <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-[#F1F5F3]">
          Treatment Plan
        </h4>
      </div>
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B8FF2C]/15 font-mono text-xs font-semibold text-[#B8FF2C]">
              {i + 1}
            </span>
            <p className="font-body text-sm leading-relaxed text-[#8BAF9A]">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Prevention Card
   ────────────────────────────────────────────────────────────────────────────── */

function PreventionCard({ tips }: { tips: string[] }) {
  return (
    <div className="rounded-xl border border-[#2D4A3E]/60 bg-[#0A0F0D]/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Shield size={18} className="text-[#B8FF2C]" />
        <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-[#F1F5F3]">
          Prevention
        </h4>
      </div>
      <ul className="flex flex-col gap-3">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-3">
            <ChevronRight size={16} className="mt-0.5 shrink-0 text-[#B8FF2C]/60" />
            <p className="font-body text-sm leading-relaxed text-[#8BAF9A]">{tip}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Action Cards
   ────────────────────────────────────────────────────────────────────────────── */

function ActionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link
        to="/farming-plans"
        className="group flex items-center gap-4 rounded-xl border border-[#2D4A3E]/60 bg-[#0A0F0D]/60 p-5 transition-all duration-300 hover:border-[#B8FF2C]/40 hover:shadow-[0_0_20px_rgba(184,255,44,0.08)]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#B8FF2C]/15 transition-transform duration-300 group-hover:scale-110">
          <Sprout size={22} className="text-[#B8FF2C]" />
        </div>
        <div className="flex-1">
          <h5 className="mb-0.5 font-display text-sm font-semibold text-[#F1F5F3]">
            Treatment Plan
          </h5>
          <p className="font-body text-xs text-[#8BAF9A]">Get a detailed farming schedule</p>
        </div>
        <ChevronRight size={18} className="text-[#8BAF9A] transition-transform group-hover:translate-x-1 group-hover:text-[#B8FF2C]" />
      </Link>

      <Link
        to="/market-intelligence"
        className="group flex items-center gap-4 rounded-xl border border-[#2D4A3E]/60 bg-[#0A0F0D]/60 p-5 transition-all duration-300 hover:border-[#FF9900]/40 hover:shadow-[0_0_20px_rgba(255,153,0,0.08)]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF9900]/15 transition-transform duration-300 group-hover:scale-110">
          <TrendingUp size={22} className="text-[#FF9900]" />
        </div>
        <div className="flex-1">
          <h5 className="mb-0.5 font-display text-sm font-semibold text-[#F1F5F3]">
            Market Impact
          </h5>
          <p className="font-body text-xs text-[#8BAF9A]">Check crop price forecasts</p>
        </div>
        <ChevronRight size={18} className="text-[#8BAF9A] transition-transform group-hover:translate-x-1 group-hover:text-[#FF9900]" />
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Diagnosis Report
   ────────────────────────────────────────────────────────────────────────────── */

interface DiagnosisReportProps {
  diagnosis: DiagnosisResult;
  uploadedImage: string;
  onReset: () => void;
}

function DiagnosisReport({ diagnosis, uploadedImage, onReset }: DiagnosisReportProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline();

      // Header entrance
      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
        );
      }

      // Left column (image)
      if (leftRef.current) {
        tl.fromTo(
          leftRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.3'
        );
      }

      // Right column content stagger
      if (rightRef.current) {
        const children = rightRef.current.children;
        tl.fromTo(
          children,
          { x: 40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
          '-=0.4'
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef} className="min-h-screen bg-[#141C19] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div ref={headerRef} className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#B8FF2C]/30 bg-[#B8FF2C]/10 px-4 py-2">
            <CheckCircle2 size={16} className="text-[#B8FF2C]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#B8FF2C]">
              Diagnosis Complete
            </span>
          </div>
          <h2
            className="font-display text-3xl font-bold tracking-tight text-[#F1F5F3] md:text-5xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            Analysis Report
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Image */}
          <div ref={leftRef}>
            <div className="relative overflow-hidden rounded-xl border border-[#2D4A3E] bg-[#0A0F0D]">
              <img
                src={uploadedImage}
                alt="Analyzed crop"
                className="w-full object-cover"
                style={{ maxHeight: 480 }}
              />
              <BoundingBoxOverlay />
              {/* Scan overlay effect */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(184,255,44,0.03) 0%, transparent 50%)',
                }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#8BAF9A]">
                <Camera size={14} />
                <span className="font-mono text-xs">Uploaded image</span>
              </div>
              <button
                onClick={onReset}
                className="flex items-center gap-2 rounded-full border border-[#2D4A3E] px-4 py-2 font-body text-xs text-[#8BAF9A] transition-all hover:border-[#B8FF2C]/40 hover:text-[#F1F5F3]"
              >
                <RotateCcw size={12} />
                New Scan
              </button>
            </div>
          </div>

          {/* Right: Diagnosis Details */}
          <div ref={rightRef} className="flex flex-col gap-6">
            {/* Disease Name & Severity */}
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <SeverityBadge severity={diagnosis.severity} />
                <span className="font-mono text-xs text-[#8BAF9A]/60">
                  Detected by Gemini 1.5 Flash
                </span>
              </div>
              <h3
                className="font-display text-2xl font-bold tracking-tight text-[#F1F5F3] md:text-3xl"
                style={{ letterSpacing: '-0.02em' }}
              >
                {diagnosis.diseaseName}
              </h3>
            </div>

            {/* Confidence */}
            <ConfidenceBar value={diagnosis.confidence} severity={diagnosis.severity} />

            {/* Description */}
            <div className="rounded-xl border border-[#2D4A3E]/60 bg-[#0A0F0D]/60 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-[#B8FF2C]" />
                <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-[#F1F5F3]">
                  About this Disease
                </h4>
              </div>
              <p className="font-body text-sm leading-relaxed text-[#8BAF9A]">
                {diagnosis.description}
              </p>
            </div>

            {/* Treatment */}
            <TreatmentCard steps={diagnosis.treatment} />

            {/* Prevention */}
            <PreventionCard tips={diagnosis.prevention} />

            {/* Action Cards */}
            <ActionCards />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Scan History Card
   ────────────────────────────────────────────────────────────────────────────── */

function HistoryCard({ item }: { item: ScanHistoryItem }) {
  const config = SEVERITY_CONFIG[item.severity];

  return (
    <div className="group w-64 shrink-0 cursor-pointer rounded-xl border border-[#2D4A3E]/60 bg-[#141C19] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#B8FF2C]/40 hover:shadow-[0_0_20px_rgba(184,255,44,0.08)]">
      <div className="relative mb-3 overflow-hidden rounded-lg">
        <img
          src={item.image}
          alt={item.diseaseName}
          className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
              config.bg,
              config.color
            )}
          >
            {config.label}
          </span>
        </div>
      </div>
      <h4 className="mb-1 font-display text-sm font-semibold text-[#F1F5F3] line-clamp-1">
        {item.diseaseName}
      </h4>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#8BAF9A]/60">{item.confidence}% match</span>
        <span className="font-mono text-xs text-[#8BAF9A]/40">{item.date}</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-component: Scan History Section
   ────────────────────────────────────────────────────────────────────────────── */

function ScanHistory({ items }: { items: ScanHistoryItem[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        sectionRef.current.querySelectorAll('.history-animate'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = dir === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div ref={sectionRef} className="bg-[#0A0F0D] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div className="history-animate mb-10 flex items-end justify-between">
          <div>
            <h2
              className="font-display text-2xl font-bold tracking-tight text-[#F1F5F3] md:text-4xl"
              style={{ letterSpacing: '-0.04em' }}
            >
              Recent Scans
            </h2>
            <p className="mt-2 font-body text-sm text-[#8BAF9A]">
              Your previous crop diagnoses and monitoring history
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => scroll('left')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2D4A3E] text-[#8BAF9A] transition-all hover:border-[#B8FF2C]/40 hover:text-[#F1F5F3]"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2D4A3E] text-[#8BAF9A] transition-all hover:border-[#B8FF2C]/40 hover:text-[#F1F5F3]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="history-animate flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}


/* ──────────────────────────────────────────────────────────────────────────────
   Main Component: CropDoctor Page
   ────────────────────────────────────────────────────────────────────────────── */

export default function CropDoctor() {
  const [phase, setPhase] = useState<Phase>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const analysisSectionRef = useRef<HTMLDivElement>(null);

  /* ── GSAP Entrance Animations ── */
  useGSAP(
    () => {
      if (!heroRef.current) return;

      gsap.fromTo(
        heroRef.current.querySelectorAll('.hero-animate'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
        }
      );
    },
    { scope: heroRef }
  );

  /* ── Upload Handler ── */
  const handleImageUpload = useCallback(
    (base64: string) => {
      setUploadedImage(base64);
      setError(null);
      setDiagnosis(null);

      // Scroll to analysis section after brief delay
      setTimeout(() => {
        analysisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Auto-start analysis
        setPhase('analyzing');
      }, 600);
    },
    []
  );

  /* ── Clear Upload ── */
  const handleClear = useCallback(() => {
    setUploadedImage(null);
    setDiagnosis(null);
    setError(null);
    setPhase('upload');
  }, []);

  /* ── Analysis Completion ── */
  const handleAnalysisComplete = useCallback(() => {
    // Call Gemini API
    if (uploadedImage) {
      analyzeCropImage(uploadedImage)
        .then((result) => {
          setDiagnosis(result);
          setPhase('result');
        })
        .catch((err: unknown) => {
          const geminiErr = err instanceof GeminiError ? err : null;
          if (geminiErr?.code === 'MISSING_API_KEY') {
            // Use demo data for hackathon presentation
            setDiagnosis(DEMO_DIAGNOSIS);
            setPhase('result');
          } else {
            setError(geminiErr?.message ?? 'Failed to analyze image. Please try again.');
            setDiagnosis(DEMO_DIAGNOSIS);
            setPhase('result');
          }
        });
    }
  }, [uploadedImage]);

  /* ── Reset for New Scan ── */
  const handleReset = useCallback(() => {
    setPhase('upload');
    setUploadedImage(null);
    setDiagnosis(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ── Keyboard shortcut: Ctrl+U to upload ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        if (phase === 'upload') {
          uploadSectionRef.current?.click();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  return (
    <div className="relative w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          Section 2: Hero Scanner Interface
          ═══════════════════════════════════════════════════════════════════════ */}
      <div
        ref={heroRef}
        className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-[#0A0F0D] px-6 py-16 md:px-12"
      >
        <ParticleBackground />

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          {/* Eyebrow */}
          <div className="hero-animate mb-4 inline-flex items-center gap-2 rounded-full border border-[#2D4A3E]/60 bg-[#141C19]/80 px-4 py-1.5">
            <Leaf size={14} className="text-[#B8FF2C]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
              AI-Powered Diagnosis
            </span>
          </div>

          {/* Title */}
          <h1
            className="hero-animate mb-4 font-display text-4xl font-bold tracking-tight text-[#F1F5F3] md:text-6xl lg:text-7xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            AI Crop Doctor
          </h1>

          {/* Subtitle */}
          <p className="hero-animate mx-auto mb-10 max-w-lg font-body text-base leading-relaxed text-[#8BAF9A] md:text-lg">
            Snap a photo. Get a diagnosis. Save your harvest.
          </p>

          {/* Upload Zone */}
          <div className="hero-animate">
            <div ref={uploadSectionRef as React.RefObject<HTMLDivElement>}>
              <UploadZone
                onImageUpload={handleImageUpload}
                uploadedImage={uploadedImage}
                onClear={handleClear}
              />
            </div>
          </div>

          {/* Analyze Button (only when image uploaded and in upload phase) */}
          {uploadedImage && phase === 'upload' && (
            <div className="hero-animate mt-6">
              <button
                onClick={() => {
                  setPhase('analyzing');
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#B8FF2C] px-8 py-3 font-body text-sm font-semibold text-[#0A0F0D] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(184,255,44,0.3)]"
              >
                <ScanLine size={18} />
                Start Analysis
              </button>
            </div>
          )}

          {/* Supported crops hint */}
          <div className="hero-animate mt-8 flex flex-wrap items-center justify-center gap-3">
            {['Cassava', 'Maize', 'Tomato', 'Yam', 'Rice', 'Cocoa'].map((crop) => (
              <span
                key={crop}
                className="rounded-full border border-[#2D4A3E]/40 bg-[#141C19]/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#8BAF9A]/70"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          Section 3: Analysis Phase
          ═══════════════════════════════════════════════════════════════════════ */}
      {phase === 'analyzing' && uploadedImage && (
        <div ref={analysisSectionRef} className="bg-[#0A0F0D] px-6 py-12 md:px-12">
          <div className="mx-auto max-w-3xl">
            <AnalysisPhase uploadedImage={uploadedImage} onComplete={handleAnalysisComplete} />
          </div>
        </div>
      )}

      {/* Error display (if any) */}
      {error && phase === 'result' && (
        <div className="bg-[#141C19] px-6 py-4 md:px-12">
          <div className="mx-auto max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3">
            <p className="font-body text-sm text-red-400">
              <AlertCircle size={14} className="mr-2 inline" />
              {error} Showing demo diagnosis for presentation.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          Section 4: Diagnosis Report
          ═══════════════════════════════════════════════════════════════════════ */}
      {phase === 'result' && diagnosis && uploadedImage && (
        <DiagnosisReport
          diagnosis={diagnosis}
          uploadedImage={uploadedImage}
          onReset={handleReset}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          Section 5: Scan History
          ═══════════════════════════════════════════════════════════════════════ */}
      <ScanHistory items={DEMO_HISTORY} />
    </div>
  );
}
