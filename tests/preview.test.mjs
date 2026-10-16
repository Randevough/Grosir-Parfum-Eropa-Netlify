import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

// Bundle TypeScript in memory for model and server-render checks. No browser/network is used.
const source = `
export * from './src/lib/cart'
export * from './src/lib/pricing'
export * from './src/lib/collections'
export { PRODUCTS } from './src/data/products'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CatalogProvider } from './src/store/catalog'
import { CartProvider } from './src/store/cart'
import Landing from './src/pages/LandingPage'
import Catalog from './src/pages/CatalogPage'
import Promo from './src/pages/PromoPage'
import Detail from './src/pages/ProductDetailPage'
import Cart from './src/pages/CartPage'
import Admin from './src/pages/AdminPage'
import SiteLayout from './src/components/layout/SiteLayout'
import { ProductImage } from './src/components/ui'
export function renderImage(product, compact) { return renderToStaticMarkup(React.createElement(ProductImage, {product, compact})) }
export function renderRoute(path) {
 const pages = [['/', Landing], ['/katalog', Catalog], ['/promo', Promo], ['/produk/:slug', Detail], ['/cart', Cart], ['/admin', Admin]]
 return renderToStaticMarkup(React.createElement(MemoryRouter, {initialEntries:[path]},
  React.createElement(CatalogProvider, null, React.createElement(CartProvider, null,
   React.createElement(Routes, null, React.createElement(Route, {element:React.createElement(SiteLayout)}, pages.map(([path, Page]) => React.createElement(Route, {key:path,path,element:React.createElement(Page)}))))))))
}
`
const result = buildSync({ stdin: { contents: source, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic', mainFields: ['module', 'main'], external: ['react', 'react-dom/server', 'react-router-dom', './MapPanel'], loader: { '.css': 'empty' } })
const bundled = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), bundled, bundled.exports)
const { parseCart, resolveCart, getVariantPrice, isPromoActive, PRODUCTS, renderRoute, COLLECTIONS, matchesCollection, renderImage } = bundled.exports

test('promo uses inclusive start, exclusive end and ignores invalid schedules/prices', () => {
 const start = Date.parse('2026-10-01T00:00:00+07:00'), end = Date.parse('2026-11-01T00:00:00+07:00')
 const variant = { price: 50000, promo: {price:40000,startsAt:'2026-10-01T00:00:00+07:00',endsAt:'2026-11-01T00:00:00+07:00'} }
 assert.equal(getVariantPrice(variant, start - 1), 50000)
 assert.equal(getVariantPrice(variant, start), 40000)
 assert.equal(getVariantPrice(variant, end - 1), 40000)
 assert.equal(getVariantPrice(variant, end), 50000)
 for (const changes of [{price:-1}, {price:50000}, {price:NaN}, {endsAt:'bad-date'}]) assert.equal(isPromoActive({...variant,promo:{...variant.promo,...changes}}, start), false)
})

test('saved cart rejects corrupt data and invalid quantities, merging duplicates safely', () => {
 for (const raw of ['bad-json', '{}', 'null', null]) assert.deepEqual(parseCart(raw), [])
 const row = {productId:'p',variantId:'35gr',quantity:2}
 assert.deepEqual(parseCart(JSON.stringify([row, {...row,quantity:3}, null, {...row,quantity:0}, {...row,quantity:1.5}, {...row,quantity:10000}])), [{...row,quantity:5}])
 assert.equal(parseCart(JSON.stringify([{...row,quantity:9999}, row]))[0].quantity, 9999)
})

test('mixed-size cart totals 1000 grams and resolves current prices and unavailable products', () => {
 const product = {...PRODUCTS[0], id:'p', published:true, variants:[35,50,100].map(grams => ({id:grams+'gr',grams,price:grams*1000,available:true}))}
 const items = [10,5,4].map((quantity,index) => ({productId:'p',variantId:product.variants[index].id,quantity}))
 const rows = resolveCart(items, [product])
 assert.equal(rows.reduce((sum,row) => sum+row.grams, 0), 1000)
 assert.equal(rows.reduce((sum,row) => sum+row.subtotal, 0), 1000000)
 assert.ok(rows.every(row => !row.blocked))
 assert.equal(resolveCart(items, [{...product, variants:product.variants.map(v=>({...v,price:2000}))}])[0].subtotal, 20000)
 assert.ok(resolveCart(items, [{...product,published:false}]).every(row => row.blocked))
 assert.ok(resolveCart(items, []).every(row => row.blocked))
 assert.ok(resolveCart(items, [{...product,variants:product.variants.map(v=>({...v,available:false}))}]).every(row => row.blocked))
})

test('all preview pages render, including filter-empty and unknown product states', () => {
 for (const [path, expected] of [['/','Pilihan aroma'], ['/katalog','Katalog'], ['/promo','Promo untuk stok'], ['/produk/sahara-oud','Sahara Oud'], ['/produk/missing','Produk tidak ditemukan'], ['/cart','Belum ada produk di cart'], ['/admin','Buka demo CMS'], ['/katalog?q=doesnotexist123','Belum ada produk yang cocok']]) assert.ok(renderRoute(path).includes(expected), path)
})

test('cart hydrates saved browser data into server-rendered summary without sending WhatsApp', () => {
 const product = PRODUCTS.find(p => p.slug === 'sahara-oud')
 const variant = product.variants.find(v => v.available)
 globalThis.localStorage = {getItem: () => JSON.stringify([{productId:product.id,variantId:variant.id,quantity:2}])}
 try {
  const html = renderRoute('/cart')
  assert.ok(html.includes(product.name))
  assert.ok(html.includes('buyer-name'))
  assert.ok(!html.includes('Belum ada produk di cart'))
 } finally { delete globalThis.localStorage }
})


test('each bento destination applies a real collection filter to the catalog', () => {
 const landing = renderRoute('/')
 for (const collection of COLLECTIONS) {
  assert.ok(landing.includes(`/katalog?collection=${collection.key}`))
  const html = renderRoute(`/katalog?collection=${collection.key}`)
  const matching = PRODUCTS.filter(product => matchesCollection(product, collection.key))
  assert.ok(html.includes(`${matching.length} produk ditemukan`), collection.key)
  for (const product of PRODUCTS.filter(p=>p.published)) {
   const link = `/produk/${product.slug}`
   assert.equal(html.includes(link), matching.some(p=>p.id===product.id), product.slug+' / '+collection.key)
  }
 }
 assert.ok(!landing.includes('Pilihan best seller.'))
 assert.ok(!landing.includes('Contoh testimoni'))
 const main = landing.slice(landing.indexOf('<main'), landing.indexOf('</main>'))
 assert.ok(!main.includes('Preview desain'))
 assert.equal((main.match(/class="collection-card /g) || []).length, 5)
})

test('locator has custom region control and separate map credits without unfinished content', () => {
 const html = renderRoute('/')
 const locations = html.slice(html.indexOf('id="lokasi"'), html.indexOf('collections-section'))
 assert.ok(locations.includes('locator-panel'))
 assert.ok(locations.includes('Jakarta Pusat'))
 assert.ok(locations.includes('Depok'))
 assert.match(locations, /aria-pressed="true"[^>]*>[\s\S]*?<strong>Jakarta Pusat<\/strong>/)
 assert.equal((locations.match(/aria-pressed="true"/g) || []).length, 1)
 assert.ok(!locations.includes('Lokasi ilustratif'))
 assert.ok(locations.includes('aria-haspopup="listbox"'))
 assert.ok(!locations.includes('<select'))
 assert.ok(locations.includes('locator-credits'))
 assert.ok(locations.includes('https://www.openstreetmap.org/copyright'))
 assert.ok(!locations.includes('Alamat toko akan ditambahkan'))
 assert.ok(!locations.includes('Jam buka belum dikonfirmasi'))
 for (const button of locations.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) assert.ok(!/<p\b/.test(button[1]))
})

test('ordering process explains three steps with a consistent example and no shopping controls', () => {
 const html = renderRoute('/')
 const process = html.slice(html.indexOf('class="business-section process-section"'), html.indexOf('storefront-details'))
 assert.equal((process.match(/class="process-step process-/g) || []).length, 3)
 assert.ok(process.includes('1.000 gr'))
 assert.ok(!process.includes('Jeda animasi'))
 assert.ok(!process.includes('<button'))
 assert.ok(process.includes('Konsultasi via WhatsApp'))
 assert.ok(!process.includes('<input'))
 assert.ok(!process.includes('aria-live'))
 assert.ok(renderRoute('/cart').includes('Belum ada produk di cart'))
})

test('hero exposes the search form without scent shortcuts', () => {
 const html = renderRoute('/')
 assert.ok(html.includes('id="hero-search-form"'))
 assert.ok(html.includes('aria-label="Cari aroma"'))
 assert.ok(!html.includes('hero-scent-chips'))
 assert.ok(!html.includes('hero-search-toggle'))
})


test('catalog illustration only fills absent product photos and leaves detail fallback intact', () => {
 const product = {...PRODUCTS[0], image: undefined}
 const placeholder = renderImage(product, true)
 assert.ok(placeholder.includes('alt="Ilustrasi botol parfum"'))
 assert.ok(placeholder.includes('/images/catalog/'))
 const actual = renderImage({...product, image: '/images/actual-product.jpg'}, true)
 assert.ok(actual.includes('src="/images/actual-product.jpg"'))
 assert.ok(!actual.includes('Ilustrasi botol parfum'))
 const detail = renderImage(product, false)
 assert.ok(!detail.includes('/images/catalog/'))
 assert.ok(detail.includes('Foto segera ditambahkan'))
})

test('business support sits between collections and ordering with distinct consultation topics', () => {
 const html = renderRoute('/')
 const start = html.indexOf('id="business-support"')
 const end = html.indexOf('class="business-section process-section"', start)
 assert.ok(start > html.indexOf('class="section collections-section"'))
 assert.ok(end > start)
 const section = html.slice(start, end)
 const links = [...section.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&')))
 assert.equal(links.length, 3)
 assert.equal(new Set(links.map(link => link.pathname)).size, 1)
 for (const topic of ['paket usaha', 'botol dan kemasan', 'alat racik']) assert.ok(links.some(link => link.searchParams.get('text').includes(topic)))
 for (const claim of ['food grade', '12+ jam', '150–300%', 'Tester gratis']) assert.ok(!section.includes(claim))
})
