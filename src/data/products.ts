import { Product, CollectionItem } from '../types'

export const ACCORD_COLORS: Record<string, { bg: string; color: string }> = {
  woody: { bg: "#7D4B2A", color: "#FFFFFF" },
  citrus: { bg: "#D2DA38", color: "#141210" },
  mossy: { bg: "#556832", color: "#FFFFFF" },
  earthy: { bg: "#4E463A", color: "#FFFFFF" },
  "fresh spicy": { bg: "#5E8E2B", color: "#FFFFFF" },
  fruity: { bg: "#BA4026", color: "#FFFFFF" },
  patchouli: { bg: "#565F32", color: "#FFFFFF" },
  sweet: { bg: "#9E3034", color: "#FFFFFF" },
  aromatic: { bg: "#296C62", color: "#FFFFFF" },
  floral: { bg: "#C86A85", color: "#FFFFFF" },
  "white floral": { bg: "#D8C7A0", color: "#141210" },
  rose: { bg: "#B8556D", color: "#FFFFFF" },
  amber: { bg: "#C88226", color: "#FFFFFF" },
  oud: { bg: "#52321E", color: "#FFFFFF" },
  aquatic: { bg: "#3A8BA6", color: "#FFFFFF" },
  vanilla: { bg: "#CCA148", color: "#141210" },
  musky: { bg: "#7C7980", color: "#FFFFFF" },
  "warm spicy": { bg: "#994320", color: "#FFFFFF" },
  powdery: { bg: "#8E7598", color: "#FFFFFF" },
  leather: { bg: "#68432A", color: "#FFFFFF" },
  smoky: { bg: "#47454A", color: "#FFFFFF" },
  green: { bg: "#4A7A38", color: "#FFFFFF" },
  coffee: { bg: "#4E3220", color: "#FFFFFF" },
  caramel: { bg: "#C68235", color: "#FFFFFF" },
  nutty: { bg: "#9A6B3D", color: "#FFFFFF" },
  clean: { bg: "#8CA2B0", color: "#FFFFFF" },
  fresh: { bg: "#369A8D", color: "#FFFFFF" }
}

