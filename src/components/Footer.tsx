import { Link } from 'react-router-dom'
import { Leaf, TrendingUp, Calendar, Phone, Mail, MapPin } from 'lucide-react'

const featureLinks = [
  { label: 'Crop Doctor', path: '/crop-doctor', icon: Leaf },
  { label: 'Farming Plans', path: '/farming-plans', icon: Calendar },
  { label: 'Market Intelligence', path: '/market-intelligence', icon: TrendingUp },
]

const companyLinks = [
  { label: 'About', path: '/about' },
  { label: 'Features', path: '/#features' },
  { label: 'Get Started', path: '/crop-doctor' },
]

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-[#2D4A3E]/40 bg-[#0A0F0D]">
      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32">
        <div className="mb-20 text-center">
          <h2
            className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-[#F1F5F3] md:text-6xl lg:text-7xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            Ready to grow?
          </h2>
          <p className="mx-auto mb-8 max-w-xl font-body text-lg text-[#8BAF9A]">
            Join thousands of Nigerian farmers using AI to increase yields and protect their crops.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/crop-doctor"
              className="rounded-full bg-[#B8FF2C] px-8 py-3 font-body text-sm font-semibold text-[#0A0F0D] transition-transform duration-200 hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/market-intelligence"
              className="rounded-full border border-[#2D4A3E] px-8 py-3 font-body text-sm font-medium text-[#8BAF9A] transition-all duration-200 hover:border-[#B8FF2C]/40 hover:text-[#F1F5F3]"
            >
              View Markets
            </Link>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 gap-12 border-t border-[#2D4A3E]/40 pt-16 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="mb-4 inline-block font-display text-2xl font-bold text-[#F1F5F3]">
              FarmGenius
            </Link>
            <p className="font-body text-sm leading-relaxed text-[#8BAF9A]">
              AI-powered agricultural intelligence for Nigerian farmers. Built for the FUTMINNA 2026 Hackathon.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
              Features
            </h4>
            <ul className="flex flex-col gap-3">
              {featureLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 font-body text-sm text-[#8BAF9A] transition-colors duration-200 hover:text-[#F1F5F3]"
                  >
                    <link.icon size={14} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-body text-sm text-[#8BAF9A] transition-colors duration-200 hover:text-[#F1F5F3]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-[#8BAF9A]">
              Contact
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2 font-body text-sm text-[#8BAF9A]">
                <Mail size={14} />
                hello@farmgenius.ai
              </li>
              <li className="flex items-center gap-2 font-body text-sm text-[#8BAF9A]">
                <Phone size={14} />
                +234 800 FARM AI
              </li>
              <li className="flex items-start gap-2 font-body text-sm text-[#8BAF9A]">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                Federal University of Technology, Minna
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#2D4A3E]/40 pt-8 md:flex-row">
          <p className="font-mono text-xs text-[#8BAF9A]/60">
            &copy; 2026 FarmGenius AI. FUTMINNA Hackathon Project.
          </p>
          <div className="flex gap-6">
            <span className="font-mono text-xs text-[#8BAF9A]/60">Privacy</span>
            <span className="font-mono text-xs text-[#8BAF9A]/60">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
