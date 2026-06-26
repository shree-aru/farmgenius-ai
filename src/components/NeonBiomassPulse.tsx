import { useRef, useEffect } from 'react'

export default function NeonBiomassPulse() {
  const orbitTextRef = useRef<HTMLDivElement>(null)
  const angleRef = useRef(0)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const animate = () => {
      angleRef.current += 0.008
      const radius = 160
      const x = Math.cos(angleRef.current) * radius
      const y = Math.sin(angleRef.current) * radius

      if (orbitTextRef.current) {
        orbitTextRef.current.style.transform = `translate(${x}px, ${y}px)`
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div className="relative flex items-center justify-center" style={{ width: 400, height: 400 }}>
      {/* Outer square */}
      <div
        className="absolute animate-spin-slow rounded-3xl border-2 border-[#B8FF2C]/30"
        style={{
          width: '100%',
          height: '100%',
          boxShadow: '0 0 30px rgba(184,255,44,0.1)',
        }}
      />

      {/* Middle octagon */}
      <div
        className="absolute animate-spin-reverse border-2 border-[#00FFAA]/40"
        style={{
          width: '75%',
          height: '75%',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          boxShadow: '0 0 40px rgba(0,255,170,0.15)',
        }}
      />

      {/* Inner circle */}
      <div
        className="absolute animate-pulse-glow rounded-full border-2"
        style={{
          width: '45%',
          height: '45%',
          borderImage: 'linear-gradient(135deg, rgba(184,255,44,0.8), rgba(0,255,170,0.8)) 1',
          background: 'radial-gradient(circle, rgba(184,255,44,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Orbiting text */}
      <div
        ref={orbitTextRef}
        className="absolute left-1/2 top-1/2 font-mono text-xs uppercase tracking-widest text-[#B8FF2C]/70"
        style={{ marginLeft: -60, marginTop: -8 }}
      >
        Scanning... Processing...
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#B8FF2C]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">AI Engine</span>
        </div>
        <p className="max-w-[200px] font-body text-sm text-[#8BAF9A]/80">
          Processing Nigerian Biomass Data...
        </p>
      </div>
    </div>
  )
}
