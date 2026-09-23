/* =====================================================
   SUPABASE CONFIGURATION
   KEN KONVEKSI
===================================================== */

const SUPABASE_URL = "https://zdpkanqgwlmbrkanyrjo.supabase.co";

const SUPABASE_KEY = "sb_publishable_olOOWAKiJRqq--6seYsA5Q_mOjo2CF7";

/* =====================================================
   CREATE SUPABASE CLIENT
===================================================== */

if (!window.supabase) {
  console.error("Supabase CDN belum dimuat.");
} else {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
  );

  console.log("Supabase berhasil terhubung.");
}
