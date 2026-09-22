/* =====================================================
   KEN KONVEKSI
   ADMIN AUTH PROTECTION
   SUPABASE AUTH
===================================================== */


/* =====================================================
   CHECK ADMIN SESSION
===================================================== */

(async function () {

  try {

    /* =================================================
       CEK SESSION SUPABASE
    ================================================= */

    const {
      data: { session },
      error
    } = await supabaseClient.auth.getSession();


    /* =================================================
       ERROR
    ================================================= */

    if (error) {

      console.error(
        "Auth session error:",
        error
      );

      window.location.replace(
        "login.html"
      );

      return;

    }


    /* =================================================
       BELUM LOGIN
    ================================================= */

    if (!session) {

      window.location.replace(
        "login.html"
      );

      return;

    }


    /* =================================================
       SUDAH LOGIN
    ================================================= */

    console.log(
      "Admin berhasil login:",
      session.user.email
    );


    /* =================================================
       OPTIONAL:
       TAMPILKAN EMAIL ADMIN
    ================================================= */

    const adminUser =
      document.querySelector(
        ".admin-user"
      );

    if (adminUser) {

      adminUser.textContent =
        session.user.email;

    }

  } catch (error) {

    console.error(
      "Auth error:",
      error
    );

    window.location.replace(
      "login.html"
    );

  }

})();