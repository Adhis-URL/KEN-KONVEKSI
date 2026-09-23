// ==========================================
// KEN KONVEKSI - CART
// ==========================================

const cartItemsElement = document.getElementById("cartItems");

const emptyCartElement = document.getElementById("emptyCart");

const cartCountElement = document.getElementById("cartCount");

const totalItemsElement = document.getElementById("totalItems");

const subtotalElement = document.getElementById("subtotal");

const shippingElement = document.getElementById("shipping");

const grandTotalElement = document.getElementById("grandTotal");

const checkoutButton = document.getElementById("checkoutBtn");

// ==========================================
// FORMAT RUPIAH
// ==========================================

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// GET CART
// ==========================================

function getCart() {
  try {
    const cart = JSON.parse(sessionStorage.getItem("kenCart")) || [];

    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Gagal membaca cart:", error);

    return [];
  }
}

// ==========================================
// SAVE CART
// ==========================================

function saveCart(cart) {
  sessionStorage.setItem("kenCart", JSON.stringify(cart));

  updateCartCount();
}

// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {
  const cart = getCart();

  const count = cart.reduce(function (total, item) {
    return total + Math.max(0, Number(item.quantity) || 0);
  }, 0);

  if (cartCountElement) {
    cartCountElement.textContent = count;
  }

  document.querySelectorAll(".cart-count").forEach(function (element) {
    element.textContent = count;
  });

  localStorage.setItem("kenCartCount", String(count));
}

// ==========================================
// RENDER CART
// ==========================================

function renderCart() {
  const cart = getCart();

  if (!cartItemsElement) {
    return;
  }

  if (!cart.length) {
    cartItemsElement.innerHTML = "";

    if (emptyCartElement) {
      emptyCartElement.style.display = "block";
    }

    updateSummary();

    return;
  }

  if (emptyCartElement) {
    emptyCartElement.style.display = "none";
  }

  cartItemsElement.innerHTML = cart
    .map(function (item, index) {
      const price = Number(item.price) || 0;

      const quantity = Math.max(1, Number(item.quantity) || 1);

      const subtotal = price * quantity;

      const image = item.image_url || item.image || "";

      return `
          <div class="cart-item">

            <div class="cart-product">

              <div class="cart-product-image">

                ${
                  image
                    ? `
                      <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(item.name)}"
                      >
                    `
                    : `
                      <div class="image-placeholder">
                        PRODUCT
                      </div>
                    `
                }

              </div>

              <div class="cart-product-info">

                <h3>
                  ${escapeHTML(item.name)}
                </h3>

                <p>
                  Ukuran:
                  <strong>
                    ${escapeHTML(item.size || "-")}
                  </strong>
                </p>

                <p>
                  ${formatRupiah(price)}
                </p>

              </div>

            </div>

            <div class="cart-price">
              ${formatRupiah(price)}
            </div>

            <div class="cart-quantity">

              <button
                type="button"
                class="quantity-btn"
                data-action="decrease"
                data-index="${index}"
              >
                −
              </button>

              <span>
                ${quantity}
              </span>

              <button
                type="button"
                class="quantity-btn"
                data-action="increase"
                data-index="${index}"
              >
                +
              </button>

            </div>

            <div class="cart-subtotal">

              ${formatRupiah(subtotal)}

              <button
                type="button"
                class="remove-cart-item"
                data-action="remove"
                data-index="${index}"
                aria-label="Hapus produk"
                title="Hapus produk"
              >
                ×
              </button>

            </div>

          </div>
        `;
    })
    .join("");

  updateSummary();
}

// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {
  const cart = getCart();

  let totalItems = 0;

  let subtotal = 0;

  cart.forEach(function (item) {
    const quantity = Math.max(0, Number(item.quantity) || 0);

    const price = Number(item.price) || 0;

    totalItems += quantity;

    subtotal += price * quantity;
  });

  /*
   * Ongkir belum ditentukan.
   * Jadi jangan masukkan angka
   * "distance" ke perhitungan.
   */

  if (totalItemsElement) {
    totalItemsElement.textContent = totalItems;
  }

  if (subtotalElement) {
    subtotalElement.textContent = formatRupiah(subtotal);
  }

  if (shippingElement) {
    shippingElement.textContent = "Mengikuti Jarak Lokasi";
  }

  if (grandTotalElement) {
    grandTotalElement.textContent = formatRupiah(subtotal);
  }

  if (checkoutButton) {
    checkoutButton.disabled = cart.length === 0;
  }
}

// ==========================================
// CART ACTION
// ==========================================

if (cartItemsElement) {
  cartItemsElement.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.action;

    const index = Number(button.dataset.index);

    const cart = getCart();

    if (!Number.isInteger(index) || !cart[index]) {
      return;
    }

    // DECREASE

    if (action === "decrease") {
      const current = Number(cart[index].quantity) || 1;

      if (current <= 1) {
        const confirmRemove = confirm("Hapus produk ini dari keranjang?");

        if (!confirmRemove) {
          return;
        }

        cart.splice(index, 1);
      } else {
        cart[index].quantity = current - 1;
      }
    }

    // INCREASE

    if (action === "increase") {
      const current = Number(cart[index].quantity) || 1;

      cart[index].quantity = current + 1;
    }

    // REMOVE

    if (action === "remove") {
      const confirmRemove = confirm(
        "Yakin ingin menghapus produk ini dari keranjang?",
      );

      if (!confirmRemove) {
        return;
      }

      cart.splice(index, 1);
    }

    saveCart(cart);

    renderCart();
  });
}

// ==========================================
// CHECKOUT
// ==========================================

if (checkoutButton) {
  checkoutButton.addEventListener("click", function () {
    const cart = getCart();

    if (!cart.length) {
      alert("Keranjang masih kosong.");

      return;
    }

    window.location.href = "checkout.html";
  });
}

// ==========================================
// INITIAL
// ==========================================

renderCart();

updateCartCount();

// ==========================================
// KETIKA KEMBALI KE HALAMAN
// ==========================================

window.addEventListener("pageshow", function () {
  renderCart();

  updateCartCount();
});
