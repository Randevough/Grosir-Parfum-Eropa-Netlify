import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { CatalogProvider, useCatalog } from './store/catalog'
import { CartProvider } from './store/cart'
import SiteLayout from './components/layout/SiteLayout'
import LandingPage from './pages/LandingPage'
import CatalogPage from './pages/CatalogPage'
import PromoPage from './pages/PromoPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import AdminPage from './pages/AdminPage'
import { EmptyState } from './components/ui'
import { Link } from 'react-router-dom'
function LegacyProduct() {
 const [params] = useSearchParams()
 const { products } = useCatalog()
 const product = products.find(p => p.id === params.get('id'))
 return <Navigate replace to={`/produk/${product?.slug || 'tidak-ditemukan'}`} />
}
export default function App() {
 return <BrowserRouter><CatalogProvider><CartProvider><Routes><Route element={<SiteLayout />}>
 <Route path="/" element={<LandingPage />} />
 <Route path="/katalog" element={<CatalogPage />} />
 <Route path="/promo" element={<PromoPage />} />
 <Route path="/produk/:slug" element={<ProductDetailPage />} />
 <Route path="/cart" element={<CartPage />} />
 <Route path="/admin" element={<AdminPage />} />
 <Route path="/produk.html" element={<LegacyProduct />} />
 <Route path="/katalog.html" element={<Navigate to="/katalog" replace />} />
 <Route path="/promo.html" element={<Navigate to="/promo" replace />} />
 <Route path="/admin.html" element={<Navigate to="/admin" replace />} />
 <Route path="*" element={<section className="wrap page-section"><EmptyState title="Halaman tidak ditemukan"><p>Alamat ini belum tersedia.</p><Link to="/katalog" className="btn btn-primary mt-6">Lihat katalog</Link></EmptyState></section>} />
 </Route></Routes></CartProvider></CatalogProvider></BrowserRouter>
}
