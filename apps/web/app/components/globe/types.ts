export interface GlobeAirport {
  id: string
  name: string
  iata: string
  coords: [number, number]
  pax?: string
  isHub?: boolean
  icao?: string
  timezone?: string
}

export interface GlobeRoute {
  id: string
  from: GlobeAirport
  to: GlobeAirport
  distanceKm?: number
}

export interface GlobeProps {
  airports?: GlobeAirport[]
  routes?: GlobeRoute[]
  interactive?: boolean
  autoRotate?: boolean
  rotateSpeed?: number
  showRoutes?: boolean
  showAirports?: boolean
  center?: [number, number]
  zoom?: number
  pitch?: number
  padding?: { top: number; bottom: number; left: number; right: number }
  projection?: 'globe' | 'mercator'
}

export const defaultGlobeProps = {
  airports: [] as GlobeAirport[],
  routes: [] as GlobeRoute[],
  interactive: true,
  autoRotate: false,
  rotateSpeed: 0.2,
  showRoutes: true,
  showAirports: true,
  center: [40, 25] as [number, number],
  zoom: 1.8,
  pitch: 30,
  padding: { top: 40, bottom: 320, left: 0, right: 0 },
  projection: 'globe' as const
}
