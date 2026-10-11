import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { MapPinIcon } from '@phosphor-icons/react/dist/csr/MapPin'
import { useCatalog } from '../../store/catalog'
import { consultationUrl } from '../../data/config'
import RegionSelect from './RegionSelect'
const MapPanel = lazy(() => import('./MapPanel'))

export default function Locations() {
  const { branches } = useCatalog()
  const [region, setRegion] = useState('')
  const [selected, setSelected] = useState('')
  const [visible, setVisible] = useState(false)
  const [overviewRequest, setOverviewRequest] = useState(0)
  const [focusRequest, setFocusRequest] = useState(0)
  function selectBranch(id: string) { setSelected(id); setFocusRequest(value => value + 1) }
  const section = useRef<HTMLElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const filtered = useMemo(() => branches.filter(branch => !region || branch.region === region), [branches, region])
  const selectedBranch = filtered.find(branch => branch.id === selected) ?? filtered[0]
  const selectedId = selectedBranch?.id ?? ''
  const regions = [...new Set(branches.map(branch => branch.region))]
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setVisible(true); return }
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect() } }, { rootMargin: '200px' })
    if (section.current) observer.observe(section.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const container = list.current
    const row = container?.querySelector<HTMLLIElement>('[data-selected="true"]')
    if (!container || !row || container.scrollHeight <= container.clientHeight) return
    if (row.offsetTop < container.scrollTop || row.offsetTop + row.offsetHeight > container.scrollTop + container.clientHeight) container.scrollTo({ top: Math.max(0, row.offsetTop - 12), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }, [selectedId])
  return <section ref={section} className="section locations" id="lokasi" aria-labelledby="locations-title"><div className="wrap">
    <div className="location-heading"><h2 id="locations-title">Mampir ke toko kami</h2></div>
    {branches.length ? <div className="locator-panel">
      <div className="locator-toolbar"><span className="locator-toolbar-title">Pilih toko untuk melihat lokasi</span><div className="locator-region"><span>Wilayah</span><RegionSelect regions={regions} value={region} onChange={value => { setRegion(value); setSelected('') }} /></div></div>
      <div className="locator-body"><div className="locator-sidebar"><ul ref={list} className="locator-list" aria-label="Pilihan lokasi toko">{filtered.map(branch => <li key={branch.id} data-selected={selectedId === branch.id}>
        <button className="locator-row" aria-pressed={selectedId === branch.id} onClick={() => selectBranch(branch.id)}><span className="locator-row-copy"><strong>{branch.name}</strong><span>{branch.address}</span>{branch.hours && <span>{branch.hours}</span>}</span></button>
        {selectedId === branch.id && !branch.demo && <a className="locator-directions" href={`https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates[1]},${branch.coordinates[0]}`} target="_blank" rel="noreferrer">Petunjuk arah <ArrowRightIcon size={16} aria-hidden="true" /></a>}
      </li>)}</ul>{!filtered.length && <p className="locator-empty">Belum ada toko di wilayah ini</p>}</div>
      {filtered.length > 0 && <div className="map-frame">{visible ? <Suspense fallback={<p className="map-status">Memuat peta…</p>}><MapPanel branches={filtered} selectedId={selectedId} overviewRequest={overviewRequest} focusRequest={focusRequest} onSelect={selectBranch} /></Suspense> : <p className="map-status">Memuat peta lokasi…</p>}{selectedBranch && <span className="map-selection" aria-live="polite"><MapPinIcon size={15} weight="fill" aria-hidden="true" />{selectedBranch.name}</span>}</div>}</div>
      {filtered.length > 0 && <div className="locator-credits"><button className="locator-overview" type="button" onClick={() => setOverviewRequest(value => value + 1)}>Tampilkan semua lokasi</button><div className="locator-attribution"><a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a><span>©</span><a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a><span>·</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></div></div>}
    </div> : <div className="locator-empty"><p>Informasi lokasi belum tersedia</p><a className="text-link" href={consultationUrl}>Tanyakan lokasi kepada admin <ArrowUpRightIcon size={17} aria-hidden="true" /></a></div>}
  </div></section>
}
