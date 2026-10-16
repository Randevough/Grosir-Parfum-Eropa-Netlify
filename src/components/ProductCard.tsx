import { ArrowUpRightIcon as ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatPrice, getStartingVariant, getVariantPrice, isPromoActive } from '../lib/pricing'
import { useNow } from '../lib/useNow'
import { ProductImage } from './ui'
export default function ProductCard({ product, catalog = false }: { product: Product; catalog?: boolean }) {
  const now = useNow()
  const variant = getStartingVariant(product, now)
  const price = variant ? <div className="product-card-price"><span>Mulai {formatPrice(getVariantPrice(variant, now))}</span><span>/ {variant.grams} gr</span>{isPromoActive(variant, now) && <del>{formatPrice(variant.price)}</del>}</div> : <p className="text-danger text-sm">Sold out</p>
  if (catalog) return <article className="product-card">
    <Link to={`/produk/${product.slug}`} aria-label={`Lihat ${product.name}`} className="product-card-visual"><ProductImage product={product} compact />{variant && isPromoActive(variant, now) && <span className="product-tag">Promo</span>}</Link>
    <div className="catalog-card-body">
      <p className="catalog-card-gender">{product.gender}</p>
      <Link to={`/produk/${product.slug}`} className="product-card-title"><h3>{product.name}</h3></Link>
      <p className="product-card-notes">{product.accords.slice(0, 2).map(a => a.name).join(' / ')}</p>
      <div className="catalog-card-purchase">{price}<p className="catalog-card-sizes">{product.variants.filter(v => v.available).map(v => `${v.grams} gr`).join(' / ') || 'Belum tersedia'}</p></div>
    </div>
  </article>
  return <article className="product-card"><Link to={`/produk/${product.slug}`} aria-label={`Lihat ${product.name}`} className="product-card-visual"><ProductImage product={product} />{variant && isPromoActive(variant, now) && <span className="product-tag">Promo</span>}</Link><div className="product-card-meta"><span>{product.gender}</span><span>{product.accords[0]?.name}</span></div><Link to={`/produk/${product.slug}`} className="product-card-title"><h3>{product.name}</h3><ArrowUpRight className="arrow-motion arrow-up-right" aria-hidden="true" size={19} /></Link><p className="product-card-notes">{product.notes.top}</p>{price}</article>
}
