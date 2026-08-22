'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

export const ARENA_COORDINATES: [number, number] = [27.1430625, -13.1623125]
export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/Triple+stars/@27.1430601,-13.1623742,20z/data=!4m14!1m7!3m6!1s0xc370d9198f5df1b:0xb03d68ceea96ab2c!2sTriple+stars!8m2!3d27.1430625!4d-13.1623125!16s%2Fg%2F11xkhl80mv!3m5!1s0xc370d9198f5df1b:0xb03d68ceea96ab2c!8m2!3d27.1430625!4d-13.1623125!16s%2Fg%2F11xkhl80mv?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D'

interface ArenaMapProps {
  className?: string
  height?: string
  initialZoom?: number
}

export default function ArenaMap({
  className = '',
  height = '100%',
  initialZoom = 17,
}: ArenaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (!mapContainerRef.current) return

      const L = (await import('leaflet')).default

      if (!isMounted || !mapContainerRef.current) return

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const map = L.map(mapContainerRef.current, {
        center: ARENA_COORDINATES,
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
      })

      mapInstanceRef.current = map

      // Dark tiles matching the theme
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 20,
          subdomains: ['a', 'b', 'c', 'd'],
        }
      ).addTo(map)

      // Sleek custom glowing pin for Triple Stars
      const customIcon = L.divIcon({
        className: 'arena-marker-custom',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <div class="absolute w-8 h-8 rounded-full bg-[#ff6600]/25 animate-ping"></div>
            <div class="absolute w-6 h-6 rounded-full bg-[#ff6600]/35 animate-pulse"></div>
            <div class="relative z-10 w-6 h-6 rounded-full bg-[#111116] border-2 border-[#ff6600] flex items-center justify-center shadow-[0_0_15px_#ff6600]">
              <span class="text-[#ff6600] text-[10px] font-bold">★</span>
            </div>
            <div class="absolute -top-7 whitespace-nowrap bg-[#121218]/95 border border-[#ff6600]/60 px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold text-white shadow-lg pointer-events-none">
              Triple Stars
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(ARENA_COORDINATES, { icon: customIcon }).addTo(map)
      markerRef.current = marker

      // Clean Popup
      const popupContent = `
        <div class="p-1 font-sans text-left">
          <div class="font-bold text-white text-xs mb-0.5 flex items-center gap-1.5">
            <span class="text-[#ff6600]">★</span> Triple Stars Arena
          </div>
          <div class="text-[11px] text-zinc-400 mb-2">
            Laâyoune, Morocco
          </div>
          <a
            href="${GOOGLE_MAPS_URL}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block w-full text-center py-1.5 px-3 rounded-lg bg-[#ff6600] text-black font-semibold text-[11px] hover:bg-[#ff7a1a] transition-colors"
          >
            Get Directions ↗
          </a>
        </div>
      `

      marker.bindPopup(popupContent, {
        className: 'custom-clean-popup',
        closeButton: false,
        maxWidth: 220,
      })

      setTimeout(() => {
        if (map && isMounted) {
          map.invalidateSize()
          setIsLoaded(true)
        }
      }, 150)
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [initialZoom])

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut()
  }

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(ARENA_COORDINATES, 18, { duration: 1 })
      markerRef.current?.openPopup()
    }
  }

  return (
    <div
      className={`relative w-full h-full min-h-[260px] rounded-2xl overflow-hidden bg-[#0e0e14] border border-white/10 group ${className}`}
      style={{ height }}
    >
      {/* Map Leaflet Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Floating Controls (Top-Right) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <div className="flex flex-col rounded-xl overflow-hidden bg-[#14141c]/90 border border-white/10 backdrop-blur-md shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/10 border-b border-white/5 transition-colors"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            −
          </button>
        </div>

        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter Map"
          aria-label="Recenter Map"
          className="w-8 h-8 rounded-xl bg-[#14141c]/90 border border-white/10 hover:border-[#ff6600]/60 text-zinc-300 hover:text-[#ff6600] hover:bg-white/5 backdrop-blur-md flex items-center justify-center text-xs transition-all shadow-md"
        >
          📍
        </button>
      </div>

      {/* Top Left Venue Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14141c]/90 border border-white/10 backdrop-blur-md shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-white">Triple Stars Arena</span>
          <span className="text-[10px] text-zinc-400">• Laâyoune</span>
        </div>
      </div>

      {/* Bottom Floating Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14141c]/90 border border-white/10 backdrop-blur-md text-[11px] text-zinc-300 pointer-events-auto">
          <span>Open Daily</span>
          <span className="text-zinc-500">•</span>
          <span className="text-white font-medium">10:00 AM – 02:00 AM</span>
        </div>

        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff6600] hover:bg-[#ff7a1a] text-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(255,102,0,0.3)] pointer-events-auto ml-auto"
        >
          <span>Open in Google Maps</span>
          <span>↗</span>
        </a>
      </div>

      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#0e0e14] flex items-center justify-center z-20">
          <div className="w-6 h-6 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
