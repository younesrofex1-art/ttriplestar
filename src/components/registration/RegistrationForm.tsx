'use client'

import { useState } from 'react'
import type { Tournament } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface RegistrationFormProps {
  tournament: Tournament
  onSuccess: (name: string, registrationNumber: number) => void
}

export default function RegistrationForm({
  tournament,
  onSuccess,
}: RegistrationFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validatePhone = (value: string): boolean => {
    // Accept Moroccan formats: 06/07xxxxxxxx, +2126/7xxxxxxxx
    const cleaned = value.replace(/[\s\-()]/g, '')
    return /^(\+?212|0)[567]\d{8}$/.test(cleaned)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your name (at least 2 characters).')
      return
    }

    if (!validatePhone(trimmedPhone)) {
      setError('Please enter a valid phone number (e.g., 0612345678).')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { data, error: rpcError } = await supabase.rpc('public_register', {
        p_tournament_id: tournament.id,
        p_name: trimmedName,
        p_phone: trimmedPhone,
      })

      if (rpcError) {
        if (rpcError.message.includes('already registered')) {
          setError('This phone number is already registered for this tournament.')
        } else if (rpcError.message.includes('not open')) {
          setError('Registration is not currently open for this tournament.')
        } else if (rpcError.message.includes('full')) {
          setError('This tournament is full. Registration is closed.')
        } else {
          setError(rpcError.message)
        }
        setIsSubmitting(false)
        return
      }

      onSuccess(trimmedName, data?.registration_number ?? 0)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tournament info */}
      <div className="space-y-2">
        <p className="font-mono text-xs text-text-secondary tracking-wider">
          REGISTER FOR
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {tournament.name}
        </h2>
        {tournament.game && (
          <p className="font-mono text-xs text-text-secondary">
            {tournament.game.name}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <span className="font-mono text-xs text-text-secondary">
            {tournament.entry_fee_mad} MAD ENTRY
          </span>
          <span className="font-mono text-xs text-text-secondary">
            {tournament.max_players} PLAYERS MAX
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="reg-name"
            className="font-mono text-xs text-text-secondary tracking-wider block"
          >
            NAME
          </label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            minLength={2}
            className="w-full bg-transparent border-b border-border-strong py-2 text-text-primary font-sans text-sm placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="reg-phone"
            className="font-mono text-xs text-text-secondary tracking-wider block"
          >
            PHONE
          </label>
          <input
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
            required
            className="w-full bg-transparent border-b border-border-strong py-2 text-text-primary font-sans text-sm placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
            autoComplete="tel"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="font-mono text-xs text-live border border-live/20 bg-live/5 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-mono text-xs tracking-widest border border-accent text-accent py-3 hover:bg-accent hover:text-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'SUBMITTING...' : 'CONFIRM REGISTRATION'}
      </button>
    </form>
  )
}
