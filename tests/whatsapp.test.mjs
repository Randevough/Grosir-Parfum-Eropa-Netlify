import test from 'node:test'
import assert from 'node:assert/strict'
import { buildWhatsAppMessage, buildWhatsAppUrl, normalizeWhatsAppNumber } from '../src/lib/whatsapp.ts'

const buyer = { name: 'Rani & Toko + Aroma', phone: '0812 3456 7890', status: 'new' }
const rows = [
  { name: 'Oud & Rose', grams: 35, quantity: 10, price: 35000 },
  { name: 'Fresh + Citrus', grams: 50, quantity: 5, price: 48000 },
  { name: 'Musk / Amber', grams: 100, quantity: 4, price: 90000 },
]

test('message totals mixed sizes correctly and round-trips special characters', () => {
  const message = buildWhatsAppMessage(buyer, rows, 1000)
  assert.match(message, /Total berat: 1\.000 gr/)
  assert.match(message, /Total harga produk: Rp\s?950\.000/)
  assert.doesNotMatch(message, /Belum mencapai minimum/)
  const url = new URL(buildWhatsAppUrl('6285782535778', message))
  assert.equal(url.pathname, '/6285782535778')
  assert.equal(url.searchParams.get('text'), message)
  assert.match(message, /Rani & Toko \+ Aroma/)
  assert.match(message, /WhatsApp: \+6281234567890/)
})

test('below minimum is consultation and repeat buyers require verification', () => {
  const message = buildWhatsAppMessage({ ...buyer, status: 'repeat' }, [rows[0] && { ...rows[0], quantity: 1 }], 100)
  assert.match(message, /konsultasi/)
  assert.match(message, /kurang 65 gr/)
  assert.match(message, /mohon verifikasi admin/)
})

test('phone formats normalize and invalid identity/quantities are rejected', () => {
  assert.equal(normalizeWhatsAppNumber('+62 (812) 3456-7890'), '6281234567890')
  assert.equal(normalizeWhatsAppNumber('0812letters345'), null)
  assert.equal(normalizeWhatsAppNumber('123'), null)
  assert.throws(() => buildWhatsAppMessage({ ...buyer, name: ' ' }, rows, 1000))
  assert.throws(() => buildWhatsAppMessage(buyer, [], 1000))
  for (const quantity of [0, -1, 1.5, 10000, NaN]) {
    assert.throws(() => buildWhatsAppMessage(buyer, [{ ...rows[0], quantity }], 1000))
  }
  assert.throws(() => buildWhatsAppUrl('not-a-number', 'Hello'))
})
