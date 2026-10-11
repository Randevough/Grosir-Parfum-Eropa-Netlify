import { Link } from 'react-router-dom'
import { ArrowRightIcon as ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { useCatalog } from '../store/catalog'
import { useNow } from '../lib/useNow'
import { formatPrice, getVariantPrice, isPromoActive } from '../lib/pricing'
import ProductCard from '../components/ProductCard'
import { EmptyState } from '../components/ui'
import '../components/catalog/catalog.css'

const date = (value: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(value))
export default function PromoPage() {
  const { products } = useCatalog()
  const now = useNow()
  const promos = products.filter(p => p.published && p.variants.some(v => v.available && isPromoActive(v,now)))
  return <section className="wrap page-section promo-page"><div className="promo-page-heading"><div><h1>Promo untuk stok berikutnya</h1><p>Harga khusus pada ukuran terpilih, harga aktif otomatis digunakan saat kamu menambahkan produk ke cart</p></div><Link className="text-link" to="/katalog">Lihat semua aroma<ArrowRight aria-hidden="true" size={17}/></Link></div><p className="promo-count" aria-live="polite">{promos.length} produk dengan promo aktif</p>{promos.length ? <div className="product-grid">{promos.map(p => <div key={p.id} className="promo-product"><ProductCard product={p}/><div className="promo-variants" aria-label={`Ukuran promo ${p.name}`}>{p.variants.filter(v => v.available && isPromoActive(v,now)).map(v => <div key={v.id} className="promo-variant"><div><strong>{v.grams} gr</strong><span><del>{formatPrice(v.price)}</del> <b>{formatPrice(getVariantPrice(v,now))}</b></span></div><p>{date(v.promo!.startsAt)} – {date(v.promo!.endsAt)} WIB</p></div>)}</div></div>)}</div> : <EmptyState title="Belum ada promo aktif"><p>Kamu tetap bisa melihat harga grosir dan pilihan aroma di katalog</p><Link className="btn btn-primary mt-5" to="/katalog">Lihat katalog</Link></EmptyState>}<p className="promo-footnote">Promo berlaku sesuai jadwal dan ketersediaan tiap ukuran Ongkir dikonfirmasi melalui WhatsApp</p></section>
}
