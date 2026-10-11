export interface ProductVariant {
  id: string
  grams: number
  price: number
  available: boolean
  promo?: { price: number; startsAt: string; endsAt: string }
}

export interface ProductAccord {
  name: string
  score: number
}

export interface ProductNotes {
  top: string
  middle: string
  base: string
}

export interface Product {
  id: string
  name: string
  brand: string
  gender: 'Pria' | 'Wanita' | 'Unisex'
  badges: Array<'viral' | 'new' | 'best' | 'selection' | 'promo'>
  desc: string
  notes: ProductNotes
  accords: ProductAccord[]
  colors: [string, string]
  variants: ProductVariant[]
  slug: string
  published: boolean
  createdAt: string
  image?: string
}

export interface CollectionItem {
  key: 'viral' | 'new' | 'best' | 'selection' | 'promo'
  name: string
  desc: string
  tint: string
  pick: string
}

export interface BankAccount {
  nama: string
  rekening: string
  atasNama: string
}

export interface PhysicalStore {
  kota: string
  alamat: string
  jam: string
}

export interface WholesaleRule {
  minPertamaGram: number
  minBerikutnyaGram: number
  catatanKonversi: string
}

export interface StoreConfig {
  brand: string
  brandSuffix: string
  tagline: string
  sejakTahun: number
  whatsapp: string
  whatsappLabel: string
  email: string
  instagram: string
  bank: BankAccount[]
  toko: PhysicalStore[]
  grosir: WholesaleRule
  jangkauan: string
  promo: string[]
  admin: {
    user: string
    pass: string
  }
}

export interface CartItem { productId: string; variantId: string; quantity: number }
export interface Branch { id: string; name: string; region: string; address: string; hours: string; coordinates: [number, number]; demo: boolean }
