import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon as Search } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { SlidersHorizontalIcon as SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal'
import { CheckIcon as Check } from '@phosphor-icons/react/dist/csr/Check'
import { CaretDownIcon as CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown'
import { XIcon as X } from '@phosphor-icons/react/dist/csr/X'
import { useCatalog } from '../store/catalog'
import { useNow } from '../lib/useNow'
import { COLLECTIONS, matchesCollection } from '../lib/collections'
import { getStartingVariant, getVariantPrice } from '../lib/pricing'
import ProductCard from '../components/ProductCard'
import { Button, EmptyState } from '../components/ui'
import '../components/catalog/catalog.css'

// URL filters are single values. size is grams; sort supports latest, price-asc,
// price-desc, best. collection selects an admin-curated collection. Unknown filters yield no results and remain removable.
const labels: Record<string, string> = { collection: 'Koleksi', gender: 'Gender', brand: 'Brand', aroma: 'Karakter aroma', size: 'Ukuran' }
const PAGE_SIZE = 12
export default function CatalogPage() {
  const { products } = useCatalog()
  const now = useNow()
  const [params, setParams] = useSearchParams()
  const [limit, setLimit] = useState(PAGE_SIZE)
  const dialog = useRef<HTMLDialogElement>(null)
  const filterTrigger = useRef<HTMLButtonElement>(null)
  const query = params.get('q') || ''
  const publicProducts = products.filter(p => p.published)
  const options: Record<string, string[]> = {
    collection: COLLECTIONS.map(collection => collection.key),
    gender: ['Pria', 'Wanita', 'Unisex'],
    brand: [...new Set(publicProducts.map(p => p.brand))].sort(),
    aroma: [...new Set(publicProducts.flatMap(p => p.accords.map(a => a.name)))].sort(),
    size: [...new Set(publicProducts.flatMap(p => p.variants.map(v => v.grams)))].sort((a,b) => a-b).map(String),
  }
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }
  const active = Object.keys(labels).filter(key => params.has(key))
  const reset = () => setParams(new URLSearchParams(), { replace: true })
  const resetFilters = () => {
    const next = new URLSearchParams(params)
    Object.keys(labels).forEach(key => next.delete(key))
    setParams(next, { replace: true })
  }
  useEffect(() => { setLimit(PAGE_SIZE) }, [params.toString()])
  const price = (p: typeof products[number]) => {
    const v = getStartingVariant(p, now)
    return v ? getVariantPrice(v, now) : Infinity
  }
  const filtered = publicProducts.filter(p => {
    const matchesQuery = `${p.name} ${p.desc}`.toLocaleLowerCase('id').includes(query.trim().toLocaleLowerCase('id'))
    return matchesQuery && (!params.get('collection') || matchesCollection(p, params.get('collection')!, now)) && (!params.get('gender') || p.gender === params.get('gender'))
      && (!params.get('brand') || p.brand === params.get('brand'))
      && (!params.get('aroma') || p.accords.some(a => a.name === params.get('aroma')))
      && (!params.get('size') || p.variants.some(v => v.grams === Number(params.get('size')) && v.available))
  }).sort((a,b) => {
    const sort = params.get('sort') || 'latest'
    if (sort === 'price-asc' || sort === 'price-desc') {
      if (!Number.isFinite(price(a))) return Number.isFinite(price(b)) ? 1 : 0
      if (!Number.isFinite(price(b))) return -1
      return sort === 'price-asc' ? price(a)-price(b) : price(b)-price(a)
    }
    if (sort === 'best') return Number(b.badges.includes('best')) - Number(a.badges.includes('best')) || Date.parse(b.createdAt)-Date.parse(a.createdAt)
    return Date.parse(b.createdAt)-Date.parse(a.createdAt)
  })
  const valueLabel = (key: string, value: string) => key === 'size' ? `${value} gr` : key === 'collection' ? COLLECTIONS.find(c => c.key === value)?.title || value : value
  const filters = (prefix: string) => <div className="catalog-filter-fields">
    <div className="catalog-filter-status"><span>{active.length ? `${active.length} filter aktif` : 'Semua aroma'}</span><button disabled={!active.length} onClick={resetFilters}>Reset</button></div>
    {Object.entries(labels).map(([key, label]) => <details className="catalog-filter-group" key={key} open={key === 'collection' || params.has(key) || undefined}>
      <summary><span>{label}{params.get(key) && <small>{valueLabel(key, params.get(key)!)}</small>}</span><CaretDown aria-hidden="true" size={16} /></summary>
      <div className="catalog-filter-options" role="group" aria-label={`${label} ${prefix === 'desktop' ? 'sidebar' : 'filter'}`}>
        {['', ...options[key], ...(params.get(key) && !options[key].includes(params.get(key)!) ? [params.get(key)!] : [])].map(value =>
          <button type="button" className="catalog-filter-option" key={value} aria-pressed={(params.get(key) || '') === value} onClick={() => update(key, value)}>
            <span>{value ? valueLabel(key, value) : `Semua ${label.toLowerCase()}`}</span>
            {(params.get(key) || '') === value && <Check aria-hidden="true" size={16} weight="bold" />}
          </button>)}
      </div>
    </details>)}
    <p className="catalog-filter-hint">Ukuran hanya menampilkan kemasan tersedia</p>
  </div>
  return <section className="wrap page-section catalog-page">
    <div className="catalog-heading">
      <div><h1>Katalog aroma</h1><p>Temukan karakter aroma untuk stok tokomu</p></div>
      <div className="catalog-search">
        <label className="sr-only" htmlFor="catalog-search">Cari produk</label>
        <div className="catalog-search-input"><Search size={21} aria-hidden="true" />
          <input className="input" id="catalog-search" type="search" placeholder="Cari nama atau karakter aroma" value={query} onChange={e => update('q', e.target.value)} />
        </div>
      </div>
    </div>
    <div className="catalog-layout">
      <aside className="catalog-sidebar" aria-label="Filter katalog"><h2>Filter aroma</h2>{filters('desktop')}</aside>
      <div className="catalog-results">
        <div className="catalog-results-bar">
          <div className="catalog-result-summary"><p aria-live="polite">{filtered.length} produk ditemukan</p></div>
          <div className="catalog-controls">
            <button ref={filterTrigger} className="btn btn-secondary catalog-filter-trigger" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog"><SlidersHorizontal aria-hidden="true" size={18} />Filter{active.length ? ` (${active.length})` : ''}</button>
            <div className="catalog-sort"><label htmlFor="catalog-sort">Urutkan</label>
              <select id="catalog-sort" value={['price-asc','price-desc','best'].includes(params.get('sort') || '') ? params.get('sort')! : 'latest'} onChange={e => update('sort', e.target.value)}>
                <option value="latest">Terbaru</option><option value="price-asc">Harga terendah</option><option value="price-desc">Harga tertinggi</option><option value="best">Best seller</option>
              </select>
            </div>
          </div>
        </div>
        {active.length > 0 && <div className="catalog-active-filters" aria-label="Filter aktif">{active.map(key => <button key={key} onClick={() => update(key, '')} aria-label={`Hapus filter ${labels[key]} ${params.get(key)}`}>{labels[key]}: {valueLabel(key, params.get(key)!)}<X aria-hidden="true" size={14} /></button>)}</div>}
        {filtered.length ? <>
          <div className="product-grid catalog-product-grid">{filtered.slice(0, limit).map(p => <ProductCard key={p.id} product={p} catalog />)}</div>
          <div className="catalog-load-more"><p>Menampilkan {Math.min(limit, filtered.length)} dari {filtered.length} produk</p>{limit < filtered.length && <Button variant="secondary" onClick={() => setLimit(v => v + PAGE_SIZE)}>Muat lebih banyak</Button>}</div>
        </> : <EmptyState title="Belum ada produk yang cocok"><p>{query ? `Tidak ada hasil untuk “${query}” dengan pilihan saat ini` : 'Coba ubah pilihan filter untuk melihat aroma lainnya'}</p><Button className="mt-6" onClick={reset}>Reset pencarian & filter</Button></EmptyState>}
      </div>
    </div>
    <dialog ref={dialog} className="catalog-filter-dialog" aria-labelledby="filter-dialog-title" onClose={() => filterTrigger.current?.focus()} onClick={e => { if (e.target === dialog.current) dialog.current.close() }}>
      <div className="catalog-dialog-header"><h2 id="filter-dialog-title">Filter aroma</h2><Button variant="ghost" aria-label="Tutup filter" onClick={() => dialog.current?.close()}><X aria-hidden="true" size={20} /></Button></div>
      {filters('mobile')}
      <div className="catalog-dialog-footer"><Button className="catalog-dialog-apply" onClick={() => dialog.current?.close()}>Lihat {filtered.length} produk</Button></div>
    </dialog>
  </section>
}
