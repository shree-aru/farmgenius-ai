import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Sprout,
  Tractor,
  Scissors,
  FlaskConical,
  Shield,
  Wheat,
  TrendingUp,
  Flower2,
  ArrowUp,
  Timer,
  Heart,
  MapPin,
  Cloud,
  CloudRain,
  Sun,
  CloudLightning,
  Droplets,
  ChevronDown,
  Loader2,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { FarmingPlan, TimelineActivity, SoilData, WeatherDay } from '@/lib/gemini-farming';
import { generateFarmingPlan } from '@/lib/gemini-farming';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Icon map for timeline activities                                   */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  Sprout,
  Tractor,
  Scissors,
  FlaskConical,
  Shield,
  Wheat,
  TrendingUp,
  Flower2,
  ArrowUp,
  Timer,
  Heart,
  MapPin,
};

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const CROPS = ['Cassava', 'Maize', 'Rice', 'Yam', 'Tomato', 'Cocoa', 'Groundnut', 'Sorghum'];
const SOIL_TYPES = ['Loamy', 'Sandy', 'Clay', 'Silt'];
const SEASONS = ['Rainy Season', 'Dry Season'];
const NIGERIAN_STATES = [
  'Niger', 'Kaduna', 'Oyo', 'Benue', 'Kano', 'Lagos', 'Ogun', 'Osun',
  'Ekiti', 'Ondo', 'Edo', 'Delta', 'Anambra', 'Enugu', 'Imo', 'Abia',
  'Cross River', 'Akwa Ibom', 'Rivers', 'Bayelsa', 'Plateau', 'Nasarawa',
  'Kogi', 'Kwara', 'Sokoto', 'Zamfara', 'Kebbi', 'Borno', 'Yobe',
  'Adamawa', 'Taraba', 'Gombe', 'Bauchi', 'Jigawa', 'Katsina', 'FCT',
];

/* ------------------------------------------------------------------ */
/*  Weather Icon Helper                                                 */
/* ------------------------------------------------------------------ */
function getWeatherIcon(condition: string, size = 20) {
  if (condition.includes('Thunder')) return <CloudLightning size={size} />;
  if (condition.includes('Rain') || condition.includes('Drizzle')) return <CloudRain size={size} />;
  if (condition.includes('Overcast') || condition.includes('Cloud')) return <Cloud size={size} />;
  return <Sun size={size} />;
}

