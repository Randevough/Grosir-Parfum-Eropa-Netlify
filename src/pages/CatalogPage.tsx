import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon as Search } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { SlidersHorizontalIcon as SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal'
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
  const filters = (prefix: string) => <div className="catalog-filter-fields">{Object.entries(labels).map(([key,label]) => <div className="field" key={key}><label htmlFor={`${prefix}-${key}`}>{label}</label><select className="input" id={`${prefix}-${key}`} value={params.get(key) || ''} onChange={e => update(key,e.target.value)}><option value="">Semua {label.toLowerCase()}</option>{params.get(key) && !options[key].includes(params.get(key)!) && <option value={params.get(key)!}>{params.get(key)}</option>}{options[key].map(value => <option key={value} value={value}>{key === 'size' ? `${value} gr` : key === 'collection' ? COLLECTIONS.find(collection => collection.key === value)?.title || value : value}</option>)}</select></div>)}<p className="catalog-filter-hint">Filter ukuran menampilkan kemasan yang tersedia</p><Button variant="ghost" onClick={reset}>Reset pencarian & filter</Button></div>
  return <section className="wrap page-section catalog-page"><div className="section-head"><div><h1>Katalog aroma</h1><p>Pilih karakter aroma dan ukuran untuk stok toko kamu dengan harga grosir terbuka tanpa perlu akun</p></div></div><div className="catalog-toolbar"><div className="catalog-search field"><label htmlFor="catalog-search">Cari produk</label><div className="catalog-search-input"><Search size={19} aria-hidden="true"/><input className="input" id="catalog-search" type="search" placeholder="Nama produk atau deskripsi aroma" value={query} onChange={e => update('q',e.target.value)}/></div></div><div className="field catalog-sort"><label htmlFor="catalog-sort">Urutkan</label><select id="catalog-sort" className="input" value={['price-asc','price-desc','best'].includes(params.get('sort') || '') ? params.get('sort')! : 'latest'} onChange={e => update('sort',e.target.value)}><option value="latest">Terbaru</option><option value="price-asc">Harga terendah</option><option value="price-desc">Harga tertinggi</option><option value="best">Best seller</option></select></div><Button className="catalog-filter-trigger" variant="secondary" onClick={() => dialog.current?.showModal()}><SlidersHorizontal aria-hidden="true" size={17}/>Filter{active.length ? ` (${active.length})` : ''}</Button></div><div className="catalog-layout"><aside className="catalog-sidebar" aria-label="Filter katalog"><h2>Persempit pilihan</h2>{filters('desktop')}</aside><div className="catalog-results"><div className="catalog-result-summary"><p aria-live="polite">{filtered.length} produk ditemukan</p><span>Harga mulai dari ukuran tersedia</span></div>{active.length > 0 && <div className="catalog-active-filters" aria-label="Filter aktif">{active.map(key => <button key={key} onClick={() => update(key,'')} aria-label={`Hapus filter ${labels[key]} ${params.get(key)}`}>{labels[key]}: {key === 'collection' ? COLLECTIONS.find(collection => collection.key === params.get(key))?.title || params.get(key) : params.get(key)}{key === 'size' ? ' gr' : ''}<X aria-hidden="true" size={14}/></button>)}</div>}{filtered.length ? <><div className="product-grid catalog-product-grid">{filtered.slice(0,limit).map(p => <ProductCard key={p.id} product={p}/>)}</div><div className="catalog-load-more"><p>Menampilkan {Math.min(limit,filtered.length)} dari {filtered.length} produk</p>{limit < filtered.length && <Button variant="secondary" onClick={() => setLimit(v => v+PAGE_SIZE)}>Muat lebih banyak</Button>}</div></> : <EmptyState title="Belum ada produk yang cocok"><p>Coba kata pencarian lain atau hapus filter untuk melihat pilihan aroma</p><Button className="mt-5" onClick={reset}>Reset pencarian & filter</Button></EmptyState>}</div></div><dialog ref={dialog} className="catalog-filter-dialog" aria-labelledby="filter-dialog-title" onClick={e => { if (e.target === dialog.current) dialog.current.close() }}><div className="catalog-dialog-header"><h2 id="filter-dialog-title">Filter katalog</h2><Button variant="ghost" aria-label="Tutup filter" onClick={() => dialog.current?.close()}><X aria-hidden="true" size={20}/></Button></div>{filters('mobile')}<Button className="catalog-dialog-apply" onClick={() => dialog.current?.close()}>Lihat {filtered.length} produk</Button></dialog></section>
}
