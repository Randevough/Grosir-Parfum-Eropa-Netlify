/* ===========================================================
   Grosir Parfum Eropa PARFUM - main.js
   BAGIAN 1: Utilitas, Penyimpanan, Botol SVG, Header/Footer,
             Keranjang, Drawer, Toast, Reveal, Kartu Produk
   =========================================================== */
(function () {
  "use strict";

  const CONFIG = window.CONFIG;

  /* ---------- 1. UTILITAS ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Format Rupiah: 120000 -> "Rp 120.000" */
  function rp(n) {
    const v = Math.round(Number(n) || 0);
    return "Rp " + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  /** Format berat: 1350 -> "1,35 kg" | 350 -> "350 gr" */
  function gr(n) {
    n = Math.round(Number(n) || 0);
    if (n >= 1000) return (n / 1000).toFixed(2).replace(".", ",").replace(/,00$/, "") + " kg";
    return n + " gr";
  }

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const param = (k) => new URLSearchParams(location.search).get(k);

  /** Angka stabil dari string - dipakai untuk variasi bentuk botol */
  function hash(str) {
    let h = 0;
    for (let i = 0; i < String(str).length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function shade(hex, amt) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const cl = (v) => Math.max(0, Math.min(255, v));
    const r = cl((n >> 16) + amt), g = cl(((n >> 8) & 255) + amt), b = cl((n & 255) + amt);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* ---------- 2. PENYIMPANAN (aman untuk file://) ----------
     Chrome kadang memblokir localStorage saat file dibuka lewat file://.
     Fallback: window.name (tetap hidup selama navigasi di tab yang sama). */
  const Store = (function () {
    let ok = true;
    try {
      localStorage.setItem("__ar_t", "1");
      localStorage.removeItem("__ar_t");
    } catch (e) { ok = false; }

    function bag() {
      try { return JSON.parse(window.name || "{}") || {}; } catch (e) { return {}; }
    }
    return {
      persistent: ok,
      get(key, fallback) {
        try {
          const raw = ok ? localStorage.getItem(key) : bag()[key];
          if (raw == null) return fallback;
          return typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch (e) { return fallback; }
      },
      set(key, val) {
        try {
          if (ok) localStorage.setItem(key, JSON.stringify(val));
          else { const b = bag(); b[key] = val; window.name = JSON.stringify(b); }
        } catch (e) { /* diam saja */ }
      },
      del(key) {
        try {
          if (ok) localStorage.removeItem(key);
          else { const b = bag(); delete b[key]; window.name = JSON.stringify(b); }
        } catch (e) { }
      }
    };
  })();

  const K = {
    cart: "arunika_cart_v1",
    mode: "arunika_mode_v1",
    admin: "arunika_admin_v1",
    over: "arunika_produk_override_v1",
    firstOk: "arunika_grosir_pernah_v1"
  };

  /* ---------- 3. KATALOG PRODUK (+ override dari admin) ---------- */
  function products() {
    const base = JSON.parse(JSON.stringify(window.PRODUCTS || []));
    const over = Store.get(K.over, null);
    if (!over) return base;

    // hapus produk yang dihapus admin
    let list = base.filter((p) => !(over.deleted || []).includes(p.id));
    // terapkan patch
    list = list.map((p) => {
      const patch = (over.patch || {})[p.id];
      return patch ? Object.assign({}, p, patch) : p;
    });
    // tambahkan produk baru
    (over.added || []).forEach((p) => list.push(p));
    return list;
  }
  function findProduct(id) { return products().find((p) => p.id === id) || null; }
  function saveOverride(o) { Store.set(K.over, o); }
  function getOverride() { return Store.get(K.over, { patch: {}, added: [], deleted: [] }); }

  function getBadges(p) {
    if (!p) return [];
    if (Array.isArray(p.badges) && p.badges.length) return p.badges;
    if (p.badge) return [p.badge];
    return [];
  }
  function hasBadge(p, b) {
    return getBadges(p).includes(b);
  }

  /* ---------- 4. MODE HARGA: GROSIR (Harga tunggal) ---------- */
  function getMode() { return "grosir"; }
  function setMode() { /* Mode grosir permanen */ }
  const priceOf = (size, p) => {
    if (!size) return 0;
    if (p && !hasBadge(p, "promo")) return size.grosir || 0;
    return (size.promoPrice != null && size.promoPrice < size.grosir ? size.promoPrice : size.grosir) || 0;
  };

  /* ---------- 5. KERANJANG ---------- */
  const Cart = {
    all() {
      const raw = Store.get(K.cart, []);
      return Array.isArray(raw) ? raw.filter((i) => i && i.id && i.ml) : [];
    },
    save(items) {
      Store.set(K.cart, items);
      document.dispatchEvent(new CustomEvent("arunika:cart", { detail: items }));
    },
    add(id, ml, qty) {
      const items = Cart.all();
      const hit = items.find((i) => i.id === id && i.ml === ml);
      if (hit) hit.qty += qty || 1;
      else items.push({ id: id, ml: ml, qty: qty || 1 });
      Cart.save(items);
      bumpBadge();
    },
    setQty(id, ml, qty) {
      let items = Cart.all();
      if (qty <= 0) items = items.filter((i) => !(i.id === id && i.ml === ml));
      else { const hit = items.find((i) => i.id === id && i.ml === ml); if (hit) hit.qty = qty; }
      Cart.save(items);
    },
    remove(id, ml) { Cart.save(Cart.all().filter((i) => !(i.id === id && i.ml === ml))); },
    clear() { Cart.save([]); },
    count() { return Cart.all().reduce((s, i) => s + i.qty, 0); },
    /** Baris lengkap: produk + ukuran + harga aktif */
    rows(mode) {
      mode = mode || getMode();
      return Cart.all().map((i) => {
        const p = findProduct(i.id);
        const s = p ? p.sizes.find((x) => x.ml === i.ml) : null;
        return { item: i, product: p, size: s, mode: mode, unit: s ? priceOf(s, mode) : 0 };
      }).filter((r) => r.product && r.size);
    },
    /** Total gram: 1 ml = 1 gr */
    grams() { return Cart.rows().reduce((s, r) => s + r.size.ml * r.item.qty, 0); },
    subtotal(mode) { return Cart.rows(mode).reduce((s, r) => s + r.unit * r.item.qty, 0); }
  };

  /** Syarat grosir terpenuhi? */
  function grosirStatus() {
    const g = CONFIG.grosir;
    const pernah = Store.get(K.firstOk, false) === true;
    const min = pernah ? g.minBerikutnyaGram : g.minPertamaGram;
    const total = Cart.grams();
    return {
      pernah: pernah, min: min, total: total,
      ok: total >= min,
      kurang: Math.max(0, min - total),
      persen: Math.min(100, min ? (total / min) * 100 : 0)
    };
  }

  /* ---------- 6. IKON (inline SVG, tanpa file eksternal) ---------- */
  const ICON = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9L12 2.6Z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.7.7-2.5-.2-.3A8 8 0 0 1 12 4Zm-3 4.3c-.2 0-.5 0-.7.4-.3.4-.9 1-.9 2.2s.9 2.5 1 2.7c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.2-.5-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.5l.5-.6c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.5h-.5Z"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.3-3 8-7 9.5-4-1.5-7-5.2-7-9.5V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12.5V4h8.5L21 13.5 13.5 21 3 12.5Z"/><circle cx="7.8" cy="7.8" r="1.3"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v10h16V10"/><path d="M3 4h18l1 5a3 3 0 0 1-5.5 1.6A3 3 0 0 1 12 10.6a3 3 0 0 1-4.5 0A3 3 0 0 1 2 9l1-5Z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l8 4v10l-8 4-8-4V7l8-4Z"/><path d="M4 7l8 4 8-4M12 11v10"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8l-4 4 4 4M6 12h10"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg>'
  };

  /* ===========================================================
     7. renderBottle(product, opts) -> string SVG
     Botol digambar penuh dengan SVG + gradient (tanpa gambar luar).
     Warna cairan diambil dari product.colors, bentuk bervariasi
     mengikuti id produk supaya katalog tidak terasa monoton.
     =========================================================== */
  let uidSeq = 0;

  function renderBottle(product, opts) {
    opts = opts || {};
    const p = product || {};
    const c1 = (p.colors && p.colors[0]) || "#D8C4A6";
    const c2 = (p.colors && p.colors[1]) || shade(c1, -60);
    const uid = "b" + (++uidSeq) + "-" + String(p.id || "x").replace(/[^a-z0-9]/gi, "");
    const h = hash(p.id || "arunika");
    const form = h % 3;                      // 0 = klasik, 1 = tirus, 2 = oval
    const level = opts.level || 104 + (h % 4) * 6; // tinggi permukaan cairan

    const bodies = [
      "M40,66 H80 A14,14 0 0 1 94,80 V176 A14,14 0 0 1 80,190 H40 A14,14 0 0 1 26,176 V80 A14,14 0 0 1 40,66 Z",
      "M34,67 H86 L93,172 A15,15 0 0 1 78,190 H42 A15,15 0 0 1 27,172 Z",
      "M60,65 C87,65 96,90 96,126 C96,166 83,190 60,190 C37,190 24,166 24,126 C24,90 33,65 60,65 Z"
    ];
    const body = bodies[form];
    const capRx = form === 2 ? 13 : 7;

    const cls = ["bottle", opts.className || ""].join(" ").trim();
    const title = esc(p.name || "Botol parfum");
    const initial = esc(String(p.name || "A").trim().charAt(0).toUpperCase());

    return (
      '<svg class="' + cls + '" viewBox="0 0 120 206" role="img" aria-label="Ilustrasi botol ' + title + '">' +
      "<defs>" +
      // cairan
      '<linearGradient id="liq-' + uid + '" x1="0" y1="0" x2="0.35" y2="1">' +
      '<stop offset="0%" stop-color="' + c1 + '"/>' +
      '<stop offset="55%" stop-color="' + c1 + '"/>' +
      '<stop offset="100%" stop-color="' + c2 + '"/>' +
      "</linearGradient>" +
      // kaca kristal
      '<linearGradient id="gls-' + uid + '" x1="0" y1="0" x2="1" y2="0.6">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>' +
      '<stop offset="42%" stop-color="#F7F3EB" stop-opacity="0.75"/>' +
      '<stop offset="100%" stop-color="#E2D8C8" stop-opacity="0.60"/>' +
      "</linearGradient>" +
      // tutup emas champagne
      '<linearGradient id="cap-' + uid + '" x1="0" y1="0" x2="1" y2="0.8">' +
      '<stop offset="0%" stop-color="#EAD9B8"/>' +
      '<stop offset="35%" stop-color="#C5A059"/>' +
      '<stop offset="70%" stop-color="#9E7A36"/>' +
      '<stop offset="100%" stop-color="#B8934A"/>' +
      "</linearGradient>" +
      '<clipPath id="clip-' + uid + '"><path d="' + body + '"/></clipPath>' +
      "</defs>" +

      // bayangan lantai
      '<ellipse cx="60" cy="197" rx="33" ry="5.4" fill="#141210" opacity="0.14"/>' +

      // leher + kerah
      '<rect x="53" y="44" width="14" height="20" fill="url(#gls-' + uid + ')" stroke="#CBBBA3" stroke-width="0.8"/>' +
      '<rect x="46.5" y="56" width="27" height="10" rx="3.5" fill="url(#cap-' + uid + ')"/>' +

      // badan kaca
      '<path d="' + body + '" fill="url(#gls-' + uid + ')" stroke="#C9B99F" stroke-width="1.2"/>' +

      // cairan parfum
      '<g clip-path="url(#clip-' + uid + ')">' +
      '<rect x="20" y="' + level + '" width="80" height="100" fill="url(#liq-' + uid + ')"/>' +
      '<ellipse cx="60" cy="' + level + '" rx="40" ry="5" fill="' + shade(c1, 26) + '" opacity="0.85"/>' +
      '<rect x="20" y="' + (level + 2) + '" width="80" height="7" fill="#ffffff" opacity="0.22"/>' +
      '<rect x="78" y="' + level + '" width="22" height="100" fill="#141210" opacity="0.12"/>' +
      // dasar kaca tebal (weighted heavy base)
      '<rect x="20" y="176" width="80" height="18" fill="url(#gls-' + uid + ')" opacity="0.85"/>' +
      '<line x1="26" y1="176" x2="94" y2="176" stroke="#ffffff" stroke-width="1" opacity="0.5"/>' +
      "</g>" +

      // kilau kaca
      '<g clip-path="url(#clip-' + uid + ')">' +
      '<rect x="34" y="76" width="8" height="102" rx="4" fill="#ffffff" opacity="0.45"/>' +
      '<rect x="46" y="76" width="3" height="66" rx="1.5" fill="#ffffff" opacity="0.26"/>' +
      '<rect x="82" y="70" width="6" height="120" rx="3" fill="#ffffff" opacity="0.18"/>' +
      "</g>" +

      // label mewah
      '<g>' +
      '<rect x="41" y="128" width="38" height="36" rx="6" fill="#FAF8F5" opacity="0.96" stroke="#D8CBBA" stroke-width="0.9"/>' +
      '<rect x="43" y="130" width="34" height="32" rx="4" fill="none" stroke="#C5A059" stroke-width="0.5" opacity="0.6"/>' +
      '<text x="60" y="149" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="600" font-size="17" fill="#856127">' + initial + "</text>" +
      '<text x="60" y="157" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="5" letter-spacing="1" fill="#70675D" font-weight="600">PARFUM</text>' +
      '</g>' +

      // tutup champagne gold
      '<rect x="45" y="15" width="30" height="31" rx="' + capRx + '" fill="url(#cap-' + uid + ')"/>' +
      '<rect x="45" y="37" width="30" height="4" rx="2" fill="#5A4318" opacity="0.30"/>' +
      '<rect x="48" y="18" width="5" height="22" rx="2.5" fill="#FFF3DC" opacity="0.55"/>' +
      '<rect x="54" y="10" width="12" height="6" rx="3" fill="#856127"/>' +
      "</svg>"
    );
  }

  /* ---------- 8. TOAST ---------- */
  function toast(msg, type, ms) {
    let host = $(".toasts");
    if (!host) {
      host = document.createElement("div");
      host.className = "toasts";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "toast toast--" + (type || "info");
    el.innerHTML =
      '<span class="toast__dot"></span><span>' + esc(msg) + "</span>" +
      '<button class="toast__x" aria-label="Tutup notifikasi">&times;</button>';
    host.appendChild(el);
    const kill = () => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 300);
    };
    $(".toast__x", el).addEventListener("click", kill);
    setTimeout(kill, ms || 3400);
  }

  /* ---------- 9. HEADER & FOOTER (disuntik dari JS) ---------- */
  function navHTML(active) {
    const link = (href, label, key) =>
      '<a class="nav__link' + (active === key ? " is-active" : "") + '" href="' + href + '">' + label + "</a>";

    return (
      '<header class="nav" id="siteNav"><div class="wrap nav__inner">' +
      '<a class="logo" href="index.html" aria-label="' + esc(CONFIG.brand) + ' beranda">' +
      '<span class="logo__mark">' + esc(CONFIG.brand) + "</span>" +
      "</a>" +
      '<nav class="nav__menu" id="navMenu" aria-label="Menu utama">' +
      link("index.html", "Beranda", "beranda") +
      link("katalog.html", "Katalog", "katalog") +
      "</nav>" +
      '<div class="nav__right">' +
      '<button class="iconbtn nav__burger" id="burger" aria-label="Buka menu" aria-expanded="false">' + ICON.burger + "</button>" +
      '<button class="iconbtn" id="cartBtn" aria-label="Buka keranjang">' + ICON.bag +
      '<span class="cart-badge" id="cartBadge" hidden>0</span>' +
      "</button>" +
      "</div>" +
      "</div></header>"
    );
  }

  function footerHTML() {
    const stores = (CONFIG.toko || []).map((t) =>
      '<div class="footer__store"><b>' + esc(t.kota) + "</b>" + esc(t.alamat) + "<br>" + esc(t.jam) + "</div>"
    ).join("");

    return (
      '<footer class="footer"><div class="wrap">' +
      '<div class="footer__grid">' +
      "<div>" +
      '<div class="logo"><span class="logo__mark">' + esc(CONFIG.brand) + '</span></div>' +
      '<p class="footer__about">Bibit parfum konsentrat Grade A murni kualitas Eropa. Melayani pesanan grosir transparan sejak ' + esc(CONFIG.sejakTahun) + ".</p>" +
      "</div>" +
      '<div><div class="footer__h">Koleksi Grosir</div><ul class="footer__list">' +
      '<li><a href="katalog.html">Semua Varian</a></li>' +
      '<li><a href="katalog.html?collection=viral">Koleksi Viral</a></li>' +
      '<li><a href="katalog.html?collection=best">Best Seller</a></li>' +
      '<li><a href="katalog.html?collection=new">New Arrival</a></li>' +
      '<li><a href="katalog.html?collection=selection">Signature Selection</a></li>' +
      '<li><a href="katalog.html?collection=promo">Promo Spesial</a></li>' +
      "</ul></div>" +
      '<div><div class="footer__h">Bantuan &amp; Mitra</div><ul class="footer__list">' +
      '<li><a href="keranjang.html">Keranjang Pesanan</a></li>' +
      '<li><a href="katalog.html#grosir">Aturan Grosir</a></li>' +
      '<li><a href="index.html#marginReseller">Simulasi Margin Reseller</a></li>' +
      '<li><a href="admin.html">Masuk Admin</a></li>' +
      "</ul></div>" +
      '<div><div class="footer__h">Kunjungi Toko</div>' + stores +
      '<div class="footer__store"><b>WhatsApp Mitra</b>' + esc(CONFIG.whatsappLabel) + "<br>" + esc(CONFIG.email) + "</div>" +
      "</div>" +
      "</div>" +
      '<div class="footer__bar">' +
      "<span>&copy; " + new Date().getFullYear() + " " + esc(CONFIG.brand) + " " + esc(CONFIG.brandSuffix) + ". Maison Grosir Parfum Eropa</span>" +
      "<span>Pembayaran transfer bank aman - konfirmasi pesanan resmi lewat WhatsApp.</span>" +
      "</div>" +
      "</div></footer>"
    );
  }

  function drawerHTML() {
    return (
      '<div class="overlay" id="overlay"></div>' +
      '<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Keranjang belanja">' +
      '<div class="drawer__head">' +
      '<div><div class="drawer__title">Keranjang Grosir</div><div class="drawer__count" id="drawerCount">0 item</div></div>' +
      '<button class="closebtn" id="drawerClose" aria-label="Tutup keranjang">' + ICON.close + "</button>" +
      "</div>" +
      '<div class="drawer__body" id="drawerBody"></div>' +
      '<div class="drawer__foot" id="drawerFoot"></div>' +
      "</aside>"
    );
  }

  /* ---------- 10. BADGE & DRAWER ---------- */
  function paintBadge() {
    const b = $("#cartBadge");
    if (!b) return;
    const n = Cart.count();
    b.textContent = n;
    b.hidden = n === 0;
  }
  function bumpBadge() {
    const b = $("#cartBadge");
    if (!b) return;
    b.classList.remove("is-bump");
    void b.offsetWidth;               // paksa reflow agar animasi terulang
    b.classList.add("is-bump");
  }

  function paintModeSwitches() {
    /* Mode retail/grosir telah ditiadakan - semua halaman murni grosir */
  }

  function cartLineHTML(r) {
    const grUnit = r.size.gr || r.size.ml;
    return (
      '<div class="citem">' +
      '<div class="citem__thumb">' + renderBottle(r.product) + "</div>" +
      '<div class="citem__main">' +
      '<div class="citem__name">' + esc(r.product.name) + "</div>" +
      '<div class="citem__sub">' + grUnit + " gr &bull; " + esc(r.product.gender) + " &bull; Harga grosir</div>" +
      '<div class="citem__row">' +
      '<div class="stepper">' +
      '<button data-act="dec" data-id="' + r.product.id + '" data-ml="' + grUnit + '" aria-label="Kurangi jumlah">' + ICON.minus + "</button>" +
      "<span>" + r.item.qty + "</span>" +
      '<button data-act="inc" data-id="' + r.product.id + '" data-ml="' + grUnit + '" aria-label="Tambah jumlah">' + ICON.plus + "</button>" +
      "</div>" +
      '<div class="citem__price">' + rp(r.unit * r.item.qty) + "</div>" +
      "</div>" +
      '<div class="citem__row" style="margin-top:8px">' +
      '<button class="iconlink" data-act="del" data-id="' + r.product.id + '" data-ml="' + grUnit + '">Hapus</button>' +
      '<span class="small muted">' + gr(grUnit * r.item.qty) + "</span>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function paintDrawer() {
    const body = $("#drawerBody"), foot = $("#drawerFoot"), count = $("#drawerCount");
    if (!body) return;
    const rows = Cart.rows();
    if (count) count.textContent = Cart.count() + " item \u2022 " + gr(Cart.grams());

    if (!rows.length) {
      body.innerHTML =
        '<div class="empty"><div class="empty__ico">' + ICON.bag + "</div>" +
        '<div class="empty__title">Keranjang masih kosong</div>' +
        '<p class="empty__text">Pilih parfum favoritmu dulu. Semua harga grosir kami tampilkan transparan.</p>' +
        '<a class="btn btn--primary" href="katalog.html">Lihat Katalog</a></div>';
      foot.innerHTML = "";
      return;
    }

    body.innerHTML = rows.map(cartLineHTML).join("");

    const sub = Cart.subtotal();
    const st = grosirStatus();

    const notice =
      '<div class="gbar"><div class="gbar__label"><span>Progres minimum grosir</span>' +
      "<b>" + gr(st.total) + " / " + gr(st.min) + "</b></div>" +
      '<div class="gbar__track"><div class="gbar__fill' + (st.ok ? " is-ok" : "") + '" style="width:' + st.persen.toFixed(1) + '%"></div></div>' +
      '<div class="small muted" style="margin-top:8px">' +
      (st.ok ? "Syarat minimum grosir terpenuhi." : "Kurang " + gr(st.kurang) + " lagi untuk memenuhi minimum order grosir.") +
      "</div></div>";

    foot.innerHTML =
      notice +
      '<div style="margin-top:16px">' +
      '<div class="sumrow"><span>Total berat</span><span>' + gr(Cart.grams()) + "</span></div>" +
      '<div class="sumrow sumrow--total"><span>Total Tagihan</span><b>' + rp(sub) + "</b></div>" +
      "</div>" +
      '<a class="btn btn--primary btn--block" href="keranjang.html" style="margin-top:14px">Lihat Keranjang' + ICON.arrow.replace("<svg", '<svg class="btn__ico"') + "</a>" +
      '<p class="small muted" style="text-align:center;margin-top:12px">Checkout diteruskan ke WhatsApp admin.</p>';
  }

  function openDrawer() {
    paintDrawer();
    $("#drawer").classList.add("is-open");
    $("#overlay").classList.add("is-open");
    document.body.style.overflow = "hidden";
    setTimeout(() => { const c = $("#drawerClose"); if (c) c.focus(); }, 60);
  }
  function closeDrawer() {
    $("#drawer").classList.remove("is-open");
    $("#overlay").classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ---------- 11. PESAN WHATSAPP ---------- */
  function waLink(extra) {
    const rows = Cart.rows();
    const st = grosirStatus();
    const L = [];
    L.push("Halo " + CONFIG.brand + ", saya mau pesan grosir:");
    L.push("");
    let totalSavings = 0;
    rows.forEach((r, i) => {
      const grUnit = r.size.gr || r.size.ml;
      const normalPrice = r.size.grosir || r.unit;
      if (r.size.promoPrice != null && r.size.promoPrice < normalPrice) {
        totalSavings += (normalPrice - r.size.promoPrice) * r.item.qty;
      }
      L.push((i + 1) + ". " + r.product.name + " - " + grUnit + " gr x" + r.item.qty + " = " + rp(r.unit * r.item.qty));
    });
    L.push("");
    L.push("Tipe harga  : GROSIR");
    L.push("Total barang: " + Cart.count() + " botol (" + gr(st.total) + ")");
    if (totalSavings > 0) {
      L.push("Hemat Promo : -" + rp(totalSavings));
    }
    L.push("Subtotal    : " + rp(Cart.subtotal()));
    if (extra) { L.push(""); L.push(extra); }
    L.push("");
    L.push("Mohon info stok, ongkos kirim, dan rekening transfer. Terima kasih.");
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(L.join("\n"));
  }

  /* ---------- 12. KARTU PRODUK ---------- */
  function productCardHTML(p) {
    const inStock = p.sizes.some((s) => s.stock);
    const pool = inStock ? p.sizes.filter((s) => s.stock) : p.sizes;
    const minSize = pool.reduce((best, s) => priceOf(s, p) < priceOf(best, p) ? s : best, pool[0] || { ml: 50, grosir: 0 });
    const main = priceOf(minSize, p);
    const hasPromo = hasBadge(p, "promo") && minSize && minSize.promoPrice != null && minSize.promoPrice < minSize.grosir;
    const grs = p.sizes.map((s) => (s.gr || s.ml)).join(" / ") + " gr";
    const bList = getBadges(p);

    let ribbon = "";
    if (!inStock) ribbon = '<span class="card__ribbon card__ribbon--out">Sold out</span>';
    else if (hasBadge(p, "promo")) ribbon = '<span class="card__ribbon card__ribbon--promo">Promo</span>';
    else if (hasBadge(p, "viral")) ribbon = '<span class="card__ribbon card__ribbon--viral">Viral</span>';
    else if (hasBadge(p, "best")) ribbon = '<span class="card__ribbon card__ribbon--best">Best Seller</span>';
    else if (hasBadge(p, "new")) ribbon = '<span class="card__ribbon card__ribbon--new">Baru</span>';
    else if (hasBadge(p, "selection")) ribbon = '<span class="card__ribbon card__ribbon--selection">Selection</span>';

    const priceHTML = hasPromo ?
      '<div class="card__price-row">' +
      '<span class="card__price--strike">' + rp(minSize.grosir) + '</span>' +
      '<span class="card__price">' + rp(main) + '</span>' +
      '<span class="card__discount-tag">-' + Math.round(((minSize.grosir - minSize.promoPrice) / minSize.grosir) * 100) + '%</span>' +
      '</div>' :
      '<div class="card__price">' + rp(main) + '</div>';

    const tagChips = bList.map((b) => {
      const col = (window.COLLECTION_LIST || []).find((c) => c.key === b);
      const name = col ? col.name : b;
      return '<span class="chip' + (b === 'promo' ? ' chip--promo' : '') + '">' + esc(name) + '</span>';
    }).join("");

    return (
      '<a class="card' + (inStock ? "" : " is-out") + '" href="produk.html?id=' + encodeURIComponent(p.id) + '"' +
      ' style="--stage-a:' + p.colors[0] + '2E">' +
      ribbon +
      '<div class="card__stage"><div class="card__bottle">' + renderBottle(p) + "</div></div>" +
      '<div class="card__body">' +
      '<div class="card__brand">' + esc(p.brand) + "</div>" +
      '<h3 class="card__name">' + esc(p.name) + "</h3>" +
      '<div class="card__meta">' +
      '<span class="chip">' + esc(p.gender) + "</span>" +
      tagChips +
      '<span class="chip chip--plain chip--sizes">' + grs + "</span>" +
      "</div>" +
      '<div class="card__foot">' +
      '<div class="card__pricewrap">' +
      '<div class="card__pricelabel">Harga Grosir <span class="card__from">mulai</span></div>' +
      priceHTML +
      "</div>" +
      '<span class="status status--' + (inStock ? "in" : "out") + '">' + (inStock ? "Tersedia" : "Sold out") + "</span>" +
      "</div>" +
      "</div>" +
      "</a>"
    );
  }

  /* ---------- 13. REVEAL, NAV, AKORDEON ---------- */
  function initReveal(root) {
    const nodes = $$(".reveal:not(.is-in)", root || document);
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (!e.isIntersecting) return;
          const d = parseInt(e.target.dataset.delay || 0, 10);
          setTimeout(() => e.target.classList.add("is-in"), d);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    nodes.forEach((n) => io.observe(n));
  }

  /** Beri delay bertingkat pada anak-anak sebuah grid */
  function stagger(container, step) {
    $$(":scope > .reveal", container).forEach((el, i) => {
      el.dataset.delay = i * (step || 80);
    });
  }

  function initAccordion(root) {
    $$(".acc__btn", root || document).forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const item = btn.closest(".acc__item");
        const panel = $(".acc__panel", item);
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
      });
    });
  }

  /* ---------- 13b. CUSTOM SELECT DROPDOWN ---------- */
  function initCustomSelect(container, onChange) {
    if (!container) return null;
    if (container.dataset.initSelect) {
      if (onChange) container._onChange = onChange;
      return container._customSelectInstance || null;
    }
    container.dataset.initSelect = "1";
    if (onChange) container._onChange = onChange;

    const trigger = $(".cselect__trigger", container);
    const label = $(".cselect__label", container);
    const options = $$(".cselect__option", container);
    const nativeSel = $("select", container);

    function close() {
      container.classList.remove("is-open");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }

    function open() {
      $$(".cselect.is-open").forEach((el) => {
        if (el !== container) {
          el.classList.remove("is-open");
          const t = $(".cselect__trigger", el);
          if (t) t.setAttribute("aria-expanded", "false");
        }
      });
      container.classList.add("is-open");
      if (trigger) trigger.setAttribute("aria-expanded", "true");
      const activeOpt = $(".cselect__option.is-selected", container) || options[0];
      if (activeOpt) activeOpt.focus();
    }

    function toggle() {
      if (container.classList.contains("is-open")) close();
      else open();
    }

    function setValue(val, silent) {
      let selectedText = "";
      options.forEach((opt) => {
        const isMatch = opt.dataset.value === val;
        opt.classList.toggle("is-selected", isMatch);
        opt.setAttribute("aria-selected", isMatch ? "true" : "false");
        if (isMatch) {
          const span = opt.querySelector("span");
          selectedText = span ? span.textContent : opt.textContent.trim();
        }
      });
      if (selectedText && label) {
        label.textContent = selectedText;
      }
      if (nativeSel && nativeSel.value !== val) {
        nativeSel.value = val;
        if (!silent) nativeSel.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const cb = container._onChange || onChange;
      if (!silent && typeof cb === "function") {
        cb(val);
      }
    }

    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      });

      trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === " " || e.key === "Enter") {
          e.preventDefault();
          open();
        } else if (e.key === "Escape") {
          close();
        }
      });
    }

    options.forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const val = opt.dataset.value;
        setValue(val);
        close();
        if (trigger) trigger.focus();
      });

      opt.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const val = opt.dataset.value;
          setValue(val);
          close();
          if (trigger) trigger.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = opt.nextElementSibling || options[0];
          if (next) next.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = opt.previousElementSibling || options[options.length - 1];
          if (prev) prev.focus();
        } else if (e.key === "Escape") {
          e.preventDefault();
          close();
          if (trigger) trigger.focus();
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && container.classList.contains("is-open")) {
        close();
        if (trigger) trigger.focus();
      }
    });

    const inst = {
      getValue() {
        const sel = $(".cselect__option.is-selected", container);
        return sel ? sel.dataset.value : (nativeSel ? nativeSel.value : "");
      },
      setValue: setValue,
      close: close,
      open: open
    };
    container._customSelectInstance = inst;
    return inst;
  }

  /* ---------- 14. EKSPOR KE GLOBAL ---------- */
  window.AR = {
    $: $, $$: $$, rp: rp, gr: gr, esc: esc, param: param, shade: shade, hash: hash,
    Store: Store, K: K, ICON: ICON,
    products: products, findProduct: findProduct, getOverride: getOverride, saveOverride: saveOverride,
    getBadges: getBadges, hasBadge: hasBadge,
    getMode: getMode, setMode: setMode, priceOf: priceOf,
    Cart: Cart, grosirStatus: grosirStatus, waLink: waLink,
    renderBottle: renderBottle, productCardHTML: productCardHTML,
    toast: toast, initReveal: initReveal, stagger: stagger, initAccordion: initAccordion,
    initCustomSelect: initCustomSelect,
    paintBadge: paintBadge, openDrawer: openDrawer, closeDrawer: closeDrawer, paintDrawer: paintDrawer,
    navHTML: navHTML, footerHTML: footerHTML, drawerHTML: drawerHTML, paintModeSwitches: paintModeSwitches
  };
  window.renderBottle = renderBottle; // sesuai permintaan: fungsi global

  /* ---------- 15. BOOT KERANGKA ---------- */
  function boot() {
    const page = document.body.dataset.page || "";

    const head = $("#siteHeader");
    if (head) head.innerHTML = navHTML(page);
    const foot = $("#siteFooter");
    if (foot) foot.innerHTML = footerHTML();
    if (!$("#drawer")) {
      const d = document.createElement("div");
      d.innerHTML = drawerHTML();
      while (d.firstChild) document.body.appendChild(d.firstChild);
    }

    paintBadge();
    paintModeSwitches();

    // navbar sticky shadow
    const nav = $("#siteNav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // menu mobile
    const burger = $("#burger"), menu = $("#navMenu");
    if (burger && menu) {
      burger.addEventListener("click", () => {
        const open = menu.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    // keranjang
    const cartBtn = $("#cartBtn");
    if (cartBtn) cartBtn.addEventListener("click", openDrawer);
    const dc = $("#drawerClose"); if (dc) dc.addEventListener("click", closeDrawer);
    const ov = $("#overlay"); if (ov) ov.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeDrawer(); const f = $(".filters"); if (f) f.classList.remove("is-open"); }
    });

    // aksi di dalam drawer
    const dbody = $("#drawerBody");
    if (dbody) {
      dbody.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const id = btn.dataset.id, ml = Number(btn.dataset.ml);
        const cur = Cart.all().find((i) => i.id === id && i.ml === ml);
        if (!cur) return;
        if (btn.dataset.act === "inc") Cart.setQty(id, ml, cur.qty + 1);
        if (btn.dataset.act === "dec") Cart.setQty(id, ml, cur.qty - 1);
        if (btn.dataset.act === "del") { Cart.remove(id, ml); toast("Item dihapus", "info"); }
      });
    }

    document.addEventListener("arunika:cart", () => { paintBadge(); paintDrawer(); });

    if (window.PAGES && typeof window.PAGES[page] === "function") window.PAGES[page]();

    initReveal();
    initAccordion();
    $$(".cselect").forEach((el) => initCustomSelect(el));
  }

  // setTimeout memastikan BAGIAN 2 (window.PAGES) sudah terdaftar sebelum boot
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 0);
})();

