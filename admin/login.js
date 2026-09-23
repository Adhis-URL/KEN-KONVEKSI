/* =====================================================
   KEN KONVEKSI
   ADMIN LOGIN
===================================================== */

"use strict";

/* =====================================================
   SUPABASE
===================================================== */

const supabaseClient = window.supabaseClient;

/* =====================================================
   ELEMENT
===================================================== */

const loginForm = document.getElementById("loginForm");

const loginButton = document.getElementById("loginButton");

const loginError = document.getElementById("loginError");

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

/* =====================================================
   ERROR
===================================================== */

function showError(message) {
  if (!loginError) {
    return;
  }

  loginError.textContent = message;

  loginError.hidden = false;
}

/* =====================================================
   HIDE ERROR
===================================================== */

function hideError() {
  if (!loginError) {
    return;
  }

  loginError.textContent = "";

  loginError.hidden = true;
}

/* =====================================================
   TOGGLE PASSWORD
===================================================== */

if (togglePassword) {
  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";

      togglePassword.textContent = "HIDE";
    } else {
      passwordInput.type = "password";

      togglePassword.textContent = "SHOW";
    }
  });
}

/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    hideError();

    /* ================================================
         CEK SUPABASE
      ================================================= */

    if (!supabaseClient) {
      showError("Supabase belum terhubung.");

      return;
    }

    /* ================================================
         AMBIL INPUT
      ================================================= */

    const email = document.getElementById("username").value.trim();

    const password = passwordInput.value;

    /* ================================================
         BUTTON
      ================================================= */

    loginButton.disabled = true;

    loginButton.textContent = "LOGIN...";

    try {
      /* ==============================================
           LOGIN SUPABASE
        =============================================== */

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,

        password: password,
      });

      /* ==============================================
           ERROR
        =============================================== */

      if (error) {
        console.error("LOGIN ERROR:", error);

        showError(error.message || "Email atau password salah.");

        return;
      }

      /* ==============================================
           BERHASIL
        =============================================== */

      console.log("Login berhasil:", data.user.email);

      window.location.href = "index.html";
    } catch (error) {
      console.error("LOGIN EXCEPTION:", error);

      showError(error.message || "Terjadi kesalahan saat login.");
    } finally {
      loginButton.disabled = false;

      loginButton.textContent = "LOGIN";
    }
  });
}
