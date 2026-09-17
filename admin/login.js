document.addEventListener("DOMContentLoaded", function () {
  /* =====================================================
     ADMIN ACCOUNT
  ====================================================== */

  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "kenkonveksi123";

  /* =====================================================
     ELEMENT
  ====================================================== */

  const loginForm = document.getElementById("loginForm");

  const usernameInput = document.getElementById("username");

  const passwordInput = document.getElementById("password");

  const loginButton = document.getElementById("loginButton");

  const loginError = document.getElementById("loginError");

  const togglePassword = document.getElementById("togglePassword");

  /* =====================================================
     JIKA SUDAH LOGIN
  ====================================================== */

  const isLoggedIn = sessionStorage.getItem("kenAdminLoggedIn");

  if (isLoggedIn === "true") {
    window.location.href = "index.html";

    return;
  }

  /* =====================================================
     TOGGLE PASSWORD
  ====================================================== */

  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";

      togglePassword.textContent = "HIDE";

      togglePassword.setAttribute("aria-label", "Sembunyikan password");
    } else {
      passwordInput.type = "password";

      togglePassword.textContent = "SHOW";

      togglePassword.setAttribute("aria-label", "Tampilkan password");
    }
  });

  /* =====================================================
     LOGIN
  ====================================================== */

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    const password = passwordInput.value;

    /* ================================================
         RESET ERROR
      ================================================= */

    loginError.hidden = true;

    loginError.textContent = "";

    /* ================================================
         VALIDASI KOSONG
      ================================================= */

    if (!username) {
      showError("Username wajib diisi.");

      usernameInput.focus();

      return;
    }

    if (!password) {
      showError("Password wajib diisi.");

      passwordInput.focus();

      return;
    }

    /* ================================================
         DISABLE BUTTON
      ================================================= */

    loginButton.disabled = true;

    loginButton.textContent = "CHECKING...";

    /* ================================================
         CEK USERNAME + PASSWORD
      ================================================= */

    setTimeout(function () {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        /* ============================================
             SIMPAN STATUS LOGIN
          ============================================= */

        sessionStorage.setItem("kenAdminLoggedIn", "true");

        /* ============================================
             SIMPAN USERNAME
          ============================================= */

        sessionStorage.setItem("kenAdminUsername", username);

        /* ============================================
             MASUK DASHBOARD
          ============================================= */

        window.location.href = "index.html";
      } else {
        showError("Username atau password salah.");

        passwordInput.value = "";

        passwordInput.focus();

        loginButton.disabled = false;

        loginButton.textContent = "LOGIN";
      }
    }, 400);
  });

  /* =====================================================
     SHOW ERROR
  ====================================================== */

  function showError(message) {
    loginError.textContent = message;

    loginError.hidden = false;
  }
});
