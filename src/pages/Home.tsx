import { useRef, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Leaf,
  CalendarDays,
  TrendingUp,
  Mic,
  ArrowRight,
  Sprout,
  Users,
  BarChart3,
} from 'lucide-react'
import DataParticles from '@/components/DataParticles'
import NeonBiomassPulse from '@/components/NeonBiomassPulse'

gsap.registerPlugin(ScrollTrigger)

const DataGradientField = lazy(() => import('@/components/DataGradientField'))

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlineRef = useRef<HTMLParagraphElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        overlineRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      )
        .fromTo(
          headlineRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.3'
        )
        .fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          '-=0.4'
        )
        .fromTo(
          ctaRef.current,
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5 },
          '-=0.3'
        )
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
      style={{ background: '#000000' }}
    >
      <Suspense
        fallback={
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, #0A1F0D 0%, #000000 100%)' }}
          />
        }
      >
        <DataGradientField />
      </Suspense>

      {/* Foreground content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p
          ref={overlineRef}
          className="mb-6 font-mono text-xs uppercase tracking-widest text-[#8BAF9A] opacity-0"
        >
          Agricultural Intelligence Platform
        </p>

        <h1
          ref={headlineRef}
          className="mb-6 font-display text-5xl font-bold leading-tight text-[#F1F5F3] md:text-6xl lg:text-7xl opacity-0"
          style={{ letterSpacing: '-0.04em', textWrap: 'balance' }}
        >
          The future of farming is intelligent.
        </h1>

        <p
          ref={subtitleRef}
          className="mx-auto mb-10 max-w-2xl font-body text-lg leading-relaxed text-[#8BAF9A] md:text-xl opacity-0"
          style={{ textWrap: 'pretty' }}
        >
          FarmGenius AI diagnoses crops, plans harvests, and tracks markets—tailored for Nigerian
          farmers.
        </p>

        <div ref={ctaRef} className="flex flex-col items-center justify-center gap-4 sm:flex-row opacity-0">
          <Link
            to="/crop-doctor"
            className="group flex items-center gap-2 rounded-full bg-[#B8FF2C] px-8 py-3.5 font-body text-sm font-semibold text-[#0A0F0D] transition-transform duration-200 hover:scale-105"
          >
            Analyze Crop
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/market-intelligence"
            className="rounded-full border border-[#2D4A3E] px-8 py-3.5 font-body text-sm font-medium text-[#8BAF9A] transition-all duration-200 hover:border-[#B8FF2C]/40 hover:text-[#F1F5F3]"
          >
            View Markets
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Feature Cards                                                      */
/* ------------------------------------------------------------------ */
const features = [
  {
    title: 'AI Crop Doctor',
    description: 'Diagnose diseases instantly via smartphone camera. Upload a photo and get AI-powered treatment recommendations in seconds.',
    icon: Leaf,
    path: '/crop-doctor',
    stat: '95% accuracy',
  },
  {
    title: 'Smart Farming Plans',
    description: 'Generate tailored crop calendars based on your soil and season. Get personalized planting schedules and fertilization plans.',
    icon: CalendarDays,
    path: '/farming-plans',
    stat: 'Up to 40% yield increase',
  },
  {
    title: 'Market Intelligence',
    description: 'Track real-time crop prices and demand across Nigeria. Make data-driven selling decisions to maximize your profits.',
    icon: TrendingUp,
    path: '/market-intelligence',
    stat: 'Live price tracking',
  },
  {
    title: 'Voice Assistant',
    description: 'Speak to FarmGenius in your local language. Get farming advice, weather updates, and market info hands-free.',
    icon: Mic,
    path: '/about',
    stat: 'Multilingual support',
  },
]

function FeatureSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: '#0A0F0D' }}
    >
      <DataParticles opacity={0.35} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
        <div ref={headingRef} className="mb-16 text-center opacity-0">
          <h2
            className="mb-4 font-display text-4xl font-bold text-[#F1F5F3] md:text-5xl lg:text-6xl"
            style={{ letterSpacing: '-0.04em', textWrap: 'balance' }}
          >
            One AI. Infinite agricultural insight.
          </h2>
          <p className="mx-auto max-w-2xl font-body text-lg text-[#8BAF9A]">
            From diagnosis to market analysis, FarmGenius gives you the tools to farm smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" id="features">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => { cardsRef.current[i] = el }}
              className="group relative rounded-xl border border-[#2D4A3E]/40 bg-[#141C19] p-6 transition-all duration-300 hover:border-[#B8FF2C]/40 opacity-0"
              style={{
                boxShadow: '0 0 0 rgba(184,255,44,0)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 0 20px rgba(184,255,44,0.05)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 0 0 rgba(184,255,44,0)'
              }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#2D4A3E]/60 bg-[#0A0F0D]">
                <feature.icon size={22} className="text-[#B8FF2C]" />
              </div>

              <h3 className="mb-2 font-display text-xl font-semibold text-[#F1F5F3]">
                {feature.title}
              </h3>

              <p className="mb-4 font-body text-sm leading-relaxed text-[#8BAF9A]">
                {feature.description}
              </p>

              <div className="mb-4 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#B8FF2C]" />
                <span className="font-mono text-xs uppercase tracking-wider text-[#B8FF2C]">
                  {feature.stat}
                </span>
              </div>

              <Link
                to={feature.path}
                className="inline-flex items-center gap-1 font-body text-sm font-medium text-[#8BAF9A] transition-colors duration-200 group-hover:text-[#B8FF2C]"
              >
                Learn more
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  AI Engine Status                                                   */
/* ------------------------------------------------------------------ */
function AIEngineSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden py-24"
      style={{ backgroundColor: '#0A0F0D' }}
    >
      {/* Gradient orbs */}
      <div
        className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(184,255,44,0.4) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0,255,170,0.4) 0%, transparent 70%)' }}
      />

      <div ref={contentRef} className="relative z-10 flex flex-col items-center opacity-0">
        <NeonBiomassPulse />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Social Proof                                                       */
