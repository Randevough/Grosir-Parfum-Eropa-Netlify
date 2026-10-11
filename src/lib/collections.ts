import type { Product } from '../types'
import { isPromoActive } from './pricing'

export const COLLECTIONS = [
  { key: 'viral', title: 'Viral', description: 'Aroma yang sedang ramai dibicarakan', caption: 'Pilihan tren', letter: 'V' },
  { key: 'new', title: 'New Arrival', description: 'Tambahan terbaru untuk pilihan stok', caption: 'Baru di katalog', letter: 'N' },
  { key: 'best', title: 'Best Seller', description: 'Pilihan best seller untuk tokomu', caption: 'Pilihan populer', letter: 'B' },
  { key: 'selection', title: 'Selection', description: 'Jelajahi karakter aroma dalam koleksi pilihan', caption: 'Kurasi aroma', letter: 'S' },
  { key: 'promo', title: 'Promo', description: 'Cek aroma dan ukuran dengan harga promo', caption: 'Harga khusus', letter: 'P' },
] as const

export function matchesCollection(product: Product, key: string, now = Date.now()) {
  if (!product.published) return false
  if (key === 'promo') return product.variants.some(variant => variant.available && isPromoActive(variant, now))
  return product.badges.some(badge => badge === key)
}
