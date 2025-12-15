// Globe component types

export interface GlobeAirport {
  id: string
  name: string
  iata: string
  coords: [number, number] // [lng, lat]
  pax?: string
}

export interface GlobeRoute {
  id: string
  from: GlobeAirport
  to: GlobeAirport
  distanceKm?: number
}

export interface GlobeProps {
  /** Airports to display on globe */
  airports?: GlobeAirport[]
  /** Routes to display on globe */
  routes?: GlobeRoute[]
  /** Enable user interaction (pan, zoom, rotate) */
  interactive?: boolean
  /** Enable auto-rotation */
  autoRotate?: boolean
  /** Auto-rotation speed (degrees per frame) */
  rotateSpeed?: number
  /** Show routes layer */
  showRoutes?: boolean
  /** Show airports layer */
  showAirports?: boolean
  /** Initial center [lng, lat] */
  center?: [number, number]
  /** Initial zoom level */
  zoom?: number
  /** Initial pitch angle */
  pitch?: number
  /** Padding for the map view */
  padding?: { top: number; bottom: number; left: number; right: number }
  /** Projection mode */
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
