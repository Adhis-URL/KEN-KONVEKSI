// ==========================================
// KEN KONVEKSI - CART
// FINAL VERSION
// ==========================================

const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");

const totalItems = document.getElementById("totalItems");
const subtotal = document.getElementById("subtotal");
const shipping = document.getElementById("shipping");
const grandTotal = document.getElementById("grandTotal");

const checkoutBtn = document.getElementById("checkoutBtn");
const cartCount = document.getElementById("cartCount");

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
    const data = sessionStorage.getItem("kenCart");

    if (!data) {
      return [];
    }

    const cart = JSON.parse(data);

    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Gagal membaca keranjang:", error);

    return [];
  }
}

// ==========================================
// SAVE CART
// ==========================================

function saveCart(cart) {
  try {
    sessionStorage.setItem("kenCart", JSON.stringify(cart));

    return true;
  } catch (error) {
    console.error("Gagal menyimpan keranjang:", error);

    alert("Keranjang tidak dapat disimpan.");

    return false;
  }
}

// ==========================================
// GET PRODUCT IMAGE
// ==========================================

function getProductImage(item) {
  // Prioritas utama image_url
  if (item.image_url && String(item.image_url).trim() !== "") {
    return String(item.image_url);
  }

  // Support data lama
  if (item.image && String(item.image).trim() !== "") {
    return String(item.image);
  }

  return "";
}

// ==========================================
// RENDER IMAGE
// ==========================================

function renderProductImage(item) {
  const imageUrl = getProductImage(item);

  if (!imageUrl) {
    return `
      <div class="image-placeholder">
        PRODUCT
      </div>
    `;
  }

  return `
    <img
      src="${escapeHTML(imageUrl)}"
      alt="${escapeHTML(item.name || "Produk")}"
      class="cart-product-img"
      loading="lazy"
      onerror="handleCartImageError(this)"
    >

    <div
      class="image-placeholder cart-image-fallback"
      style="display:none;"
    >
      PRODUCT
    </div>
  `;
}

// ==========================================
// IMAGE ERROR
// ==========================================

function handleCartImageError(image) {
  image.style.display = "none";

  const fallback = image.nextElementSibling;

  if (fallback) {
    fallback.style.display = "flex";
  }
}

// ==========================================
// RENDER CART
// ==========================================

function renderCart() {
  const cart = getCart();

  // ========================================
  // CART KOSONG
  // ========================================

  if (!cart.length) {
    if (cartItems) {
      cartItems.innerHTML = "";
    }

    if (emptyCart) {
      emptyCart.style.display = "block";
    }

    updateSummary();

    return;
  }

  // ========================================
  // CART ADA ISI
  // ========================================

  if (emptyCart) {
    emptyCart.style.display = "none";
  }

  if (!cartItems) {
    return;
  }

  cartItems.innerHTML = cart
    .map(function (item, index) {
      const price = Number(item.price) || 0;

      const quantity = Number(item.quantity) || 1;

      const itemTotal = price * quantity;

      const imageHTML = renderProductImage(item);

      return `
        <div class="cart-product">

          <!-- ========================= -->
          <!-- FOTO PRODUK -->
          <!-- ========================= -->

          <div class="cart-product-image">
            ${imageHTML}
          </div>


          <!-- ========================= -->
          <!-- INFORMASI PRODUK -->
          <!-- ========================= -->

          <div class="cart-product-info">

            <h3>
              ${escapeHTML(item.name || "Produk")}
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


          <!-- ========================= -->
          <!-- QUANTITY -->
          <!-- ========================= -->

          <div class="cart-quantity-control">

            <button
              type="button"
              class="cart-minus"
              data-index="${index}"
            >
              −
            </button>

            <span>
              ${quantity}
            </span>

            <button
              type="button"
              class="cart-plus"
              data-index="${index}"
            >
              +
            </button>

          </div>


          <!-- ========================= -->
          <!-- SUBTOTAL -->
          <!-- ========================= -->

          <div class="cart-subtotal">
            ${formatRupiah(itemTotal)}
          </div>


          <!-- ========================= -->
          <!-- REMOVE -->
          <!-- ========================= -->

          <button
            type="button"
            class="remove-cart"
            data-index="${index}"
            aria-label="Hapus produk"
          >
            ×
          </button>

        </div>
      `;
    })
    .join("");

  // ========================================
  // BUTTON EVENT
  // ========================================

  attachCartEvents();

  // ========================================
  // UPDATE SUMMARY
  // ========================================

  updateSummary();
}

// ==========================================
// CART EVENTS
// ==========================================

function attachCartEvents() {
  // ========================================
  // MINUS
  // ========================================

  document.querySelectorAll(".cart-minus").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(button.dataset.index);

      changeQuantity(index, -1);
    });
  });

  // ========================================
  // PLUS
  // ========================================

  document.querySelectorAll(".cart-plus").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(button.dataset.index);

      changeQuantity(index, 1);
    });
  });

  // ========================================
  // REMOVE
  // ========================================

  document.querySelectorAll(".remove-cart").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(button.dataset.index);

      removeItem(index);
    });
  });
}

// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeQuantity(index, change) {
  const cart = getCart();

  if (!cart[index]) {
    return;
  }

  let quantity = Number(cart[index].quantity) || 1;

  quantity += change;

  // Minimal quantity
  if (quantity < 1) {
    quantity = 1;
  }

  // ========================================
  // CHECK STOCK DARI SUPABASE
  // ========================================

  if (change > 0 && cart[index].stock) {
    const stock = Number(cart[index].stock) || 0;

    if (quantity > stock) {
      quantity = stock;

      alert(`Maksimal pembelian ${stock} barang.`);
    }
  }

  cart[index].quantity = quantity;

  if (saveCart(cart)) {
    renderCart();
  }
}

// ==========================================
// REMOVE ITEM
// ==========================================

function removeItem(index) {
  const cart = getCart();

  if (!cart[index]) {
    return;
  }

  cart.splice(index, 1);

  if (saveCart(cart)) {
    renderCart();
  }
}

// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {
  const cart = getCart();

  let itemCount = 0;
  let total = 0;

  cart.forEach(function (item) {
    const quantity = Number(item.quantity) || 0;

    const price = Number(item.price) || 0;

    itemCount += quantity;

    total += price * quantity;
  });

  // Saat di cart, ongkir belum dipilih
  const shippingCost = 0;

  if (totalItems) {
    totalItems.textContent = itemCount;
  }

  if (subtotal) {
    subtotal.textContent = formatRupiah(total);
  }

  if (shipping) {
    shipping.textContent = formatRupiah(shippingCost);
  }

  if (grandTotal) {
    grandTotal.textContent = formatRupiah(total + shippingCost);
  }

  // Navbar cart count
  if (cartCount) {
    cartCount.textContent = itemCount;
  }
}

// ==========================================
// CHECKOUT
// ==========================================

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    const cart = getCart();

    if (!cart.length) {
      alert("Keranjang masih kosong.");

      return;
    }

    window.location.href = "checkout.html";
  });
}

// ==========================================
// INITIALIZE
// ==========================================

renderCart();