/* ------------------------------------------------------------------ */
/*  NPK Radial Chart Component (CSS conic-gradient)                    */
/* ------------------------------------------------------------------ */
function NPKRadial({ label, value, color }: { label: string; value: number; color: string }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#2D4A3E"
            strokeWidth="8"
          />
          {/* Value arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
              transition: 'stroke-dashoffset 1.5s ease-out',
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-display text-2xl font-bold text-[#F1F5F3]">{value}%</span>
        </div>
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  pH Indicator Component                                              */
/* ------------------------------------------------------------------ */
function PHIndicator({ ph }: { ph: number }) {
  const getColor = () => {
    if (ph < 5.5) return '#FF6B35';
    if (ph < 6.5) return '#B8FF2C';
    if (ph < 7.5) return '#00FFAA';
    return '#FF9900';
  };

  const getLabel = () => {
    if (ph < 5.5) return 'Acidic';
    if (ph < 6.5) return 'Slightly Acidic';
    if (ph < 7.5) return 'Neutral';
    return 'Alkaline';
  };

  const pct = Math.min(Math.max(((ph - 4) / 5) * 100, 0), 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-32 w-6 items-end rounded-full bg-[#2D4A3E] p-1">
        <div
          className="w-full rounded-full transition-all duration-1000 ease-out"
          style={{
            height: `${pct}%`,
            backgroundColor: getColor(),
            boxShadow: `0 0 12px ${getColor()}60`,
          }}
        />
      </div>
      <span className="font-display text-xl font-bold text-[#F1F5F3]">{ph}</span>
      <span className="font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">{getLabel()}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Soil Health Card                                                    */
/* ------------------------------------------------------------------ */
function SoilHealthCard({ soil }: { soil: SoilData }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.soil-chart', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
      gsap.from('.soil-rec', {
        x: -30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="min-h-[60vh] bg-[#141C19] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
        <h3
          className="mb-4 font-display text-3xl font-bold tracking-tight text-[#F1F5F3] md:text-4xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          Soil Composition
        </h3>
        <p className="mb-12 max-w-xl font-body text-[#8BAF9A]">
          AI analysis of your soil profile with personalized recommendations for nutrient management.
        </p>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          {/* NPK Radials */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <div className="soil-chart">
              <NPKRadial label="Nitrogen (N)" value={soil.nitrogen} color="#B8FF2C" />
            </div>
            <div className="soil-chart">
              <NPKRadial label="Phosphorus (P)" value={soil.phosphorus} color="#00FFAA" />
            </div>
            <div className="soil-chart">
              <NPKRadial label="Potassium (K)" value={soil.potassium} color="#FF9900" />
            </div>
          </div>

          {/* pH */}
          <div className="soil-chart flex flex-col items-center">
            <PHIndicator ph={soil.ph} />
          </div>

          {/* Recommendations */}
          <div className="flex-1 lg:max-w-md">
            <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
              AI Recommendations
            </h4>
            <div className="flex flex-col gap-3">
              {soil.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="soil-rec flex items-start gap-3 rounded-xl border border-[#2D4A3E]/40 bg-[#0A0F0D]/60 p-4"
                >
                  <Info size={16} className="mt-0.5 shrink-0 text-[#B8FF2C]" />
                  <p className="font-body text-sm leading-relaxed text-[#F1F5F3]/90">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Soil texture badge */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2D4A3E]/40 bg-[#0A0F0D]/60 px-6 py-3">
            <Sprout size={16} className="text-[#B8FF2C]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
              Soil Texture:
            </span>
            <span className="font-display text-sm font-semibold text-[#F1F5F3]">{soil.texture}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Weather Section                                                     */
/* ------------------------------------------------------------------ */
function WeatherSection({ weather }: { weather: WeatherDay[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.weather-card', {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="relative h-auto min-h-[400px] overflow-hidden bg-[#0A0F0D] py-16 md:py-24">
      {/* Rain/wind particle effect overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <WeatherParticles />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
        <h3
          className="mb-4 font-display text-3xl font-bold tracking-tight text-[#F1F5F3] md:text-4xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          Weather Forecast
        </h3>
        <p className="mb-10 max-w-xl font-body text-[#8BAF9A]">
          5-day forecast with AI-powered farming advisories for your location.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {weather.map((day, i) => (
            <div
              key={i}
              className="weather-card flex flex-col gap-4 rounded-xl border border-[#2D4A3E]/40 bg-white/[0.03] p-5 backdrop-blur-md transition-all duration-300 hover:border-[#B8FF2C]/30 hover:bg-white/[0.06]"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
                {day.day}
              </span>

              <div className="flex items-center gap-2 text-[#F1F5F3]">
                {getWeatherIcon(day.condition, 24)}
                <span className="font-display text-2xl font-bold">{day.temp}°C</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#8BAF9A]">
                  <Droplets size={14} />
                  <span className="font-body text-xs">{day.humidity}% humidity</span>
                </div>
                <div className="flex items-center gap-2 text-[#8BAF9A]">
                  <CloudRain size={14} />
                  <span className="font-body text-xs">{day.rainProb}% rain</span>
                </div>
              </div>

              <div className="rounded-lg border border-[#2D4A3E]/30 bg-[#0A0F0D]/50 p-3">
                <p className="font-body text-xs leading-relaxed text-[#F1F5F3]/80">{day.advisory}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Weather Particles (rain/wind simulation)                            */
/* ------------------------------------------------------------------ */
function WeatherParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        speed: 3 + Math.random() * 5,
        length: 10 + Math.random() * 20,
        opacity: 0.15 + Math.random() * 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1, p.y + p.length);
        ctx.strokeStyle = `rgba(139, 175, 154, ${p.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        p.y += p.speed;
        p.x -= 0.3;

        if (p.y > h()) {
          p.y = -p.length;
          p.x = Math.random() * w();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline Component                                                  */
/* ------------------------------------------------------------------ */
function SeasonTimeline({ timeline }: { timeline: TimelineActivity[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Stagger cards in
      gsap.from('.timeline-card', {
        y: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      // Animate connecting line
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Glowing nodes
      gsap.from('.timeline-node', {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="min-h-[80vh] bg-[#0A0F0D] py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-12 lg:px-24">
        <h3
          className="mb-4 font-display text-3xl font-bold tracking-tight text-[#F1F5F3] md:text-4xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          Season Timeline
        </h3>
        <p className="mb-16 max-w-xl font-body text-[#8BAF9A]">
          Your week-by-week farming guide from planting to harvest.
        </p>

        <div className="relative">
          {/* Vertical connecting line */}
          <div
            ref={lineRef}
            className="absolute left-4 top-0 hidden h-full w-[2px] origin-top md:left-1/2 md:-translate-x-1/2 md:border-l-2 md:border-dashed md:border-[#2D4A3E]"
            style={{ background: 'repeating-linear-gradient(to bottom, #2D4A3E 0px, #2D4A3E 8px, transparent 8px, transparent 16px)' }}
          />

          <div className="flex flex-col gap-12">
            {timeline.map((activity, i) => {
              const Icon = iconMap[activity.icon] || Sprout;
              const isLeft = i % 2 === 0;

              return (
                <div
                  key={i}
                  className={cn(
                    'timeline-card relative flex items-start gap-6 md:gap-0',
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  )}
                >
                  {/* Card */}
                  <div className={cn('flex-1 md:w-[45%]', isLeft ? 'md:pr-12' : 'md:pl-12')}>
                    <div
                      className={[
                        'rounded-xl border p-6 transition-all duration-300',
                        'border-[#2D4A3E]/40 bg-[#141C19] hover:border-[#B8FF2C]/40',
                        i === 0 ? 'border-[#B8FF2C]/60 shadow-[inset_0_0_30px_rgba(184,255,44,0.05)]' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B8FF2C]/10">
                          <Icon size={18} className="text-[#B8FF2C]" />
                        </div>
                        <div>
                          <h4 className="font-display text-lg font-semibold text-[#F1F5F3]">
                            {activity.phase}
                          </h4>
                          <span className="font-mono text-xs text-[#8BAF9A]">
                            {activity.startDate} — {activity.endDate}
                          </span>
                        </div>
                      </div>

                      <p className="mb-3 font-body text-sm leading-relaxed text-[#8BAF9A]">
                        {activity.description}
                      </p>

                      <ul className="flex flex-col gap-1.5">
                        {activity.details.map((detail, j) => (
                          <li key={j} className="flex items-start gap-2 font-body text-xs text-[#F1F5F3]/80">
                            <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-[#B8FF2C]/70" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Center node */}
                  <div className="timeline-node absolute left-4 top-6 z-10 hidden h-4 w-4 rounded-full bg-[#B8FF2C] shadow-[0_0_15px_#B8FF2C] md:left-1/2 md:block md:-translate-x-1/2" />

                  {/* Spacer for alternating layout */}
                  <div className="hidden flex-1 md:block md:w-[45%]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data Particles Canvas (right panel / background effect)            */
/* ------------------------------------------------------------------ */
const DataParticlesCanvas = ({ intensity }: { intensity: 'idle' | 'active' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      baseX: number;
      baseY: number;
    }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * w();
      const y = Math.random() * h();
      particles.push({
        x, y, baseX: x, baseY: y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.5,
      });
    }

    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, w(), h());

      const isActive = intensity === 'active';
      const speed = isActive ? 3 : 1;

      particles.forEach((p) => {
        // Sine wave motion
        p.x = p.baseX + Math.sin(time + p.baseY * 0.01) * 30 * speed;
        p.y = p.baseY + Math.cos(time + p.baseX * 0.01) * 20 * speed;
        p.baseY -= p.vy * speed;

        if (p.baseY < -10) {
          p.baseY = h() + 10;
          p.baseX = Math.random() * w();
        }

        const color = isActive ? '184, 255, 44' : '139, 175, 154';
        const op = isActive ? p.opacity * 1.5 : p.opacity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${Math.min(op, 1)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                 */
/* ------------------------------------------------------------------ */
export default function FarmingPlans() {
  const [crop, setCrop] = useState('');
  const [farmSize, setFarmSize] = useState(5);
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('');
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<FarmingPlan | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const heroRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  /* GSAP entrance animations */
  useGSAP(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
      gsap.from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.15,
        ease: 'power3.out',
      });
      gsap.from('.form-field', {
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        delay: 0.3,
        ease: 'power3.out',
      });
    }, heroRef);
    return () => ctx.revert();
  }, { scope: heroRef });

  /* Scroll to results when plan is generated */
  useEffect(() => {
    if (plan && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [plan]);

  const validate = useCallback(() => {
    const newErrors: Record<string, boolean> = {};
    if (!crop) newErrors.crop = true;
    if (!location) newErrors.location = true;
    if (!soilType) newErrors.soilType = true;
    if (!season) newErrors.season = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [crop, location, soilType, season]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await generateFarmingPlan({
        crop,
        farmSize,
        location,
        soilType,
        season,
      });
      setPlan(result);
    } catch {
      // Error handled silently — demo data used as fallback
    } finally {
      setLoading(false);
    }
  }, [crop, farmSize, location, soilType, season, validate]);

  return (
    <div className="w-full">
      {/* ========== Section 2: Plan Generator ========== */}
      <div
        ref={heroRef}
        className="relative flex min-h-[100dvh] flex-col lg:flex-row"
      >
        {/* Left Panel — Form */}
        <div className="relative z-10 flex w-full flex-col justify-center bg-[#141C19] px-6 py-16 md:px-12 lg:w-[40%] lg:p-12">
          <h2
            className="hero-title mb-2 font-display text-4xl font-bold tracking-tight text-[#F1F5F3] md:text-5xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            Build Your Season
          </h2>
          <p className="hero-subtitle mb-10 max-w-sm font-body text-[#8BAF9A]">
            Tell us about your farm and we will generate a complete crop calendar powered by AI.
          </p>

          <div className="flex flex-col gap-5">
            {/* Crop */}
            <div className="form-field">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
                Select Crop
              </label>
              <div className="relative">
                <select
                  value={crop}
                  onChange={(e) => { setCrop(e.target.value); setErrors((p) => ({ ...p, crop: false })); }}
                  className={cn(
                    'w-full appearance-none rounded-xl border bg-[#0A0F0D] px-4 py-3 font-body text-sm text-[#F1F5F3] outline-none transition-all',
                    errors.crop
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-[#2D4A3E]/40 focus:border-[#B8FF2C]/60'
                  )}
                >
                  <option value="">Choose a crop...</option>
                  {CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8BAF9A]" />
              </div>
              {errors.crop && (
                <span className="mt-1 flex items-center gap-1 font-body text-xs text-red-400">
                  <AlertTriangle size={12} /> Please select a crop
                </span>
              )}
            </div>

            {/* Location */}
            <div className="form-field">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
                Location (State)
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: false })); }}
                  className={cn(
                    'w-full appearance-none rounded-xl border bg-[#0A0F0D] px-4 py-3 font-body text-sm text-[#F1F5F3] outline-none transition-all',
                    errors.location
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-[#2D4A3E]/40 focus:border-[#B8FF2C]/60'
                  )}
                >
                  <option value="">Select your state...</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8BAF9A]" />
              </div>
              {errors.location && (
                <span className="mt-1 flex items-center gap-1 font-body text-xs text-red-400">
                  <AlertTriangle size={12} /> Please select a location
                </span>
              )}
            </div>

            {/* Soil Type */}
            <div className="form-field">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
                Soil Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SOIL_TYPES.map((soil) => (
                  <button
                    key={soil}
                    onClick={() => { setSoilType(soil); setErrors((p) => ({ ...p, soilType: false })); }}
                    className={cn(
                      'rounded-xl border px-4 py-3 font-body text-sm transition-all duration-200',
                      soilType === soil
                        ? 'border-[#B8FF2C]/60 bg-[#B8FF2C]/10 text-[#B8FF2C]'
                        : 'border-[#2D4A3E]/40 bg-[#0A0F0D] text-[#8BAF9A] hover:border-[#2D4A3E]'
                    )}
                  >
                    {soil}
                  </button>
                ))}
              </div>
              {errors.soilType && (
                <span className="mt-1 flex items-center gap-1 font-body text-xs text-red-400">
                  <AlertTriangle size={12} /> Please select a soil type
                </span>
              )}
            </div>

            {/* Season */}
            <div className="form-field">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
                Season
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SEASONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSeason(s); setErrors((p) => ({ ...p, season: false })); }}
                    className={cn(
                      'rounded-xl border px-4 py-3 font-body text-sm transition-all duration-200',
                      season === s
                        ? 'border-[#B8FF2C]/60 bg-[#B8FF2C]/10 text-[#B8FF2C]'
                        : 'border-[#2D4A3E]/40 bg-[#0A0F0D] text-[#8BAF9A] hover:border-[#2D4A3E]'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.season && (
                <span className="mt-1 flex items-center gap-1 font-body text-xs text-red-400">
                  <AlertTriangle size={12} /> Please select a season
                </span>
              )}
            </div>

            {/* Farm Size Slider */}
            <div className="form-field">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
                Farm Size: <span className="text-[#B8FF2C]">{farmSize} acres</span>
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={farmSize}
                onChange={(e) => setFarmSize(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#B8FF2C]"
                style={{
                  background: `linear-gradient(to right, #B8FF2C 0%, #B8FF2C ${(farmSize / 50) * 100}%, #2D4A3E ${(farmSize / 50) * 100}%, #2D4A3E 100%)`,
                  height: '6px',
                  borderRadius: '999px',
                  appearance: 'none',
                }}
              />
              <div className="mt-1 flex justify-between font-mono text-xs text-[#8BAF9A]">
                <span>1 acre</span>
                <span>50 acres</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="form-field mt-4 flex items-center justify-center gap-2 rounded-full bg-[#B8FF2C] px-8 py-4 font-body text-sm font-semibold text-[#0A0F0D] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(184,255,44,0.3)] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <ClipboardList size={18} />
                  Generate Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel — Results / Data Particles */}
        <div className="relative flex min-h-[400px] w-full items-center justify-center bg-[#0A0F0D] lg:w-[60%] lg:min-h-0">
          <DataParticlesCanvas intensity={loading ? 'active' : 'idle'} />

          <div className="relative z-10 px-6 text-center">
            {!plan && !loading && (
              <>
                <Sprout size={48} className="mx-auto mb-4 text-[#2D4A3E]" />
                <p className="font-display text-xl font-semibold text-[#2D4A3E]">
                  Your plan will appear here
                </p>
                <p className="mt-2 max-w-xs font-body text-sm text-[#2D4A3E]/60">
                  Fill out the form to generate a personalized AI farming calendar
                </p>
              </>
            )}

            {loading && (
              <div className="flex flex-col items-center">
                <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#2D4A3E] border-t-[#B8FF2C] shadow-[0_0_20px_rgba(184,255,44,0.3)]" />
                <p className="font-display text-lg font-semibold text-[#B8FF2C]">
                  Analyzing your farm data...
                </p>
                <p className="mt-1 font-body text-sm text-[#8BAF9A]">
                  Building your personalized crop calendar
                </p>
              </div>
            )}

            {plan && !loading && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B8FF2C]/10">
                  <CheckCircle2 size={32} className="text-[#B8FF2C]" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#F1F5F3]">
                  Plan Ready
                </h3>
                <p className="max-w-sm font-body text-sm text-[#8BAF9A]">
                  {plan.summary}
                </p>
                <button
                  onClick={() => resultRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-2 rounded-full border border-[#B8FF2C]/40 px-6 py-2 font-body text-sm text-[#B8FF2C] transition-all hover:bg-[#B8FF2C]/10"
                >
                  View Timeline
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== Results Sections ========== */}
      {plan && (
        <div ref={resultRef}>
          {/* Section 3: Season Timeline */}
          <SeasonTimeline timeline={plan.timeline} />

          {/* Section 4: Soil Health */}
          <SoilHealthCard soil={plan.soil} />

          {/* Section 5: Weather */}
          <WeatherSection weather={plan.weather} />

          {/* Summary CTA */}
          <div className="bg-[#141C19] py-16 md:py-24">
            <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
              <Wheat size={32} className="mx-auto mb-4 text-[#B8FF2C]" />
              <h3 className="mb-3 font-display text-2xl font-bold text-[#F1F5F3] md:text-3xl">
                Ready to Start Farming?
              </h3>
              <p className="mb-6 font-body text-[#8BAF9A]">
                Follow your AI-generated plan week by week. Save or print this calendar to take it to the field.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => {
                    setPlan(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-full bg-[#B8FF2C] px-8 py-3 font-body text-sm font-semibold text-[#0A0F0D] transition-transform hover:scale-105"
                >
                  Generate New Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
