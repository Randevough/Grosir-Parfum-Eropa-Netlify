/* ===========================================================
   Grosir Parfum Eropa - FILE KONFIGURASI
   Ubah SEMUA identitas toko di file ini saja.
   Tidak perlu menyentuh file HTML/CSS/JS lainnya.
   =========================================================== */

const CONFIG = {
  /* --- Identitas brand (placeholder, ganti sesukamu) --- */
  brand: "Grosir Parfum Eropa",
  brandSuffix: "Parfum",
  tagline: "Parfum Isi Ulang",
  sejakTahun: 2019,

  /* --- Kontak & checkout (TIDAK ada payment gateway) --- */
  whatsapp: "6281234567890",          // format internasional tanpa tanda +
  whatsappLabel: "0812-3456-7890",
  email: "halo@arunikaparfum.id",
  instagram: "@arunikaparfum",

  /* --- Rekening (detail lengkap dikirim admin via WA) --- */
  bank: [
    { nama: "BCA", rekening: "1234567890", atasNama: "PT Grosir Parfum Eropa Wangi Nusantara" },
    { nama: "Mandiri", rekening: "9876543210", atasNama: "PT Grosir Parfum Eropa Wangi Nusantara" }
  ],

  /* --- Toko fisik --- */
  toko: [
    { kota: "Jakarta", alamat: "Jl. Melati Raya No. 21, Tebet, Jakarta Selatan", jam: "09.00 - 20.00 WIB" },
    { kota: "Depok", alamat: "Jl. Margonda Raya No. 88, Beji, Depok", jam: "09.00 - 20.00 WIB" }
  ],

  /* --- Aturan grosir --- */
  grosir: {
    minPertamaGram: 1000,   // belanja grosir pertama: minimal 1 kg (1000 gr)
    minBerikutnyaGram: 100, // pembelian berikutnya: minimal 100 gr
    catatanKonversi: "Satuan bibit parfum dalam gram (gr)"
  },

  /* --- Ongkir / pengiriman --- */
  jangkauan: "Seluruh Indonesia & Asia Tenggara",

  /* --- Teks promo berjalan di topbar --- */
  promo: [
    "Harga grosir transparan langsung",
    "Kirim se-Indonesia & Asia Tenggara",
    "Minimal order awal 1 kg (1.000 gr)"
  ],

  /* --- Login admin (prototype, bukan keamanan sungguhan) --- */
  admin: { user: "admin", pass: "arunika123" }
};

window.CONFIG = CONFIG;
