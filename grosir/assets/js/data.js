/* ===========================================================
   Grosir Parfum Eropa - DATA PRODUK (12 produk fiktif)
   Takaran stok & ukuran dalam Gram (gr).
   grosir = harga grosir langsung (per botol)
   badge  = "viral" | "new" | "best" | "selection" | "promo" | null
   =========================================================== */

const PRODUCTS = [
  {
    id: "sahara-oud",
    name: "Sahara Oud",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Pria",
    aroma: "Woody",
    badge: "best",
    desc: "Oud hangat yang dibuat tidak berat. Cocok untuk acara malam, rapat penting, atau saat kamu ingin dikenang lewat wangi.",
    notes: { top: "Safron, Lada Hitam", middle: "Mawar Taif, Cendana", base: "Oud, Amber, Musk" },
    colors: ["#8A5A2B", "#4A2C14"],
    sizes: [
      { ml: 35,  price: 45000,  grosir: 34000, stock: true },
      { ml: 50,  price: 58000,  grosir: 44000, stock: true },
      { ml: 100, price: 100000, grosir: 78000, stock: true }
    ]
  },
  {
    id: "melati-senja",
    name: "Melati Senja",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Wanita",
    aroma: "Floral",
    badge: "best",
    desc: "Melati yang mekar pelan menjelang magrib. Lembut, bersih, dan tidak menusuk - aman dipakai setiap hari.",
    notes: { top: "Bergamot, Pir", middle: "Melati, Ylang-Ylang", base: "Musk Putih, Kayu Cedar" },
    colors: ["#F3D9E4", "#C98BA8"],
    sizes: [
      { ml: 35,  price: 38000, grosir: 29000, stock: true },
      { ml: 50,  price: 48000, grosir: 37000, stock: true },
      { ml: 100, price: 85000, grosir: 66000, stock: true }
    ]
  },
  {
    id: "kopi-karamel",
    name: "Kopi Karamel",
    brand: "Grosir Parfum Eropa Kitchen",
    gender: "Unisex",
    aroma: "Gourmand",
    badge: "viral",
    desc: "Espresso yang ditumpuk karamel dan sedikit garam laut. Manisnya pas, tidak bikin enek.",
    notes: { top: "Kopi Sangrai, Jeruk Mandarin", middle: "Karamel, Hazelnut", base: "Tonka, Vanila, Musk" },
    colors: ["#C08A4E", "#5A3413"],
    sizes: [
      { ml: 35,  price: 38000, grosir: 29000, stock: true },
      { ml: 50,  price: 48000, grosir: 37000, stock: true },
      { ml: 100, price: 85000, grosir: 66000, stock: false }
    ]
  },
  {
    id: "laut-pagi",
    name: "Laut Pagi",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Pria",
    aroma: "Fresh",
    badge: "viral",
    desc: "Aroma udara asin jam enam pagi. Ringan, bersih, dan menyegarkan untuk iklim tropis yang panas.",
    notes: { top: "Jeruk Nipis, Daun Mint", middle: "Nota Laut, Lavender", base: "Kayu Driftwood, Musk" },
    colors: ["#A8D8E8", "#2E6E8E"],
    sizes: [
      { ml: 35,  price: 32000, grosir: 24000, stock: true },
      { ml: 50,  price: 42000, grosir: 32000, stock: true },
      { ml: 100, price: 75000, grosir: 58000, stock: true }
    ]
  },
  {
    id: "amber-rindu",
    name: "Amber Rindu",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Unisex",
    aroma: "Oriental",
    badge: "selection",
    desc: "Amber resin yang hangat dengan sentuhan rempah manis. Wangi pelukan di ruangan ber-AC.",
    notes: { top: "Kapulaga, Kayu Manis", middle: "Amber, Labdanum", base: "Benzoin, Vanila, Patchouli" },
    colors: ["#E8B961", "#9A5F1C"],
    sizes: [
      { ml: 35,  price: 45000,  grosir: 34000, stock: true },
      { ml: 50,  price: 58000,  grosir: 44000, stock: true },
      { ml: 100, price: 100000, grosir: 78000, stock: true }
    ]
  },
  {
    id: "peach-ceria",
    name: "Peach Ceria",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Wanita",
    aroma: "Fruity",
    badge: "new",
    desc: "Persik matang dan sedikit yoghurt. Riang, muda, dan ramah dipakai ke kampus atau kantor.",
    notes: { top: "Persik, Leci", middle: "Bunga Jeruk, Freesia", base: "Musk, Kayu Putih Lembut" },
    colors: ["#FFC9A3", "#E2704F"],
    sizes: [
      { ml: 35,  price: 32000, grosir: 24000, stock: true },
      { ml: 50,  price: 42000, grosir: 32000, stock: true },
      { ml: 100, price: 75000, grosir: 58000, stock: true }
    ]
  },
  {
    id: "cendana-malam",
    name: "Cendana Malam",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Pria",
    aroma: "Woody",
    badge: "selection",
    desc: "Cendana kering dengan asap tipis. Tenang, dewasa, dan tahan lama di kain.",
    notes: { top: "Juniper, Pala", middle: "Cendana, Vetiver", base: "Cedarwood, Kulit, Musk" },
    colors: ["#B9A281", "#4C3A28"],
    sizes: [
      { ml: 35,  price: 38000, grosir: 29000, stock: false },
      { ml: 50,  price: 48000, grosir: 37000, stock: true },
      { ml: 100, price: 85000, grosir: 66000, stock: true }
    ]
  },
  {
    id: "vanila-sutra",
    name: "Vanila Sutra",
    brand: "Grosir Parfum Eropa Kitchen",
    gender: "Wanita",
    aroma: "Gourmand",
    badge: "new",
    desc: "Vanila Madagaskar yang halus seperti kain sutra, ditutup almond panggang tipis.",
    notes: { top: "Almond, Bergamot", middle: "Vanila Bourbon, Heliotrope", base: "Tonka, Sandalwood" },
    colors: ["#F6E3C5", "#C89A5B"],
    sizes: [
      { ml: 35,  price: 38000, grosir: 29000, stock: true },
      { ml: 50,  price: 48000, grosir: 37000, stock: true },
      { ml: 100, price: 85000, grosir: 66000, stock: true }
    ]
  },
  {
    id: "jeruk-bali",
    name: "Jeruk Bali",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Unisex",
    aroma: "Fresh",
    badge: "promo",
    desc: "Pomelo yang baru dikupas. Segar, sedikit pahit di awal, lalu manis dan bersih.",
    notes: { top: "Pomelo, Grapefruit", middle: "Neroli, Daun Teh", base: "Musk Bersih, Vetiver" },
    colors: ["#F5E27A", "#B8912A"],
    sizes: [
      { ml: 35,  price: 32000, grosir: 24000, stock: true },
      { ml: 50,  price: 42000, grosir: 32000, stock: true },
      { ml: 100, price: 75000, grosir: 58000, stock: true }
    ]
  },
  {
    id: "mawar-embun",
    name: "Mawar Embun",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Wanita",
    aroma: "Floral",
    badge: "promo",
    desc: "Mawar yang masih basah embun pagi. Anggun tanpa terasa tua.",
    notes: { top: "Lychee, Blackcurrant", middle: "Mawar Damask, Peony", base: "Musk, Amber Lembut" },
    colors: ["#EFB8C2", "#A44A62"],
    sizes: [
      { ml: 35,  price: 38000, grosir: 29000, stock: true },
      { ml: 50,  price: 48000, grosir: 37000, stock: false },
      { ml: 100, price: 85000, grosir: 66000, stock: true }
    ]
  },
  {
    id: "kayu-hujan",
    name: "Kayu Hujan",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Pria",
    aroma: "Woody",
    badge: "selection",
    desc: "Bau tanah dan kayu sesaat setelah hujan reda. Netral, maskulin, mudah disukai siapa saja.",
    notes: { top: "Nota Petrichor, Bergamot", middle: "Vetiver, Geranium", base: "Cedarwood, Patchouli" },
    colors: ["#9DB0A2", "#3C4C41"],
    sizes: [
      { ml: 35,  price: 32000, grosir: 24000, stock: true },
      { ml: 50,  price: 42000, grosir: 32000, stock: true },
      { ml: 100, price: 75000, grosir: 58000, stock: true }
    ]
  },
  {
    id: "musk-awan",
    name: "Musk Awan",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Unisex",
    aroma: "Oriental",
    badge: "promo",
    desc: "Musk bersih seperti handuk yang baru dijemur. Aman untuk kulit sensitif dan ruangan tertutup.",
    notes: { top: "Aldehid, Pir", middle: "Iris, Musk Putih", base: "Cashmeran, Amber Bening" },
    colors: ["#DCDCE4", "#8A8AA0"],
    sizes: [
      { ml: 35,  price: 32000, grosir: 24000, stock: true },
      { ml: 50,  price: 42000, grosir: 32000, stock: true },
      { ml: 100, price: 75000, grosir: 58000, stock: true }
    ]
  }
];

