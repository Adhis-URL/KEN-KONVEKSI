function adminLogout() {
  /* =====================================================
     HAPUS SESSION ADMIN
  ====================================================== */

  sessionStorage.removeItem("kenAdminLoggedIn");

  sessionStorage.removeItem("kenAdminUsername");

  /* =====================================================
     KEMBALI KE LOGIN
  ====================================================== */

  window.location.replace("login.html");
}
