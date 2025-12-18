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
  offsetTop?: number
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
  padding: () => ({ top: 40, bottom: 40, left: 0, right: 0 }),
  projection: 'globe',
  offsetTop: 0
})

const emit = defineEmits<{
  airportClick: [airport: GlobeAirport]
  zoomChange: [zoom: number]
}>()

const theme = ref<'light' | 'dark'>('light')
const colors = computed(() => globePalette[theme.value])

const mapContainer = ref<HTMLDivElement | null>(null)
let map: any = null
let animationFrameId: number | null = null
let maplibregl: any = null
let currentPopup: any = null

const airportsGeoJSON = computed(() => airportsToGeoJSON(props.airports))
const routesGeoJSON = computed(() => routesToGeoJSON(props.routes))

function updateLayers() {
  if (!map || !maplibregl) return
  const palette = colors.value

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

  if (map.getSource('airports')) {
    (map.getSource('airports') as any).setData(airportsGeoJSON.value)
  } else {
    map.addSource('airports', { type: 'geojson', data: airportsGeoJSON.value })
    map.addLayer({
      id: 'airports',
      type: 'circle',
      source: 'airports',
      paint: {
        'circle-radius': ['case', ['get', 'isHub'], 10, 7],
        'circle-color': ['case', ['get', 'isHub'], palette.primary, palette.primary],
        'circle-stroke-width': ['case', ['get', 'isHub'], 3, 2],
        'circle-stroke-color': palette.surface
      }
    })
  }

  if (map.getLayer('routes')) {
    map.setLayoutProperty('routes', 'visibility', props.showRoutes ? 'visible' : 'none')
  }
  if (map.getLayer('airports')) {
    map.setLayoutProperty('airports', 'visibility', props.showAirports ? 'visible' : 'none')
  }
}

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
    map.setPaintProperty('airports', 'circle-color', ['case', ['get', 'isHub'], palette.primary, palette.primary])
    map.setPaintProperty('airports', 'circle-stroke-color', palette.surface)
  }
}

function setupAirportInteraction() {
  if (!map || !maplibregl) return

  map.on('click', 'airports', (e: any) => {
    if (!e.features || !e.features[0]) return

    const feature = e.features[0]
    const coords = feature.geometry.coordinates.slice()
    const properties = feature.properties

    const airportData: GlobeAirport = {
      id: properties.id,
      name: properties.name,
      iata: properties.iata,
      icao: properties.icao,
      timezone: properties.timezone,
      coords: coords as [number, number],
      isHub: properties.isHub
    }

    emit('airportClick', airportData)

    if (currentPopup) {
      currentPopup.remove()
    }

    const popupContent = `
      <div style="font-family: 'Montserrat', sans-serif; padding: 8px; min-width: 180px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 20px; font-weight: 700;">${properties.iata}</span>
          ${properties.icao ? `<span style="font-size: 12px; color: #6B7280;">${properties.icao}</span>` : ''}
        </div>
        <div style="font-size: 14px; color: #374151; margin-bottom: 8px;">${properties.name}</div>
        ${properties.timezone ? `<div style="font-size: 12px; color: #6B7280;">🌐 ${properties.timezone}</div>` : ''}
        ${properties.isHub ? '<div style="font-size: 12px; color: #1D4ED8; margin-top: 4px;">✈ Your Hub</div>' : ''}
      </div>
    `

    currentPopup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: '300px'
    })
      .setLngLat(coords)
      .setHTML(popupContent)
      .addTo(map)
  })

  map.on('mouseenter', 'airports', () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'airports', () => {
    map.getCanvas().style.cursor = ''
  })
}

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

const setProjection = (type: 'globe' | 'mercator') => {
  if (map) {
    try {
      map.setProjection({ type })
    } catch (e) {
      console.warn('Could not change projection:', e)
    }
  }
}

const zoomIn = () => {
  if (map) {
    map.zoomIn()
  }
}

const zoomOut = () => {
  if (map) {
    map.zoomOut()
  }
}

const getZoom = () => {
  return map ? map.getZoom() : props.zoom
}

defineExpose({
  setProjection,
  zoomIn,
  zoomOut,
  getZoom
})

async function initMap() {
  if (!mapContainer.value) {
    return
  }

  try {
    const module = await import('maplibre-gl')
    maplibregl = module.default || module

    const palette = colors.value
    const style = createMapStyle(palette, props.projection)

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

    map.on('load', () => {
      if (!map) return

      if (props.projection === 'globe') {
        try {
          map.setProjection({ type: 'globe' })
        } catch (e) {
          console.warn('Could not set globe projection:', e)
        }
      }

      const padding = {
        top: Math.max(0, props.padding.top),
        bottom: Math.max(0, props.padding.bottom),
        left: Math.max(0, props.padding.left),
        right: Math.max(0, props.padding.right)
      }
      map.setPadding(padding)

      updateLayers()
      setupAirportInteraction()

      if (props.autoRotate) {
        startAutoRotate()
      }
    })

    map.on('zoom', () => {
      emit('zoomChange', map.getZoom())
    })
  } catch (error) {
    console.error('Failed to initialize map:', error)
  }
}

watch(() => props.projection, (newVal) => {
  if (map) {
    try {
      map.setProjection({ type: newVal })
    } catch (e) {
      console.warn('Could not change projection:', e)
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
  if (currentPopup) {
    currentPopup.remove()
  }
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