/* Daftar filter turunan (dipakai halaman katalog) */
const AROMA_LIST  = ["Floral", "Woody", "Fresh", "Oriental", "Gourmand", "Fruity"];
const GENDER_LIST = ["Pria", "Wanita", "Unisex"];

const COLLECTION_LIST = [
  { key: "viral", name: "Viral", desc: "Aroma yang ramai dibicarakan dan jadi tren saat ini.", tint: "#F3E8FF", pick: "kopi-karamel" },
  { key: "new", name: "New Arrival", desc: "Racikan dan varian aroma terbaru yang baru masuk.", tint: "#FEF3C7", pick: "peach-ceria" },
  { key: "best", name: "Best Seller", desc: "Paling diminati dengan volume repeat order tertinggi.", tint: "#E0E7FF", pick: "sahara-oud" },
  { key: "selection", name: "Selection", desc: "Koleksi signature berkarakter mewah dan tahan lama.", tint: "#ECFDF5", pick: "amber-rindu" },
  { key: "promo", name: "Promo", desc: "Penawaran harga grosir spesial dengan margin maksimal.", tint: "#FEE2E2", pick: "jeruk-bali" }
];

window.PRODUCTS = PRODUCTS;
window.AROMA_LIST = AROMA_LIST;
window.GENDER_LIST = GENDER_LIST;
window.COLLECTION_LIST = COLLECTION_LIST;
