import { StoreConfig } from '../types'

export const CONFIG: StoreConfig = {
  brand: "Grosir Parfum Eropa",
  brandSuffix: "Parfum",
  tagline: "Parfum Isi Ulang",
  sejakTahun: 2019,

  whatsapp: "6281234567890",
  whatsappLabel: "0812-3456-7890",
  email: "halo@arunikaparfum.id",
  instagram: "@arunikaparfum",

  bank: [
    { nama: "BCA", rekening: "1234567890", atasNama: "PT Grosir Parfum Eropa Wangi Nusantara" },
    { nama: "Mandiri", rekening: "9876543210", atasNama: "PT Grosir Parfum Eropa Wangi Nusantara" }
  ],

  toko: [
    { kota: "Jakarta", alamat: "Jl. Melati Raya No. 21, Tebet, Jakarta Selatan", jam: "09.00 - 20.00 WIB" },
    { kota: "Depok", alamat: "Jl. Margonda Raya No. 88, Beji, Depok", jam: "09.00 - 20.00 WIB" }
  ],

  grosir: {
    minPertamaGram: 1000,
    minBerikutnyaGram: 100,
    catatanKonversi: "Satuan bibit parfum dalam gram (gr)"
  },

  jangkauan: "Seluruh Indonesia & Asia Tenggara",

  promo: [
    "Harga grosir transparan langsung",
    "Kirim se-Indonesia & Asia Tenggara",
    "Minimal order awal 1 kg (1.000 gr)"
  ],

  admin: { user: "admin", pass: "arunika123" }
}
