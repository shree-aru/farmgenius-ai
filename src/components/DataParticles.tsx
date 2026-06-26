import { useRef, useEffect, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  baseY: number
  speed: number
  size: number
  opacity: number
  color: string
}

interface DataParticlesProps {
  opacity?: number
}

export default function DataParticles({ opacity = 0.4 }: DataParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const shiftTargetRef = useRef(0)
  const currentShiftRef = useRef(0)
  const animFrameRef = useRef<number>(0)

  const initParticles = useCallback((width: number, height: number) => {
    const count = 400
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const isLeft = Math.random() > 0.5
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseY: Math.random() * height,
        speed: 0.3 + Math.random() * 0.8,
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.6,
        color: isLeft ? '#B8FF2C' : '#00FFAA',
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      initParticles(rect.width, rect.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = (e.clientY - rect.top) / rect.height
      shiftTargetRef.current = (mouseRef.current.y - 0.5) * 100
    }

    canvas.parentElement?.addEventListener('mousemove', handleMouseMove)

    let time = 0
    const animate = () => {
      time += 0.008
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) {
        animFrameRef.current = requestAnimationFrame(animate)
        return
      }

      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      currentShiftRef.current += (shiftTargetRef.current - currentShiftRef.current) * 0.02

      for (const p of particlesRef.current) {
        p.x += p.speed
        if (p.x > w) p.x = 0

        const frequency = 0.003
        const amplitude = 30
        p.y = p.baseY + Math.sin(p.x * frequency + time) * amplitude + currentShiftRef.current

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity * opacity
        ctx.shadowBlur = 6
        ctx.shadowColor = p.color
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove)
    }
  }, [initParticles, opacity])

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
        pointerEvents: 'auto',
      }}
    />
  )
}
