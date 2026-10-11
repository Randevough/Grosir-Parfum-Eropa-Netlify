import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { Branch } from '../../types'
import 'maplibre-gl/dist/maplibre-gl.css'

// MapLibre 6 resolves its worker relative to its module; Vite needs to bundle that worker explicitly.
maplibregl.setWorkerUrl(workerUrl)

// Phosphor Storefront regular path, rasterized for MapLibre's symbol atlas.
const storefrontPath = new Path2D('M232,96a7.89,7.89,0,0,0-.3-2.2L217.35,43.6A16.07,16.07,0,0,0,202,32H54A16.07,16.07,0,0,0,38.65,43.6L24.31,93.8A7.89,7.89,0,0,0,24,96h0v16a40,40,0,0,0,16,32v72a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V144a40,40,0,0,0,16-32V96ZM54,48H202l11.42,40H42.61Zm50,56h48v8a24,24,0,0,1-48,0Zm-16,0v8a24,24,0,0,1-35.12,21.26,7.88,7.88,0,0,0-1.82-1.06A24,24,0,0,1,40,112v-8ZM200,208H56V151.2a40.57,40.57,0,0,0,8,.8,40,40,0,0,0,32-16,40,40,0,0,0,64,0,40,40,0,0,0,32,16,40.57,40.57,0,0,0,8-.8Zm4.93-75.8a8.08,8.08,0,0,0-1.8,1.05A24,24,0,0,1,168,112v-8h48v8A24,24,0,0,1,204.93,132.2Z')

function pinImage(selected: boolean) {
  const canvas = document.createElement('canvas')
  canvas.width = 88; canvas.height = 88
  const context = canvas.getContext('2d')!
  context.beginPath(); context.roundRect(8, 6, 72, 72, 22)
  context.shadowColor = 'rgba(25,26,23,.18)'; context.shadowBlur = 6; context.shadowOffsetY = 3
  context.fillStyle = selected ? '#191a17' : '#ffffff'; context.fill()
  context.shadowColor = 'transparent'
  context.translate(18, 16); context.scale(52 / 256, 52 / 256)
  context.fillStyle = selected ? '#f5cb24' : '#191a17'
  context.fill(storefrontPath)
  return context.getImageData(0, 0, 88, 88)
}

export default function MapPanel({ branches, selectedId, overviewRequest, focusRequest, onSelect }: { branches: Branch[]; selectedId: string; overviewRequest: number; focusRequest: number; onSelect: (id: string) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [status, setStatus] = useState('Memuat peta…')
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  useEffect(() => {
    if (!container.current) return
    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({ container: container.current, style: 'https://tiles.openfreemap.org/styles/positron', center: [106.84, -6.28], zoom: 9, scrollZoom: false, locale: { 'NavigationControl.ZoomIn': 'Perbesar peta', 'NavigationControl.ZoomOut': 'Perkecil peta' }, attributionControl: false })
    } catch { setStatus('Peta tidak tersedia, pilih cabang dari daftar'); return }
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    const timeout = setTimeout(() => setStatus('Peta belum termuat, daftar cabang tetap dapat digunakan'), 12000)
    map.on('load', () => {
      clearTimeout(timeout); setStatus('')
      map.addSource('branches', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, cluster: true, clusterMaxZoom: 12, clusterRadius: 45 })
      map.addImage('branch-pin', pinImage(false), { pixelRatio: 2 })
      map.addImage('branch-pin-selected', pinImage(true), { pixelRatio: 2 })
      map.addLayer({ id: 'branch-clusters', type: 'circle', source: 'branches', filter: ['has', 'point_count'], paint: { 'circle-color': '#191a17', 'circle-radius': 18, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 } })
      map.addLayer({ id: 'branch-count', type: 'symbol', source: 'branches', filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Regular'], 'text-size': 12 }, paint: { 'text-color': '#f5cb24' } })
      map.addLayer({ id: 'branch-points', type: 'symbol', source: 'branches', filter: ['!', ['has', 'point_count']], layout: { 'icon-image': 'branch-pin', 'icon-anchor': 'center', 'icon-allow-overlap': true, 'icon-padding': 8, 'icon-size': 1 } })
      map.on('click', 'branch-points', e => { const id = e.features?.[0]?.properties?.id; if (id) onSelectRef.current(String(id)) })
      map.on('click', 'branch-clusters', async e => {
        const feature = e.features?.[0]
        const source = map.getSource('branches') as maplibregl.GeoJSONSource
        if (!feature || feature.geometry.type !== 'Point') return
        try { const zoom = await source.getClusterExpansionZoom(Number(feature.properties?.cluster_id)); map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350 }) } catch { /* Map may have been removed during navigation. */ }
      })
      for (const layer of ['branch-points', 'branch-clusters']) {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
      }
    })
    map.on('idle', () => { if (map.isStyleLoaded() && map.areTilesLoaded()) setStatus('') })
    map.on('error', () => { setStatus('Sebagian peta gagal dimuat, daftar cabang tetap tersedia') })
    return () => { clearTimeout(timeout); map.remove(); mapRef.current = null }
  }, [])
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const sync = () => {
      const source = map.getSource('branches') as maplibregl.GeoJSONSource | undefined
      source?.setData({ type: 'FeatureCollection', features: branches.map(b => ({ type: 'Feature', properties: { id: b.id }, geometry: { type: 'Point', coordinates: b.coordinates } })) })
      if (branches.length) {
        const bounds = new maplibregl.LngLatBounds()
        branches.forEach(b => bounds.extend(b.coordinates))
        map.fitBounds(bounds, { padding: 50, maxZoom: 11, duration: 0 })
      }
    }
    if (map.getSource('branches')) sync(); else map.once('load', sync)
    return () => { map.off('load', sync) }
  }, [branches, overviewRequest])
  useEffect(() => {
    const map = mapRef.current
    const selected = branches.find(b => b.id === selectedId)
    if (!map) return
    const focus = () => {
      if (map.getLayer('branch-points')) {
        map.setLayoutProperty('branch-points', 'icon-image', ['case', ['==', ['get', 'id'], selectedId], 'branch-pin-selected', 'branch-pin'])
        map.setLayoutProperty('branch-points', 'icon-size', ['case', ['==', ['get', 'id'], selectedId], 1.08, 1])
      }
      if (selected) map.easeTo({ center: selected.coordinates, zoom: 11.5, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350 })
    }
    if (map.getLayer('branch-points')) focus(); else map.once('load', focus)
    return () => { map.off('load', focus) }
  }, [selectedId, branches, focusRequest])
  return <><div ref={container} className="h-full w-full" role="region" aria-label="Peta lokasi cabang" />{status && <p role="status" className="map-status">{status}</p>}</>
}
