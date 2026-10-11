export type BuyerStatus = 'new' | 'repeat'
export interface BuyerDetails { name: string; phone: string; status: BuyerStatus }
export interface WhatsAppRow { name: string; grams: number; quantity: number; price: number }
const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const grams = (value: number) => `${new Intl.NumberFormat('id-ID').format(value)} gr`

export function normalizeWhatsAppNumber(value: string): string | null {
  if (!/^[+\d\s()-]+$/.test(value.trim())) return null
  let number = value.replace(/[\s()+-]/g, '')
  if (number.startsWith('0')) number = `62${number.slice(1)}`
  return /^[1-9]\d{7,14}$/.test(number) ? number : null
}

export function buildWhatsAppMessage(buyer: BuyerDetails, rows: WhatsAppRow[], minimumGrams: number): string {
  const phone = normalizeWhatsAppNumber(buyer.phone)
  if (!buyer.name.trim() || !phone || !['new', 'repeat'].includes(buyer.status)) throw new Error('Lengkapi identitas pembeli.')
  if (!rows.length || rows.some(row => !row.name.trim() || !Number.isSafeInteger(row.quantity) || row.quantity < 1 || row.quantity > 9999 || !Number.isFinite(row.grams) || row.grams <= 0 || !Number.isFinite(row.price) || row.price < 0)) throw new Error('Periksa kembali pilihan produk.')
  const totalGrams = rows.reduce((sum, row) => sum + row.grams * row.quantity, 0)
  const totalPrice = rows.reduce((sum, row) => sum + row.price * row.quantity, 0)
  return [
    `Halo Grosir Parfum Eropa, saya ingin ${totalGrams < minimumGrams ? 'konsultasi pilihan grosir berikut' : 'mengonfirmasi pesanan grosir berikut'}.`,
    '', `Nama: ${buyer.name.trim()}`, `WhatsApp: +${phone}`,
    `Status: ${buyer.status === 'new' ? 'Pembeli pertama' : 'Pernah membeli (mohon verifikasi admin)'}`,
    '', ...rows.map((row, index) => `${index + 1}. ${row.name} — ${grams(row.grams)} × ${row.quantity}\n   Harga/kemasan: ${money(row.price)} | Subtotal: ${money(row.price * row.quantity)}`),
    '', `Total berat: ${grams(totalGrams)}`, `Total harga produk: ${money(totalPrice)}`,
    ...(totalGrams < minimumGrams ? [`Belum mencapai minimum ${grams(minimumGrams)}; kurang ${grams(minimumGrams - totalGrams)}. Mohon konsultasi terlebih dahulu.`] : []),
    '', 'Harga belum termasuk ongkir. Mohon konfirmasi ketersediaan, pengiriman, dan pembayaran melalui admin.',
  ].join('\n')
}

export function buildWhatsAppUrl(destination: string, message: string): string {
  const number = normalizeWhatsAppNumber(destination)
  if (!number) throw new Error('Nomor WhatsApp tujuan tidak valid.')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
