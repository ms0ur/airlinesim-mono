import type { GlobeAirport, GlobeRoute } from './types'


export function approxDistanceKm(a: [number, number], b: [number, number]): number {
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = lat2 - lat1
  let dLng = Math.abs(lng2 - lng1)
  if (dLng > 180) dLng = 360 - dLng
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 100)
}

export function routeCoordsThroughAntimeridian(
  start: [number, number],
  end: [number, number]
): [[number, number], [number, number]] {
  const [lng1, lat1] = start
  let [lng2, lat2] = end

  const delta = lng2 - lng1
  if (delta >= 180) {
    lng2 -= 360
  } else if (delta <= -180) {
    lng2 += 360
  }

  return [
    [lng1, lat1],
    [lng2, lat2]
  ]
}


export function airportsToGeoJSON(airports: GlobeAirport[]) {
  return {
    type: 'FeatureCollection' as const,
    features: airports.map((airport) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: airport.coords
      },
      properties: {
        id: airport.id,
        name: airport.name,
        iata: airport.iata,
        pax: airport.pax
      }
    }))
  }
}


export function routesToGeoJSON(routes: GlobeRoute[]) {
  return {
    type: 'FeatureCollection' as const,
    features: routes.map((route) => ({
      type: 'Feature' as const,
      properties: {
        id: route.id,
        from: route.from.name,
        to: route.to.name,
        distance: route.distanceKm ? `${route.distanceKm} km` : undefined
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: routeCoordsThroughAntimeridian(route.from.coords, route.to.coords)
      }
    }))
  }
}


export function createMapStyle(colors: { ocean: string; surface: string; border: string }, projection: 'globe' | 'mercator' = 'globe') {
  return {
    version: 8 as const,
    projection: { type: projection },
    sources: {
      world: {
        type: 'geojson' as const,
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson'
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background' as const,
        paint: { 'background-color': colors.ocean }
      },
      {
        id: 'land',
        type: 'fill' as const,
        source: 'world',
        paint: { 'fill-color': colors.surface }
      },
      {
        id: 'borders',
        type: 'line' as const,
        source: 'world',
        paint: {
          'line-color': colors.border,
          'line-width': 1
        }
      }
    ],
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
  }
}
