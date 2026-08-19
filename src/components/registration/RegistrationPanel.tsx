'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import type { Tournament } from '@/lib/types'
import RegistrationForm from './RegistrationForm'
import RegistrationConfirmation from './RegistrationConfirmation'

interface RegistrationPanelProps {
  tournament: Tournament
  isOpen: boolean
  onClose: () => void
}

export default function RegistrationPanel({
  tournament,
  isOpen,
  onClose,
}: RegistrationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [registrationResult, setRegistrationResult] = useState<{
    name: string
    registrationNumber: number
  } | null>(null)

  useEffect(() => {
    if (!panelRef.current || !overlayRef.current) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'

      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.fromTo(
        panelRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: 'power3.out' }
      )
    } else {
      gsap.to(panelRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in',
      })
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          document.body.style.overflow = ''
        },
      })
    }
  }, [isOpen])

  const handleClose = () => {
    setRegistrationResult(null)
    onClose()
  }

  const handleSuccess = (name: string, registrationNumber: number) => {
    setRegistrationResult({ name, registrationNumber })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Tournament Registration">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-bg-surface border-l border-border flex flex-col translate-x-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-border">
          <span className="font-mono text-xs text-text-secondary tracking-wider">
            REGISTRATION
          </span>
          <button
            onClick={handleClose}
            className="font-mono text-xs text-text-secondary hover:text-text-primary transition-colors p-2"
            aria-label="Close registration"
          >
            CLOSE ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {registrationResult ? (
            <RegistrationConfirmation
              name={registrationResult.name}
              registrationNumber={registrationResult.registrationNumber}
              tournamentName={tournament.name}
            />
          ) : (
            <RegistrationForm
              tournament={tournament}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
