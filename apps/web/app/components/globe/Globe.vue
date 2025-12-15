<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import type { GlobeAirport, GlobeRoute } from './types'
import { globePalette } from './palette'
import { airportsToGeoJSON, routesToGeoJSON, createMapStyle } from './utils'

interface Props {
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

const props = withDefaults(defineProps<Props>(), {
  airports: () => [],
  routes: () => [],
  interactive: true,
  autoRotate: false,
  rotateSpeed: 0.2,
  showRoutes: true,
  showAirports: true,
  center: () => [40, 25],
  zoom: 1.8,
  pitch: 30,
  padding: () => ({ top: 40, bottom: 320, left: 0, right: 0 }),
  projection: 'globe'
})

const theme = ref<'light' | 'dark'>('light')
const colors = computed(() => globePalette[theme.value])

const mapContainer = ref<HTMLDivElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any = null
let animationFrameId: number | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let maplibregl: any = null

// Compute GeoJSON data
const airportsGeoJSON = computed(() => airportsToGeoJSON(props.airports))
const routesGeoJSON = computed(() => routesToGeoJSON(props.routes))

// Update map layers when data changes
function updateLayers() {
  if (!map || !maplibregl) return
  const palette = colors.value

  // Update or add routes source/layer
  if (map.getSource('routes')) {
    (map.getSource('routes') as any).setData(routesGeoJSON.value)
  } else {
    map.addSource('routes', { type: 'geojson', data: routesGeoJSON.value })
    map.addLayer({
      id: 'routes',
      type: 'line',
      source: 'routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': palette.primary,
        'line-width': 2.5,
        'line-opacity': 0.8
      }
    })
  }

  // Update or add airports source/layer
  if (map.getSource('airports')) {
    (map.getSource('airports') as any).setData(airportsGeoJSON.value)
  } else {
    map.addSource('airports', { type: 'geojson', data: airportsGeoJSON.value })
    map.addLayer({
      id: 'airports',
      type: 'circle',
      source: 'airports',
      paint: {
        'circle-radius': 7,
        'circle-color': palette.primary,
        'circle-stroke-width': 2,
        'circle-stroke-color': palette.surface
      }
    })
  }

  // Update visibility
  if (map.getLayer('routes')) {
    map.setLayoutProperty('routes', 'visibility', props.showRoutes ? 'visible' : 'none')
  }
  if (map.getLayer('airports')) {
    map.setLayoutProperty('airports', 'visibility', props.showAirports ? 'visible' : 'none')
  }
}

// Update colors when theme changes
function updateColors() {
  if (!map) return
  const palette = colors.value

  if (map.getLayer('background')) {
    map.setPaintProperty('background', 'background-color', palette.ocean)
  }
  if (map.getLayer('land')) {
    map.setPaintProperty('land', 'fill-color', palette.surface)
  }
  if (map.getLayer('borders')) {
    map.setPaintProperty('borders', 'line-color', palette.border)
  }
  if (map.getLayer('routes')) {
    map.setPaintProperty('routes', 'line-color', palette.primary)
  }
  if (map.getLayer('airports')) {
    map.setPaintProperty('airports', 'circle-color', palette.primary)
    map.setPaintProperty('airports', 'circle-stroke-color', palette.surface)
  }
}

// Auto-rotation animation
function startAutoRotate() {
  if (!map || !props.autoRotate) return

  function animate() {
    if (!map || !props.autoRotate) {
      animationFrameId = null
      return
    }

    const center = map.getCenter()
    map.jumpTo({
      center: [center.lng - props.rotateSpeed, center.lat],
      zoom: props.zoom,
      pitch: props.pitch
    })

    animationFrameId = requestAnimationFrame(animate)
  }

  animate()
}

function stopAutoRotate() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// Initialize map
async function initMap() {
  if (!mapContainer.value) {
    console.error('[Globe] Map container not found')
    return
  }

  try {
    // Dynamic import to ensure client-side only
    const module = await import('maplibre-gl')
    maplibregl = module.default || module

    console.log('[Globe] MapLibre GL loaded')
    console.log('[Globe] Projection prop:', props.projection)

    const palette = colors.value
    const style = createMapStyle(palette, props.projection)

    // Create map with projection in style
    const mapOptions: any = {
      container: mapContainer.value,
      style: style,
      center: props.center,
      zoom: props.zoom,
      pitch: props.pitch,
      interactive: props.interactive,
      scrollZoom: props.interactive,
      dragPan: props.interactive,
      dragRotate: props.interactive,
      doubleClickZoom: props.interactive,
      touchZoomRotate: props.interactive,
      keyboard: props.interactive
    }

    map = new maplibregl.Map(mapOptions)

    map.on('error', (e: any) => {
      console.error('[Globe] Map error:', e)
    })

    map.on('load', () => {
      if (!map) return

      console.log('[Globe] Map loaded successfully')

      // Set projection after map loads
      if (props.projection === 'globe') {
        try {
          map.setProjection({ type: 'globe' })
          console.log('[Globe] Globe projection set')
        } catch (e) {
          console.warn('[Globe] Could not set globe projection:', e)
        }
      }

      // Set padding with validation
      const padding = {
        top: Math.max(0, props.padding.top),
        bottom: Math.max(0, props.padding.bottom),
        left: Math.max(0, props.padding.left),
        right: Math.max(0, props.padding.right)
      }
      map.setPadding(padding)

      updateLayers()
      // Note: setFog/atmosphere not available in MapLibre GL 5.x

      if (props.autoRotate) {
        startAutoRotate()
      }
    })
  } catch (error) {
    console.error('[Globe] Failed to initialize map:', error)
  }
}

// Watch for prop changes
watch(() => props.projection, (newVal) => {
  if (map) {
    try {
      map.setProjection({ type: newVal })
    } catch (e) {
      console.warn('[Globe] Could not change projection:', e)
    }
  }
})

watch(() => props.autoRotate, (newVal) => {
  if (newVal) {
    startAutoRotate()
  } else {
    stopAutoRotate()
  }
})

watch([() => props.airports, () => props.routes], () => {
  if (map && map.isStyleLoaded()) {
    updateLayers()
  }
})

watch(theme, () => {
  if (map && map.isStyleLoaded()) {
    updateColors()
  }
})

// Detect system theme
onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  theme.value = mediaQuery.matches ? 'dark' : 'light'

  mediaQuery.addEventListener('change', (e) => {
    theme.value = e.matches ? 'dark' : 'light'
  })

  initMap()
})

onUnmounted(() => {
  stopAutoRotate()
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapContainer" class="globe-container" />
</template>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.globe-container :deep(.maplibregl-ctrl-bottom-left),
.globe-container :deep(.maplibregl-ctrl-bottom-right) {
  display: none !important;
}

.globe-container :deep(.maplibregl-canvas) {
  outline: none;
}
</style>

