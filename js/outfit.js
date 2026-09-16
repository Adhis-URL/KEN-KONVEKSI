document.addEventListener("DOMContentLoaded", function () {
  /* =====================================================
     ELEMENT
  ====================================================== */

  const outfitGrid = document.getElementById("outfitGrid");

  const outfitEmpty = document.getElementById("outfitEmpty");

  const outfitCount = document.getElementById("outfitCount");

  const cartCount = document.querySelector(".cart-count");

  /* =====================================================
     AMBIL PRODUK
  ====================================================== */

  const products = JSON.parse(localStorage.getItem("kenProducts")) || [];

  /* =====================================================
     UPDATE CART COUNT
  ====================================================== */

  function updateCartCount() {
    if (!cartCount) {
      return;
    }

    const cart = JSON.parse(localStorage.getItem("kenCart")) || [];

    const total = cart.reduce(function (sum, item) {
      return sum + (Number(item.quantity) || 0);
    }, 0);

    cartCount.textContent = total;
  }

  /* =====================================================
     KUMPULKAN OUTFIT
  ====================================================== */

  const outfitList = [];

  products.forEach(function (product) {
    /*
      =====================================================
      PENTING

      OUTFIT PAGE HANYA MENGAMBIL:

      product.outfits

      BUKAN:

      product.image
      =====================================================
    */

    if (!Array.isArray(product.outfits)) {
      return;
    }

    if (product.outfits.length === 0) {
      return;
    }

    product.outfits.forEach(function (outfitImage) {
      if (!outfitImage) {
        return;
      }

      outfitList.push({
        productId: product.id,

        productName: product.name || "Produk KEN KONVEKSI",

        category: product.category || "CLOTHING",

        image: outfitImage,
      });
    });
  });

  /* =====================================================
     JUMLAH OUTFIT
  ====================================================== */

  outfitCount.textContent = outfitList.length;

  /* =====================================================
     JIKA TIDAK ADA OUTFIT
  ====================================================== */

  if (outfitList.length === 0) {
    outfitGrid.innerHTML = "";

    outfitEmpty.hidden = false;

    updateCartCount();

    return;
  }

  /* =====================================================
     TAMPILKAN OUTFIT
  ====================================================== */

  outfitEmpty.hidden = true;

  outfitGrid.innerHTML = outfitList
    .map(function (outfit, index) {
      const productUrl =
        "product.html?id=" + encodeURIComponent(outfit.productId);

      return `

          <article class="outfit-card">

            <a
              href="${productUrl}"
              title="Lihat ${escapeHTML(outfit.productName)}"
            >

              <!-- NOMOR -->

              <span class="outfit-number">

                ${String(index + 1).padStart(2, "0")}

              </span>


              <!-- FOTO OUTFIT -->

              <img
                src="${outfit.image}"
                alt="Outfit ${escapeHTML(outfit.productName)}"
                loading="lazy"
              />


              <!-- INFORMASI -->

              <div class="outfit-overlay">

                <h3 class="outfit-name">

                  ${escapeHTML(outfit.productName)}

                </h3>


                <p class="outfit-category">

                  ${escapeHTML(String(outfit.category).toUpperCase())}

                </p>

              </div>

            </a>

          </article>

        `;
    })
    .join("");

  /* =====================================================
     ESCAPE HTML
  ====================================================== */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");
  }

  /* =====================================================
     CART
  ====================================================== */

  updateCartCount();
});
