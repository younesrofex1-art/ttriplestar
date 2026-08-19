'use client'

export default function ControllerLoader() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] flex items-center justify-end pr-[10%]">
      {/* A subtle pulsing placeholder - simple rectangle with rounded corners and shimmer */}
      <div className="w-[300px] h-[200px] rounded-3xl bg-[#111111]/40 border border-[#222222]/50 animate-pulse relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  )
}
