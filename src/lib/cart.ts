import type { CartItem, Product } from '../types'
import { getVariantPrice } from './pricing'
export const validQuantity = (value: number) => Number.isSafeInteger(value) && value > 0 && value <= 9999
export function parseCart(raw: string | null): CartItem[] {
  try {
    const data: unknown = JSON.parse(raw || '[]')
    if (!Array.isArray(data)) return []
    const result: CartItem[] = []
    for (const item of data) {
      if (!item || typeof item.productId !== 'string' || typeof item.variantId !== 'string' || !validQuantity(item.quantity)) continue
      const existing = result.find(i => i.productId === item.productId && i.variantId === item.variantId)
      if (existing) existing.quantity = Math.min(9999, existing.quantity + item.quantity)
      else result.push({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })
    }
    return result
  } catch { return [] }
}
export function resolveCart(items: CartItem[], products: Product[], now = Date.now()) {
  return items.map(item => {
    const product = products.find(p => p.id === item.productId && p.published)
    const variant = product?.variants.find(v => v.id === item.variantId)
    const price = variant ? getVariantPrice(variant, now) : 0
    return { ...item, product, variant, blocked: !product || !variant || !variant.available, price, subtotal: price * item.quantity, grams: (variant?.grams || 0) * item.quantity }
  })
}
