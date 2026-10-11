import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem } from '../types'
import { parseCart, validQuantity } from '../lib/cart'
import { useCatalog } from './catalog'
export const CART_KEY = 'gpe-preview-cart-v1'
const CartContext = createContext<{
  items: CartItem[]; count: number; storageError: boolean
  addItem: (productId: string, variantId: string, quantity?: number) => boolean
  updateQuantity: (productId: string, variantId: string, quantity: number) => void
  removeItem: (productId: string, variantId: string) => void
  clearCart: () => void
} | null>(null)
export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog()
  const [items, setItems] = useState<CartItem[]>(() => { try { return parseCart(localStorage.getItem(CART_KEY)) } catch { return [] } })
  const [storageError, setStorageError] = useState(false)
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(items)); setStorageError(false) } catch { setStorageError(true) } }, [items])
  const addItem = (productId: string, variantId: string, quantity = 1) => {
    const product = products.find(p => p.id === productId && p.published)
    if (!validQuantity(quantity) || !product?.variants.find(v => v.id === variantId && v.available)) return false
    if ((items.find(i => i.productId === productId && i.variantId === variantId)?.quantity || 0) + quantity > 9999) return false
    setItems(old => {
      const found = old.find(i => i.productId === productId && i.variantId === variantId)
      return found ? old.map(i => i === found ? { ...i, quantity: Math.min(9999, i.quantity + quantity) } : i) : [...old, { productId, variantId, quantity }]
    })
    return true
  }
  return <CartContext.Provider value={{ items, count: items.reduce((sum, i) => sum + i.quantity, 0), storageError, addItem,
    updateQuantity: (productId, variantId, quantity) => { if (validQuantity(quantity)) setItems(old => old.map(i => i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i)) },
    removeItem: (productId, variantId) => setItems(old => old.filter(i => i.productId !== productId || i.variantId !== variantId)), clearCart: () => setItems([]),
  }}>{children}</CartContext.Provider>
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('CartProvider diperlukan'); return value }
