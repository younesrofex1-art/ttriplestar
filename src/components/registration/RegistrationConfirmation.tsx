'use client'

interface RegistrationConfirmationProps {
  name: string
  registrationNumber: number
  tournamentName: string
}

export default function RegistrationConfirmation({
  name,
  registrationNumber,
  tournamentName,
}: RegistrationConfirmationProps) {
  const formattedNumber = `#${String(registrationNumber).padStart(3, '0')}`

  return (
    <div className="space-y-8">
      {/* Success header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="status-dot status-online" />
          <span className="font-mono text-xs text-accent tracking-wider">
            REGISTRATION RECEIVED
          </span>
        </div>

        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {name}
        </h2>

        <p className="font-mono text-xs text-text-secondary">
          {tournamentName}
        </p>
      </div>

      {/* Registration details */}
      <div className="space-y-4 border-t border-border pt-6">
        <div className="space-y-1">
          <p className="font-mono text-xs text-text-secondary tracking-wider">
            REGISTRATION NUMBER
          </p>
          <p className="font-mono text-3xl font-bold text-accent">
            {formattedNumber}
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-mono text-xs text-text-secondary tracking-wider">
            STATUS
          </p>
          <div className="flex items-center gap-2">
            <span className="status-dot status-pending" />
            <span className="font-mono text-sm text-warning">
              PENDING CONFIRMATION
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="border-t border-border pt-6">
        <p className="font-sans text-xs text-text-secondary leading-relaxed">
          Your registration has been received. You will be contacted to confirm
          your spot and payment. Please save your registration number.
        </p>
      </div>
    </div>
  )
}