export const PRODUCTS: Product[] = [
  {
    id: "sahara-oud",
    slug: "sahara-oud", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Sahara Oud",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Pria",
    badges: ["best", "selection"],
    desc: "Oud hangat yang dibuat tidak berat Cocok untuk acara malam, rapat penting, atau saat kamu ingin dikenang lewat wangi",
    notes: { top: "Safron, Lada Hitam", middle: "Mawar Taif, Cendana", base: "Oud, Amber, Musk" },
    accords: [
      { name: "woody", score: 100 },
      { name: "warm spicy", score: 84 },
      { name: "amber", score: 72 },
      { name: "oud", score: 62 },
      { name: "rose", score: 48 },
      { name: "smoky", score: 36 }
    ],
    colors: ["#8A5A2B", "#4A2C14"],
    variants: [
      { id: "35gr", grams: 35, price: 34000, available: true },
      { id: "50gr", grams: 50, price: 44000, available: true },
      { id: "100gr", grams: 100, price: 78000, available: true }
    ]
  },
  {
    id: "melati-senja",
    slug: "melati-senja", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Melati Senja",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Wanita",
    badges: ["best"],
    desc: "Melati yang mekar pelan menjelang magrib Lembut, bersih, dan tidak menusuk - aman dipakai setiap hari",
    notes: { top: "Bergamot, Pir", middle: "Melati, Ylang-Ylang", base: "Musk Putih, Kayu Cedar" },
    accords: [
      { name: "white floral", score: 100 },
      { name: "floral", score: 85 },
      { name: "citrus", score: 68 },
      { name: "musky", score: 54 },
      { name: "powdery", score: 42 }
    ],
    colors: ["#F3D9E4", "#C98BA8"],
    variants: [
      { id: "35gr", grams: 35, price: 29000, available: true },
      { id: "50gr", grams: 50, price: 37000, available: true },
      { id: "100gr", grams: 100, price: 66000, available: true }
    ]
  },
  {
    id: "kopi-karamel",
    slug: "kopi-karamel", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Kopi Karamel",
    brand: "Grosir Parfum Eropa Kitchen",
    gender: "Unisex",
    badges: ["viral", "best"],
    desc: "Espresso yang ditumpuk karamel dan sedikit garam laut Manisnya pas, tidak bikin enek",
    notes: { top: "Kopi Sangrai, Jeruk Mandarin", middle: "Karamel, Hazelnut", base: "Tonka, Vanila, Musk" },
    accords: [
      { name: "sweet", score: 100 },
      { name: "coffee", score: 88 },
      { name: "caramel", score: 76 },
      { name: "vanilla", score: 68 },
      { name: "warm spicy", score: 50 }
    ],
    colors: ["#C08A4E", "#5A3413"],
    variants: [
      { id: "35gr", grams: 35, price: 29000, available: true },
      { id: "50gr", grams: 50, price: 37000, available: true },
      { id: "100gr", grams: 100, price: 66000, available: false }
    ]
  },
  {
    id: "laut-pagi",
    slug: "laut-pagi", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Laut Pagi",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Pria",
    badges: ["viral"],
    desc: "Aroma udara asin jam enam pagi Ringan, bersih, dan menyegarkan untuk iklim tropis yang panas",
    notes: { top: "Jeruk Nipis, Daun Mint", middle: "Nota Laut, Lavender", base: "Kayu Driftwood, Musk" },
    accords: [
      { name: "aquatic", score: 100 },
      { name: "aromatic", score: 84 },
      { name: "fresh spicy", score: 70 },
      { name: "citrus", score: 65 },
      { name: "woody", score: 46 }
    ],
    colors: ["#A8D8E8", "#2E6E8E"],
    variants: [
      { id: "35gr", grams: 35, price: 24000, available: true },
      { id: "50gr", grams: 50, price: 32000, available: true },
      { id: "100gr", grams: 100, price: 58000, available: true }
    ]
  },
  {
    id: "amber-rindu",
    slug: "amber-rindu", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Amber Rindu",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Unisex",
    badges: ["selection"],
    desc: "Amber resin yang hangat dengan sentuhan rempah manis Wangi pelukan di ruangan ber-AC",
    notes: { top: "Kapulaga, Kayu Manis", middle: "Amber, Labdanum", base: "Benzoin, Vanila, Patchouli" },
    accords: [
      { name: "amber", score: 100 },
      { name: "warm spicy", score: 86 },
      { name: "vanilla", score: 74 },
      { name: "woody", score: 60 },
      { name: "patchouli", score: 48 }
    ],
    colors: ["#E8B961", "#9A5F1C"],
    variants: [
      { id: "35gr", grams: 35, price: 34000, available: true },
      { id: "50gr", grams: 50, price: 44000, available: true },
      { id: "100gr", grams: 100, price: 78000, available: true }
    ]
  },
  {
    id: "peach-ceria",
    slug: "peach-ceria", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Peach Ceria",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Wanita",
    badges: ["new"],
    desc: "Persik matang dan sedikit yoghurt Riang, muda, dan ramah dipakai ke kampus atau kantor",
    notes: { top: "Persik, Leci", middle: "Bunga Jeruk, Freesia", base: "Musk, Kayu Putih Lembut" },
    accords: [
      { name: "fruity", score: 100 },
      { name: "sweet", score: 82 },
      { name: "floral", score: 66 },
      { name: "citrus", score: 54 },
      { name: "musky", score: 42 }
    ],
    colors: ["#FFC9A3", "#E2704F"],
    variants: [
      { id: "35gr", grams: 35, price: 24000, available: true },
      { id: "50gr", grams: 50, price: 32000, available: true },
      { id: "100gr", grams: 100, price: 58000, available: true }
    ]
  },
  {
    id: "cendana-malam",
    slug: "cendana-malam", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Cendana Malam",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Pria",
    badges: ["selection"],
    desc: "Cendana kering dengan asap tipis Tenang, dewasa, dan tahan lama di kain",
    notes: { top: "Juniper, Pala", middle: "Cendana, Vetiver", base: "Cedarwood, Kulit, Musk" },
    accords: [
      { name: "woody", score: 100 },
      { name: "earthy", score: 82 },
      { name: "warm spicy", score: 68 },
      { name: "smoky", score: 56 },
      { name: "leather", score: 44 }
    ],
    colors: ["#B9A281", "#4C3A28"],
    variants: [
      { id: "35gr", grams: 35, price: 29000, available: false },
      { id: "50gr", grams: 50, price: 37000, available: true },
      { id: "100gr", grams: 100, price: 66000, available: true }
    ]
  },
  {
    id: "vanila-sutra",
    slug: "vanila-sutra", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Vanila Sutra",
    brand: "Grosir Parfum Eropa Kitchen",
    gender: "Wanita",
    badges: ["new", "selection"],
    desc: "Vanila Madagaskar yang halus seperti kain sutra, ditutup almond panggang tipis",
    notes: { top: "Almond, Bergamot", middle: "Vanila Bourbon, Heliotrope", base: "Tonka, Sandalwood" },
    accords: [
      { name: "vanilla", score: 100 },
      { name: "sweet", score: 86 },
      { name: "nutty", score: 72 },
      { name: "powdery", score: 58 },
      { name: "woody", score: 46 }
    ],
    colors: ["#F6E3C5", "#C89A5B"],
    variants: [
      { id: "35gr", grams: 35, price: 29000, available: true },
      { id: "50gr", grams: 50, price: 37000, available: true },
      { id: "100gr", grams: 100, price: 66000, available: true }
    ]
  },
  {
    id: "jeruk-bali",
    slug: "jeruk-bali", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Jeruk Bali",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Unisex",
    badges: ["promo", "viral"],
    desc: "Pomelo yang baru dikupas Segar, sedikit pahit di awal, lalu manis dan bersih",
    notes: { top: "Pomelo, Grapefruit", middle: "Neroli, Daun Teh", base: "Musk Bersih, Vetiver" },
    accords: [
      { name: "citrus", score: 100 },
      { name: "fresh spicy", score: 80 },
      { name: "green", score: 66 },
      { name: "aromatic", score: 54 },
      { name: "musky", score: 40 }
    ],
    colors: ["#F5E27A", "#B8912A"],
    variants: [
      { id: "35gr", grams: 35, price: 24000, available: true, promo: { price: 19500, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } },
      { id: "50gr", grams: 50, price: 32000, available: true, promo: { price: 26000, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } },
      { id: "100gr", grams: 100, price: 58000, available: true, promo: { price: 47000, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } }
    ]
  },
  {
    id: "mawar-embun",
    slug: "mawar-embun", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Mawar Embun",
    brand: "Grosir Parfum Eropa Signature",
    gender: "Wanita",
    badges: ["promo"],
    desc: "Mawar yang masih basah embun pagi Anggun tanpa terasa tua",
    notes: { top: "Lychee, Blackcurrant", middle: "Mawar Damask, Peony", base: "Musk, Amber Lembut" },
    accords: [
      { name: "rose", score: 100 },
      { name: "floral", score: 86 },
      { name: "fruity", score: 70 },
      { name: "fresh", score: 55 },
      { name: "musky", score: 42 }
    ],
    colors: ["#EFB8C2", "#A44A62"],
    variants: [
      { id: "35gr", grams: 35, price: 29000, available: true, promo: { price: 23500, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } },
      { id: "50gr", grams: 50, price: 37000, available: false, promo: { price: 30000, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } },
      { id: "100gr", grams: 100, price: 66000, available: true, promo: { price: 53500, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } }
    ]
  },
  {
    id: "kayu-hujan",
    slug: "kayu-hujan", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Kayu Hujan",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Pria",
    badges: ["selection"],
    desc: "Bau tanah dan kayu sesaat setelah hujan reda Netral, maskulin, mudah disukai siapa saja",
    notes: { top: "Nota Petrichor, Bergamot", middle: "Vetiver, Geranium", base: "Cedarwood, Patchouli" },
    accords: [
      { name: "woody", score: 100 },
      { name: "earthy", score: 86 },
      { name: "mossy", score: 75 },
      { name: "fresh spicy", score: 62 },
      { name: "patchouli", score: 50 }
    ],
    colors: ["#9DB0A2", "#3C4C41"],
    variants: [
      { id: "35gr", grams: 35, price: 24000, available: true },
      { id: "50gr", grams: 50, price: 32000, available: true },
      { id: "100gr", grams: 100, price: 58000, available: true }
    ]
  },
  {
    id: "musk-awan",
    slug: "musk-awan", published: true, createdAt: "2026-10-01T00:00:00+07:00",
    name: "Musk Awan",
    brand: "Grosir Parfum Eropa Daily",
    gender: "Unisex",
    badges: ["promo", "new"],
    desc: "Musk bersih seperti handuk yang baru dijemur Karakter lembut untuk pilihan aroma sehari-hari",
    notes: { top: "Aldehid, Pir", middle: "Iris, Musk Putih", base: "Cashmeran, Amber Bening" },
    accords: [
      { name: "musky", score: 100 },
      { name: "powdery", score: 82 },
      { name: "clean", score: 70 },
      { name: "floral", score: 54 },
      { name: "amber", score: 42 }
    ],
    colors: ["#DCDCE4", "#8A8AA0"],
    variants: [
      { id: "35gr", grams: 35, price: 24000, available: true, promo: { price: 19500, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } },
      { id: "50gr", grams: 50, price: 32000, available: true, promo: { price: 26000, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } },
      { id: "100gr", grams: 100, price: 58000, available: true, promo: { price: 47000, startsAt: "2026-10-01T00:00:00+07:00", endsAt: "2026-11-01T00:00:00+07:00" } }
    ]
  }
]

export const GENDER_LIST = ["Pria", "Wanita", "Unisex"] as const

export const COLLECTION_LIST: CollectionItem[] = [
  { key: "viral", name: "Viral", desc: "Aroma yang ramai dibicarakan dan jadi tren saat ini", tint: "#F3E8FF", pick: "kopi-karamel" },
  { key: "new", name: "New Arrival", desc: "Racikan dan varian aroma terbaru yang baru masuk", tint: "#FEF3C7", pick: "peach-ceria" },
  { key: "best", name: "Best Seller", desc: "Pilihan best seller yang ditandai admin", tint: "#E0E7FF", pick: "sahara-oud" },
  { key: "selection", name: "Selection", desc: "Koleksi signature berkarakter mewah dan tahan lama", tint: "#ECFDF5", pick: "amber-rindu" },
  { key: "promo", name: "Promo", desc: "Penawaran harga grosir spesial dengan margin maksimal", tint: "#FEE2E2", pick: "jeruk-bali" }
]
