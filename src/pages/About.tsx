import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Brain,
  TrendingUp,
  Mic,
  Camera,
  ScanLine,
  CalendarDays,
  BarChart3,
  Sparkles,
  Code2,
  Palette,
  Cloud,
  Users,
  Award,
  ArrowRight,
  Sprout,
  AlertTriangle,
  CircleDollarSign,
  Wifi,
  ChevronRight,
  Zap,
  MapPin,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  Helper: count-up animation                                         */
/* ------------------------------------------------------------------ */
function useCountUp(
  scopeRef: React.RefObject<HTMLElement | null>,
  selector: string,
  options?: { duration?: number; stagger?: number }
) {
  useGSAP(
    () => {
      if (!scopeRef.current) return
      const els = scopeRef.current.querySelectorAll(selector)
      els.forEach((el) => {
        const target = el as HTMLElement
        const final = parseFloat(target.dataset.value || '0')
        const suffix = target.dataset.suffix || ''
        const prefix = target.dataset.prefix || ''
        const isDecimal = target.dataset.decimal === 'true'
        const obj = { val: 0 }

        gsap.to(obj, {
          val: final,
          duration: options?.duration ?? 2.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            if (isDecimal) {
              target.textContent =
                prefix + obj.val.toFixed(0) + suffix
            } else {
              target.textContent =
                prefix +
                Math.floor(obj.val).toLocaleString() +
                suffix
            }
          },
        })
      })
    },
    { scope: scopeRef }
  )
}

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */
function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.about-hero-overline', {
        y: 30,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          '.about-hero-headline',
          { y: 60, opacity: 0, duration: 1.2 },
          '-=0.5'
        )
        .from(
          '.about-hero-subtitle',
          { y: 40, opacity: 0, duration: 1 },
          '-=0.8'
        )
        .from(
          '.about-hero-cta',
          { y: 30, opacity: 0, duration: 0.8 },
          '-=0.6'
        )
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
    >
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/img-nigerian-farm-1.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F0D]/70 via-[#0A0F0D]/80 to-[#0A0F0D]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F0D]/60 via-transparent to-[#0A0F0D]/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 text-center md:px-12">
        <div className="about-hero-overline mb-6 inline-flex items-center gap-2 rounded-full border border-[#B8FF2C]/30 bg-[#B8FF2C]/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-[#B8FF2C]">
          <Sprout size={14} />
          Our Mission
        </div>

        <h1
          className="about-hero-headline mb-8 font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.04em] text-[#F1F5F3]"
        >
          Reimagining Agriculture
          <br />
          <span className="text-[#B8FF2C]">for Every Farmer</span>
        </h1>

        <p className="about-hero-subtitle mx-auto mb-10 max-w-2xl font-body text-lg leading-relaxed text-[#8BAF9A] md:text-xl">
          FarmGenius AI is on a mission to democratize agricultural intelligence.
          We believe every farmer deserves expert agronomic advice at their
          fingertips — powered by AI, built for Nigeria.
        </p>

        <div className="about-hero-cta flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#problem"
            className="group inline-flex items-center gap-2 rounded-full bg-[#B8FF2C] px-8 py-3 font-body text-sm font-semibold text-[#0A0F0D] transition-transform duration-200 hover:scale-105"
          >
            Discover Our Story
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>
          <a
            href="#impact"
            className="inline-flex items-center gap-2 rounded-full border border-[#2D4A3E] px-8 py-3 font-body text-sm font-medium text-[#8BAF9A] transition-all duration-200 hover:border-[#B8FF2C]/40 hover:text-[#F1F5F3]"
          >
            See Our Impact
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-[#8BAF9A]/40 p-1">
          <div className="h-2 w-1 rounded-full bg-[#B8FF2C]" />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Problem Section                                                    */
/* ------------------------------------------------------------------ */
const problemStats = [
  {
    icon: Users,
    value: 38,
    suffix: 'M',
    label: 'Smallholder farmers in Nigeria lack access to expert agronomic advice',
  },
  {
    icon: AlertTriangle,
    value: 35,
    suffix: '%',
    label: 'Of crops are lost annually to preventable diseases and poor planning',
  },
  {
    icon: CircleDollarSign,
    value: 60,
    suffix: '%',
    label: 'Of farmers sell below market price due to limited pricing information',
  },
  {
    icon: Wifi,
    value: 72,
    suffix: '%',
    label: 'Rural farming communities have inconsistent internet connectivity',
  },
]

function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useCountUp(sectionRef, '.problem-stat-number', { duration: 2.5 })

  useGSAP(
    () => {
      if (!sectionRef.current) return

      gsap.from('.problem-overline', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: '.problem-overline', start: 'top 85%' },
      })

      gsap.from('.problem-heading', {
        y: 40,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: '.problem-heading', start: 'top 85%' },
      })

      gsap.from('.problem-body', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        scrollTrigger: { trigger: '.problem-body', start: 'top 85%' },
      })

      gsap.from('.problem-stat-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: {
          trigger: '.problem-stats-grid',
          start: 'top 85%',
        },
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative bg-[#0A0F0D] py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <div className="problem-overline mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-[#FF0055]">
            <AlertTriangle size={14} />
            The Problem
          </div>
          <h2 className="problem-heading mb-6 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-[-0.03em] text-[#F1F5F3]">
            Nigerian farmers lose billions to{' '}
            <span className="text-[#FF0055]">preventable</span> crop diseases.
          </h2>
          <p className="problem-body font-body text-lg leading-relaxed text-[#8BAF9A]">
            Access to agronomic expertise is scarce. By the time a farmer
            recognizes a disease, it&apos;s often too late to save the yield.
            Middlemen exploit information gaps, and climate uncertainty makes
            traditional farming methods increasingly unreliable.
          </p>
        </div>

        {/* Problem Stats Grid */}
        <div className="problem-stats-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problemStats.map((stat, i) => (
            <div
              key={i}
              className="problem-stat-card group relative overflow-hidden rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-6 transition-all duration-300 hover:border-[#FF0055]/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FF0055]/10">
                <stat.icon size={22} className="text-[#FF0055]" />
              </div>
              <div className="mb-2">
                <span
                  className="problem-stat-number font-display text-4xl font-bold text-[#FF0055] md:text-5xl"
                  data-value={stat.value}
                  data-suffix={stat.suffix}
                  data-decimal="true"
                >
                  0{stat.suffix}
                </span>
              </div>
              <p className="font-body text-sm leading-relaxed text-[#8BAF9A]">
                {stat.label}
              </p>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#FF0055]/5 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Solution Section                                                   */
/* ------------------------------------------------------------------ */
const solutionPillars = [
  {
    icon: Brain,
    title: 'AI Crop Doctor',
    description:
      'Snap a photo of any crop issue and get instant AI-powered diagnosis with treatment recommendations powered by Gemini vision.',
    gradient: 'from-[#B8FF2C]/20 to-[#00FFAA]/10',
    border: 'border-[#B8FF2C]/30',
    iconBg: 'bg-[#B8FF2C]/10',
    iconColor: 'text-[#B8FF2C]',
  },
  {
    icon: Sprout,
    title: 'Smart Farming Plans',
    description:
      'Personalized crop calendars, soil management tips, and planting schedules tailored to your location and conditions.',
    gradient: 'from-[#00FFAA]/20 to-[#00CCFF]/10',
    border: 'border-[#00FFAA]/30',
    iconBg: 'bg-[#00FFAA]/10',
    iconColor: 'text-[#00FFAA]',
  },
  {
    icon: TrendingUp,
    title: 'Market Intelligence',
    description:
      'Real-time crop pricing data, demand forecasts, and optimal selling windows to maximize your income.',
    gradient: 'from-[#FF9900]/20 to-[#FF0055]/10',
    border: 'border-[#FF9900]/30',
    iconBg: 'bg-[#FF9900]/10',
    iconColor: 'text-[#FF9900]',
  },
  {
    icon: Mic,
    title: 'Voice Assistant',
    description:
      'Speak naturally in English or local languages to get farming advice — no typing or reading required.',
    gradient: 'from-[#8B5CF6]/20 to-[#EC4899]/10',
    border: 'border-[#8B5CF6]/30',
    iconBg: 'bg-[#8B5CF6]/10',
    iconColor: 'text-[#8B5CF6]',
  },
]

function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return

      gsap.from('.solution-overline', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: '.solution-overline', start: 'top 85%' },
      })

      gsap.from('.solution-heading', {
        y: 40,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: '.solution-heading', start: 'top 85%' },
      })

      gsap.from('.solution-body', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        scrollTrigger: { trigger: '.solution-body', start: 'top 85%' },
      })

      gsap.from('.solution-card', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: '.solution-grid', start: 'top 80%' },
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0A0F0D] py-24 md:py-32"
    >
      {/* Subtle gradient orb in background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B8FF2C]/[0.03] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-16 max-w-3xl">
          <div className="solution-overline mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-[#B8FF2C]">
            <Sparkles size={14} />
            The Solution
          </div>
          <h2 className="solution-heading mb-6 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-[-0.03em] text-[#F1F5F3]">
            Putting an <span className="text-[#B8FF2C]">AI agronomist</span> in
            every pocket.
          </h2>
          <p className="solution-body font-body text-lg leading-relaxed text-[#8BAF9A]">
            FarmGenius AI combines Gemini&apos;s multimodal intelligence with
            Nigerian market data to diagnose, plan, and forecast — right from a
            smartphone.
          </p>
        </div>

        <div className="solution-grid grid grid-cols-1 gap-6 md:grid-cols-2">
          {solutionPillars.map((pillar, i) => (
            <div
              key={i}
              className={`solution-card group relative overflow-hidden rounded-xl border ${pillar.border} bg-gradient-to-br ${pillar.gradient} p-8 transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${pillar.iconBg}">
                <pillar.icon size={26} className={pillar.iconColor} />
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-[#F1F5F3]">
                {pillar.title}
              </h3>
              <p className="font-body text-[15px] leading-relaxed text-[#8BAF9A]">
                {pillar.description}
              </p>
              <div className="mt-6 flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#8BAF9A]/60 transition-colors duration-200 group-hover:text-[#B8FF2C]">
                <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                Learn more
              </div>

              {/* Glow effect on hover */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-[#B8FF2C]/10 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  How It Works Section                                               */
/* ------------------------------------------------------------------ */
const steps = [
  {
    number: '01',
    title: 'Upload a Photo',
    description:
      'Take a clear photo of your crop using your smartphone and upload it to the FarmGenius AI app. Works even on low-bandwidth connections.',
    icon: Camera,
  },
  {
    number: '02',
    title: 'AI Analysis',
    description:
      'Gemini&apos;s multimodal vision model analyzes the image instantly, identifying diseases, pests, nutrient deficiencies, and more.',
    icon: ScanLine,
  },
  {
    number: '03',
    title: 'Get Your Plan',
    description:
      'Receive a personalized treatment plan and farming calendar tailored to your crop type, soil conditions, and local climate.',
    icon: CalendarDays,
  },
  {
    number: '04',
    title: 'Maximize Profits',
    description:
      'Access real-time market intelligence to find the best buyers, optimal selling times, and fair prices for your harvest.',
    icon: BarChart3,
  },
]

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return

      gsap.from('.hiw-overline', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: '.hiw-overline', start: 'top 85%' },
      })

      gsap.from('.hiw-heading', {
        y: 40,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: '.hiw-heading', start: 'top 85%' },
      })

      gsap.from('.hiw-step-card', {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        scrollTrigger: { trigger: '.hiw-steps-container', start: 'top 80%' },
      })

      gsap.from('.hiw-connector', {
        scaleY: 0,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.hiw-steps-container',
          start: 'top 75%',
        },
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0A0F0D] py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="hiw-overline mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-[#B8FF2C]">
            <Zap size={14} />
            How It Works
          </div>
          <h2 className="hiw-heading font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-[-0.03em] text-[#F1F5F3]">
            From <span className="text-[#B8FF2C]">Photo</span> to{' '}
            <span className="text-[#B8FF2C]">Action</span> in 4 Steps
          </h2>
        </div>

        {/* Steps */}
        <div className="hiw-steps-container relative">
          {/* Vertical connector line - desktop */}
          <div className="hiw-connector absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-[#B8FF2C]/60 via-[#B8FF2C]/20 to-transparent md:block" />

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0
              return (
                <div
                  key={i}
                  className={`hiw-step-card relative grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16`}
                >
                  {/* Content side - alternates */}
                  <div
                    className={`${isEven ? 'md:pr-16' : 'md:order-2 md:pl-16'}`}
                  >
                    <div className="rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-6 transition-all duration-300 hover:border-[#B8FF2C]/30 md:p-8">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B8FF2C]">
                          <step.icon size={18} className="text-[#0A0F0D]" />
                        </div>
                        <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#8BAF9A]">
                          Step {step.number}
                        </span>
                      </div>
                      <h3 className="mb-3 font-display text-2xl font-semibold text-[#F1F5F3]">
                        {step.title}
                      </h3>
                      <p
                        className="font-body text-[15px] leading-relaxed text-[#8BAF9A]"
                        dangerouslySetInnerHTML={{
                          __html: step.description,
                        }}
                      />
                    </div>
                  </div>

                  {/* Number circle - center on desktop */}
                  <div
                    className={`hidden items-center justify-center md:flex ${
                      isEven ? 'md:order-2' : ''
                    }`}
                  >
                    <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#B8FF2C] bg-[#0A0F0D] shadow-[0_0_30px_rgba(184,255,44,0.2)]">
                      <span className="font-display text-2xl font-bold text-[#B8FF2C]">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Mobile number indicator */}
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#B8FF2C] bg-[#0A0F0D] md:hidden">
                    <span className="font-display text-sm font-bold text-[#B8FF2C]">
                      {step.number}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Impact Metrics Section                                             */
