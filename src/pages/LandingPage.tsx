import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { ChatCircleIcon } from '@phosphor-icons/react/dist/csr/ChatCircle'
import { FlaskIcon } from '@phosphor-icons/react/dist/csr/Flask'
import { TagIcon } from '@phosphor-icons/react/dist/csr/Tag'
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star'
import { useCatalog } from '../store/catalog'
import { consultationUrl } from '../data/config'
import { COLLECTIONS, matchesCollection } from '../lib/collections'
import { useNow } from '../lib/useNow'
import Locations from '../components/locations/Locations'
import BusinessProcess from '../components/BusinessProcess'

// Preview-only testimonials and five-star ratings; replace with verified reviews before publication.
const sampleReviews = [
  { name: 'Rani · Pemilik toko refill', text: 'Pilihan ukuran dan harga mudah dibandingkan, jadi lebih cepat menyusun kebutuhan stok toko' },
  { name: 'Dimas · Pembeli grosir', text: 'Bisa menggabungkan beberapa aroma dalam satu cart, lalu membahas semuanya bersama admin' },
  { name: 'Nadia · Reseller', text: 'Detail karakter aroma membantu memilih produk sebelum bertanya lebih lanjut lewat WhatsApp' },
]

const collectionPhotos = {
  viral: '/images/collections/33711974.jpg',
  new: '/images/collections/30990129.jpg',
  best: '/images/collections/7814722.jpg',
  selection: '/images/collections/1653085.jpg',
  promo: '/images/collections/9202849.jpg',
}

export default function LandingPage() {
  const { products, content } = useCatalog()
  const now = useNow()
  const [query, setQuery] = useState('')
  const [reveal, setReveal] = useState(false)
  const collectionSection = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReveal(true); observer.disconnect() }
    }, { threshold: 0.12 })
    if (collectionSection.current) observer.observe(collectionSection.current)
    return () => observer.disconnect()
  }, [])
  return <div className="landing-page">
    <div className="hero-surface"><div className="wrap">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">{content.heroTitle}</h1>
          <p>{content.heroDescription}</p>
          <div className="hero-engagement"><div className="hero-actions">
            <Link to="/katalog" className="btn btn-primary">Lihat katalog <ArrowRightIcon size={18} aria-hidden="true" /></Link>
            <a href={consultationUrl} target="_blank" rel="noreferrer" className="hero-consultation">Konsultasi via WhatsApp <ChatCircleIcon size={18} aria-hidden="true" /></a>
          </div>
          <p className="hero-rule">Pembelian pertama mulai total 1 kg<br />Gabungkan aroma sesuai kebutuhan tokomu</p>
          <form className="hero-search" role="search" onSubmit={e => { e.preventDefault(); navigate(`/katalog?q=${encodeURIComponent(query.trim())}`) }}>
            <label htmlFor="hero-search" className="sr-only">Cari aroma di katalog</label>
            <input id="hero-search" type="search" placeholder="Cari aroma, misalnya oud atau melati" value={query} onChange={e => setQuery(e.target.value)} />
            <button aria-label="Cari aroma"><MagnifyingGlassIcon size={22} weight="bold" aria-hidden="true" /></button>
          </form></div>
        </div>
        <figure className="hero-media"><img src="/images/hero_atelier.jpg" alt="Botol dan bahan parfum" width="1200" height="896" fetchPriority="high" /></figure>
      </section>
    </div></div>
    <Locations />
    <section ref={collectionSection} className="section collections-section" aria-labelledby="collections-title">
      <div className="wrap">
        <div className="section-head"><div><h2 id="collections-title">Temukan koleksi aromamu</h2><p>Jelajahi pilihan aroma untuk stok tokomu</p></div><Link to="/katalog" className="text-link">Semua aroma <ArrowUpRightIcon size={18} aria-hidden="true" /></Link></div>
        <div className={`collection-grid ${reveal ? 'collection-revealed' : ''}`}>
          {COLLECTIONS.map((collection, index) => {
            const count = products.filter(product => matchesCollection(product, collection.key, now)).length
            return <Link key={collection.key} to={`/katalog?collection=${collection.key}${collection.key === 'best' ? '&sort=best' : ''}`} className={`collection-card collection-${collection.key}`} style={{ '--stagger': `${index * 45}ms` } as React.CSSProperties}>
              <div className="collection-photo"><img src={collectionPhotos[collection.key]} alt="" loading="lazy" decoding="async" width="900" height="1200" onError={event => { event.currentTarget.hidden = true }} /></div>
              <div className="collection-content"><div className="collection-copy"><h3>{collection.title}</h3><p>{collection.description}</p></div>
              <div className="collection-action"><span>{count > 0 ? `Lihat ${count} aroma` : 'Lihat koleksi'} <ArrowRightIcon size={18} aria-hidden="true" /></span></div></div>
            </Link>
          })}
        </div>
      </div>
    </section>
    <BusinessProcess />
    <section className="section storefront-details" aria-labelledby="details-title"><div className="wrap">
      <div className="section-head"><h2 id="details-title">Ketentuan pembelian grosir</h2></div>
      <div className="purchase-details">
        <div className="purchase-minimum"><h3>Minimum pembelian</h3><dl><div><dt>Pembelian pertama</dt><dd>1.000 <span>gr</span></dd></div><div><dt>Pembelian berikutnya</dt><dd>100 <span>gr</span></dd></div></dl><p>Bisa gabung beberapa aroma</p><p className="purchase-note">Status pembeli lama dikonfirmasi admin</p></div>
        <div className="purchase-info">
          <div className="purchase-info-row"><TagIcon size={28} weight="duotone" aria-hidden="true" /><div><h3>Harga sesuai ukuran</h3><p>Harga 35, 50, dan 100 gr ditampilkan terpisah di setiap produk</p><Link to="/katalog" className="purchase-link">Lihat harga di katalog <ArrowRightIcon size={18} aria-hidden="true" /></Link></div></div>
          <div className="purchase-info-row"><FlaskIcon size={28} weight="duotone" aria-hidden="true" /><div><h3>Kenali karakter aroma</h3><p>Lihat karakter dan susunan aroma di detail produk sebelum memilih stok</p></div></div>
        </div>
      </div>
    </div></section>
    <section className="section testimonial-section" aria-labelledby="testimonials-title"><div className="wrap">
      <div className="section-head"><div><h2 id="testimonials-title">Cerita dari pelanggan</h2></div></div>
      <div className="testimonial-grid">{(content.testimonial ? [{ name: 'Pelanggan toko', text: content.testimonial }] : sampleReviews).map(review => <figure className="testimonial-card" key={review.name}>{!content.testimonial && <div className="testimonial-stars" role="img" aria-label="5 dari 5 bintang">{Array.from({ length: 5 }, (_, index) => <StarIcon key={index} size={20} weight="fill" aria-hidden="true" />)}</div>}<blockquote>{review.text}</blockquote><figcaption><span className="review-initial" aria-hidden="true">{review.name.charAt(0)}</span><span><strong>{review.name.split(" · ")[0]}</strong>{review.name.includes(" · ") && <span className="review-role">{review.name.split(" · ").slice(1).join(" · ")}</span>}</span></figcaption></figure>)}</div>
    </div></section>
  </div>
}