/* ===========================================================
   BAGIAN 2: Controller per halaman
   Dipanggil otomatis lewat <body data-page="...">
   =========================================================== */
(function () {
  "use strict";
  const CONFIG = window.CONFIG;
  const A = window.AR;
  const $ = A.$, $$ = A.$$, rp = A.rp, gr = A.gr, esc = A.esc, ICON = A.ICON, getBadges = A.getBadges, hasBadge = A.hasBadge;

  const PAGES = {};
  window.PAGES = PAGES;

  /* ============ BERANDA ============ */
  PAGES.beranda = function () {
    const list = A.products();

    /* Hero: 3 botol dengan warna berbeda */
    const heroPicks = ["melati-senja", "sahara-oud", "laut-pagi"]
      .map((id) => A.findProduct(id))
      .filter(Boolean);
    const slots = [$("#heroB"), $("#heroA"), $("#heroC")];
    heroPicks.forEach((p, i) => { if (slots[i]) slots[i].innerHTML = A.renderBottle(p); });

    /* Kategori (5 Koleksi Utama) */
    const catWrap = $("#catGrid");
    if (catWrap) {
      const collections = [
        {
          key: "viral",
          name: "Viral",
          tagline: "Tren TikTok & Reseller",
          notes: "Espresso, Salted Caramel & Sea Salt",
          desc: "Aroma manis gurih dan kesegaran laut yang paling ramai dibicarakan saat ini.",
          tint: "#F5EEFD",
          pick: "kopi-karamel"
        },
        {
          key: "new",
          name: "New Arrival",
          tagline: "Rilisan Formula 2025",
          notes: "White Peach, Lychee & Madagascar Vanilla",
          desc: "Racikan formula parfum terbaru yang baru saja mendarat dari distributor resmi.",
          tint: "#FEF7E6",
          pick: "peach-ceria"
        },
        {
          key: "best",
          name: "Best Seller",
          tagline: "Repeat Order Tertinggi",
          notes: "Safron, Taif Rose, Smoky Oud & Melati",
          desc: "Aroma klasik favorit pelanggan dengan tingkat repeat order tertinggi setiap bulan.",
          tint: "#FFF8F0",
          pick: "sahara-oud"
        },
        {
          key: "selection",
          name: "Selection",
          tagline: "Signature Konsentrat Mewah",
          notes: "Amber Resin, Cardamom & Mysore Sandalwood",
          desc: "Koleksi khusus dengan aroma oriental dan kayu kering tahan lama berkarakter elegan.",
          tint: "#F1F5F9",
          pick: "amber-rindu"
        },
        {
          key: "promo",
          name: "Promo",
          tagline: "Penawaran Margin Maksimal",
          notes: "Grapefruit, Damask Rose & White Musk",
          desc: "Varian bibit parfum berkualitas dengan harga promo grosir terbaik untuk modal awal.",
          tint: "#FDF2F2",
          pick: "jeruk-bali"
        }
      ];

      catWrap.innerHTML = collections.map((col, i) => {
        const n = list.filter((p) => p.badge === col.key).length;
        const p = A.findProduct(col.pick) || list[0];
        return (
          '<a class="cat reveal" data-delay="' + i * 80 + '" href="katalog.html?collection=' + encodeURIComponent(col.key) + '"' +
          ' style="--c1:' + col.tint + '">' +
          '<div class="cat__top">' +
          '<div class="flexrow" style="justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '<span class="cat__idx">0' + (i + 1) + '</span>' +
          '<span class="cat__tagline">' + esc(col.tagline) + '</span>' +
          '</div>' +
          '<h3 class="cat__name">' + esc(col.name) + '</h3>' +
          '<p class="cat__desc">' + esc(col.desc) + '</p>' +
          '<div class="cat__notes">Nota: ' + esc(col.notes) + '</div>' +
          '</div>' +
          '<span class="cat__count">' + n + ' varian ' + ICON.arrow + '</span>' +
          '<div class="cat__bottle">' + A.renderBottle(p) + '</div>' +
          '</a>'
        );
      }).join("");
    }
  };

  /* ============ KATALOG ============ */
  PAGES.katalog = function () {
    const state = {
      q: "",
      collection: new Set(),
      gender: new Set(),
      stockOnly: false,
      sort: "rekomendasi"
    };
    const pCol = A.param("collection"); if (pCol) state.collection.add(pCol);
    const pg = A.param("gender"); if (pg) state.gender.add(pg);
    if (A.param("promo")) state.collection.add("promo");

    const all = A.products();
    const countBy = (key, val) => all.filter((p) => p[key] === val).length;
    const countByCollection = (badgeKey) => all.filter((p) => hasBadge(p, badgeKey)).length;

    const optHTML = (group, val, n, label) =>
      '<label class="fopt"><input type="checkbox" data-group="' + group + '" value="' + esc(val) + '"' +
      (state[group].has(val) ? " checked" : "") + ">" +
      '<span class="fbox">' + ICON.check + "</span>" +
      '<span class="fopt__txt">' + esc(label || val) + '</span><span class="fopt__n">' + n + "</span></label>";

    const sideEl = $("#filters");
    sideEl.innerHTML =
      '<div class="filters__head"><span class="filters__ttl">Filter</span>' +
      '<button class="closebtn filters__close" id="fClose" aria-label="Tutup filter">' + ICON.close + "</button></div>" +
      '<div class="fgroup"><div class="fgroup__h">Cari</div>' +
      '<div class="searchbox">' + ICON.search +
      '<input class="input" id="fSearch" type="search" placeholder="Cari nama atau brand..." aria-label="Cari parfum"></div></div>' +
      '<div class="fgroup"><div class="fgroup__h">Koleksi Pilihan</div>' +
      (window.COLLECTION_LIST || []).map((c) => optHTML("collection", c.key, countByCollection(c.key), c.name)).join("") + "</div>" +
      '<div class="fgroup"><div class="fgroup__h">Untuk</div>' +
      (window.GENDER_LIST || []).map((g) => optHTML("gender", g, countBy("gender", g))).join("") + "</div>" +
      '<div class="fgroup"><div class="fgroup__h">Ketersediaan</div>' +
      '<label class="fopt"><input type="checkbox" id="fStock"><span class="fbox">' + ICON.check + "</span>" +
      '<span class="fopt__txt">Sembunyikan yang sold out</span></label></div>' +
      '<button class="btn btn--ghost btn--sm btn--block" id="fReset">Atur Ulang Filter</button>';

    const grid = $("#grid");
    const info = $("#resultCount");
    const tags = $("#activeFilters");

    function filtered() {
      const q = state.q.trim().toLowerCase();
      let out = all.filter((p) => {
        if (state.collection.size && !Array.from(state.collection).some((c) => hasBadge(p, c))) return false;
        if (state.gender.size && !state.gender.has(p.gender)) return false;
        if (state.stockOnly && !p.sizes.some((s) => s.stock)) return false;
        if (q) {
          const hay = (p.name + " " + p.brand + " " + p.gender + " " + p.desc).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      const low = (p) => Math.min.apply(null, p.sizes.map((s) => A.priceOf(s, p)));
      if (state.sort === "murah") out.sort((a, b) => low(a) - low(b));
      else if (state.sort === "mahal") out.sort((a, b) => low(b) - low(a));
      else if (state.sort === "nama") out.sort((a, b) => a.name.localeCompare(b.name, "id"));
      else out.sort((a, b) => ((hasBadge(a, "promo") || hasBadge(a, "best") || hasBadge(a, "viral")) ? -1 : 0) - ((hasBadge(b, "promo") || hasBadge(b, "best") || hasBadge(b, "viral")) ? -1 : 0));
      return out;
    }

    const colMap = (window.COLLECTION_LIST || []).reduce((acc, c) => { acc[c.key] = c.name; return acc; }, {});

    function paintTags() {
      const chips = [];
      state.collection.forEach((v) => chips.push({ g: "collection", v: colMap[v] || v, raw: v }));
      state.gender.forEach((v) => chips.push({ g: "gender", v: v, raw: v }));
      if (state.stockOnly) chips.push({ g: "stock", v: "Hanya tersedia" });
      if (state.q.trim()) chips.push({ g: "q", v: '"' + state.q.trim() + '"' });

      tags.innerHTML = chips.map((c) =>
        '<span class="tagx">' + esc(c.v) +
        '<button data-g="' + c.g + '" data-v="' + esc(c.raw || c.v) + '" aria-label="Hapus filter ' + esc(c.v) + '">' + ICON.close + "</button></span>"
      ).join("");
      tags.style.display = chips.length ? "flex" : "none";
    }

    function paint() {
      const rows = filtered();
      info.innerHTML = "<b>" + rows.length + "</b> dari " + all.length + " parfum";
      paintTags();

      if (!rows.length) {
        grid.innerHTML =
          '<div class="empty" style="grid-column:1/-1"><div class="empty__ico">' + ICON.search + "</div>" +
          '<div class="empty__title">Tidak ada yang cocok</div>' +
          '<p class="empty__text">Coba kurangi filter atau ubah kata kunci pencarianmu.</p>' +
          '<button class="btn btn--ghost" id="emptyReset">Atur Ulang Filter</button></div>';
        const er = $("#emptyReset");
        if (er) er.addEventListener("click", resetAll);
        return;
      }
      grid.innerHTML = rows.map((p) => A.productCardHTML(p)).join("");
    }

    function resetAll() {
      state.q = ""; state.collection.clear(); state.gender.clear(); state.stockOnly = false;
      $$("#filters input[type=checkbox]").forEach((c) => (c.checked = false));
      const s = $("#fSearch"); if (s) s.value = "";
      const s2 = $("#mSearch"); if (s2) s2.value = "";
      paint();
    }

    sideEl.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset && t.dataset.group) {
        const set = state[t.dataset.group];
        t.checked ? set.add(t.value) : set.delete(t.value);
        paint();
      }
      if (t.id === "fStock") { state.stockOnly = t.checked; paint(); }
    });
    sideEl.addEventListener("input", (e) => {
      if (e.target.id === "fSearch") { state.q = e.target.value; paint(); }
    });
    $("#fReset").addEventListener("click", resetAll);

    tags.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-g]");
      if (!b) return;
      const g = b.dataset.g;
      if (g === "stock") { state.stockOnly = false; const c = $("#fStock"); if (c) c.checked = false; }
      else if (g === "q") { state.q = ""; const s = $("#fSearch"); if (s) s.value = ""; const m = $("#mSearch"); if (m) m.value = ""; }
      else {
        state[g].delete(b.dataset.v);
        const box = $('#filters input[data-group="' + g + '"][value="' + b.dataset.v + '"]');
        if (box) box.checked = false;
      }
      paint();
    });

    const sortDropdown = $("#sortDropdown");
    const sortSel = $("#sortBy");
    if (sortDropdown) {
      A.initCustomSelect(sortDropdown, (val) => {
        state.sort = val;
        paint();
      });
    } else if (sortSel) {
      sortSel.addEventListener("change", () => { state.sort = sortSel.value; paint(); });
    }

    // filter versi mobile
    const fOpen = $("#fOpen");
    if (fOpen) fOpen.addEventListener("click", () => sideEl.classList.add("is-open"));
    sideEl.addEventListener("click", (e) => {
      if (e.target.closest("#fClose")) sideEl.classList.remove("is-open");
    });
    const mSearch = $("#mSearch");
    if (mSearch) mSearch.addEventListener("input", () => {
      state.q = mSearch.value;
      const s = $("#fSearch"); if (s) s.value = mSearch.value;
      paint();
    });

    document.addEventListener("arunika:mode", paint);
    paint();
  };

  /* ============ OLFACTORY ACCORDS (FRAGRANTICA STYLE) ============ */
  function autoAccords(p) {
    if (p.accords && p.accords.length) return p.accords;
    const txt = ((p.notes ? [p.notes.top, p.notes.middle, p.notes.base].join(" ") : "") + " " + (p.desc || "")).toLowerCase();
    const rules = [
      { key: "woody", kw: ["oud", "kayu", "cendana", "cedarwood", "driftwood", "woody"], score: 95 },
      { key: "citrus", kw: ["jeruk", "bergamot", "pomelo", "grapefruit", "lemon", "lime", "citrus"], score: 85 },
      { key: "floral", kw: ["mawar", "melati", "bunga", "neroli", "freesia", "peony", "floral", "rose"], score: 80 },
      { key: "sweet", kw: ["karamel", "vanila", "tonka", "hazelnut", "manis", "sweet"], score: 75 },
      { key: "fresh spicy", kw: ["lada", "kapulaga", "kayu manis", "pala", "spicy", "mint"], score: 70 },
      { key: "aquatic", kw: ["laut", "garam", "air", "aquatic", "fresh"], score: 70 },
      { key: "earthy", kw: ["petrichor", "tanah", "vetiver", "hujan", "mossy"], score: 65 },
      { key: "amber", kw: ["amber", "labdanum", "benzoin", "resin"], score: 65 },
      { key: "musky", kw: ["musk", "cashmeran", "putih"], score: 60 }
    ];
    const found = [];
    rules.forEach((r) => {
      if (r.kw.some((w) => txt.includes(w))) found.push({ name: r.key, score: r.score });
    });
    if (!found.length) {
      found.push({ name: "woody", score: 90 }, { name: "aromatic", score: 75 }, { name: "musky", score: 60 });
    }
    return found.slice(0, 6);
  }

  function renderMainAccords(p) {
    const list = autoAccords(p);
    if (!list || !list.length) return "";
    const maxScore = Math.max.apply(null, list.map((a) => a.score || 0)) || 100;
    const rows = list.map((a) => {
      const key = a.name.toLowerCase().trim();
      const cfg = (window.ACCORD_COLORS && window.ACCORD_COLORS[key]) || { bg: "#7D4B2A", color: "#FFFFFF" };
      const pct = Math.max(34, Math.min(100, Math.round(((a.score || 0) / maxScore) * 100)));
      return (
        '<div class="accord-row">' +
        '<div class="accord-bar" style="width:' + pct + '%;background:' + cfg.bg + ';color:' + cfg.color + '">' +
        '<span class="accord-name">' + esc(a.name) + '</span>' +
        '</div>' +
        '</div>'
      );
    }).join("");

    return (
      '<div class="pdp__accords">' +
      '<div class="pdp__accords-head">' +
      '<span class="pdp__accords-title">Main Accords</span>' +
      '</div>' +
      '<div class="accord-bars">' + rows + '</div>' +
      '</div>'
    );
  }

  /* ============ PRODUK DETAIL ============ */
  PAGES.produk = function () {
    const id = A.param("id");
    const p = id ? A.findProduct(id) : null;
    const root = $("#pdpRoot");

    if (!p) {
      root.innerHTML =
        '<div class="empty" style="padding:96px 24px"><div class="empty__ico">' + ICON.search + "</div>" +
        '<div class="empty__title">Produk tidak ditemukan</div>' +
        '<p class="empty__text">Tautan mungkin salah atau produk sudah tidak dijual.</p>' +
        '<a class="btn btn--primary" href="katalog.html">Kembali ke Katalog</a></div>';
      return;
    }
    document.title = p.name + " - " + CONFIG.brand + " " + CONFIG.brandSuffix;

    let curMl = (p.sizes.find((s) => s.stock) || p.sizes[0] || { ml: 50 }).ml;
    let qty = 1;

    function curSize() {
      return p.sizes.find((s) => s.ml === curMl) || p.sizes[0];
    }

    function sizesHTML() {
      return p.sizes.map((s) => {
        const sel = s.ml === curMl;
        const oos = !s.stock;
        const grLabel = (s.gr || s.ml) + " gr";
        return (
          '<button class="sizebtn' + (sel ? " is-active" : "") + (oos ? " is-oos" : "") + '"' +
          ' data-ml="' + s.ml + '"' + (oos ? " disabled" : "") + ">" +
          '<span class="sizebtn__ml">' + grLabel + "</span>" +
          '<span class="sizebtn__pr">' + rp(A.priceOf(s, p)) + "</span>" +
          (oos ? '<span class="sizebtn__tag">Habis</span>' : "") +
          "</button>"
        );
      }).join("");
    }

    function priceboxHTML() {
      const s = curSize();
      const pr = A.priceOf(s, p);
      const oos = !s.stock;
      const st = A.grosirStatus();
      const hasPromo = hasBadge(p, "promo") && s && s.promoPrice != null && s.promoPrice < s.grosir;

      const priceDisplay = hasPromo ?
        '<div class="pricebox__row">' +
        '<span class="pricebox__val--strike">' + rp(s.grosir) + '</span>' +
        '<span class="pricebox__val">' + rp(pr) + '</span>' +
        '<span class="pricebox__discount-tag">Hemat ' + Math.round(((s.grosir - s.promoPrice) / s.grosir) * 100) + '%</span>' +
        '</div>' :
        '<div class="pricebox__val">' + rp(pr) + '</div>';

      return (
        '<div class="pricebox__top">' +
        '<div class="pricebox__label">Harga Grosir <b>' + (s.gr || s.ml) + ' gr</b></div>' +
        priceDisplay +
        "</div>" +
        '<div class="pricebox__cta">' +
        '<div class="stepper">' +
        '<button id="qDec" aria-label="Kurangi jumlah">' + ICON.minus + "</button>" +
        '<span id="qVal">' + qty + "</span>" +
        '<button id="qInc" aria-label="Tambah jumlah">' + ICON.plus + "</button>" +
        "</div>" +
        '<button class="btn btn--primary" id="addBtn"' + (oos ? " disabled" : "") + ">" +
        ICON.bag.replace("<svg", '<svg class="btn__ico"') +
        (oos ? "Stok Habis" : "Tambah ke Keranjang") +
        "</button>" +
        "</div>" +
        '<a class="btn btn--wa btn--block" id="waBtn" href="#" target="_blank" rel="noopener">' +
        ICON.wa.replace("<svg", '<svg class="btn__ico"') + "Tanya Admin</a>" +
        '<div class="pricebox__note">' + ICON.info +
        "<span>Harga grosir langsung. Akumulasi total belanja minimal <b>" + gr(st.min) + "</b>" +
        (st.pernah ? " (pembelian lanjutan)" : " untuk pembelian pertama") +
        ". Saat ini keranjangmu <b>" + gr(st.total) + "</b>.</span>" +
        "</div>"
      );
    }

    const badges = getBadges(p);
    const primaryBadge = badges[0] || "";
    const colObj = (window.COLLECTION_LIST || []).find((c) => c.key === primaryBadge) || { name: "Katalog Grosir", key: "" };

    root.innerHTML =
      '<div class="wrap">' +
      '<div class="pdp__topbar">' +
      '<a class="pdp__back" href="katalog.html">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>' +
      "<span>Kembali ke Katalog</span>" +
      "</a>" +
      '<div class="pdp__topbar-cat">' +
      (colObj.key ? '<a href="katalog.html?collection=' + encodeURIComponent(colObj.key) + '">Koleksi: ' + esc(colObj.name) + '</a>' : '<span>Koleksi Grosir</span>') +
      "</div>" +
      "</div>" +
      '<div class="pdp">' +
      '<div class="pdp__visual reveal" style="--stage-a:' + p.colors[0] + '38">' +
      '<div class="pdp__stage"><div class="pdp__bottle float">' + A.renderBottle(p) + "</div></div>" +
      '<div class="pdp__swatches"><span>Warna cairan</span>' +
      '<span class="swatch" style="background:' + p.colors[0] + '"></span>' +
      '<span class="swatch" style="background:' + p.colors[1] + '"></span>' +
      '<span class="spacer"></span><span>Botol kaca bening</span>' +
      "</div>" +
      renderMainAccords(p) +
      "</div>" +
      '<div class="pdp__info reveal" data-delay="90">' +
      '<div class="pdp__brand">' + esc(p.brand) + "</div>" +
      '<h1 class="pdp__title">' + esc(p.name) + "</h1>" +
      '<div class="pdp__meta">' +
      '<span class="chip">' + esc(p.gender) + "</span>" +
      badges.map((b) => {
        const col = (window.COLLECTION_LIST || []).find((c) => c.key === b);
        const name = col ? col.name : b;
        return '<span class="chip' + (b === 'promo' ? ' chip--promo' : '') + '">' + esc(name) + '</span>';
      }).join("") +
      "</div>" +
      '<p class="pdp__desc">' + esc(p.desc) + "</p>" +

      '<div class="pdp__block"><div class="pdp__blockh"><span>Pilih ukuran</span></div>' +
      '<div class="sizes" id="sizes">' + sizesHTML() + "</div>" +
      '<div class="pricebox" id="pricebox">' + priceboxHTML() + "</div>" +
      "</div>" +

      '<div class="pdp__block"><div class="pdp__blockh"><span>Piramida aroma</span></div>' +
      '<div class="notes">' +
      '<div class="note"><div class="note__k"><i></i>Top Notes</div><div class="note__v">' + esc(p.notes.top) + "</div></div>" +
      '<div class="note"><div class="note__k"><i></i>Middle Notes</div><div class="note__v">' + esc(p.notes.middle) + "</div></div>" +
      '<div class="note"><div class="note__k"><i></i>Base Notes</div><div class="note__v">' + esc(p.notes.base) + "</div></div>" +
      "</div>" +
      "</div>" +

      '<div class="pdp__block"><div class="pdp__blockh"><span>Informasi belanja</span></div>' +
      '<div class="acc">' +
      accItem("Aturan harga grosir",
        "Belanja grosir <b>pertama</b> minimal <b>1 kg (1.000 gr)</b> total akumulasi semua item. Pembelian <b>berikutnya</b> cukup minimal <b>100 gr</b>. " +
        "Harga grosir kami tampilkan terbuka di setiap produk - tanpa perlu nego.", true) +
      accItem("Pembayaran & checkout",
        "Belum tersedia payment gateway. Tombol checkout akan membuka <b>WhatsApp</b> berisi rincian pesananmu. " +
        "Pembayaran lewat <b>transfer bank</b>, dan detail rekening dikirim admin lewat WhatsApp setelah pesanan dikonfirmasi.") +
      accItem("Pengiriman & ambil di toko",
        "Kami kirim ke <b>" + esc(CONFIG.jangkauan) + "</b>. Kamu juga bisa ambil sendiri di gerai " +
        esc((CONFIG.toko || []).map((t) => t.kota).join(" dan ")) + ".") +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<section class="related"><div class="wrap">' +
      '<div class="sec-head"><div class="sec-head__text">' +
      '<div class="eyebrow"><span class="eyebrow__num">Rekomendasi</span></div>' +
      '<h2 class="sec-title">Koleksi parfum ' + esc(p.gender) + " lainnya</h2>" +
      '</div><a class="sec-head__link" href="katalog.html?gender=' + encodeURIComponent(p.gender) + '">Lihat semua</a></div>' +
      '<div class="grid-4" id="relGrid"></div>' +
      "</div></section>";

    function accItem(title, body, open) {
      return (
        '<div class="acc__item' + (open ? " is-open" : "") + '">' +
        '<button class="acc__btn" aria-expanded="' + (open ? "true" : "false") + '">' + esc(title) + ICON.chev + "</button>" +
        '<div class="acc__panel"' + (open ? ' style="max-height:400px"' : "") + '><div class="acc__inner">' + body + "</div></div>" +
        "</div>"
      );
    }

    function relGrid() {
      const rel = A.products().filter((x) => x.id !== p.id && (x.gender === p.gender || badges.some((b) => hasBadge(x, b)))).slice(0, 4);
      $("#relGrid").innerHTML = rel.map((x) => A.productCardHTML(x)).join("");
    }
    relGrid();

    function repaint() {
      $("#sizes").innerHTML = sizesHTML();
      $("#pricebox").innerHTML = priceboxHTML();
      bindPrice();
    }

    function bindPrice() {
      const wa = $("#waBtn");
      const s = curSize();
      const grUnit = s.gr || s.ml;
      if (wa) {
        const txt = "Halo " + CONFIG.brand + ", saya mau tanya " + p.name + " ukuran " + grUnit + " gr (harga grosir).";
        wa.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(txt);
      }
      const inc = $("#qInc"), dec = $("#qDec"), val = $("#qVal");
      if (inc) inc.addEventListener("click", () => { qty = Math.min(99, qty + 1); val.textContent = qty; });
      if (dec) dec.addEventListener("click", () => { qty = Math.max(1, qty - 1); val.textContent = qty; });
      const add = $("#addBtn");
      if (add) add.addEventListener("click", () => {
        A.Cart.add(p.id, s.ml, qty);
        A.toast(p.name + " (" + grUnit + " gr) ditambahkan", "ok");
        A.openDrawer();
        qty = 1;
        $("#pricebox").innerHTML = priceboxHTML();
        bindPrice();
      });
    }

    $("#sizes").addEventListener("click", (e) => {
      const b = e.target.closest(".sizebtn, .size");
      if (!b || b.disabled) return;
      curMl = Number(b.dataset.ml);
      repaint();
    });

    document.addEventListener("arunika:mode", () => { repaint(); relGrid(); });
    document.addEventListener("arunika:cart", () => {
      $("#pricebox").innerHTML = priceboxHTML();
      bindPrice();
    });

    bindPrice();
    A.initAccordion(root);
  };

  /* ============ KERANJANG ============ */
  PAGES.keranjang = function () {
    const root = $("#cartRoot");

    function paint() {
      const rows = A.Cart.rows();
      const mode = A.getMode();
      const st = A.grosirStatus();

      if (!rows.length) {
        root.innerHTML =
          '<div class="wrap"><div class="panel" style="margin:40px 0 88px">' +
          '<div class="empty" style="padding:80px 24px"><div class="empty__ico">' + ICON.bag + "</div>" +
          '<div class="empty__title">Keranjangmu masih kosong</div>' +
          '<p class="empty__text">Belum ada parfum yang dipilih. Yuk mulai dari best seller kami.</p>' +
          '<div class="flexrow" style="justify-content:center">' +
          '<a class="btn btn--primary" href="katalog.html">Jelajahi Katalog</a>' +
          '<a class="btn btn--ghost" href="katalog.html?collection=best">Lihat Best Seller</a>' +
          "</div></div>" +
          "</div></div>";
        return;
      }

      const sub = A.Cart.subtotal();
      const blocked = !st.ok;

      let notice;
      if (st.ok) {
        notice =
          '<div class="callout callout--ok">' + ICON.check +
          "<span>Syarat minimum grosir <b>terpenuhi</b> (" + gr(st.total) + " dari minimum " + gr(st.min) +
          "). Pesanan siap diteruskan ke WhatsApp!</span></div>";
      } else {
        notice =
          '<div class="callout callout--warn">' + ICON.info +
          "<span>Kurang <b>" + gr(st.kurang) + "</b> lagi untuk memenuhi minimum grosir " +
          (st.pernah ? "pembelian lanjutan" : "pembelian pertama") + " sebesar <b>" + gr(st.min) +
          "</b>. Silakan tambah item ke keranjang.</span></div>";
      }

      root.innerHTML =
        '<div class="wrap"><div class="cartpage">' +
        "<div>" +
        "<div class=\"panel\">" +
        '<div class="panel__head">' +
        '<div><div class="panel__title">Keranjang Grosir</div>' +
        '<div class="small muted">' + A.Cart.count() + " item - total berat " + gr(st.total) + "</div></div>" +
        "</div>" +
        '<div class="panel__body" id="cartLines">' + rows.map(cartLine).join("") + "</div>" +
        '<div class="panel__foot flexrow" style="justify-content:space-between">' +
        '<a class="linkarrow" href="katalog.html">Lanjut belanja</a>' +
        '<button class="iconlink" id="clearCart">Kosongkan keranjang</button>' +
        "</div>" +
        "</div>" +

        '<div class="mt-24">' + notice + "</div>" +

        '<div class="panel mt-24"><div class="panel__head"><div class="panel__title">Cara pesan</div></div>' +
        '<div class="panel__body" style="padding:20px 22px 24px"><div class="steps">' +
        step(1, "Kirim keranjang ke WhatsApp", "Tombol checkout membuka WhatsApp berisi rincian pesananmu secara otomatis.") +
        step(2, "Admin konfirmasi & hitung ongkir", "Admin cek stok, hitung ongkir, lalu mengirim nomor rekening.") +
        step(3, "Transfer bank", "Bayar lewat transfer ke rekening " + esc((CONFIG.bank || []).map((b) => b.nama).join(" / ")) + ", lalu kirim bukti transfer.") +
        step(4, "Dikirim atau ambil di toko", "Pesanan dikirim ke " + esc(CONFIG.jangkauan) + ", atau ambil di gerai " + esc((CONFIG.toko || []).map((t) => t.kota).join(" / ")) + ".") +
        "</div></div>" +
        "</div>" +
        "</div>" +

        '<aside class="panel summary">' +
        '<div class="panel__head"><div class="panel__title">Ringkasan</div>' +
        '<span class="pill pill--new">Harga Grosir</span></div>' +
        '<div class="summary__body">' +
        '<div class="gbar mb-24"><div class="gbar__label"><span>Minimum grosir</span><b>' +
        gr(st.total) + " / " + gr(st.min) + "</b></div>" +
        '<div class="gbar__track"><div class="gbar__fill' + (st.ok ? " is-ok" : "") +
        '" style="width:' + st.persen.toFixed(1) + '%"></div></div></div>' +
        '<div class="sumrow"><span>Jumlah item</span><span>' + A.Cart.count() + " botol</span></div>" +
        '<div class="sumrow"><span>Total berat</span><span>' + gr(st.total) + "</span></div>" +
        '<div class="sumrow"><span>Ongkos kirim</span><span>Dihitung admin</span></div>' +
        '<div class="sumrow sumrow--total"><span>Total Tagihan</span><b>' + rp(sub) + "</b></div>" +
        '<a class="btn btn--wa btn--block mt-16" id="coBtn" href="#" target="_blank" rel="noopener"' +
        (blocked ? ' aria-disabled="true"' : "") + ">" +
        ICON.wa.replace("<svg", '<svg class="btn__ico"') +
        (blocked ? "Minimum grosir belum tercapai" : "Checkout via WhatsApp") + "</a>" +
        '<p class="small muted" style="text-align:center;margin-top:12px">Tanpa payment gateway. Pembayaran transfer bank, rekening dikirim admin lewat WhatsApp.</p>' +
        "</div>" +
        "</aside>" +
        "</div></div>";

      const co = $("#coBtn");
      if (co && !blocked) co.href = A.waLink("Catatan: harap konfirmasi ketersediaan stok.");
      if (co && blocked) co.addEventListener("click", (e) => {
        e.preventDefault();
        A.toast("Kurang " + gr(st.kurang) + " untuk grosir", "warn");
      });

      $("#clearCart").addEventListener("click", () => {
        if (confirm("Kosongkan seluruh keranjang?")) {
          A.Cart.clear();
          A.toast("Keranjang dikosongkan", "info");
        }
      });

      $("#cartLines").addEventListener("click", (e) => {
        const b = e.target.closest("[data-act]");
        if (!b) return;
        const id = b.dataset.id, ml = Number(b.dataset.ml);
        const cur = A.Cart.all().find((i) => i.id === id && i.ml === ml);
        if (!cur) return;
        if (b.dataset.act === "inc") A.Cart.setQty(id, ml, cur.qty + 1);
        if (b.dataset.act === "dec") A.Cart.setQty(id, ml, cur.qty - 1);
        if (b.dataset.act === "del") { A.Cart.remove(id, ml); A.toast("Item dihapus", "info"); }
      });
    }

    function step(n, t, d) {
      return '<div class="step"><span class="step__n">' + n + "</span><div><b>" + esc(t) + "</b>" + d + "</div></div>";
    }

    function cartLine(r) {
      const grUnit = r.size.gr || r.size.ml;
      return (
        '<div class="citem">' +
        '<div class="citem__thumb" style="width:74px;height:92px">' + A.renderBottle(r.product) + "</div>" +
        '<div class="citem__main">' +
        '<div class="flexrow" style="justify-content:space-between;align-items:flex-start">' +
        "<div>" +
        '<a class="citem__name" href="produk.html?id=' + encodeURIComponent(r.product.id) + '">' + esc(r.product.name) + "</a>" +
        '<div class="citem__sub">' + esc(r.product.brand) + " • " + grUnit + " gr • " + esc(r.product.gender) + "</div>" +
        "</div>" +
        '<span class="status status--in">Tersedia</span>' +
        "</div>" +
        '<div class="citem__row">' +
        '<div class="stepper">' +
        '<button data-act="dec" data-id="' + r.product.id + '" data-ml="' + grUnit + '" aria-label="Kurangi">' + ICON.minus + "</button>" +
        "<span>" + r.item.qty + "</span>" +
        '<button data-act="inc" data-id="' + r.product.id + '" data-ml="' + grUnit + '" aria-label="Tambah">' + ICON.plus + "</button>" +
        "</div>" +
        '<div class="citem__price">' + rp(r.unit * r.item.qty) + "</div>" +
        "</div>" +
        '<div class="citem__row" style="margin-top:8px">' +
        '<button class="iconlink" data-act="del" data-id="' + r.product.id + '" data-ml="' + grUnit + '">Hapus</button>' +
        '<span class="small muted">' + rp(r.unit) + " / botol - " + gr(grUnit * r.item.qty) + "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
      );
    }

    document.addEventListener("arunika:cart", paint);
    document.addEventListener("arunika:mode", paint);
    paint();
  };

  /* ============ ADMIN ============ */
  PAGES.admin = function () {
    const root = $("#adminRoot");
    const logged = A.Store.get(A.K.admin, false) === true;
    logged ? renderApp() : renderLogin();

    function renderLogin() {
      root.innerHTML =
        '<div class="login-shell"><form class="login" id="loginForm">' +
        '<div class="login__lock">' + ICON.lock + "</div>" +
        '<h1 style="font-size:26px">Masuk Admin</h1>' +
        '<p class="muted small" style="margin-top:8px">Panel internal ' + esc(CONFIG.brand) + " untuk kelola produk, stok, dan pesanan.</p>" +
        '<div class="field" style="margin-top:22px"><label class="label" for="aUser">Nama pengguna</label>' +
        '<input class="input" id="aUser" autocomplete="username" placeholder="admin"><div class="err"></div></div>' +
        '<div class="field"><label class="label" for="aPass">Kata sandi</label>' +
        '<input class="input" id="aPass" type="password" autocomplete="current-password" placeholder="********"><div class="err"></div></div>' +
        '<button class="btn btn--primary btn--block mt-8" type="submit">Masuk</button>' +
        '<div class="login__hint">Demo prototype - gunakan <code>' + esc(CONFIG.admin.user) +
        "</code> / <code>" + esc(CONFIG.admin.pass) + "</code>. Ganti di <code>assets/js/config.js</code>.</div>" +
        "</form></div>";

      $("#loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const u = $("#aUser").value.trim(), p = $("#aPass").value;
        if (u === CONFIG.admin.user && p === CONFIG.admin.pass) {
          A.Store.set(A.K.admin, true);
          A.toast("Berhasil masuk sebagai admin", "ok");
          renderApp();
        } else {
          $("#aPass").closest(".field").classList.add("has-err");
          $("#aPass").closest(".field").querySelector(".err").textContent = "Nama pengguna atau kata sandi salah.";
          A.toast("Login gagal", "err");
        }
      });
    }

    function renderApp(tab) {
      tab = tab || "dashboard";
      const tabs = [
        { k: "dashboard", t: "Dashboard", i: ICON.grid },
        { k: "produk", t: "Produk", i: ICON.box }
      ];
      root.innerHTML =
        '<div class="wrap"><div class="admin-shell">' +
        '<aside class="adnav">' +
        tabs.map((x) =>
          '<button class="adnav__btn' + (tab === x.k ? " is-on" : "") + '" data-tab="' + x.k + '">' + x.i + esc(x.t) + "</button>"
        ).join("") +
        '<div class="rule" style="margin:12px 0"></div>' +
        '<a class="adnav__btn" href="index.html">' + ICON.out + "Lihat Toko</a>" +
        "</aside>" +
        '<section id="adBody"></section>' +
        "</div></div>";

      $$(".adnav__btn[data-tab]").forEach((b) =>
        b.addEventListener("click", () => renderApp(b.dataset.tab))
      );
      if (tab === "dashboard") viewDashboard();
      if (tab === "produk") viewProduk();
    }

    function kpi(l, v, d, down) {
      return '<div class="kpi"><div class="kpi__lbl">' + esc(l) + '</div><div class="kpi__val">' + v + "</div>" +
        (d ? '<div class="kpi__delta' + (down ? " is-down" : "") + '">' + esc(d) + "</div>" : "") + "</div>";
    }

    function viewDashboard() {
      const list = A.products();
      const habis = list.reduce((s, p) => s + p.sizes.filter((x) => !x.stock).length, 0);
      const variants = list.reduce((s, p) => s + p.sizes.length, 0);
      const totalCollections = (window.COLLECTION_LIST || []).length;

      $("#adBody").innerHTML =
        '<div class="flexrow mb-24" style="justify-content:space-between">' +
        "<div><h1 style=\"font-size:30px\">Dashboard</h1>" +
        '<p class="muted small" style="margin-top:6px">Ringkasan katalog dan ketersediaan produk saat ini.</p></div>' +
        '<span class="pill pill--ok">Toko aktif</span>' +
        "</div>" +
        '<div class="kpis">' +
        kpi("Total produk", list.length, "Katalog aktif") +
        kpi("Total varian", variants, "Semua ukuran") +
        kpi("Koleksi aktif", totalCollections, "Kategori katalog") +
        kpi("Varian sold out", habis, habis ? "Perlu restock" : "Semua aman", habis > 0) +
        "</div>" +
        '<div class="panel"><div class="panel__head"><div class="panel__title">Stok perlu perhatian</div></div>' +
        '<div class="tablewrap"><table class="tbl"><thead><tr>' +
        "<th>Produk</th><th>Ukuran</th><th>Status</th><th></th></tr></thead><tbody>" +
        (function () {
          const rows = [];
          list.forEach((p) => p.sizes.forEach((s) => {
            if (!s.stock) rows.push(
              "<tr><td><div class=\"tbl__name\">" + esc(p.name) + '</div><div class="tbl__sub">' + esc(p.brand) + "</div></td>" +
              "<td>" + (s.gr || s.ml) + ' gr</td><td><span class="pill pill--grey">Sold out</span></td>' +
              '<td class="tbl__num"><button class="minibtn" data-restock="' + p.id + "|" + s.ml + '">Tandai tersedia</button></td></tr>'
            );
          }));
          return rows.length ? rows.join("") :
            '<tr><td colspan="4" class="muted small" style="padding:22px 18px">Semua ukuran tersedia. Mantap.</td></tr>';
        })() +
        "</tbody></table></div></div>";

      $$("[data-restock]").forEach((b) =>
        b.addEventListener("click", () => {
          const parts = b.dataset.restock.split("|");
          patchSize(parts[0], Number(parts[1]), { stock: true });
          A.toast("Stok diperbarui menjadi tersedia", "ok");
          viewDashboard();
        })
      );
    }

    /* --- CRUD produk --- */
    function patchSize(id, ml, patch) {
      const over = A.getOverride();
      const p = A.findProduct(id);
      if (!p) return;
      const sizes = p.sizes.map((s) => (s.ml === ml ? Object.assign({}, s, patch) : s));
      over.patch = over.patch || {};
      over.patch[id] = Object.assign({}, over.patch[id] || {}, { sizes: sizes });
      A.saveOverride(over);
    }

    function viewProduk() {
      const list = A.products();
      $("#adBody").innerHTML =
        '<div class="flexrow mb-24" style="justify-content:space-between">' +
        "<div><h1 style=\"font-size:30px\">Produk &amp; Stok</h1>" +
        '<p class="muted small" style="margin-top:6px">' + list.length +
        " produk. Kelola katalog, stok, dan produk promo grosir.</p></div>" +
        '<div class="flexrow" style="gap:10px">' +
        '<button class="btn btn--ghost btn--sm" id="adCsv"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>Impor CSV Massal</button>' +
        '<button class="btn btn--gold btn--sm" id="adAdd">+ Tambah Produk</button>' +
        '</div>' +
        "</div>" +
        '<div class="panel"><div class="tablewrap"><table class="tbl"><thead><tr>' +
        "<th>Produk</th><th>Target &amp; Tag</th><th>Ukuran &amp; Harga Grosir</th><th>Stok</th><th></th>" +
        "</tr></thead><tbody>" +
        list.map((p) => {
          const bList = getBadges(p);
          const tagPills = bList.map((b) => {
            if (b === "promo") return '<span class="pill" style="background:#B83A2E;color:#fff;font-size:10px;padding:2px 7px;font-weight:700">PROMO</span>';
            if (b === "viral") return '<span class="pill" style="background:#7C3AED;color:#fff;font-size:10px;padding:2px 7px;font-weight:700">VIRAL</span>';
            if (b === "best") return '<span class="pill" style="background:#111;color:#F5C400;font-size:10px;padding:2px 7px">BEST</span>';
            if (b === "new") return '<span class="pill" style="background:#F7EEDF;color:#8A6428;font-size:10px;padding:2px 7px">BARU</span>';
            if (b === "selection") return '<span class="pill" style="background:#1C2421;color:#E8B961;font-size:10px;padding:2px 7px">SELECTION</span>';
            return '<span class="pill pill--grey" style="font-size:10px;padding:2px 7px">' + esc(b) + '</span>';
          }).join(" ");

          return (
            "<tr>" +
            '<td><div class="flexrow" style="gap:12px;flex-wrap:nowrap">' +
            '<span style="width:30px;flex:none">' + A.renderBottle(p) + "</span>" +
            '<span><span class="tbl__name">' + esc(p.name) + '</span><br><span class="tbl__sub">' + esc(p.brand) + "</span></span>" +
            "</div></td>" +
            '<td class="small">' + esc(p.gender) + '<br><div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">' + (tagPills || '<span class="tbl__sub">Reguler</span>') + "</div></td>" +
            '<td class="small">' + p.sizes.map((s) => (s.gr || s.ml) + " gr - " + rp(A.priceOf(s, p))).join("<br>") + "</td>" +
            "<td>" + p.sizes.map((s) =>
              '<span class="pill ' + (s.stock ? "pill--ok" : "pill--grey") + '" style="margin:0 4px 4px 0">' + (s.gr || s.ml) + " gr</span>"
            ).join("") + "</td>" +
            '<td class="tbl__num"><div class="tbl__act">' +
            '<button class="minibtn" data-edit="' + p.id + '">Ubah</button>' +
            '<button class="minibtn minibtn--danger" data-del="' + p.id + '">Hapus</button>' +
            "</div></td>" +
            "</tr>"
          );
        }).join("") +
        "</tbody></table></div></div>" +
        modalHTML();

      $$("[data-edit]").forEach((b) => b.addEventListener("click", () => openEdit(b.dataset.edit)));
      $("#adAdd").addEventListener("click", openAdd);
      const csvBtn = $("#adCsv");
      if (csvBtn) csvBtn.addEventListener("click", openCsvImport);
      $$("[data-del]").forEach((b) => b.addEventListener("click", () => openDeleteConfirm(b.dataset.del)));
    }

    function openDeleteConfirm(id) {
      const p = A.findProduct(id);
      if (!p) return;
      const modal = $("#delModal");
      $("#delProdName").textContent = p.name;
      modal.classList.add("is-open");
      $$("[data-close]", modal).forEach((b) => b.onclick = () => modal.classList.remove("is-open"));
      $("#delConfirmBtn").onclick = () => {
        const over = A.getOverride();
        over.deleted = over.deleted || [];
        over.deleted.push(p.id);
        over.added = (over.added || []).filter((x) => x.id !== p.id);
        A.saveOverride(over);
        modal.classList.remove("is-open");
        A.toast("Produk dihapus", "info");
        viewProduk();
      };
    }

    function modalHTML() {
      return (
        '<div class="modal" id="pModal" role="dialog" aria-modal="true" aria-label="Ubah produk">' +
        '<div class="modal__bg" data-close></div><div class="modal__card">' +
        '<div class="modal__head"><h3 style="font-size:20px" id="pmTitle">Ubah Produk</h3>' +
        '<button class="closebtn" data-close aria-label="Tutup">' + ICON.close + "</button></div>" +
        '<div class="modal__body" id="pmBody"></div>' +
        '<div class="modal__foot"><button class="btn btn--ghost btn--sm" data-close>Batal</button>' +
        '<button class="btn btn--primary btn--sm" id="pmSave">Simpan Perubahan</button></div>' +
        "</div></div>" +
        '<div class="modal" id="delModal" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus produk">' +
        '<div class="modal__bg" data-close></div><div class="modal__card" style="max-width:440px">' +
        '<div class="modal__head"><h3 style="font-size:18px">Hapus Produk</h3>' +
        '<button class="closebtn" data-close aria-label="Tutup">' + ICON.close + "</button></div>" +
        '<div class="modal__body">' +
        '<p style="font-size:14px;color:var(--muted);line-height:1.6">' +
        'Apakah kamu yakin ingin menghapus produk <b id="delProdName" style="color:var(--espresso)"></b> dari katalog? Tindakan ini tidak dapat dibatalkan.' +
        '</p>' +
        '</div>' +
        '<div class="modal__foot">' +
        '<button class="btn btn--ghost btn--sm" data-close>Batal</button>' +
        '<button class="btn btn--sm" id="delConfirmBtn" style="background:#E53E3E;color:#fff;border-color:#E53E3E;padding:8px 16px;font-weight:600">Hapus Produk</button>' +
        '</div>' +
        "</div></div>" +
        '<div class="modal" id="csvModal" role="dialog" aria-modal="true" aria-label="Impor Produk Massal CSV">' +
        '<div class="modal__bg" data-close></div><div class="modal__card" style="max-width:680px">' +
        '<div class="modal__head"><h3 style="font-size:20px">Impor Produk Massal (CSV)</h3>' +
        '<button class="closebtn" data-close aria-label="Tutup">' + ICON.close + '</button></div>' +
        '<div class="modal__body">' +
        '<div class="csv-guide">' +
        '<div class="csv-guide__h">Panduan Format Kolom File CSV:</div>' +
        '<p class="csv-guide__p">Gunakan baris header berikut persis: <code>name,brand,gender,tags,top,middle,base,desc,sizes</code></p>' +
        '<ul class="csv-guide__list">' +
        '<li><b>gender</b>: Pria, Wanita, atau Unisex</li>' +
        '<li><b>tags</b>: Dipisahkan titik-koma, contoh: <code>viral;promo</code> atau <code>best</code></li>' +
        '<li><b>sizes</b>: Format <code>gram:grosir:promo</code> dipisahkan titik-koma. Contoh: <code>35:28000;50:38000:32000;100:70000:60000</code></li>' +
        '</ul>' +
        '<button type="button" class="btn btn--ghost btn--sm" id="csvDownloadTemplate" style="margin-top:10px">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Unduh Template CSV' +
        '</button>' +
        '</div>' +
        '<label class="csv-dropzone" for="csvFileInput" id="csvDropzone">' +
        '<input type="file" id="csvFileInput" accept=".csv,text/csv">' +
        '<svg class="csv-dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>' +
        '<span class="csv-dropzone__title">Klik atau seret file CSV ke sini</span>' +
        '<span class="csv-dropzone__sub">File teks CSV berpemisah koma (.csv)</span>' +
        '</label>' +
        '<div id="csvPreviewWrap" style="display:none;margin-top:16px">' +
        '<div class="flexrow mb-12" style="justify-content:space-between">' +
        '<strong id="csvCountLabel" style="font-size:13px;color:var(--espresso)">0 produk terdeteksi</strong>' +
        '<span class="pill pill--ok">Siap Diimpor</span>' +
        '</div>' +
        '<div class="csv-preview"><table class="tbl"><thead><tr>' +
        '<th>Nama</th><th>Brand</th><th>Gender</th><th>Tags</th><th>Ukuran</th>' +
        '</tr></thead><tbody id="csvPreviewTbody"></tbody></table></div>' +
        '</div>' +
        '</div>' +
        '<div class="modal__foot">' +
        '<button class="btn btn--ghost btn--sm" data-close>Batal</button>' +
        '<button class="btn btn--gold btn--sm" id="csvCommitBtn" disabled>Proses &amp; Simpan ke Katalog</button>' +
        '</div>' +
        '</div></div>'
      );
    }

    function uploadField() {
      return '<div class="field"><label class="label">Gambar Produk</label><label class="upload-dropzone" for="pmImage">' +
        '<input id="pmImage" type="file" accept="image/*"><span class="upload-dropzone__empty">' +
        '<svg class="upload-dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 18 5-5 3 3 3-3 5 5"/></svg>' +
        '<span>Klik atau seret gambar produk ke sini</span><small class="upload-dropzone__note">JPG, PNG, atau WEBP</small></span>' +
        '<img class="upload-dropzone__preview" hidden alt="Pratinjau gambar produk"></label></div>';
    }

    function prepareModal(modal) {
      modal.classList.add("is-open");
      $$('[data-close]', modal).forEach((b) => b.onclick = () => modal.classList.remove("is-open"));
      const input = $("#pmImage", modal), preview = $(".upload-dropzone__preview", modal), empty = $(".upload-dropzone__empty", modal);
      if (input) input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return;
        preview.src = URL.createObjectURL(file);
        preview.hidden = false;
        empty.hidden = true;
      };
    }

    function renderTagPicker(prefix, selectedBadges) {
      selectedBadges = selectedBadges || [];
      const list = [
        { key: "viral", name: "Viral", cls: "tag-chip--viral" },
        { key: "new", name: "New Arrival", cls: "tag-chip--new" },
        { key: "best", name: "Best Seller", cls: "tag-chip--best" },
        { key: "selection", name: "Selection", cls: "tag-chip--selection" },
        { key: "promo", name: "Promo (Harga Spesial)", cls: "tag-chip--promo" }
      ];
      return (
        '<div class="field">' +
        '<label class="label">Badge / Tag Koleksi &amp; Promo <span style="font-weight:400;color:var(--muted)">(Bisa pilih lebih dari satu)</span></label>' +
        '<div class="tag-picker" id="' + prefix + 'TagPicker">' +
        list.map((t) => {
          const isChecked = selectedBadges.includes(t.key);
          return (
            '<label class="tag-chip ' + (t.cls || "") + '">' +
            '<input type="checkbox" name="' + prefix + 'Tags" value="' + t.key + '"' + (isChecked ? " checked" : "") + '>' +
            '<span class="tag-chip__text">' + t.name + "</span>" +
            "</label>"
          );
        }).join("") +
        "</div></div>"
      );
    }

    function getSelectedTags(prefix) {
      const boxes = $$('input[name="' + prefix + 'Tags"]:checked');
      return Array.from(boxes).map((b) => b.value);
    }

    function bindPromoToggle(prefix, containerId) {
      const cont = $("#" + containerId);
      const promoCheckbox = $('input[name="' + prefix + 'Tags"][value="promo"]');
      if (!cont || !promoCheckbox) return;
      const updateClass = () => {
        if (promoCheckbox.checked) {
          cont.classList.add("has-promo");
        } else {
          cont.classList.remove("has-promo");
        }
      };
      promoCheckbox.addEventListener("change", updateClass);
      updateClass();
    }

    function sizeEditHTML(grVal, grosir, stock, promoPrice) {
      return (
        '<div class="sizeedit">' +
        '<div class="sizeedit__ml"><div class="sizeedit__lbl">Ukuran (gr)</div><input class="input" type="number" min="1" placeholder="gr" data-k="ml" value="' + (grVal !== undefined && grVal !== null ? grVal : "") + '"></div>' +
        '<div><div class="sizeedit__lbl">Harga Normal (Rp)</div><input class="input" type="number" min="0" step="1000" data-k="grosir" value="' + (grosir !== undefined && grosir !== null ? grosir : "") + '"></div>' +
        '<div class="sizeedit__promo"><div class="sizeedit__lbl">Harga Promo (Rp)</div><input class="input" type="number" min="0" step="1000" data-k="promo" placeholder="Wajib jika promo" value="' + (promoPrice !== undefined && promoPrice !== null ? promoPrice : "") + '"></div>' +
        '<div><div class="sizeedit__lbl">Tersedia</div><label class="switch"><input type="checkbox" data-k="stock"' + (stock ? " checked" : "") + '><span class="switch__track"></span></label></div>' +
        '<div><button type="button" class="sizeedit__del" data-act="del-size" title="Hapus ukuran">' + ICON.trash + '</button></div>' +
        '</div>'
      );
    }

    function parseAccordsInput(val) {
      if (!val || !val.trim()) return null;
      return val.split(",").map((part) => {
        const segs = part.split(":");
        const name = (segs[0] || "").trim().toLowerCase();
        const score = parseInt(segs[1] || 80, 10) || 80;
        return name ? { name: name, score: Math.min(100, Math.max(10, score)) } : null;
      }).filter(Boolean);
    }

    function bindSizeActions(containerId, addBtnId) {
      const cont = $("#" + containerId);
      const addBtn = $("#" + addBtnId);
      if (cont) {
        cont.onclick = (e) => {
          const btn = e.target.closest('[data-act="del-size"]');
          if (!btn) return;
          const rows = cont.querySelectorAll(".sizeedit");
          if (rows.length <= 1) {
            A.toast("Minimal harus ada 1 ukuran", "warn");
            return;
          }
          btn.closest(".sizeedit").remove();
        };
      }
      if (addBtn && cont) {
        addBtn.onclick = () => {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = sizeEditHTML("", "", true, "");
          cont.appendChild(wrapper.firstElementChild);
        };
      }
    }

    function openAdd() {
      const modal = $("#pModal");
      $("#pmTitle").textContent = "Tambah Produk";
      $("#pmSave").textContent = "Tambah Produk";
      $("#pmBody").innerHTML = uploadField() +
        '<div class="form-2"><div class="field"><label class="label" for="paName">Nama Produk</label><input class="input" id="paName" required placeholder="Contoh: Vanilla Sunset"></div><div class="field"><label class="label" for="paBrand">Brand</label><input class="input" id="paBrand" value="Grosir Parfum Eropa"></div></div>' +
        '<div class="field"><label class="label" for="paGender">Target Pengguna</label><select class="select" id="paGender"><option>Pria</option><option>Wanita</option><option>Unisex</option></select></div>' +
        renderTagPicker("pa", []) +
        '<div class="field"><label class="label" for="paDesc">Deskripsi</label><textarea class="textarea" id="paDesc" rows="3" placeholder="Deskripsi karakter parfum dan aromatik..."></textarea></div>' +
        '<div class="form-3"><div class="field"><label class="label" for="paTop">Top Notes</label><input class="input" id="paTop" placeholder="Bergamot"></div><div class="field"><label class="label" for="paMid">Middle Notes</label><input class="input" id="paMid" placeholder="Rose"></div><div class="field"><label class="label" for="paBase">Base Notes</label><input class="input" id="paBase" placeholder="Musk"></div></div>' +
        '<div class="field">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
        '<label class="label" style="margin-bottom:0" for="paAccords">Main Accords (Olfactory Profile)</label>' +
        '<button type="button" class="btn btn--ghost btn--sm" id="paAutoAccords" style="padding:4px 10px;font-size:11.5px">' +
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>' +
        'Auto-Generate dari Notes' +
        '</button>' +
        '</div>' +
        '<input class="input" id="paAccords" placeholder="Contoh: woody: 100, warm spicy: 82, amber: 70, oud: 62">' +
        '</div>' +
        '<div class="pdp__blockh" style="margin:14px 0 6px"><span>Ukuran (gr), Harga Normal &amp; Harga Promo</span></div>' +
        '<div id="paSizesContainer">' +
        [35, 50, 100].map((grVal) => sizeEditHTML(grVal, grVal * 800, true, "")).join("") +
        '</div><button type="button" class="btn btn--ghost btn--sm mt-16" id="paAddSize">+ Tambah Ukuran</button>';

      prepareModal(modal);
      bindSizeActions("paSizesContainer", "paAddSize");
      bindPromoToggle("pa", "paSizesContainer");

      const autoBtn = $("#paAutoAccords");
      if (autoBtn) {
        autoBtn.onclick = () => {
          const dummy = {
            notes: { top: $("#paTop").value, middle: $("#paMid").value, base: $("#paBase").value },
            desc: $("#paDesc").value
          };
          const gen = autoAccords(dummy);
          $("#paAccords").value = gen.map((g) => g.name + ": " + g.score).join(", ");
          A.toast("Accords berhasil digenerate dari notes", "ok");
        };
      }

      $("#pmSave").onclick = () => {
        const name = $("#paName").value.trim();
        if (!name) {
          A.toast("Nama produk wajib diisi", "warn");
          return;
        }

        const tags = getSelectedTags("pa");
        const isPromoActive = tags.includes("promo");

        const newSizes = [];
        $$("#paSizesContainer .sizeedit").forEach((row) => {
          const inpMl = row.querySelector('[data-k="ml"]');
          const inpGrosir = row.querySelector('[data-k="grosir"]');
          const inpPromo = row.querySelector('[data-k="promo"]');
          const inpStock = row.querySelector('[data-k="stock"]');
          const mlVal = Number(inpMl.value);
          if (mlVal > 0) {
            const grosirPrice = Number(inpGrosir.value) || 0;
            const promoVal = Number(inpPromo ? inpPromo.value : 0);
            const sizeObj = {
              ml: mlVal,
              gr: mlVal,
              price: grosirPrice,
              grosir: grosirPrice,
              stock: inpStock ? inpStock.checked : true
            };
            if (isPromoActive && promoVal > 0 && promoVal < grosirPrice) {
              sizeObj.promoPrice = promoVal;
            }
            newSizes.push(sizeObj);
          }
        });
        if (!newSizes.length) {
          newSizes.push({ ml: 50, gr: 50, price: 35000, grosir: 35000, stock: true });
        }

        const customAccords = parseAccordsInput($("#paAccords").value);

        const newProd = {
          id: "custom-" + Date.now(),
          name: name,
          brand: $("#paBrand").value.trim() || "Grosir Parfum Eropa",
          gender: $("#paGender").value,
          badges: tags,
          badge: tags[0] || "",
          desc: $("#paDesc").value.trim() || "Parfum grosir dengan bibit berkualitas tahan lama.",
          colors: ["#D4A900", "#FAF7F2"],
          notes: {
            top: $("#paTop").value.trim() || "Bergamot, Citrus",
            middle: $("#paMid").value.trim() || "Jasmine, Floral",
            base: $("#paBase").value.trim() || "Musk, Amber"
          },
          accords: customAccords || undefined,
          sizes: newSizes
        };

        const over = A.getOverride();
        over.added = over.added || [];
        over.added.push(newProd);
        A.saveOverride(over);

        modal.classList.remove("is-open");
        A.toast("Produk berhasil ditambahkan", "ok");
        $("#pmBody").innerHTML = "";
        viewProduk();
      };
    }

    function openEdit(id) {
      const p = A.findProduct(id);
      if (!p) return;
      const modal = $("#pModal");
      $("#pmSave").textContent = "Simpan Perubahan";
      $("#pmTitle").textContent = "Ubah: " + p.name;
      const curAccords = (p.accords || autoAccords(p)).map((a) => a.name + ": " + a.score).join(", ");
      const curBadges = getBadges(p);

      $("#pmBody").innerHTML = uploadField() +
        '<div class="field"><label class="label" for="pmName">Nama produk</label>' +
        '<input class="input" id="pmName" value="' + esc(p.name) + '"></div>' +
        '<div class="field"><label class="label" for="pmGender">Target Pengguna</label>' +
        '<select class="select" id="pmGender">' + (window.GENDER_LIST || []).map((g) =>
          '<option' + (g === p.gender ? " selected" : "") + ">" + g + "</option>").join("") + "</select></div>" +
        renderTagPicker("pm", curBadges) +
        '<div class="form-3"><div class="field"><label class="label" for="pmTop">Top Notes</label><input class="input" id="pmTop" value="' + esc(p.notes ? p.notes.top : "") + '"></div><div class="field"><label class="label" for="pmMid">Middle Notes</label><input class="input" id="pmMid" value="' + esc(p.notes ? p.notes.middle : "") + '"></div><div class="field"><label class="label" for="pmBase">Base Notes</label><input class="input" id="pmBase" value="' + esc(p.notes ? p.notes.base : "") + '"></div></div>' +
        '<div class="field">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
        '<label class="label" style="margin-bottom:0" for="pmAccords">Main Accords (Olfactory Profile)</label>' +
        '<button type="button" class="btn btn--ghost btn--sm" id="pmAutoAccords" style="padding:4px 10px;font-size:11.5px">' +
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>' +
        'Auto-Generate dari Notes' +
        '</button>' +
        '</div>' +
        '<input class="input" id="pmAccords" value="' + esc(curAccords) + '">' +
        '</div>' +
        '<div class="pdp__blockh" style="margin:14px 0 6px"><span>Harga normal, harga promo &amp; stok per ukuran (gr)</span></div>' +
        '<div id="pmSizesContainer">' +
        p.sizes.map((s) => sizeEditHTML(s.gr || s.ml, s.grosir, s.stock, s.promoPrice)).join("") +
        '</div><button type="button" class="btn btn--ghost btn--sm mt-16" id="pmAddSize">+ Tambah Ukuran</button>';

      prepareModal(modal);
      bindSizeActions("pmSizesContainer", "pmAddSize");
      bindPromoToggle("pm", "pmSizesContainer");

      const autoBtn = $("#pmAutoAccords");
      if (autoBtn) {
        autoBtn.onclick = () => {
          const dummy = {
            notes: { top: $("#pmTop").value, middle: $("#pmMid").value, base: $("#pmBase").value },
            desc: p.desc
          };
          const gen = autoAccords(dummy);
          $("#pmAccords").value = gen.map((g) => g.name + ": " + g.score).join(", ");
          A.toast("Accords berhasil digenerate dari notes", "ok");
        };
      }

      $("#pmSave").onclick = () => {
        const tags = getSelectedTags("pm");
        const isPromoActive = tags.includes("promo");

        const newSizes = [];
        $$("#pmSizesContainer .sizeedit").forEach((row) => {
          const inpMl = row.querySelector('[data-k="ml"]');
          const inpGrosir = row.querySelector('[data-k="grosir"]');
          const inpPromo = row.querySelector('[data-k="promo"]');
          const inpStock = row.querySelector('[data-k="stock"]');
          const mlVal = Number(inpMl.value);
          if (mlVal > 0) {
            const grosirPrice = Number(inpGrosir.value) || 0;
            const promoVal = Number(inpPromo ? inpPromo.value : 0);
            const sizeObj = {
              ml: mlVal,
              gr: mlVal,
              price: grosirPrice,
              grosir: grosirPrice,
              stock: inpStock ? inpStock.checked : true
            };
            if (isPromoActive && promoVal > 0 && promoVal < grosirPrice) {
              sizeObj.promoPrice = promoVal;
            }
            newSizes.push(sizeObj);
          }
        });

        if (!newSizes.length) {
          A.toast("Minimal harus ada 1 ukuran", "warn");
          return;
        }

        const customAccords = parseAccordsInput($("#pmAccords").value);

        const over = A.getOverride();
        over.patch = over.patch || {};
        over.patch[p.id] = Object.assign({}, over.patch[p.id] || {}, {
          name: $("#pmName").value.trim() || p.name,
          gender: $("#pmGender").value,
          badges: tags,
          badge: tags[0] || "",
          notes: {
            top: $("#pmTop") ? $("#pmTop").value : (p.notes ? p.notes.top : ""),
            middle: $("#pmMid") ? $("#pmMid").value : (p.notes ? p.notes.middle : ""),
            base: $("#pmBase") ? $("#pmBase").value : (p.notes ? p.notes.base : "")
          },
          accords: customAccords || undefined,
          sizes: newSizes
        });
        A.saveOverride(over);
        modal.classList.remove("is-open");
        A.toast("Perubahan tersimpan", "ok");
        viewProduk();
      };
    }

    function openCsvImport() {
      const modal = $("#csvModal");
      if (!modal) return;
      modal.classList.add("is-open");
      $$("[data-close]", modal).forEach((b) => (b.onclick = () => modal.classList.remove("is-open")));

      const fileInput = $("#csvFileInput", modal);
      const dropzone = $("#csvDropzone", modal);
      const previewWrap = $("#csvPreviewWrap", modal);
      const previewTbody = $("#csvPreviewTbody", modal);
      const countLabel = $("#csvCountLabel", modal);
      const commitBtn = $("#csvCommitBtn", modal);
      const downloadBtn = $("#csvDownloadTemplate", modal);

      let parsedProds = [];

      if (fileInput) fileInput.value = "";
      if (previewWrap) previewWrap.style.display = "none";
      if (commitBtn) commitBtn.disabled = true;

      if (downloadBtn) {
        downloadBtn.onclick = () => {
          const csvHeader = "name,brand,gender,tags,top,middle,base,desc,sizes\r\n";
          const csvRows = [
            '"Vanilla Sublime","Grosir Parfum Eropa","Wanita","best;promo","Vanilla, Bergamot","Rose, Jasmine","Musk, Amber","Racikan aroma vanilla lembut nan manis tahan lama.","35:28000;50:38000:32000;100:70000:60000"',
            '"Ocean Blue Wave","Grosir Parfum Eropa","Pria","viral","Sea Salt, Grapefruit","Sage, Lavender","Woody, Cedarwood","Aroma kesegaran laut yang maskulin dan sporty.","35:25000;50:35000;100:65000"',
            '"Amber Royale Elite","Grosir Parfum Eropa","Unisex","selection","Cardamom, Saffron","Oud Wood, Rose","Patchouli, Amber","Wangi mewah oriental dengan daya tahan tinggi.","50:45000;100:85000"'
          ].join("\r\n");
          const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "template_produk_grosir.csv";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          A.toast("Template CSV berhasil diunduh", "ok");
        };
      }

      function handleFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target.result;
          parsedProds = parseCSVProducts(text);
          if (!parsedProds.length) {
            A.toast("Tidak ada data produk valid dalam file CSV", "warn");
            if (previewWrap) previewWrap.style.display = "none";
            if (commitBtn) commitBtn.disabled = true;
            return;
          }

          if (countLabel) countLabel.textContent = parsedProds.length + " produk siap diimpor";
          if (previewTbody) {
            previewTbody.innerHTML = parsedProds.slice(0, 10).map((p) => {
              const tagStr = (p.badges || []).join(", ") || "-";
              const szStr = (p.sizes || []).map((s) => (s.gr || s.ml) + "gr (" + rp(s.grosir) + (s.promoPrice ? " -> " + rp(s.promoPrice) : "") + ")").join(", ");
              return "<tr><td><b>" + esc(p.name) + "</b></td><td>" + esc(p.brand) + "</td><td>" + esc(p.gender) + "</td><td>" + esc(tagStr) + "</td><td class=\"small\">" + esc(szStr) + "</td></tr>";
            }).join("") + (parsedProds.length > 10 ? '<tr><td colspan="5" class="small muted" style="text-align:center">... dan ' + (parsedProds.length - 10) + ' produk lainnya</td></tr>' : "");
          }
          if (previewWrap) previewWrap.style.display = "block";
          if (commitBtn) commitBtn.disabled = false;
        };
        reader.readAsText(file);
      }

      if (fileInput) {
        fileInput.onchange = () => {
          if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
        };
      }

      if (dropzone) {
        dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = "var(--gold)"; };
        dropzone.ondragleave = () => { dropzone.style.borderColor = ""; };
        dropzone.ondrop = (e) => {
          e.preventDefault();
          dropzone.style.borderColor = "";
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        };
      }

      if (commitBtn) {
        commitBtn.onclick = () => {
          if (!parsedProds.length) return;
          const over = A.getOverride();
          over.added = over.added || [];
          parsedProds.forEach((p) => over.added.push(p));
          A.saveOverride(over);
          modal.classList.remove("is-open");
          A.toast(parsedProds.length + " produk berhasil diimpor ke katalog!", "ok");
          viewProduk();
        };
      }
    }

    function parseCSVProducts(text) {
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) return [];

      const parseRow = (line) => {
        const row = [];
        let inQuotes = false;
        let cur = "";
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (c === ',' && !inQuotes) {
            row.push(cur.trim());
            cur = "";
          } else {
            cur += c;
          }
        }
        row.push(cur.trim());
        return row;
      };

      const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
      const out = [];

      for (let i = 1; i < lines.length; i++) {
        const vals = parseRow(lines[i]);
        if (vals.length < 2) continue;
        const row = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] !== undefined ? vals[idx] : ""; });
        const name = row.name || row.namaproduk || row.nama;
        if (!name) continue;

        const tags = (row.tags || row.tag || row.badge || "").split(";").map((t) => t.trim().toLowerCase()).filter(Boolean);
        const hasPromoTag = tags.includes("promo");

        const rawSizes = (row.sizes || row.ukuran || "").split(";").map((s) => s.trim()).filter(Boolean);
        const parsedSizes = [];
        rawSizes.forEach((str) => {
          const parts = str.split(":").map((p) => Number(p.trim()) || 0);
          const grVal = parts[0] || 50;
          const grosirVal = parts[1] || 35000;
          const promoVal = parts[2] || 0;
          const sObj = {
            ml: grVal,
            gr: grVal,
            price: grosirVal,
            grosir: grosirVal,
            stock: true
          };
          if (hasPromoTag && promoVal > 0 && promoVal < grosirVal) {
            sObj.promoPrice = promoVal;
          }
          parsedSizes.push(sObj);
        });

        if (!parsedSizes.length) {
          parsedSizes.push({ ml: 50, gr: 50, price: 35000, grosir: 35000, stock: true });
        }

        const notes = {
          top: row.top || "Bergamot, Citrus",
          middle: row.middle || row.mid || "Jasmine, Floral",
          base: row.base || "Musk, Amber"
        };

        const prod = {
          id: "csv-" + Date.now() + "-" + i,
          name: name,
          brand: row.brand || "Grosir Parfum Eropa",
          gender: ["Pria", "Wanita", "Unisex"].find((g) => g.toLowerCase() === (row.gender || "").toLowerCase()) || "Unisex",
          badges: tags,
          badge: tags[0] || "",
          desc: row.desc || row.deskripsi || "Parfum grosir bibit murni berkualitas tinggi.",
          colors: ["#D4A900", "#FAF7F2"],
          notes: notes,
          sizes: parsedSizes
        };
        prod.accords = autoAccords(prod);
        out.push(prod);
      }
      return out;
    }
  };
})();
