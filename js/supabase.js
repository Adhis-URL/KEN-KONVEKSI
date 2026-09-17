// =====================================================
// KEN KONVEKSI - SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL = "https://zdpkanqgwlmbrkanyrjo.supabase.co";

// GANTI dengan Publishable Key / anon key dari Supabase
const SUPABASE_KEY = "MASUKKAN_KEY_DI_SINI";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
