'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { GOOGLE_MAPS_URL } from '@/components/map/ArenaMap'

const ArenaMap = dynamic(() => import('@/components/map/ArenaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] rounded-2xl bg-[#0e0e14] border border-white/10 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
    </div>
  ),
})

interface ContactSceneProps {
  onNavigate?: (index: number) => void
}

export function ContactScene({ onNavigate }: ContactSceneProps) {
  const [formSent, setFormSent] = useState(false)
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' })
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.contact) return
    setFormSent(true)
    setTimeout(() => {
      setFormData({ name: '', contact: '', message: '' })
      setFormSent(false)
    }, 4000)
  }

  const socials = [
    { name: 'Instagram', handle: '@triplestars', url: 'https://instagram.com' },
    { name: 'Discord', handle: 'Triple Stars', url: 'https://discord.com' },
    { name: 'YouTube', handle: 'Triple Stars', url: 'https://youtube.com' },
    { name: 'TikTok', handle: '@triplestars', url: 'https://tiktok.com' },
    { name: 'Twitch', handle: 'TripleStarsTV', url: 'https://twitch.tv' },
    { name: 'X / Twitter', handle: '@TripleStars', url: 'https://x.com' },
  ]

  return (
    <div className="w-full h-full flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-16 text-[#ededed] relative overflow-hidden py-16 md:py-0">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#ff6600]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full z-10 mx-auto">
        {/* Section Header */}
        <div className="mb-4 md:mb-5">
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            VISIT OUR <span className="text-[#ff6600] drop-shadow-[0_0_20px_rgba(255,102,0,0.4)]">ARENA</span>
          </h2>
        </div>

        {/* 2-Column Spacious Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch">
          {/* Left Column: Large Prominent Real Map (7 cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#0e0e14]/90 border border-white/10 p-4 md:p-5 backdrop-blur-xl shadow-xl">
            {/* Map Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-white/5">
              <div>
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <span>Triple Stars Arena</span>
                  <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    Open Daily
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Laâyoune, Morocco • Open 10:00 AM – 02:00 AM
                </p>
              </div>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#ff6600] hover:text-black border border-white/10 hover:border-[#ff6600] text-zinc-200 text-xs font-semibold transition-all"
              >
                <span>Google Maps</span>
                <span className="text-xs">↗</span>
              </a>
            </div>

            {/* Large Interactive Map Canvas */}
            <div className="flex-1 min-h-[300px] md:min-h-[360px] rounded-xl overflow-hidden">
              <ArenaMap height="100%" initialZoom={17} />
            </div>
          </div>

          {/* Right Column: Direct Channels & Message Form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl bg-[#0e0e14]/90 border border-white/10 p-5 md:p-6 backdrop-blur-xl shadow-xl">
            {/* Direct Channels */}
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Quick Channels
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-emerald-400 mb-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300">
                      Chat on WhatsApp
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      +212 600-000000
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                  Message ↗
                </span>
              </a>

              {/* Email & Phone Copy */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleCopy('contact@triplestars.gg', 'email')}
                  className="p-2.5 rounded-xl bg-[#14141c] hover:bg-[#1a1a24] border border-white/10 hover:border-[#ff6600]/50 text-left transition-all"
                >
                  <div className="text-[10px] text-zinc-500 uppercase font-medium">Email</div>
                  <div className="text-xs text-white truncate mt-0.5">
                    {copied === 'email' ? '✓ Copied' : 'contact@triplestars.gg'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy('+212 600 000 000', 'phone')}
                  className="p-2.5 rounded-xl bg-[#14141c] hover:bg-[#1a1a24] border border-white/10 hover:border-[#ff6600]/50 text-left transition-all"
                >
                  <div className="text-[10px] text-zinc-500 uppercase font-medium">Phone</div>
                  <div className="text-xs text-white truncate mt-0.5">
                    {copied === 'phone' ? '✓ Copied' : '+212 600 000 000'}
                  </div>
                </button>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Send a Message
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#121218] border border-white/10 focus:border-[#ff6600] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Email or Phone"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-[#121218] border border-white/10 focus:border-[#ff6600] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <textarea
                  placeholder="How can we help you?"
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#121218] border border-white/10 focus:border-[#ff6600] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none resize-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-black bg-[#ff6600] hover:bg-[#ff7a1a] transition-all shadow-[0_0_15px_rgba(255,102,0,0.3)]"
                >
                  {formSent ? '✓ Message Sent' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Socials Row */}
            <div className="pt-3 border-t border-white/5">
              <div className="flex flex-wrap items-center gap-1.5">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-medium transition-colors"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
