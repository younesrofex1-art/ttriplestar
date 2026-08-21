'use client'

import React, { useState } from 'react'

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
    {
      name: 'Instagram',
      handle: '@triplestars.gg',
      desc: 'Highlights & event stories',
      url: 'https://instagram.com',
      badge: 'OFFICIAL',
      color: '#ff6600',
    },
    {
      name: 'Discord',
      handle: 'Triple Stars Arena',
      desc: 'Community matchmaking & scrims',
      url: 'https://discord.com',
      badge: '5.2K MEMBERS',
      color: '#5865F2',
    },
    {
      name: 'YouTube',
      handle: 'Triple Stars Esports',
      desc: 'Tournament VODs & 4K live streams',
      url: 'https://youtube.com',
      badge: 'VODS & LIVE',
      color: '#FF0000',
    },
    {
      name: 'TikTok',
      handle: '@triplestars_gaming',
      desc: 'Clips, setups & player moments',
      url: 'https://tiktok.com',
      badge: 'VIRAL CLIPS',
      color: '#ff0050',
    },
    {
      name: 'Twitch',
      handle: 'TripleStarsTV',
      desc: 'Official tournament broadcasts',
      url: 'https://twitch.tv',
      badge: 'LIVE STREAMS',
      color: '#9146FF',
    },
    {
      name: 'X / Twitter',
      handle: '@TripleStarsGG',
      desc: 'Bracket drops & instant announcements',
      url: 'https://x.com',
      badge: 'NEWS',
      color: '#1DA1F2',
    },
  ]

  return (
    <div className="w-full h-full flex flex-col justify-center px-6 md:px-14 lg:px-20 text-[#ededed] relative overflow-hidden select-none py-12 md:py-0">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff6600]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#ff8800]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full z-10 mx-auto">
        {/* Header HUD */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] md:text-xs text-[#ff6600] font-bold tracking-widest uppercase bg-[#ff6600]/10 border border-[#ff6600]/30 px-2.5 py-0.5 rounded">
              06 // COMMS & HEADQUARTERS
            </span>
            <span className="h-px flex-1 max-w-xs bg-gradient-to-r from-[#ff6600]/40 to-transparent" />
          </div>
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
            CONNECT & <span className="text-[#ff6600] drop-shadow-[0_0_20px_rgba(255,102,0,0.5)]">LOCATION</span>
          </h2>
          <p className="text-xs md:text-sm text-text-secondary max-w-xl mt-1 font-mono">
            Esports Arena Headquarters, 24/7 Direct Player Support, & Community Social Networks.
          </p>
        </div>

        {/* 3-Column Responsive Cyber Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          {/* Column 1: Arena Location & Headquarters (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#0e0e13]/85 border border-border-strong/80 hover:border-[#ff6600]/50 p-5 md:p-6 backdrop-blur-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] text-[#ff6600] tracking-wider uppercase font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff6600] animate-pulse" />
                  PHYSICAL ARENA HQ
                </span>
                <span className="font-mono text-[9px] text-text-muted border border-border px-1.5 py-0.5 rounded">
                  ZONE 01
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-white mb-2">
                TRIPLE STARS ESPORTS ARENA
              </h3>

              <div className="space-y-3 font-mono text-xs text-text-secondary mb-5">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#ff6600] text-sm">📍</span>
                  <div>
                    <div className="text-white font-medium">Boulevard Hassan II</div>
                    <div className="text-[11px] text-text-muted">Gaming & Tournament Complex, Agadir</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-[#ff6600] text-sm">⏱</span>
                  <div>
                    <div className="text-white font-medium">Open Daily: 10:00 AM – 02:00 AM</div>
                    <div className="text-[11px] text-[#ff6600]/90">Non-stop tournament weekends</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-[#ff6600] text-sm">⚡</span>
                  <div>
                    <div className="text-white font-medium">Specs & Equipment</div>
                    <div className="text-[11px] text-text-muted">
                      240Hz Rigs • PS5 Pro Stations • 1Gbps Fiber
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Agadir+Morocco"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-black bg-[#ff6600] hover:bg-[#ff7711] shadow-[0_0_15px_rgba(255,102,0,0.4)] hover:shadow-[0_0_25px_rgba(255,102,0,0.7)] transition-all"
            >
              <span>📍 OPEN IN GOOGLE MAPS</span>
              <span className="text-xs">↗</span>
            </a>
          </div>

          {/* Column 2: Direct Comms & Fast Contact Form (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#0e0e13]/85 border border-border-strong/80 hover:border-[#ff6600]/50 p-5 md:p-6 backdrop-blur-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] text-[#ff6600] tracking-wider uppercase font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  DIRECT CHANNELS
                </span>
                <span className="font-mono text-[9px] text-text-muted border border-border px-1.5 py-0.5 rounded">
                  24/7 LIVE
                </span>
              </div>

              {/* Direct WhatsApp Quick Chat */}
              <a
                href="https://wa.me/212600000000?text=Hello%20Triple%20Stars%20Team!%20I%20have%20a%20question%20about%20the%20tournaments."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/70 transition-all mb-3 text-emerald-400"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <div className="text-left">
                    <div className="font-mono text-xs font-bold text-white group-hover:text-emerald-300">
                      WhatsApp Support Line
                    </div>
                    <div className="font-mono text-[10px] text-text-secondary">
                      +212 600-000000 • Instant Reply
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  CHAT ↗
                </span>
              </a>

              {/* Email & Phone Copy Triggers */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleCopy('support@triplestars.gg', 'email')}
                  className="p-2.5 rounded-xl bg-[#141419] hover:bg-[#1c1c24] border border-border hover:border-[#ff6600]/40 text-left transition-all"
                >
                  <div className="text-[10px] font-mono text-text-muted">EMAIL</div>
                  <div className="text-[11px] font-mono text-white truncate">
                    {copied === 'email' ? '✓ COPIED' : 'support@triplestars.gg'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('+212 600 000 000', 'phone')}
                  className="p-2.5 rounded-xl bg-[#141419] hover:bg-[#1c1c24] border border-border hover:border-[#ff6600]/40 text-left transition-all"
                >
                  <div className="text-[10px] font-mono text-text-muted">PHONE</div>
                  <div className="text-[11px] font-mono text-white truncate">
                    {copied === 'phone' ? '✓ COPIED' : '+212 600 000 000'}
                  </div>
                </button>
              </div>

              {/* Quick Message Dispatch Form */}
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Name / Gamer Tag"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121216] border border-border focus:border-[#ff6600] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none transition-colors"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone Number or Email"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full bg-[#121216] border border-border focus:border-[#ff6600] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none transition-colors"
                  required
                />
                <textarea
                  placeholder="Inquiry / Registration questions..."
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#121216] border border-border focus:border-[#ff6600] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none resize-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg font-mono text-xs font-bold text-white bg-[#1a1a22] hover:bg-[#ff6600] hover:text-black border border-[#ff6600]/40 transition-all duration-200"
                >
                  {formSent ? '✓ MESSAGE DISPATCHED' : 'SEND DISPATCH →'}
                </button>
              </form>
            </div>
          </div>

          {/* Column 3: Social Media Community Matrix (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#0e0e13]/85 border border-border-strong/80 hover:border-[#ff6600]/50 p-5 md:p-6 backdrop-blur-xl transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] text-[#ff6600] tracking-wider uppercase font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff6600] animate-pulse" />
                  COMMUNITY MATRIX
                </span>
                <span className="font-mono text-[9px] text-text-muted border border-border px-1.5 py-0.5 rounded">
                  SOCIALS
                </span>
              </div>

              {/* Social Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between p-3 rounded-xl bg-[#121216] hover:bg-[#1b1b22] border border-border hover:border-[#ff6600]/60 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-[#ff6600] transition-colors">
                        {s.name}
                      </span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-text-muted group-hover:text-white">
                        {s.badge}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-text-secondary truncate group-hover:text-text-primary">
                      {s.handle}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom Cyber Tag */}
            <div className="p-3 rounded-xl bg-[#141419]/90 border border-border text-center">
              <span className="font-mono text-[10px] text-text-muted tracking-wider">
                TRIPLE STARS ESPORTS • CONNECTED 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
