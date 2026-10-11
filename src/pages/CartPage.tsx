import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon as ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { ArrowUpRightIcon as ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { TrashIcon as Trash2 } from '@phosphor-icons/react/dist/csr/Trash'
import { Button, EmptyState, Field, ProductImage, QuantityControl } from '../components/ui'
import { useCart } from '../store/cart'
import { useCatalog } from '../store/catalog'
import { resolveCart } from '../lib/cart'
import { formatGrams, formatPrice } from '../lib/pricing'
import { useNow } from '../lib/useNow'
import { buildWhatsAppMessage, buildWhatsAppUrl, normalizeWhatsAppNumber, type BuyerStatus } from '../lib/whatsapp'
import { CONFIG, consultationUrl } from '../data/config'
import '../components/cart/cart.css'

export default function CartPage() {
  const { items, storageError, updateQuantity, removeItem } = useCart()
  const { products } = useCatalog()
  const now = useNow()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<BuyerStatus>('new')
  const [errors, setErrors] = useState<{ name?: string; phone?: string; submit?: string }>({})
  const [priceNotice, setPriceNotice] = useState(false)
  const previousPrices = useRef(new Map<string, number>())
  const rows = resolveCart(items, products, now)
  const blocked = rows.some(row => row.blocked)
  const totalGrams = rows.reduce((sum, row) => sum + row.grams, 0)
  const totalPrice = rows.reduce((sum, row) => sum + row.subtotal, 0)
  const minimum = status === 'new' ? CONFIG.grosir.minPertamaGram : CONFIG.grosir.minBerikutnyaGram
  const belowMinimum = totalGrams < minimum

  useEffect(() => {
    const latest = new Map(rows.map(row => [`${row.productId}:${row.variantId}`, row.price]))
    if ([...latest].some(([key, value]) => previousPrices.current.has(key) && previousPrices.current.get(key) !== value)) setPriceNotice(true)
    previousPrices.current = latest
  }, [items, products, now])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = 'Isi nama agar admin mengenali permintaanmu'
    if (!normalizeWhatsAppNumber(phone)) nextErrors.phone = 'Isi nomor WhatsApp yang valid, misalnya 081234567890.'
    const fresh = resolveCart(items, products, Date.now())
    if (!fresh.length || fresh.some(row => row.blocked)) nextErrors.submit = 'Hapus atau ganti produk yang tidak tersedia sebelum lanjut'
    if (fresh.some((row, index) => row.price !== rows[index]?.price)) {
      setPriceNotice(true)
      nextErrors.submit = 'Harga baru saja berubah, periksa rangkuman terbaru, lalu lanjutkan kembali'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const id = nextErrors.name ? 'buyer-name' : nextErrors.phone ? 'buyer-phone' : 'cart-submit-error'
      document.getElementById(id)?.focus()
      return
    }
    try {
      const message = buildWhatsAppMessage({ name, phone, status }, fresh.map(row => ({ name: row.product!.name, grams: row.variant!.grams, quantity: row.quantity, price: row.price })), minimum)
      window.location.assign(buildWhatsAppUrl(CONFIG.whatsapp, message))
    } catch {
      setErrors({ submit: 'Rangkuman belum bisa dibuka, periksa data lalu coba kembali' })
    }
  }

  return <section className="wrap page-section">
    <div className="cart-heading"><h1>Cart kamu</h1><p>Gabungkan pilihan aroma dan ukuran Admin akan mengonfirmasi pesananmu melalui WhatsApp</p></div>
    {storageError && <p className="cart-notice" role="status">Browser tidak bisa menyimpan cart, pilihan saat ini tetap dapat digunakan, tetapi bisa hilang saat halaman ditutup</p>}
    {!items.length ? <EmptyState title="Belum ada produk di cart"><p className="mb-6">Temukan aroma yang sesuai untuk stok tokomu</p><Link className="btn btn-primary" to="/katalog">Lihat katalog <ArrowUpRight aria-hidden="true" size={17} /></Link></EmptyState> : <div className="cart-layout">
      <div className="cart-list">
        {rows.map(row => <article className="cart-row" key={`${row.productId}:${row.variantId}`}>
          {row.product ? <Link to={`/produk/${row.product.slug}`} tabIndex={-1} aria-hidden="true"><ProductImage product={row.product} className="cart-row-image" /></Link> : <div className="cart-row-image bg-surface-muted" />}
          <div><h2>{row.product ? <Link to={`/produk/${row.product.slug}`}>{row.product.name}</Link> : 'Produk tidak tersedia'}</h2>
            <p className="cart-row-meta">{row.variant ? `${formatGrams(row.variant.grams)} · ${formatPrice(row.price)} / kemasan` : 'Ukuran tidak tersedia lagi'}</p>
            {row.blocked && <p className="cart-blocked text-sm mb-3">{row.product && row.variant ? 'Sold out, hapus atau pilih ukuran lain' : 'Produk telah dihapus atau disembunyikan, hapus dari cart'}</p>}
            <div className="cart-row-controls"><QuantityControl value={row.quantity} disabled={row.blocked} label={`Jumlah ${row.product?.name ?? 'produk'} ${row.variant?.grams ?? ''} gr`} onChange={quantity => updateQuantity(row.productId, row.variantId, quantity)} /><button type="button" className="cart-remove" onClick={() => removeItem(row.productId, row.variantId)} aria-label={`Hapus ${row.product?.name ?? 'produk'} ${row.variant?.grams ?? ''} gr`}><Trash2 aria-hidden="true" size={15} /> Hapus</button></div>
            <p className="cart-row-price">{row.variant ? formatPrice(row.subtotal) : '—'}</p>
          </div>
        </article>)}
        <Link className="text-link cart-back" to="/katalog"><ArrowLeft aria-hidden="true" size={16} /> Tambah pilihan aroma</Link>
      </div>
      <aside className="cart-summary" aria-label="Rangkuman dan identitas pembeli">
        <h2>Rangkuman pilihan</h2>
        <dl className="cart-totals" aria-live="polite"><div><dt>Total berat</dt><dd>{formatGrams(totalGrams)}</dd></div><div><dt>Total produk</dt><dd>{formatPrice(totalPrice)}</dd></div></dl>
        <p className="cart-fineprint">Belum termasuk ongkir, harga mengikuti harga dan promo terbaru</p>
        {priceNotice && <p className="cart-notice" role="status">Harga atau promo telah berubah Rangkuman sekarang memakai harga terbaru</p>}
        <form className="cart-form" onSubmit={submit} noValidate>
          <Field id="buyer-name" label="Nama" required autoComplete="name" maxLength={120} value={name} onChange={event => setName(event.target.value)} error={errors.name} />
          <Field id="buyer-phone" label="Nomor WhatsApp" required type="tel" inputMode="tel" autoComplete="tel" maxLength={24} placeholder="Contoh: 081234567890" value={phone} onChange={event => setPhone(event.target.value)} error={errors.phone} />
          <fieldset><legend>Status pembeli</legend><label className="cart-radio"><input type="radio" name="buyer-status" checked={status === 'new'} onChange={() => setStatus('new')} /> Pertama kali membeli</label><label className="cart-radio"><input type="radio" name="buyer-status" checked={status === 'repeat'} onChange={() => setStatus('repeat')} /> Pernah membeli</label></fieldset>
          {status === 'repeat' && <p className="cart-fineprint">Admin akan memverifikasi pembelian sebelumnya melalui WhatsApp</p>}
          <div className="cart-notice" aria-live="polite">Minimum gabungan aroma: <strong>{formatGrams(minimum)}</strong>. {belowMinimum ? <>Masih kurang <strong>{formatGrams(minimum - totalGrams)}</strong>. Kamu tetap bisa konsultasi dengan admin</> : 'Pilihanmu sudah memenuhi minimum berat'}</div>
          {blocked && <p className="cart-blocked text-sm" role="alert">Hapus atau ganti item yang tidak tersedia untuk melanjutkan</p>}
          {errors.submit && <p id="cart-submit-error" tabIndex={-1} className="cart-blocked text-sm" role="alert">{errors.submit}</p>}
          <Button type="submit" disabled={blocked}>{belowMinimum ? 'Konsultasikan pilihan via WA' : 'Lanjut ke WhatsApp'} <ArrowUpRight aria-hidden="true" size={18} /></Button>
          <p className="cart-fineprint">Rangkuman dibuka di WhatsApp Kirim pesan untuk konfirmasi stok, ongkir, dan pembayaran bersama admin</p>
          {blocked && <a className="text-link" href={consultationUrl}>Konsultasi umum via WhatsApp <ArrowUpRight aria-hidden="true" size={16} /></a>}
        </form>
      </aside>
    </div>}
  </section>
}
