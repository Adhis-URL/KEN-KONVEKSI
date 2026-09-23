/* =====================================================
   KEN KONVEKSI
   ADMIN AUTHENTICATION
===================================================== */

(function () {
  "use strict";

  /* ===================================================
     CEK SUPABASE CLIENT
  =================================================== */

  if (!window.supabaseClient) {
    console.error("Supabase Client belum tersedia.");

    return;
  }

  const supabaseClient = window.supabaseClient;

  /* ===================================================
     CEK SESSION
  =================================================== */

  async function checkAdminSession() {
    try {
      const { data, error } = await supabaseClient.auth.getSession();

      /* ===============================================
         ERROR
      =============================================== */

      if (error) {
        console.error("Gagal mengecek session:", error);

        window.location.replace("login.html");

        return;
      }

      /* ===============================================
         TIDAK ADA SESSION
      =============================================== */

      if (!data || !data.session) {
        console.warn("Tidak ada session admin.");

        window.location.replace("login.html");

        return;
      }

      /* ===============================================
         SESSION VALID
      =============================================== */

      console.log("Admin berhasil terautentikasi:", data.session.user.email);

      /* ===============================================
         TAMPILKAN EMAIL ADMIN
      =============================================== */

      const adminUser = document.querySelector(".admin-user");

      if (adminUser) {
        adminUser.textContent = data.session.user.email;
      }
    } catch (error) {
      console.error("AUTH ERROR:", error);

      window.location.replace("login.html");
    }
  }

  /* ===================================================
     JALANKAN
  =================================================== */

  checkAdminSession();
})();
