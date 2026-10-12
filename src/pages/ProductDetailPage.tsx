import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon as ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { ArrowRightIcon as ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { CheckIcon as Check } from '@phosphor-icons/react/dist/csr/Check'
import { BagIcon as ShoppingBag } from '@phosphor-icons/react/dist/csr/Bag'
import { Button, EmptyState, ProductImage, QuantityControl } from '../components/ui'
import { useCatalog } from '../store/catalog'
import { useCart } from '../store/cart'
import { formatGrams, formatPrice, getVariantPrice, isPromoActive } from '../lib/pricing'
import { useNow } from '../lib/useNow'
import { ACCORD_COLORS } from '../data/products'
import type { Product } from '../types'
import '../components/product-detail/product-detail.css'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { products } = useCatalog()
  const product = products.find(p => p.slug === slug && p.published)
  if (!product) return <section className="wrap page-section"><EmptyState title="Produk tidak ditemukan"><p>Produk ini tidak tersedia di katalog, coba pilih aroma lainnya</p><Link className="btn btn-primary" to="/katalog">Lihat katalog</Link></EmptyState></section>
  return <ProductDetail key={product.id} product={product} />
}

function ProductDetail({ product }: { product: Product }) {
  const now = useNow()
  const { addItem } = useCart()
  const [selectedId, setSelectedId] = useState(product.variants.find(v => v.available)?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null)
  const selected = product.variants.find(v => v.id === selectedId)
  const canAdd = !!selected?.available
  const price = selected ? getVariantPrice(selected, now) : 0
  const promo = selected ? isPromoActive(selected, now) : false
  const accords = [...product.accords].filter(a => Number.isFinite(a.score) && a.score > 0).sort((a, b) => b.score - a.score)
  const strongest = accords[0]?.score || 1
  const notes = [
    { label: 'Top notes', description: 'Kesan pertama', content: product.notes.top },
    { label: 'Middle notes', description: 'Karakter utama', content: product.notes.middle },
    { label: 'Base notes', description: 'Dasar aroma', content: product.notes.base },
  ]
  const add = () => {
    if (!selected || !canAdd) return
    const success = addItem(product.id, selected.id, quantity)
    setFeedback({ success, text: success ? `${quantity} kemasan ${product.name}, ${formatGrams(selected.grams)}, ditambahkan ke cart.` : 'Belum bisa ditambahkan Periksa ketersediaan atau jumlah di cart (maksimal 9.999 kemasan per ukuran).' })
  }

  return <section className="wrap page-section pdp">
    <Link className="pdp-back text-link" to="/katalog"><ArrowLeft aria-hidden="true" size={16} /> Kembali ke katalog</Link>
    <div className="pdp-overview">
      <figure className="pdp-photo"><ProductImage product={product} />{!product.image && <figcaption>Foto produk asli akan ditampilkan setelah tersedia</figcaption>}</figure>
      <div className="pdp-info">
        <div className="pdp-meta"><span>{product.brand}</span><span>{product.gender}</span></div>
        <h1>{product.name}</h1>
        <p className="pdp-description">{product.desc || 'Deskripsi aroma belum tersedia'}</p>
        <fieldset className="pdp-variants">
          <legend>Pilih ukuran</legend>
          <div className="pdp-variant-grid">
            {product.variants.map(v => <label key={v.id} className={`pdp-variant ${selectedId === v.id ? 'is-selected' : ''} ${!v.available ? 'is-unavailable' : ''}`}>
              <input type="radio" name={`variant-${product.id}`} value={v.id} checked={selectedId === v.id} disabled={!v.available} onChange={() => { setSelectedId(v.id); setFeedback(null) }} />
              <strong>{formatGrams(v.grams)}</strong>
              <span className="pdp-variant-price">{formatPrice(getVariantPrice(v, now))}</span>
              <span className={v.available ? 'text-success' : 'text-danger'}>{v.available ? 'Tersedia' : 'Sold out'}</span>
            </label>)}
          </div>
          {!product.variants.length && <p className="text-muted">Ukuran belum tersedia</p>}
        </fieldset>
        {selected && <div className="pdp-price">
          <div><strong>{formatPrice(price)}</strong>{promo && <del>{formatPrice(selected.price)}</del>}</div>
          <span>per kemasan {formatGrams(selected.grams)}</span>
          {promo && selected.promo && <p>Promo sampai {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(selected.promo.endsAt))} WIB</p>}
        </div>}
        {!canAdd && <p className="pdp-unavailable" role="status">{product.variants.some(v => v.available) ? 'Ukuran ini sedang sold out, pilih ukuran lain' : 'Semua ukuran belum tersedia, lihat pilihan aroma lain di katalog'}</p>}
        <div className="pdp-purchase">
          <div><span className="pdp-quantity-label">Jumlah kemasan</span><QuantityControl value={quantity} onChange={v => { setQuantity(v); setFeedback(null) }} disabled={!canAdd} /></div>
          <Button disabled={!canAdd} onClick={add}><ShoppingBag aria-hidden="true" size={18} /> Tambah ke cart</Button>
        </div>
        {selected && canAdd && <p className="pdp-total">{formatGrams(selected.grams * quantity)} · Subtotal <strong>{formatPrice(price * quantity)}</strong></p>}
        <div className="pdp-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback && <><p className={feedback.success ? 'text-success' : 'text-danger'}>{feedback.success && <Check size={16} aria-hidden="true" />}{feedback.text}</p>{feedback.success && <Link to="/cart" className="text-link">Lihat cart <ArrowRight className="arrow-motion arrow-right" aria-hidden="true" size={16} /></Link>}</>}</div>
        <p className="pdp-rule">Pembelian pertama minimal total 1.000 gr; pembelian berikutnya 100 gr Bisa gabung beberapa aroma Belum memenuhi minimum? Tetap bisa konsultasi melalui WhatsApp dari cart</p>
      </div>
    </div>
    <div className="pdp-aroma">
      <section aria-labelledby="accords-title">
        <h2 id="accords-title">Main accords</h2>
        <p className="pdp-section-description">Karakter aroma, dari yang paling dominan Bar menunjukkan kekuatan relatif, bukan komposisi formula</p>
        {accords.length ? <ul className="pdp-accord-list">{accords.map((a, index) => <li key={`${a.name}-${index}`}><span>{a.name}</span><div className="pdp-accord-track" aria-hidden="true"><div style={{ width: `${Math.min(100, a.score / strongest * 100)}%`, backgroundColor: ACCORD_COLORS[a.name.toLowerCase()]?.bg ?? 'var(--color-ink)' }} /></div></li>)}</ul> : <p className="text-muted">Informasi main accords belum tersedia</p>}
      </section>
      <section aria-labelledby="notes-title">
        <h2 id="notes-title">Piramida aroma</h2>
        <p className="pdp-section-description">Kenali lapisan yang membentuk karakter aroma ini</p>
        <ol className="pdp-notes">{notes.map(note => <li key={note.label}><div><h3>{note.label}</h3><span>{note.description}</span></div><p>{note.content.trim() || 'Informasi belum tersedia'}</p></li>)}</ol>
      </section>
    </div>
  </section>
}
