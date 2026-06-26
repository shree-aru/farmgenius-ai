import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Crop Doctor', path: '/crop-doctor' },
  { label: 'Farming Plans', path: '/farming-plans' },
  { label: 'Market Intelligence', path: '/market-intelligence' },
  { label: 'About', path: '/about' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <nav
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10, 15, 13, 0.9)' : 'rgba(10, 15, 13, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
        {/* Wordmark */}
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-[#F1F5F3] transition-all duration-300 hover:text-[#B8FF2C]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          FarmGenius
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="font-body text-sm font-medium uppercase tracking-widest text-[#8BAF9A] transition-colors duration-200 hover:text-[#F1F5F3]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/crop-doctor"
            className="rounded-full bg-[#B8FF2C] px-5 py-2 font-body text-sm font-semibold text-[#0A0F0D] transition-transform duration-200 hover:scale-105"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#F1F5F3] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#2D4A3E]/40 bg-[#0A0F0D]/95 px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-body text-sm font-medium uppercase tracking-widest text-[#8BAF9A] transition-colors duration-200 hover:text-[#F1F5F3]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/crop-doctor"
              className="mt-2 rounded-full bg-[#B8FF2C] px-5 py-3 text-center font-body text-sm font-semibold text-[#0A0F0D]"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
