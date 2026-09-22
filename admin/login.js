/* =====================================================
   KEN KONVEKSI
   ADMIN LOGIN - SUPABASE AUTH
===================================================== */

/* =====================================================
   ELEMENT
===================================================== */

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");

/* =====================================================
   SHOW ERROR
===================================================== */

function showLoginError(message) {
  loginError.textContent = message;
  loginError.hidden = false;
}

/* =====================================================
   HIDE ERROR
===================================================== */

function hideLoginError() {
  loginError.textContent = "";
  loginError.hidden = true;
}

/* =====================================================
   CHECK EXISTING SESSION
===================================================== */

async function checkExistingSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error) {
      console.error("SESSION ERROR:", error);

      return;
    }

    if (session) {
      console.log("SESSION DITEMUKAN:", session.user.email);

      window.location.replace("index.html");
    }
  } catch (error) {
    console.error("CHECK SESSION ERROR:", error);
  }
}

/* =====================================================
   LOGIN FORM
===================================================== */

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  hideLoginError();

  /* =================================================
       GET INPUT
    ================================================= */

  const email = usernameInput.value.trim();

  const password = passwordInput.value;

  console.log("================================");

  console.log("KEN KONVEKSI LOGIN");

  console.log("Email:", email);

  console.log("Mencoba login ke Supabase...");

  /* =================================================
       VALIDATION
    ================================================= */

  if (!email || !password) {
    showLoginError("Email dan password wajib diisi.");

    return;
  }

  /* =================================================
       LOADING
    ================================================= */

  loginButton.disabled = true;

  loginButton.textContent = "LOGIN...";

  try {
    /* ===============================================
         SUPABASE LOGIN
      =============================================== */

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,

      password: password,
    });

    /* ===============================================
         TAMPILKAN RESPONSE KE CONSOLE
      =============================================== */

    console.log("LOGIN DATA:", data);

    console.log("LOGIN ERROR:", error);

    /* ===============================================
         ERROR
      =============================================== */

    if (error) {
      console.error("SUPABASE ERROR:", error);

      /*
       * Untuk sementara kita tampilkan
       * error asli dari Supabase.
       */

      showLoginError(error.message);

      loginButton.disabled = false;

      loginButton.textContent = "LOGIN";

      return;
    }

    /* ===============================================
         LOGIN BERHASIL
      =============================================== */

    if (data && data.session) {
      console.log("================================");

      console.log("LOGIN BERHASIL!");

      console.log("User:", data.user.email);

      console.log("================================");

      loginButton.textContent = "BERHASIL...";

      window.location.replace("index.html");

      return;
    }

    /* ===============================================
         SESSION TIDAK DITEMUKAN
      =============================================== */

    console.error("Login berhasil tetapi session tidak ditemukan.");

    showLoginError("Login gagal. Session tidak ditemukan.");

    loginButton.disabled = false;

    loginButton.textContent = "LOGIN";
  } catch (error) {
    console.error("LOGIN EXCEPTION:", error);

    showLoginError(error.message || "Terjadi kesalahan saat login.");

    loginButton.disabled = false;

    loginButton.textContent = "LOGIN";
  }
});

/* =====================================================
   SHOW / HIDE PASSWORD
===================================================== */

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
   START
===================================================== */

checkExistingSession();