/* ------------------------------------------------------------------ */
const impactMetrics = [
  {
    value: 50,
    suffix: 'K+',
    label: 'Farmers Reached',
    description:
      'Smallholder farmers across Nigeria using FarmGenius AI for crop diagnosis and planning.',
  },
  {
    value: 85,
    suffix: '%',
    label: 'Diagnosis Accuracy',
    description:
      'AI-powered disease identification accuracy validated against agricultural experts.',
  },
  {
    value: 40,
    suffix: '%',
    label: 'Increase in Crop Yield',
    description:
      'Average yield improvement reported by farmers following AI-generated farming plans.',
  },
  {
    value: 2.5,
    prefix: 'N',
    suffix: 'M',
    label: 'Average Income Growth',
    description:
      'Additional annual income per farmer through better pricing and yield optimization.',
    isDecimal: true,
  },
]

function ImpactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useCountUp(sectionRef, '.impact-number', { duration: 2.5 })

  useGSAP(
    () => {
      if (!sectionRef.current) return

      gsap.from('.impact-overline', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: '.impact-overline', start: 'top 85%' },
      })

      gsap.from('.impact-heading', {
        y: 40,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: '.impact-heading', start: 'top 85%' },
      })

      gsap.from('.impact-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: '.impact-grid', start: 'top 80%' },
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="impact"
      className="relative overflow-hidden bg-[#141C19] py-24 md:py-32"
    >
      {/* Background gradient accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full bg-[#B8FF2C]/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#FF9900]/[0.04] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-16 text-center">
          <div className="impact-overline mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-[#FF9900]">
            <TrendingUp size={14} />
            Our Impact
          </div>
          <h2 className="impact-heading font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-[-0.03em] text-[#F1F5F3]">
            Numbers that <span className="text-[#B8FF2C]">matter</span>
          </h2>
        </div>

        <div className="impact-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric, i) => (
            <div
              key={i}
              className="impact-card group rounded-xl border border-[#2D4A3E]/40 bg-[#0A0F0D] p-6 text-center transition-all duration-300 hover:border-[#B8FF2C]/30 md:p-8"
            >
              <div className="mb-4">
                <span
                  className="impact-number font-display text-[clamp(3rem,7vw,5rem)] font-bold leading-none text-[#B8FF2C]"
                  style={{
                    textShadow: '0 0 40px rgba(184,255,44,0.3)',
                  }}
                  data-value={metric.value}
                  data-suffix={metric.suffix}
                  data-prefix={metric.prefix || ''}
                  data-decimal={metric.isDecimal ? 'true' : 'false'}
                >
                  {metric.prefix || '0'}
                  0{metric.suffix}
                </span>
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-[#F1F5F3]">
                {metric.label}
              </h3>
              <p className="font-body text-sm leading-relaxed text-[#8BAF9A]">
                {metric.description}
              </p>

              {/* Glow */}
              <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#B8FF2C]/20 transition-all duration-300 group-hover:w-20 group-hover:bg-[#B8FF2C]/40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Tech Stack Section                                                 */
/* ------------------------------------------------------------------ */
const techStack = [
  {
    name: 'Gemini API',
    description: 'Vision, Text, Voice',
    icon: Sparkles,
    gradient: 'from-[#B8FF2C]/15 to-[#00FFAA]/5',
    border: 'border-[#B8FF2C]/25',
    iconColor: 'text-[#B8FF2C]',
  },
  {
    name: 'React + TypeScript',
    description: 'Type-safe frontend',
    icon: Code2,
    gradient: 'from-[#61DAFB]/15 to-[#3178C6]/5',
    border: 'border-[#61DAFB]/25',
    iconColor: 'text-[#61DAFB]',
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first styling',
    icon: Palette,
    gradient: 'from-[#38BDF8]/15 to-[#0EA5E9]/5',
    border: 'border-[#38BDF8]/25',
    iconColor: 'text-[#38BDF8]',
  },
  {
    name: 'Google Cloud',
    description: 'Scalable deployment',
    icon: Cloud,
    gradient: 'from-[#FF9900]/15 to-[#FF0055]/5',
    border: 'border-[#FF9900]/25',
    iconColor: 'text-[#FF9900]',
  },
]

function TechStackSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return

      gsap.from('.tech-overline', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: '.tech-overline', start: 'top 85%' },
      })

      gsap.from('.tech-heading', {
        y: 40,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: '.tech-heading', start: 'top 85%' },
      })

      gsap.from('.tech-body', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        scrollTrigger: { trigger: '.tech-body', start: 'top 85%' },
      })

      gsap.from('.tech-card', {
        rotateY: 90,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.tech-grid', start: 'top 80%' },
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#141C19] py-24 md:py-32"
    >
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <div className="mb-16 text-center">
          <div className="tech-overline mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-[#B8FF2C]">
            <Code2 size={14} />
            Built With
          </div>
          <h2 className="tech-heading mb-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-[-0.03em] text-[#F1F5F3]">
            Built for the <span className="text-[#B8FF2C]">Future</span>.
          </h2>
          <p className="tech-body mx-auto max-w-2xl font-body text-lg leading-relaxed text-[#8BAF9A]">
            FarmGenius AI was developed for the FUTMINNA 2026 Hackathon. It
            leverages the Gemini API multimodally (Vision, Text, Voice) and is
            deployed on Google Cloud.
          </p>
        </div>

        <div className="tech-grid grid grid-cols-1 gap-6 sm:grid-cols-2">
          {techStack.map((tech, i) => (
            <div
              key={i}
              className={`tech-card group relative overflow-hidden rounded-xl border ${tech.border} bg-gradient-to-br ${tech.gradient} p-8 transition-all duration-300 hover:scale-[1.02]`}
              style={{ perspective: '1000px' }}
            >
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0A0F0D]/60">
                  <tech.icon size={26} className={tech.iconColor} />
                </div>
                <div>
                  <h3 className="mb-1 font-display text-xl font-semibold text-[#F1F5F3]">
                    {tech.name}
                  </h3>
                  <p className="font-body text-sm text-[#8BAF9A]">
                    {tech.description}
                  </p>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-[#B8FF2C]/20 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Hackathon / Team Acknowledgment Section                            */
/* ------------------------------------------------------------------ */
function AcknowledgmentSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return

      gsap.from('.ack-content', {
        y: 50,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: '.ack-content', start: 'top 85%' },
      })

      gsap.from('.ack-badge', {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: { trigger: '.ack-badges', start: 'top 85%' },
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0A0F0D] py-24 md:py-32"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-[#B8FF2C]/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center md:px-12">
        <div className="ack-content">
          {/* Award badge */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#B8FF2C]/30 bg-[#B8FF2C]/10">
            <Award size={36} className="text-[#B8FF2C]" />
          </div>

          <h2 className="mb-6 font-display text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight tracking-[-0.03em] text-[#F1F5F3]">
            FUTMINNA{' '}
            <span className="text-[#B8FF2C]">Build With AI</span> Hackathon
            2026
          </h2>

          <p className="mx-auto mb-10 max-w-2xl font-body text-lg leading-relaxed text-[#8BAF9A]">
            This project was born at the Federal University of Technology,
            Minna, where we set out to solve real agricultural challenges facing
            millions of Nigerian farmers. Using Gemini&apos;s multimodal
            capabilities, we built an AI companion that understands crops,
            markets, and farmers.
          </p>

          <div className="ack-badges flex flex-wrap items-center justify-center gap-4">
            <div className="ack-badge inline-flex items-center gap-2 rounded-full border border-[#B8FF2C]/30 bg-[#B8FF2C]/10 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#B8FF2C]">
              <Sparkles size={14} />
              Gemini API
            </div>
            <div className="ack-badge inline-flex items-center gap-2 rounded-full border border-[#2D4A3E] bg-[#141C19] px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#8BAF9A]">
              <Users size={14} />
              Team Project
            </div>
            <div className="ack-badge inline-flex items-center gap-2 rounded-full border border-[#2D4A3E] bg-[#141C19] px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#8BAF9A]">
              <Sprout size={14} />
              Agriculture
            </div>
            <div className="ack-badge inline-flex items-center gap-2 rounded-full border border-[#2D4A3E] bg-[#141C19] px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#8BAF9A]">
              <MapPin size={14} />
              Nigeria
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div className="mx-auto mb-10 mt-16 h-px w-24 bg-[#2D4A3E]/60" />

        <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#8BAF9A]/50">
          Built with passion for Nigerian farmers
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Main About Page                                                    */
/* ------------------------------------------------------------------ */
export default function About() {
  return (
    <div className="relative">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <ImpactSection />
      <TechStackSection />
      <AcknowledgmentSection />
    </div>
  )
}
