import type { Product, ProductVariant } from '../types'
export function isPromoActive(v: ProductVariant, now = Date.now()): boolean {
  const p = v.promo
  return !!p && Number.isFinite(p.price) && p.price >= 0 && p.price < v.price && Date.parse(p.startsAt) <= now && now < Date.parse(p.endsAt)
}
export function getVariantPrice(v: ProductVariant, now = Date.now()): number { return isPromoActive(v, now) ? v.promo!.price : v.price }
export function getStartingVariant(p: Product, now = Date.now()): ProductVariant | undefined {
  return [...p.variants.filter(v => v.available)].sort((a, b) => getVariantPrice(a, now) - getVariantPrice(b, now))[0]
}
export const formatPrice = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
export const formatGrams = (v: number) => `${new Intl.NumberFormat('id-ID').format(v)} gr`
