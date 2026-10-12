import { useEffect, useState } from 'react'
import { ArrowUpRightIcon as ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { ListIcon as Menu } from '@phosphor-icons/react/dist/csr/List'
import { BagIcon as ShoppingBag } from '@phosphor-icons/react/dist/csr/Bag'
import { XIcon as X } from '@phosphor-icons/react/dist/csr/X'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../../store/cart'
import { CONFIG, consultationUrl } from '../../data/config'

function Brand() { return <Link to="/" className="brand" aria-label="Grosir Parfum Eropa, beranda"><span className="brand-mark" aria-hidden="true">g</span><span>Grosir Parfum<br />Eropa</span></Link> }
const links = [['/', 'Beranda'], ['/katalog', 'Katalog'], ['/promo', 'Promo']]
export default function SiteLayout() {
  const { count } = useCart()
  const [menu, setMenu] = useState(false)
  const { pathname, search } = useLocation()
  useEffect(() => { setMenu(false); window.scrollTo({ top: 0 }); document.getElementById('main')?.focus({ preventScroll: true }) }, [pathname])
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); document.getElementById('nav-toggle')?.focus() } }
    if (menu) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [menu])
  useEffect(() => { if (pathname === '/' && window.location.hash === '#lokasi') document.getElementById('lokasi')?.scrollIntoView() }, [pathname])
  useEffect(() => { const title = pathname === '/' ? 'Beranda' : pathname.startsWith('/produk') ? 'Detail aroma' : pathname === '/katalog' ? 'Katalog' : pathname === '/promo' ? 'Promo' : pathname === '/cart' ? 'Cart' : 'Admin'; document.title = `${title} | ${CONFIG.brand}` }, [pathname, search])
  return <><a className="skip-link" href="#main">Lompat ke konten utama</a><header className="site-header"><div className="wrap header-inner"><Brand /><nav className="header-nav" aria-label="Navigasi utama">{links.map(([url, title]) => <NavLink key={url} to={url} end={url === '/'}>{title}</NavLink>)}</nav><div className="flex items-center gap-2 sm:gap-6"><Link className="cart-link" to="/cart" aria-label={`Cart, ${count} kemasan`}><ShoppingBag aria-hidden="true" size={19} /><span className="hidden sm:inline">Cart</span><span className="cart-count" data-empty={count === 0}>{count}</span></Link><button id="nav-toggle" className="mobile-menu" aria-label={menu ? 'Tutup menu' : 'Buka menu'} aria-expanded={menu} aria-controls="mobile-nav" onClick={() => setMenu(v => !v)}>{menu ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}</button></div></div>{menu && <nav id="mobile-nav" className="mobile-nav" aria-label="Navigasi mobile">{links.map(([url, title]) => <NavLink key={url} to={url} end={url === '/'} onClick={() => setMenu(false)}>{title}</NavLink>)}</nav>}</header><main id="main" tabIndex={-1} className="outline-none"><Outlet /></main><footer className="site-footer"><div className="wrap"><div className="footer-top"><div><Brand /><p>Pilihan parfum grosir untuk toko refill dan reseller</p></div><nav className="footer-links" aria-label="Navigasi footer"><h2 className="footer-label">Jelajahi</h2><Link to="/katalog">Katalog aroma</Link><Link to="/promo">Promo</Link><a href="/#lokasi">Lokasi toko</a></nav><div className="footer-contact"><h2>Diskusikan kebutuhan stokmu</h2><a href={consultationUrl} target="_blank" rel="noreferrer" className="btn btn-primary">Hubungi via WhatsApp <ArrowUpRight className="arrow-motion arrow-up-right" aria-hidden="true" size={15} /></a><a className="footer-phone" href={`tel:${CONFIG.whatsappLabel.replace(/[^0-9+]/g, "")}`}>{CONFIG.whatsappLabel}</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Grosir Parfum Eropa</span><Link to="/admin">Akses admin</Link></div></div></footer></>
}
