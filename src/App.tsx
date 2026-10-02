import { useState } from 'react'
import { 
  Sparkles, 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  ChevronRight, 
  MessageCircle,
  Package
} from 'lucide-react'
import { CONFIG } from './data/config'
import { PRODUCTS, ACCORD_COLORS, GENDER_LIST } from './data/products'

export default function App() {
  const [selectedGender, setSelectedGender] = useState<string>('Semua')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredProducts = PRODUCTS.filter((item) => {
    const matchGender = selectedGender === 'Semua' || item.gender === selectedGender
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchGender && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f2eb] flex flex-col font-sans selection:bg-[#c5a059]/30 selection:text-[#faedd0]">
      {/* Top Banner */}
      <div className="bg-[#141210] border-b border-[#2a2622] text-xs text-[#c5a059] py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>Setup Aktif: Vite 6 + React 19 + Tailwind CSS v4 &mdash; Siap konversi desain Grosir Parfum Eropa</span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0a0908]/90 backdrop-blur-md border-b border-[#24211e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#866232] to-[#c5a059] flex items-center justify-center text-[#0a0908] font-bold shadow-lg shadow-[#c5a059]/10">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-wide text-[#f5eed8] block leading-tight">
                {CONFIG.brand}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#a7803d]">
                {CONFIG.tagline} &bull; Est. {CONFIG.sejakTahun}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#c4bdae]">
            <a href="#hero" className="text-[#c5a059] transition-colors">Beranda</a>
            <a href="#katalog" className="hover:text-[#f5f2eb] transition-colors">Katalog Grosir</a>
            <a href="#keunggulan" className="hover:text-[#f5f2eb] transition-colors">Standar Mutu</a>
            <a href="#kontak" className="hover:text-[#f5f2eb] transition-colors">Hubungi Admin</a>
          </nav>

          <div className="flex items-center gap-3">
            <a 
              href={`https://wa.me/${CONFIG.whatsapp}?text=Halo%20Grosir%20Parfum%20Eropa`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25d366]/10 text-[#25d366] border border-[#25d366]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-[#25d366]/20 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{CONFIG.whatsappLabel}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section id="hero" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#1f1c19]">
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#c5a059] via-transparent to-transparent"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1b17] border border-[#38322a] text-[#dec47d] text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
              <span>Distributor Resmi &bull; Pasokan Bibit Murni Grade A Standar IFRA</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#fbf7ee] leading-[1.1]">
              Maison Bibit Parfum Eropa
            </h1>
            
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#b8b09f] leading-relaxed">
              Pasokan bibit parfum konsentrat impor tanpa campuran solviol atau DPG. Diformulasikan khusus untuk toko refill, reseller, dan brand independen dengan takaran gram akurat dan harga grosir transparan.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a 
                href="#katalog" 
                className="bg-[#c5a059] hover:bg-[#d1aa50] text-[#0a0908] font-semibold px-6 py-3 rounded-md text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#c5a059]/20"
              >
                <span>Lihat 12 Produk Unggulan</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <a 
                href={`https://wa.me/${CONFIG.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#1a1714] hover:bg-[#25211d] text-[#e0d8c7] border border-[#3d362c] px-6 py-3 rounded-md text-sm font-semibold transition-all"
              >
                Konsultasi Pemesanan WA
              </a>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto text-left">
              <div className="bg-[#121110] border border-[#26221d] p-4 rounded-lg">
                <div className="font-serif text-2xl font-bold text-[#c5a059]">1 kg</div>
                <div className="text-xs text-[#9a9181] mt-1">Akumulasi Order Awal</div>
              </div>
              <div className="bg-[#121110] border border-[#26221d] p-4 rounded-lg">
                <div className="font-serif text-2xl font-bold text-[#c5a059]">100 gr</div>
                <div className="text-xs text-[#9a9181] mt-1">Bebas Repeat Order</div>
              </div>
              <div className="bg-[#121110] border border-[#26221d] p-4 rounded-lg">
                <div className="font-serif text-2xl font-bold text-[#c5a059]">100%</div>
                <div className="text-xs text-[#9a9181] mt-1">Bibit Konsentrat Murni</div>
              </div>
              <div className="bg-[#121110] border border-[#26221d] p-4 rounded-lg">
                <div className="font-serif text-2xl font-bold text-[#c5a059]">Asia</div>
                <div className="text-xs text-[#9a9181] mt-1">Kirim Seluruh Kawasan</div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="katalog" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#26221d]">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#a7803d] font-semibold mb-1">
                Katalog Grosir
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f5eed8]">
                Daftar Produk Bibit Murni
              </h2>
              <p className="text-sm text-[#9e9686] mt-1">
                Harga grosir langsung transparan per takaran gram &amp; botol
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#7a7263] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Cari aroma..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#141210] border border-[#2e2924] rounded-md pl-9 pr-4 py-2 text-xs text-[#f5f2eb] placeholder-[#7a7263] focus:outline-none focus:border-[#c5a059] w-full sm:w-48"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#141210] border border-[#2e2924] p-1 rounded-md text-xs">
                {['Semua', ...GENDER_LIST].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`px-3 py-1 rounded transition-colors ${
                      selectedGender === gender 
                        ? 'bg-[#c5a059] text-[#0a0908] font-bold' 
                        : 'text-[#9a9181] hover:text-[#f5f2eb]'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const lowestSize = product.sizes[0]
              return (
                <div 
                  key={product.id}
                  className="group bg-[#121110] border border-[#24201b] hover:border-[#c5a059]/40 rounded-xl overflow-hidden transition-all duration-300 flex flex-col"
                >
                  {/* Visual Header / Gradient Swatch */}
                  <div 
                    className="h-32 p-4 flex flex-col justify-between relative"
                    style={{
                      background: `linear-gradient(135deg, ${product.colors[0]}, ${product.colors[1]})`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
                        {product.gender}
                      </span>
                      <div className="flex gap-1">
                        {product.badges.map(b => (
                          <span key={b} className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400 text-black">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-white drop-shadow-md">
                      <span className="text-xs opacity-80">{product.brand}</span>
                      <h3 className="font-serif text-xl font-bold leading-tight">{product.name}</h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-[#a39b8c] line-clamp-2 leading-relaxed">
                      {product.desc}
                    </p>

                    {/* Accords preview */}
                    <div className="flex flex-wrap gap-1">
                      {product.accords.slice(0, 3).map(accord => {
                        const style = ACCORD_COLORS[accord.name] || { bg: '#333', color: '#fff' }
                        return (
                          <span 
                            key={accord.name}
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: style.bg, color: style.color }}
                          >
                            {accord.name}
                          </span>
                        )
                      })}
                    </div>

                    {/* Price and Action */}
                    <div className="pt-2 border-t border-[#1f1c18] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[#7a7263]">Mulai Grosir:</div>
                        <div className="text-sm font-bold text-[#c5a059]">
                          Rp {lowestSize.grosir.toLocaleString('id-ID')}
                          <span className="text-[10px] text-[#8a8170] font-normal"> / {lowestSize.ml}ml</span>
                        </div>
                      </div>
                      <a 
                        href={`https://wa.me/${CONFIG.whatsapp}?text=Halo%2C%20saya%20tertarik%20pesan%20grosir%20${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#1f1c19] hover:bg-[#c5a059] hover:text-[#0a0908] text-[#c5a059] p-2 rounded-lg transition-colors"
                        title="Pesan via WA"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="kontak" className="bg-[#0e0d0c] border-t border-[#1f1c18] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#8a8170]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-serif text-lg font-bold text-[#f5eed8] mb-2">{CONFIG.brand}</div>
            <p className="max-w-sm leading-relaxed text-[#9a9181]">
              Penyedia bibit parfum Eropa konsentrat murni tanpa campuran solviol atau DPG untuk industri parfum isi ulang dan retail.
            </p>
          </div>
          <div>
            <div className="font-semibold text-[#f5eed8] mb-2">Toko Fisik &amp; Kantor</div>
            {CONFIG.toko.map(t => (
              <div key={t.kota} className="mb-2">
                <span className="font-medium text-[#c5a059]">{t.kota}:</span> {t.alamat} ({t.jam})
              </div>
            ))}
          </div>
          <div>
            <div className="font-semibold text-[#f5eed8] mb-2">Kontak &amp; Dukungan</div>
            <p>WhatsApp: {CONFIG.whatsappLabel}</p>
            <p>Email: {CONFIG.email}</p>
            <p>Instagram: {CONFIG.instagram}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-[#1a1816] text-center text-[#615a4e]">
          &copy; {CONFIG.sejakTahun} &ndash; {new Date().getFullYear()} {CONFIG.brand}. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
