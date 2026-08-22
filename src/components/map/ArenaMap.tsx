'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

// Target Coordinates for "Triple stars"
export const ARENA_COORDINATES: [number, number] = [27.1430625, -13.1623125]
export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/Triple+stars/@27.1430601,-13.1623742,20z/data=!4m14!1m7!3m6!1s0xc370d9198f5df1b:0xb03d68ceea96ab2c!2sTriple+stars!8m2!3d27.1430625!4d-13.1623125!16s%2Fg%2F11xkhl80mv!3m5!1s0xc370d9198f5df1b:0xb03d68ceea96ab2c!8m2!3d27.1430625!4d-13.1623125!16s%2Fg%2F11xkhl80mv?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D'

interface ArenaMapProps {
  className?: string
  height?: string
  showControls?: boolean
  interactive?: boolean
  initialZoom?: number
  onExpand?: () => void
}

export default function ArenaMap({
  className = '',
  height = '180px',
  showControls = true,
  interactive = true,
  initialZoom = 17,
  onExpand,
}: ArenaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null)

  const [mapType, setMapType] = useState<'tactical' | 'satellite'>('tactical')
  const [isCopied, setIsCopied] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize Map
  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (!mapContainerRef.current) return

      // Dynamically import Leaflet to ensure client-side only execution
      const L = (await import('leaflet')).default

      if (!isMounted || !mapContainerRef.current) return

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const map = L.map(mapContainerRef.current, {
        center: ARENA_COORDINATES,
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false, // Prevent page scroll trapping
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
      })

      mapInstanceRef.current = map

      // Tiles: CartoDB Dark Matter for tactical cyber dark look
      const darkTileUrl =
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      const satelliteTileUrl =
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

      const activeUrl = mapType === 'satellite' ? satelliteTileUrl : darkTileUrl
      const activeSubdomains = mapType === 'satellite' ? ['a', 'b', 'c', 'd'] : ['a', 'b', 'c', 'd']

      const tileLayer = L.tileLayer(activeUrl, {
        maxZoom: 20,
        subdomains: activeSubdomains,
      }).addTo(map)

      tileLayerRef.current = tileLayer

      // Custom Cyber Glow Marker
      const customIcon = L.divIcon({
        className: 'cyber-arena-marker',
        html: `
          <div class="relative flex items-center justify-center w-12 h-12 -translate-x-1/2 -translate-y-1/2">
            <!-- Pulsing Radar Waves -->
            <div class="absolute inset-0 rounded-full bg-[#ff6600]/30 animate-ping duration-1000"></div>
            <div class="absolute w-8 h-8 rounded-full bg-[#ff6600]/40 animate-pulse"></div>
            <div class="absolute w-10 h-10 rounded-full border border-[#ff6600]/60 animate-spin" style="animation-duration: 8s; border-style: dashed;"></div>
            
            <!-- Center Core Marker -->
            <div class="relative z-10 w-6 h-6 rounded-full bg-[#0e0e13] border-2 border-[#ff6600] flex items-center justify-center shadow-[0_0_15px_#ff6600] transition-transform hover:scale-125">
              <span class="text-[#ff6600] text-[10px] font-black leading-none select-none">★</span>
            </div>

            <!-- Callout Pin Label -->
            <div class="absolute -top-7 whitespace-nowrap bg-[#0a0a0e]/90 border border-[#ff6600]/80 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#ff6600] shadow-[0_0_10px_rgba(255,102,0,0.5)] flex items-center gap-1 backdrop-blur-md pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-[#ff6600] animate-pulse"></span>
              TRIPLE STARS
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(ARENA_COORDINATES, { icon: customIcon }).addTo(map)
      markerRef.current = marker

      // Custom Dark Cyber Popup
      const popupContent = `
        <div class="p-1 font-mono text-left select-none">
          <div class="flex items-center gap-1.5 text-[#ff6600] font-bold text-xs mb-1">
            <span>★</span>
            <span>TRIPLE STARS ARENA HQ</span>
          </div>
          <div class="text-[11px] text-zinc-300 mb-1 leading-snug">
            Boulevard Hassan II, Gaming Complex
          </div>
          <div class="text-[10px] text-emerald-400 font-semibold mb-2">
            ● ARENA OPERATIONAL // 10:00 - 02:00
          </div>
          <div class="text-[9px] text-zinc-500 mb-2">
            GPS: 27.14306° N, 13.16231° W
          </div>
          <a
            href="${GOOGLE_MAPS_URL}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-1 w-full py-1 px-2 rounded bg-[#ff6600] text-black font-bold text-[10px] hover:bg-[#ff7711] transition-colors"
          >
            <span>ROUTE IN GOOGLE MAPS</span>
            <span>↗</span>
          </a>
        </div>
      `

      marker.bindPopup(popupContent, {
        className: 'cyber-map-popup',
        closeButton: false,
        maxWidth: 240,
      })

      // Invalidate size once rendered
      setTimeout(() => {
        if (map && isMounted) {
          map.invalidateSize()
          setIsLoaded(true)
        }
      }, 200)
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [initialZoom, interactive])

  // Handle Map Type Switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return

    import('leaflet').then((L) => {
      const darkTileUrl =
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      const satelliteTileUrl =
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

      const nextUrl = mapType === 'satellite' ? satelliteTileUrl : darkTileUrl

      mapInstanceRef.current.removeLayer(tileLayerRef.current)
      const newLayer = L.tileLayer(nextUrl, {
        maxZoom: 20,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(mapInstanceRef.current)

      tileLayerRef.current = newLayer
    })
  }, [mapType])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(ARENA_COORDINATES, 18, {
        duration: 1.2,
      })
      if (markerRef.current) {
        markerRef.current.openPopup()
      }
    }
  }

  const handleCopyCoords = () => {
    navigator.clipboard.writeText('27.1430625, -13.1623125')
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-border-strong/90 bg-[#09090d] group ${className}`}
      style={{ height }}
    >
      {/* HUD Corner Tech Accents */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#ff6600]/80 z-20 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#ff6600]/80 z-20 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#ff6600]/80 z-20 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#ff6600]/80 z-20 pointer-events-none" />

      {/* Cyber Grid Crosshair Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(10,10,14,0.4)_100%)] pointer-events-none z-10" />

      {/* Top HUD Bar */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-[#0a0a0f]/90 border border-border-strong/90 px-2 py-0.5 rounded-md backdrop-blur-md pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6600] animate-pulse" />
          <span className="font-mono text-[9px] text-zinc-300 font-bold tracking-wider">
            GPS 27.143° N, 13.162° W
          </span>
        </div>

        {/* Map Mode Switcher */}
        {showControls && (
          <div className="flex items-center gap-1 bg-[#0a0a0f]/90 border border-border-strong/90 p-0.5 rounded-md backdrop-blur-md pointer-events-auto">
            <button
              type="button"
              onClick={() => setMapType('tactical')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                mapType === 'tactical'
                  ? 'bg-[#ff6600] text-black shadow-[0_0_8px_rgba(255,102,0,0.5)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              TACTICAL
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                mapType === 'satellite'
                  ? 'bg-[#ff6600] text-black shadow-[0_0_8px_rgba(255,102,0,0.5)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ORBIT
            </button>
          </div>
        )}
      </div>

      {/* Interactive Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Floating HUD Controls */}
      {showControls && (
        <div className="absolute bottom-2 right-2 z-20 flex flex-col gap-1 pointer-events-auto">
          <div className="flex flex-col rounded-md overflow-hidden bg-[#0e0e14]/90 border border-border-strong/90 backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="w-6 h-6 flex items-center justify-center font-mono text-xs font-bold text-zinc-200 hover:text-[#ff6600] hover:bg-white/5 border-b border-border/50 transition-colors"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="w-6 h-6 flex items-center justify-center font-mono text-xs font-bold text-zinc-200 hover:text-[#ff6600] hover:bg-white/5 transition-colors"
            >
              −
            </button>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            title="Focus Arena HQ"
            aria-label="Focus Arena HQ"
            className="w-6 h-6 rounded-md bg-[#0e0e14]/90 border border-[#ff6600]/50 hover:border-[#ff6600] flex items-center justify-center text-[#ff6600] hover:bg-[#ff6600]/20 backdrop-blur-md transition-all shadow-[0_0_10px_rgba(255,102,0,0.2)]"
          >
            <span className="text-[10px]">🎯</span>
          </button>

          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              title="Expand Full Tactical Map"
              aria-label="Expand Full Tactical Map"
              className="w-6 h-6 rounded-md bg-[#0e0e14]/90 border border-border-strong hover:border-white flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all"
            >
              <span className="text-[9px]">⛶</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Left Quick Status / Coordinates Copy */}
      <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 pointer-events-auto">
        <button
          type="button"
          onClick={handleCopyCoords}
          className="bg-[#0a0a0f]/85 hover:bg-[#151520] border border-border-strong hover:border-[#ff6600]/60 px-2 py-0.5 rounded text-[8px] font-mono text-zinc-400 hover:text-[#ff6600] transition-colors flex items-center gap-1 backdrop-blur-md"
        >
          <span>{isCopied ? '✓ COPIED' : '📋 COPY GPS'}</span>
        </button>
      </div>

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#09090d] flex items-center justify-center z-30">
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#ff6600]">
            <span className="w-2 h-2 rounded-full bg-[#ff6600] animate-ping" />
            <span>CALIBRATING SATELLITE RADAR...</span>
          </div>
        </div>
      )}
    </div>
  )
}
