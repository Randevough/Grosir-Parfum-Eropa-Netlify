import { createContext, useContext, useState, type ReactNode } from 'react'
import { PRODUCTS } from '../data/products'
import { BRANCHES } from '../data/branches'
import type { Product, Branch } from '../types'
export interface LandingContent { heroTitle: string; heroDescription: string; businessText: string; testimonial: string }
const initialContent: LandingContent = {
  heroTitle: 'Pilihan aroma untuk stok toko parfum kamu',
  heroDescription: 'Kenali aromanya, pilih ukuran, lalu konfirmasi pesanan grosir bersama admin melalui WhatsApp',
  businessText: 'Pilih aroma dan ukuran yang sesuai kebutuhan toko, lalu tanyakan kebutuhan usaha lainnya kepada admin',
  testimonial: '',
}
const CatalogContext = createContext<{
  products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  branches: Branch[]; setBranches: React.Dispatch<React.SetStateAction<Branch[]>>
  content: LandingContent; setContent: React.Dispatch<React.SetStateAction<LandingContent>>
} | null>(null)
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [branches, setBranches] = useState<Branch[]>(BRANCHES)
  const [content, setContent] = useState(initialContent)
  return <CatalogContext.Provider value={{ products, setProducts, branches, setBranches, content, setContent }}>{children}</CatalogContext.Provider>
}
export function useCatalog() {
  const value = useContext(CatalogContext)
  if (!value) throw new Error('CatalogProvider diperlukan')
  return value
}
