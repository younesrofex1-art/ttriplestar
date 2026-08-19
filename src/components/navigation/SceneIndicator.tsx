'use client'

import { SCENES } from '@/lib/types'

interface SceneIndicatorProps {
  activeScene: number
}

export default function SceneIndicator({ activeScene }: SceneIndicatorProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 md:flex hidden"
      role="tablist"
      aria-label="Scene indicators"
    >
      {SCENES.map((scene, index) => (
        <div key={scene.id} className="flex items-center gap-2">
          <div
            className={`h-1 rounded-full transition-all duration-500 ${
              index === activeScene
                ? 'w-8 bg-accent'
                : 'w-2 bg-border-strong'
            }`}
            role="tab"
            aria-selected={index === activeScene}
            aria-label={scene.label}
          />
        </div>
      ))}
    </div>
  )
}