/* ------------------------------------------------------------------ */
const stats = [
  { value: '10,000+', label: 'Farmers Helped', icon: Users },
  { value: '95%', label: 'Diagnosis Accuracy', icon: Sprout },
  { value: '36', label: 'Nigerian States', icon: BarChart3 },
  { value: '40%', label: 'Avg Yield Increase', icon: TrendingUp },
]

const testimonials = [
  {
    quote:
      'FarmGenius helped me identify cassava mosaic disease before it spread. Saved my entire harvest.',
    author: 'Musa Ibrahim',
    location: 'Niger State',
  },
  {
    quote:
      'The market intelligence feature showed me the best time to sell my maize. I doubled my profit.',
    author: 'Amina Okafor',
    location: 'Anambra State',
  },
  {
    quote:
      'I use the voice assistant every morning to check weather and get farming advice in Hausa.',
    author: 'Yusuf Abdullahi',
    location: 'Kaduna State',
  },
]

const marqueeItems = [
  'AI-Powered Crop Diagnosis',
  'Real-Time Market Prices',
  'Smart Planting Calendars',
  'Voice Assistant in Local Languages',
  'Built for Nigerian Farmers',
  'FUTMINNA 2026 Hackathon',
]

function SocialProofSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      gsap.fromTo(
        statsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: '#141C19' }}
    >
      {/* Marquee */}
      <div className="mb-16 flex overflow-hidden border-y border-[#2D4A3E]/30 py-4">
        <div className="animate-marquee flex shrink-0 gap-12 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-[#8BAF9A]/50">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B8FF2C]/50" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div ref={headingRef} className="mb-16 text-center opacity-0">
          <h2
            className="mb-4 font-display text-4xl font-bold text-[#F1F5F3] md:text-5xl"
            style={{ letterSpacing: '-0.04em', textWrap: 'balance' }}
          >
            Farming smarter, not harder.
          </h2>
          <p className="mx-auto max-w-xl font-body text-lg text-[#8BAF9A]">
            Join the growing community of Nigerian farmers transforming their farms with AI.
          </p>
        </div>

        {/* Stats grid */}
        <div
          ref={statsRef}
          className="mb-20 grid grid-cols-2 gap-6 md:grid-cols-4 opacity-0"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl border border-[#2D4A3E]/40 bg-[#0A0F0D] p-6 text-center"
            >
              <stat.icon size={24} className="mb-3 text-[#B8FF2C]" />
              <span className="mb-1 font-display text-3xl font-bold text-[#F1F5F3] md:text-4xl">
                {stat.value}
              </span>
              <span className="font-body text-sm text-[#8BAF9A]">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el }}
              className="group relative overflow-hidden rounded-xl border border-[#2D4A3E]/40 bg-[#0A0F0D] p-6 opacity-0"
            >
              {/* Background image overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity duration-300 group-hover:opacity-15"
                style={{ backgroundImage: 'url(/img-nigerian-farm-1.jpg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0D] via-[#0A0F0D]/80 to-transparent" />

              <div className="relative z-10">
                <p className="mb-6 font-body text-sm italic leading-relaxed text-[#8BAF9A]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-display text-sm font-semibold text-[#F1F5F3]">{t.author}</p>
                  <p className="font-mono text-xs text-[#8BAF9A]/60">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Home Page                                                          */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <AIEngineSection />
      <SocialProofSection />
    </>
  )
}
