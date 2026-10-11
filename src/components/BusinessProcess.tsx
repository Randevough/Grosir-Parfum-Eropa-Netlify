import { useEffect, useRef, useState } from 'react'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/csr/WhatsappLogo'
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { useCatalog } from '../store/catalog'
import { formatGrams, formatPrice, getVariantPrice } from '../lib/pricing'
import { useNow } from '../lib/useNow'
import { consultationUrl } from '../data/config'

export default function BusinessProcess() {
  const section = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [tabActive, setTabActive] = useState(true)
  const [reduced, setReduced] = useState(false)
  const { products } = useCatalog()
  const now = useNow()
  const examples = products.filter(product => product.published).flatMap(product => {
    const variant = product.variants.find(variant => variant.grams === 50 && variant.available)
    return variant ? [{ product, variant, quantity: 10 }] : []
  }).slice(0, 2)
  const grams = examples.reduce((total, row) => total + row.variant.grams * row.quantity, 0)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motion = () => setReduced(media.matches)
    const visibility = () => setTabActive(!document.hidden)
    motion(); visibility()
    media.addEventListener('change', motion)
    document.addEventListener('visibilitychange', visibility)
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => setVisible(entries.some(entry => entry.isIntersecting)), { threshold: 0 }) : null
    if (observer && section.current) observer.observe(section.current)
    else setVisible(true)
    return () => { observer?.disconnect(); media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  return <section ref={section} className="business-section process-section" aria-labelledby="process-title" data-running={visible && tabActive && !reduced}>
    <div className="wrap">
      <div className="process-heading"><h2 id="process-title">Susun stok tokomu<br />dalam tiga langkah</h2><p>Pilih aroma dan ukuran, susun cart, lalu konfirmasi pesanan bersama admin</p></div>
      <ol className="process-steps">
        <li className="process-step process-first"><div className="process-step-heading"><span className="process-number" aria-hidden="true">1</span><h3>Pilih aroma dan ukuran</h3></div>
          <p>Bandingkan aroma dan harga ukuran 35, 50, atau 100 gr</p>
          <div className="process-visual process-product" role="img" aria-label="Gambaran memilih aroma dengan ukuran 50 gram">
            <img src="/images/collections/33711974.jpg" alt="" loading="lazy" width="900" height="1350" onError={event => { event.currentTarget.hidden = true }} />
            <div><strong>{examples[0]?.product.name || 'Temukan aromamu'}</strong><div className="process-sizes"><span>35 gr</span><span className="process-highlight">50 gr</span><span>100 gr</span></div>{examples[0] && <span className="process-price">{formatPrice(getVariantPrice(examples[0].variant, now))}</span>}</div>
          </div>
        </li>
        <li className="process-step process-second"><div className="process-step-heading"><span className="process-number" aria-hidden="true">2</span><h3>Gabungkan pilihanmu</h3></div>
          <p>Campur beberapa aroma, total berat dihitung otomatis</p>
          <div className="process-visual process-cart">{examples.map(row => <div className="process-cart-row" key={row.product.id}><strong>{row.product.name}</strong><span>{row.quantity} × {row.variant.grams} gr</span></div>)}<div className="process-total process-highlight"><span>Total berat</span><strong>{formatGrams(grams)}</strong></div></div>
        </li>
        <li className="process-step process-third"><div className="process-step-heading"><span className="process-number" aria-hidden="true">3</span><h3>Konfirmasi lewat WhatsApp</h3></div>
          <p>Bahas stok, ongkir, dan pembayaran bersama admin</p>
          <div className="process-visual process-message"><div className="process-message-heading"><WhatsappLogoIcon size={24} className="process-highlight-icon" aria-hidden="true" /><strong>Rangkuman pesanan</strong></div><div className="process-message-body"><span>Halo, saya ingin memesan</span>{examples.map(row => <span key={row.product.id}>{row.product.name} · {row.quantity} × {row.variant.grams} gr</span>)}<strong>Total {formatGrams(grams)}</strong></div></div>
        </li>
      </ol>
      <div className="process-footer"><div><h3>Butuh bantuan memilih aroma?</h3></div><div className="process-controls"><a className="btn btn-primary" href={consultationUrl} target="_blank" rel="noreferrer">Konsultasi via WhatsApp <ArrowUpRightIcon size={18} aria-hidden="true" /></a></div></div>
    </div>
  </section>
}
