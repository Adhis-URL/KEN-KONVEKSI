(function () {
  /* =====================================================
     CEK LOGIN ADMIN
  ====================================================== */

  const isLoggedIn = sessionStorage.getItem("kenAdminLoggedIn");

  /* =====================================================
     JIKA BELUM LOGIN
  ====================================================== */

  if (isLoggedIn !== "true") {
    window.location.replace("login.html");
  }
})();
