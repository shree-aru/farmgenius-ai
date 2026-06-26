import { useRef, useEffect, useState, useCallback, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  Brain,
  AlertTriangle,
  Globe,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { getMarketInsights, getDemandForecast } from '@/lib/gemini-market';
import type { MarketInsight, DemandForecast } from '@/lib/gemini-market';

gsap.registerPlugin(ScrollTrigger);

/* Inline marquee keyframes — not modifying global CSS */
const marqueeStyles = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 30s linear infinite;
  }
`;

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

interface CropData {
  name: string;
  price: number;
  change: number;
  unit: string;
  category: 'Tubers' | 'Grains' | 'Vegetables' | 'Cash Crops';
  sparkline: number[];
}

const CROPS: CropData[] = [
  { name: 'Cassava', price: 450, change: 5.2, unit: '/kg', category: 'Tubers', sparkline: [420, 430, 425, 440, 445, 450, 450] },
  { name: 'Maize', price: 850, change: 3.1, unit: '/kg', category: 'Grains', sparkline: [800, 810, 825, 830, 840, 845, 850] },
  { name: 'Rice', price: 1200, change: -1.5, unit: '/kg', category: 'Grains', sparkline: [1250, 1240, 1230, 1220, 1210, 1205, 1200] },
  { name: 'Yam', price: 600, change: 8.7, unit: '/kg', category: 'Tubers', sparkline: [540, 550, 555, 565, 580, 590, 600] },
  { name: 'Tomato', price: 750, change: -4.2, unit: '/kg', category: 'Vegetables', sparkline: [800, 790, 780, 770, 765, 760, 750] },
  { name: 'Cocoa', price: 4500, change: 12.3, unit: '/kg', category: 'Cash Crops', sparkline: [3900, 4000, 4050, 4150, 4250, 4400, 4500] },
  { name: 'Groundnut', price: 900, change: 2.8, unit: '/kg', category: 'Cash Crops', sparkline: [860, 870, 875, 880, 885, 890, 900] },
  { name: 'Sorghum', price: 700, change: 1.9, unit: '/kg', category: 'Grains', sparkline: [680, 685, 688, 690, 692, 695, 700] },
  { name: 'Millet', price: 650, change: 0.5, unit: '/kg', category: 'Grains', sparkline: [645, 646, 647, 648, 648, 649, 650] },
  { name: 'Beans', price: 1100, change: -2.1, unit: '/kg', category: 'Grains', sparkline: [1150, 1140, 1130, 1125, 1120, 1110, 1100] },
];

const CATEGORIES = ['All', 'Tubers', 'Grains', 'Vegetables', 'Cash Crops'] as const;

interface NaijaState {
  name: string;
  abbr: string;
  path: string;
  cx: number;
  cy: number;
  crops: string[];
  priceIndex: number;
}

const NIGERIA_STATES: NaijaState[] = [
  { name: 'Borno', abbr: 'BO', path: 'M520,80 L580,80 L590,130 L570,160 L520,150 Z', cx: 550, cy: 115, crops: ['Beans', 'Millet', 'Groundnut'], priceIndex: 92 },
  { name: 'Kano', abbr: 'KN', path: 'M340,140 L400,140 L410,190 L380,210 L340,200 Z', cx: 375, cy: 175, crops: ['Groundnut', 'Maize', 'Sorghum'], priceIndex: 88 },
  { name: 'Kaduna', abbr: 'KD', path: 'M320,200 L390,200 L400,250 L370,270 L320,260 Z', cx: 360, cy: 235, crops: ['Maize', 'Sorghum', 'Yam'], priceIndex: 95 },
  { name: 'Niger', abbr: 'NG', path: 'M260,250 L340,250 L350,310 L320,340 L260,320 Z', cx: 305, cy: 295, crops: ['Cassava', 'Yam', 'Rice'], priceIndex: 90 },
  { name: 'Benue', abbr: 'BE', path: 'M380,320 L450,320 L460,370 L420,390 L380,370 Z', cx: 420, cy: 355, crops: ['Yam', 'Cassava', 'Sorghum'], priceIndex: 85 },
  { name: 'Taraba', abbr: 'TA', path: 'M480,280 L540,280 L550,340 L520,360 L480,340 Z', cx: 515, cy: 320, crops: ['Rice', 'Maize', 'Cassava'], priceIndex: 87 },
  { name: 'Cross River', abbr: 'CR', path: 'M400,420 L450,420 L460,470 L430,480 L400,460 Z', cx: 430, cy: 450, crops: ['Cocoa', 'Palm Oil', 'Yam'], priceIndex: 105 },
  { name: 'Oyo', abbr: 'OY', path: 'M200,360 L270,360 L280,410 L250,430 L200,410 Z', cx: 240, cy: 395, crops: ['Cassava', 'Maize', 'Yam'], priceIndex: 98 },
  { name: 'Ogun', abbr: 'OG', path: 'M260,400 L320,400 L330,440 L300,460 L260,440 Z', cx: 295, cy: 430, crops: ['Rice', 'Cassava', 'Palm Oil'], priceIndex: 102 },
  { name: 'Lagos', abbr: 'LA', path: 'M240,450 L280,450 L285,480 L265,490 L240,480 Z', cx: 262, cy: 470, crops: ['Imported Rice', 'Frozen Fish', 'Vegetables'], priceIndex: 115 },
  { name: 'Anambra', abbr: 'AN', path: 'M380,410 L430,410 L440,450 L410,460 L380,440 Z', cx: 410, cy: 435, crops: ['Rice', 'Cassava', 'Yam'], priceIndex: 93 },
  { name: 'Katsina', abbr: 'KT', path: 'M300,100 L350,100 L360,150 L340,170 L300,160 Z', cx: 330, cy: 135, crops: ['Groundnut', 'Millet', 'Sorghum'], priceIndex: 86 },
];

/* ------------------------------------------------------------------ */
/*  SPARKLINE COMPONENT (Canvas)                                       */
/* ------------------------------------------------------------------ */

const Sparkline = memo(function Sparkline({
  data,
  color,
  width = 120,
  height = 40,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 4;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // gradient fill below
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    // hex to rgba helper
    const hexToRgba = (hex: string, a: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    };
    grad.addColorStop(0, hexToRgba(color, 0.15));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
  }, [data, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
    />
  );
});

/* ------------------------------------------------------------------ */
/*  MINI SPARKLINE (simpler, for cards)                                */
/* ------------------------------------------------------------------ */

const MiniSparkline = memo(function MiniSparkline({
  data,
  isPositive,
}: {
  data: number[];
  isPositive: boolean;
}) {
  const color = isPositive ? '#B8FF2C' : '#FF0055';
  return <Sparkline data={data} color={color} width={100} height={32} />;
});

/* ------------------------------------------------------------------ */
/*  DATA PARTICLES BACKGROUND (Canvas)                                 */
/* ------------------------------------------------------------------ */

const DataParticles = memo(function DataParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    const particles: {
      x: number;
      y: number;
      baseX: number;
      amp: number;
      freq: number;
      speed: number;
      phase: number;
      size: number;
      color: string;
    }[] = [];

    const COLORS = ['#FF9900', '#FF0055', '#B8FF2C'];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = canvas!.offsetWidth;
      h = canvas!.offsetHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles.length = 0;
      const count = Math.min(80, Math.floor((w * h) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          baseX: Math.random() * w,
          amp: 20 + Math.random() * 60,
          freq: 0.005 + Math.random() * 0.01,
          speed: 0.2 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          size: 1.5 + Math.random() * 2.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x = p.baseX + Math.sin(time * p.freq + p.phase) * p.amp;
        p.y += p.speed;
        if (p.y > h + 10) p.y = -10;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = 0.6;
        ctx!.fill();
      });
      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    animId = requestAnimationFrame(draw);

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animId);
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
});

/* ------------------------------------------------------------------ */
/*  LIVE PRICE TICKER                                                  */
/* ------------------------------------------------------------------ */

const LivePriceTicker = memo(function LivePriceTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!tickerRef.current) return;
    gsap.from(tickerRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.4,
    });
  });

  const doubled = [...CROPS, ...CROPS];

  return (
    <div
      ref={tickerRef}
      className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-[#2D4A3E]/40 bg-[#0A0F0D]/80 py-3"
    >
      <div className="ticker-track flex w-max animate-marquee hover:[animation-play-state:paused]">
        {doubled.map((crop, i) => (
          <div
            key={`${crop.name}-${i}`}
            className="mx-6 flex items-center gap-2 whitespace-nowrap"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
              {crop.name}
            </span>
            <span className="font-mono text-sm font-semibold text-[#F1F5F3]">
              NGN {crop.price.toLocaleString()}
              {crop.unit}
            </span>
            {crop.change >= 0 ? (
              <span className="flex items-center gap-0.5 font-mono text-xs font-medium text-[#B8FF2C]">
                <ArrowUpRight size={12} /> {crop.change}%
              </span>
            ) : (
              <span className="flex items-center gap-0.5 font-mono text-xs font-medium text-[#FF0055]">
                <ArrowDownRight size={12} /> {Math.abs(crop.change)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  FORECAST CHART (Canvas)                                            */
/* ------------------------------------------------------------------ */

function ForecastChart({ cropName }: { cropName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: DemandForecast } | null>(null);
  const [forecast, setForecast] = useState<DemandForecast[]>([]);
  const animProgressRef = useRef(0);

  useEffect(() => {
    getDemandForecast(cropName).then(setForecast);
  }, [cropName]);

  useEffect(() => {
    if (forecast.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(progress: number) {
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const pad = { top: 30, right: 30, bottom: 50, left: 60 };
      const chartW = w - pad.left - pad.right;
      const chartH = h - pad.top - pad.bottom;

      ctx!.clearRect(0, 0, w, h);

      // grid lines
      ctx!.strokeStyle = '#2D4A3E';
      ctx!.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (chartH / 4) * i;
        ctx!.beginPath();
        ctx!.moveTo(pad.left, y);
        ctx!.lineTo(pad.left + chartW, y);
        ctx!.stroke();
      }

      // vertical grid
      const allMonths = forecast.map((f) => f.month);
      allMonths.forEach((_, i) => {
        const x = pad.left + (i / (allMonths.length - 1)) * chartW;
        ctx!.beginPath();
        ctx!.moveTo(x, pad.top);
        ctx!.lineTo(x, pad.top + chartH);
        ctx!.stroke();
      });

      const allVals = forecast.flatMap((f) => [f.historical || f.forecast, f.confidenceLow, f.confidenceHigh]);
      const minVal = Math.min(...allVals) * 0.9;
      const maxVal = Math.max(...allVals) * 1.1;
      const range = maxVal - minVal;

      function valY(v: number) {
        return pad.top + chartH - ((v - minVal) / range) * chartH;
      }
      function idxX(i: number) {
        return pad.left + (i / (forecast.length - 1)) * chartW;
      }

      // confidence band
      ctx!.beginPath();
      forecast.forEach((f, i) => {
        const x = idxX(i);
        const y = valY(f.confidenceHigh);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      });
      for (let i = forecast.length - 1; i >= 0; i--) {
        const x = idxX(i);
        const y = valY(forecast[i].confidenceLow);
        ctx!.lineTo(x, y);
      }
      ctx!.closePath();
      ctx!.fillStyle = 'rgba(184, 255, 44, 0.08)';
      ctx!.fill();

      // historical line
      const histPoints = forecast.filter((f) => f.historical > 0);
      if (histPoints.length > 0) {
        ctx!.beginPath();
        ctx!.strokeStyle = '#8BAF9A';
        ctx!.lineWidth = 2;
        histPoints.forEach((f, idx) => {
          const globalIdx = forecast.indexOf(f);
          const x = idxX(globalIdx);
          const y = valY(f.historical);
          const easedProgress = Math.min(1, progress * 1.5);
          const drawX = pad.left + (x - pad.left) * Math.min(1, easedProgress * (forecast.length / histPoints.length));
          if (idx === 0) ctx!.moveTo(drawX, y);
          else ctx!.lineTo(drawX, y);
        });
        ctx!.stroke();
      }

      // forecast line
      const forePoints = forecast.filter((f) => f.forecast > 0);
      if (forePoints.length > 0) {
        ctx!.beginPath();
        ctx!.strokeStyle = '#B8FF2C';
        ctx!.lineWidth = 2.5;
        forePoints.forEach((f, idx) => {
          const globalIdx = forecast.indexOf(f);
          const x = idxX(globalIdx);
          const y = valY(f.forecast);
          const segmentProgress = (progress - 0.3) / 0.7;
          const easedProgress = Math.max(0, Math.min(1, segmentProgress));
          const drawX = pad.left + (x - pad.left) * easedProgress;
          if (idx === 0) ctx!.moveTo(drawX, y);
          else ctx!.lineTo(drawX, y);
        });
        ctx!.stroke();

        // neon glow
        ctx!.beginPath();
        ctx!.strokeStyle = 'rgba(184, 255, 44, 0.3)';
        ctx!.lineWidth = 8;
        forePoints.forEach((f, idx) => {
          const globalIdx = forecast.indexOf(f);
          const x = idxX(globalIdx);
          const y = valY(f.forecast);
          const segmentProgress = (progress - 0.3) / 0.7;
          const easedProgress = Math.max(0, Math.min(1, segmentProgress));
          const drawX = pad.left + (x - pad.left) * easedProgress;
          if (idx === 0) ctx!.moveTo(drawX, y);
          else ctx!.lineTo(drawX, y);
        });
        ctx!.stroke();
      }

      // axis labels
      ctx!.fillStyle = '#8BAF9A';
      ctx!.font = '11px "JetBrains Mono", monospace';
      ctx!.textAlign = 'center';
      forecast.forEach((f, i) => {
        ctx!.fillText(f.month, idxX(i), pad.top + chartH + 20);
      });

      // y-axis labels
      ctx!.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = minVal + (range / 4) * (4 - i);
        ctx!.fillText(`${(val / 1000).toFixed(1)}k`, pad.left - 10, pad.top + (chartH / 4) * i + 4);
      }

      // legend
      ctx!.textAlign = 'left';
      ctx!.font = '12px "Inter", sans-serif';

      // Historical
      ctx!.fillStyle = '#8BAF9A';
      ctx!.fillRect(pad.left, 8, 16, 3);
      ctx!.fillText('Historical', pad.left + 22, 14);

      // Forecast
      ctx!.fillStyle = '#B8FF2C';
      ctx!.fillRect(pad.left + 100, 8, 16, 3);
      ctx!.fillText('AI Forecast', pad.left + 122, 14);

      // Confidence
      ctx!.fillStyle = 'rgba(184, 255, 44, 0.4)';
      ctx!.fillRect(pad.left + 210, 6, 16, 8);
      ctx!.fillStyle = '#8BAF9A';
      ctx!.fillText('Confidence', pad.left + 232, 14);
    }

    // animate draw-on-load
    animProgressRef.current = 0;
    function animate() {
      animProgressRef.current += 0.015;
      if (animProgressRef.current > 1) animProgressRef.current = 1;
      draw(animProgressRef.current);
      if (animProgressRef.current < 1) {
        animId = requestAnimationFrame(animate);
      }
    }

    resize();
    animate();

    const onResize = () => {
      resize();
      draw(1);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [forecast]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || forecast.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const pad = { top: 30, right: 30, bottom: 50, left: 60 };
      const chartW = rect.width - pad.left - pad.right;
      const chartH = rect.height - pad.top - pad.bottom;

      // find nearest month index
      const rawIdx = ((mx - pad.left) / chartW) * (forecast.length - 1);
      const idx = Math.round(rawIdx);
      if (idx < 0 || idx >= forecast.length) {
        setTooltip(null);
        return;
      }

      const x = pad.left + (idx / (forecast.length - 1)) * chartW;
      if (Math.abs(mx - x) < 30 && my >= pad.top && my <= pad.top + chartH) {
        setTooltip({ x, y: pad.top + 10, data: forecast[idx] });
      } else {
        setTooltip(null);
      }
    },
    [forecast],
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        style={{ width: '100%', height: '360px' }}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-[#2D4A3E] bg-[#141C19]/95 px-3 py-2 shadow-xl"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y,
          }}
        >
          <p className="font-mono text-xs text-[#8BAF9A]">{tooltip.data.month}</p>
          {tooltip.data.historical > 0 && (
            <p className="font-mono text-xs text-[#8BAF9A]">
              Hist: <span className="text-[#F1F5F3]">{tooltip.data.historical.toLocaleString()}</span>
            </p>
          )}
          {tooltip.data.forecast > 0 && (
            <p className="font-mono text-xs text-[#B8FF2C]">
              Fcst: <span className="font-semibold">{tooltip.data.forecast.toLocaleString()}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function MarketIntelligence() {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [selectedCrop, setSelectedCrop] = useState('Cassava');
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [hoveredState, setHoveredState] = useState<NaijaState | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);

  const filteredCrops = activeCategory === 'All'
    ? CROPS
    : CROPS.filter((c) => c.category === activeCategory);

  // load AI insight for selected crop
  useEffect(() => {
    setLoadingInsight(true);
    getMarketInsights(selectedCrop).then((data) => {
      setInsight(data);
      setLoadingInsight(false);
    });
  }, [selectedCrop]);

  // GSAP entrance animations
  useGSAP(() => {
    // Hero text
    if (heroRef.current) {
      gsap.from(heroRef.current.querySelectorAll('.hero-animate'), {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }

    // Grid cards
    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.querySelectorAll('.crop-card'),
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        },
      );
    }

    // Chart
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { y: 60, opacity: 0 },
        {
          scrollTrigger: {
            trigger: chartRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
      );
    }

    // Map
    if (mapRef.current) {
      gsap.fromTo(
        mapRef.current.querySelectorAll('.map-state'),
        { scale: 0.8, opacity: 0 },
        {
          scrollTrigger: {
            trigger: mapRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: 'back.out(1.4)',
        },
      );
    }

    // Insights panel
    if (insightsRef.current) {
      gsap.fromTo(
        insightsRef.current.querySelectorAll('.insight-card'),
        { x: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: insightsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        },
      );
    }
  });

  const handleStateHover = (state: NaijaState | null, e?: React.MouseEvent) => {
    setHoveredState(state);
    if (e) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: marqueeStyles }} />
      {/* ====== SECTION 1: HERO ====== */}
      <section
        ref={heroRef}
        className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-[#0A0F0D] px-6 md:px-12 lg:px-24"
      >
        <DataParticles />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="hero-animate mb-4 flex items-center justify-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#B8FF2C]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
              Live Market Data
            </span>
          </div>

          <h1
            className="hero-animate mb-6 font-display text-5xl font-bold leading-tight tracking-tight text-[#F1F5F3] md:text-7xl lg:text-8xl"
            style={{ letterSpacing: '-0.04em', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Market Intelligence
          </h1>

          <p className="hero-animate mx-auto max-w-2xl text-lg text-[#8BAF9A] md:text-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            Don&apos;t guess. Know. Real-time crop data for Nigerian markets.
          </p>

          <div className="hero-animate mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => gridRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full bg-[#B8FF2C] px-6 py-3 font-body text-sm font-semibold text-[#0A0F0D] transition-transform duration-200 hover:scale-105"
            >
              View Prices
            </button>
            <button
              onClick={() => chartRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border border-[#2D4A3E] px-6 py-3 font-body text-sm font-medium text-[#8BAF9A] transition-all duration-200 hover:border-[#B8FF2C]/40 hover:text-[#F1F5F3]"
            >
              AI Forecasts
            </button>
          </div>
        </div>

        <LivePriceTicker />
      </section>

      {/* ====== SECTION 2: LIVE PRICE GRID ====== */}
      <section ref={gridRef} className="min-h-[80vh] bg-[#141C19] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2
                className="mb-2 font-display text-3xl font-bold text-[#F1F5F3] md:text-4xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
              >
                Live Crop Prices
              </h2>
              <p className="font-body text-[#8BAF9A]">Real-time prices across Nigerian markets</p>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-[#B8FF2C] text-[#0A0F0D]'
                      : 'border border-[#2D4A3E] text-[#8BAF9A] hover:border-[#B8FF2C]/40 hover:text-[#F1F5F3]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Crop grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCrops.map((crop) => (
              <div
                key={crop.name}
                className="crop-card group relative overflow-hidden rounded-xl border border-[#2D4A3E]/40 bg-[#0A0F0D] p-6 transition-all duration-300 hover:border-[#B8FF2C]/40 hover:shadow-[0_0_20px_rgba(184,255,44,0.05)]"
              >
                {/* yield-glow gradient sweep on hover */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF9900]/60 to-[#FF0055]/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3
                      className="mb-1 font-display text-lg font-semibold text-[#F1F5F3]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {crop.name}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#8BAF9A]/60">
                      {crop.category}
                    </span>
                  </div>
                  <MiniSparkline data={crop.sparkline} isPositive={crop.change >= 0} />
                </div>

                <div className="mb-4">
                  <span
                    className="font-display text-3xl font-bold text-[#F1F5F3]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    N{crop.price.toLocaleString()}
                  </span>
                  <span className="ml-1 font-mono text-sm text-[#8BAF9A]">{crop.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs font-medium ${
                      crop.change >= 0
                        ? 'bg-[#B8FF2C]/10 text-[#B8FF2C]'
                        : 'bg-[#FF0055]/10 text-[#FF0055]'
                    }`}
                  >
                    {crop.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {crop.change >= 0 ? '+' : ''}
                    {crop.change}%
                  </span>

                  <button
                    onClick={() => {
                      setSelectedCrop(crop.name);
                      chartRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#8BAF9A] transition-colors duration-200 hover:text-[#B8FF2C]"
                  >
                    Details
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SECTION 3: DEMAND FORECASTING ====== */}
      <section ref={chartRef} className="bg-[#0A0F0D] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Brain size={16} className="text-[#B8FF2C]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF2C]">
                  AI Powered
                </span>
              </div>
              <h2
                className="font-display text-3xl font-bold text-[#F1F5F3] md:text-4xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
              >
                Demand Forecasting
              </h2>
              <p className="mt-2 font-body text-[#8BAF9A]">
                AI-projected demand trends for the next 3 months
              </p>
            </div>

            {/* Crop toggle */}
            <div className="flex flex-wrap gap-2">
              {CROPS.slice(0, 6).map((crop) => (
                <button
                  key={crop.name}
                  onClick={() => setSelectedCrop(crop.name)}
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all duration-200 ${
                    selectedCrop === crop.name
                      ? 'bg-[#B8FF2C] text-[#0A0F0D]'
                      : 'border border-[#2D4A3E] text-[#8BAF9A] hover:border-[#B8FF2C]/40'
                  }`}
                >
                  {crop.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-4 md:p-6">
            <ForecastChart cropName={selectedCrop} />
          </div>

          {/* AI Insight Box */}
          {loadingInsight ? (
            <div className="mt-6 rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-6">
              <div className="flex items-center gap-3">
                <div className="h-4 w-32 animate-pulse rounded bg-[#2D4A3E]" />
                <div className="h-4 w-4 animate-pulse rounded-full bg-[#2D4A3E]" />
              </div>
            </div>
          ) : insight ? (
            <div className="mt-6 rounded-xl border border-[#B8FF2C]/20 bg-gradient-to-r from-[#141C19] to-[#0A0F0D] p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B8FF2C]/10">
                  <Brain size={20} className="text-[#B8FF2C]" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF2C]">
                      AI Insight — {insight.crop}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                        insight.trend === 'up'
                          ? 'bg-[#B8FF2C]/10 text-[#B8FF2C]'
                          : insight.trend === 'down'
                            ? 'bg-[#FF0055]/10 text-[#FF0055]'
                            : 'bg-[#8BAF9A]/10 text-[#8BAF9A]'
                      }`}
                    >
                      {insight.trend === 'up' ? <TrendingUp size={10} /> : insight.trend === 'down' ? <TrendingDown size={10} /> : <Minus size={10} />}
                      {insight.trend}
                    </span>
                    <span className="font-mono text-[10px] text-[#8BAF9A]">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="mb-2 font-body text-sm leading-relaxed text-[#F1F5F3]">
                    {insight.insight}
                  </p>
                  <p className="font-mono text-xs text-[#FF9900]">
                    Recommendation: {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ====== SECTION 4: REGIONAL MAP ====== */}
      <section ref={mapRef} className="relative h-[600px] overflow-hidden bg-[#141C19] px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-[#FF9900]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#FF9900]">
                Regional Analysis
              </span>
            </div>
            <h2
              className="font-display text-3xl font-bold text-[#F1F5F3] md:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
            >
              Nigerian Market Map
            </h2>
          </div>

          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 700 550"
              className="h-auto w-full max-w-3xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(184,255,44,0.05))' }}
            >
              {/* Background glow */}
              <defs>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(184,255,44,0.05)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="700" height="550" fill="url(#mapGlow)" />

              {/* State shapes */}
              {NIGERIA_STATES.map((state) => (
                <g key={state.name}>
                  <path
                    d={state.path}
                    className="map-state cursor-pointer transition-all duration-300"
                    fill={
                      hoveredState?.name === state.name
                        ? 'rgba(184, 255, 44, 0.2)'
                        : 'rgba(45, 74, 62, 0.25)'
                    }
                    stroke={hoveredState?.name === state.name ? '#B8FF2C' : '#2D4A3E'}
                    strokeWidth={hoveredState?.name === state.name ? 2 : 1}
                    onMouseEnter={(e) => handleStateHover(state, e)}
                    onMouseMove={(e) => {
                      setMousePos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => handleStateHover(null)}
                  />
                  {/* State label */}
                  <text
                    x={state.cx}
                    y={state.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none font-mono text-[10px]"
                    fill={hoveredState?.name === state.name ? '#B8FF2C' : '#8BAF9A'}
                  >
                    {state.abbr}
                  </text>
                </g>
              ))}

              {/* Connecting lines for visual effect */}
              <g opacity="0.2">
                <line x1="375" y1="175" x2="360" y2="235" stroke="#B8FF2C" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="360" y1="235" x2="305" y2="295" stroke="#B8FF2C" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="305" y1="295" x2="420" y2="355" stroke="#B8FF2C" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="420" y1="355" x2="430" y2="450" stroke="#B8FF2C" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="375" y1="175" x2="550" y2="115" stroke="#FF9900" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="550" y1="115" x2="515" y2="320" stroke="#FF9900" strokeWidth="0.5" strokeDasharray="4 4" />
              </g>
            </svg>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredState && (
          <div
            className="pointer-events-none fixed z-50 rounded-xl border border-[#2D4A3E] bg-[#0A0F0D]/95 px-4 py-3 shadow-2xl backdrop-blur-sm"
            style={{
              left: mousePos.x + 16,
              top: mousePos.y - 20,
            }}
          >
            <h4 className="mb-1 font-display text-sm font-semibold text-[#F1F5F3]">
              {hoveredState.name} State
            </h4>
            <div className="mb-2 font-mono text-xs text-[#8BAF9A]">
              Price Index:{" "}
              <span
                className={`font-semibold ${
                  hoveredState.priceIndex >= 100 ? 'text-[#B8FF2C]' : 'text-[#FF9900]'
                }`}
              >
                {hoveredState.priceIndex}
              </span>
              {hoveredState.priceIndex >= 100 ? ' (Premium)' : ' (Discount)'}
            </div>
            <div className="flex flex-wrap gap-1">
              {hoveredState.crops.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-[#2D4A3E] px-2 py-0.5 font-mono text-[10px] text-[#8BAF9A]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ====== SECTION 5: AI INSIGHTS PANEL ====== */}
      <section ref={insightsRef} className="bg-[#0A0F0D] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Brain size={16} className="text-[#B8FF2C]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF2C]">
                AI Analysis
              </span>
            </div>
            <h2
              className="font-display text-3xl font-bold text-[#F1F5F3] md:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}
            >
              Smart Market Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Trending Up */}
            <div className="insight-card rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-5 transition-all duration-300 hover:border-[#B8FF2C]/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#B8FF2C]/10">
                <TrendingUp size={20} className="text-[#B8FF2C]" />
              </div>
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-[#F1F5F3]">
                Trending Up
              </h3>
              <ul className="space-y-3">
                {[
                  { crop: 'Cocoa', detail: '+12.3% this week', color: '#B8FF2C' },
                  { crop: 'Yam', detail: '+8.7% demand surge', color: '#B8FF2C' },
                  { crop: 'Cassava', detail: '+5.2% processing buying', color: '#B8FF2C' },
                ].map((item) => (
                  <li key={item.crop} className="flex items-center justify-between">
                    <span className="font-body text-sm text-[#F1F5F3]">{item.crop}</span>
                    <span className="font-mono text-xs" style={{ color: item.color }}>
                      {item.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Time to Sell */}
            <div className="insight-card rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-5 transition-all duration-300 hover:border-[#B8FF2C]/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF9900]/10">
                <Clock size={20} className="text-[#FF9900]" />
              </div>
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-[#F1F5F3]">
                Best Time to Sell
              </h3>
              <ul className="space-y-3">
                {[
                  { crop: 'Cocoa', detail: 'Wait 2 weeks', wait: true },
                  { crop: 'Yam', detail: 'Sell now', wait: false },
                  { crop: 'Maize', detail: 'Sell 60% now', wait: false },
                ].map((item) => (
                  <li key={item.crop} className="flex items-center justify-between">
                    <span className="font-body text-sm text-[#F1F5F3]">{item.crop}</span>
                    <span
                      className={`font-mono text-xs ${item.wait ? 'text-[#FF9900]' : 'text-[#B8FF2C]'}`}
                    >
                      {item.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Export Opportunities */}
            <div className="insight-card rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-5 transition-all duration-300 hover:border-[#B8FF2C]/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#8BAF9A]/10">
                <Globe size={20} className="text-[#8BAF9A]" />
              </div>
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-[#F1F5F3]">
                Export Opportunities
              </h3>
              <ul className="space-y-3">
                {[
                  { crop: 'Cocoa', market: 'EU Premium +18%', highlight: true },
                  { crop: 'Yam', market: 'UK/US Diaspora +15%', highlight: true },
                  { crop: 'Groundnut', market: 'Asia demand rising', highlight: false },
                ].map((item) => (
                  <li key={item.crop} className="flex items-center justify-between">
                    <span className="font-body text-sm text-[#F1F5F3]">{item.crop}</span>
                    <span
                      className={`font-mono text-xs ${item.highlight ? 'text-[#B8FF2C]' : 'text-[#8BAF9A]'}`}
                    >
                      {item.market}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Volatility Alerts */}
            <div className="insight-card rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-5 transition-all duration-300 hover:border-[#FF0055]/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF0055]/10">
                <AlertTriangle size={20} className="text-[#FF0055]" />
              </div>
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-[#F1F5F3]">
                Volatility Alerts
              </h3>
              <ul className="space-y-3">
                {[
                  { crop: 'Tomato', alert: 'Seasonal glut', severity: 'high' },
                  { crop: 'Rice', alert: 'Import pressure', severity: 'medium' },
                  { crop: 'Beans', alert: 'Supply ample', severity: 'low' },
                ].map((item) => (
                  <li key={item.crop} className="flex items-center justify-between">
                    <span className="font-body text-sm text-[#F1F5F3]">{item.crop}</span>
                    <span
                      className={`font-mono text-xs ${
                        item.severity === 'high'
                          ? 'text-[#FF0055]'
                          : item.severity === 'medium'
                            ? 'text-[#FF9900]'
                            : 'text-[#8BAF9A]'
                      }`}
                    >
                      {item.alert}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
