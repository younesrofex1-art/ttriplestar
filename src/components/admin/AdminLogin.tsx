'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AdminLoginProps {
  onSuccess?: () => void
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please verify your credentials.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Email is not confirmed yet. Check your inbox or Supabase dashboard.')
        } else {
          setError(authError.message)
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        if (onSuccess) {
          onSuccess()
        } else {
          window.location.href = '/admin'
        }
      }
    } catch {
      setError('An unexpected error occurred during authentication.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background grid texture */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />

      {/* Subtle ambient orange/cyber glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff6600]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#121214] border border-border-strong p-8 rounded-xl relative z-10 shadow-2xl backdrop-blur-md">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6600] animate-pulse" />
            <span className="font-mono text-[10px] text-[#ff6600] uppercase tracking-widest font-bold">
              SECURITY CHECKPOINT
            </span>
          </div>
          <span className="font-mono text-[10px] text-text-muted border border-border px-2 py-0.5 rounded">
            AUTH v2.6
          </span>
        </div>

        {/* Branding & Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-text-primary">
            TRIPLE STARS
          </h1>
          <h2 className="text-xs font-mono text-text-secondary tracking-widest uppercase mt-1">
            ADMINISTRATOR ACCESS
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono text-xs flex items-start gap-2">
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 font-mono text-xs">
          <div>
            <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[10px]">
              ADMIN EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@triplestars.ma"
              autoComplete="email"
              className="w-full bg-[#18181b] border border-border text-text-primary px-3.5 py-3 rounded-lg focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] focus:outline-none transition-all placeholder:text-text-muted text-sm font-sans"
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-1.5 uppercase tracking-wider text-[10px]">
              ACCESS PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full bg-[#18181b] border border-border text-text-primary px-3.5 py-3 pr-12 rounded-lg focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] focus:outline-none transition-all placeholder:text-text-muted text-sm font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-[11px] p-1 font-mono"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#ff6600] hover:bg-[#ff7700] text-black font-mono font-bold text-xs py-3.5 px-4 rounded-lg tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,102,0,0.25)] hover:shadow-[0_0_25px_rgba(255,102,0,0.4)] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <span>SIGN IN TO CONTROL PANEL →</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
          <a
            href="/"
            className="hover:text-text-primary transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>BACK TO WEBSITE</span>
          </a>
          <span>CASABLANCA HQ</span>
        </div>
      </div>
    </div>
  )
}
