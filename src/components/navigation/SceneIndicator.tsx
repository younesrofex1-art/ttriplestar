'use client'

import { SCENES } from '@/lib/types'

interface SceneIndicatorProps {
  activeScene: number
  onNavigate?: (index: number) => void
}

export default function SceneIndicator({ activeScene, onNavigate }: SceneIndicatorProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 hidden md:flex bg-bg-surface/60 backdrop-blur-md px-4 py-2 rounded-full border border-border/80"
      role="tablist"
      aria-label="Scene navigation dots"
    >
      {SCENES.map((scene, index) => (
        <button
          key={scene.id}
          onClick={() => onNavigate?.(index)}
          className="group relative p-1 focus:outline-none"
          role="tab"
          aria-selected={index === activeScene}
          aria-label={`Jump to ${scene.label}`}
        >
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeScene
                ? 'w-8 bg-accent shadow-[0_0_10px_rgba(0,255,136,0.5)]'
                : 'w-2 bg-border-strong group-hover:bg-text-secondary group-hover:w-4'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
