// ==========================================
// KEN KONVEKSI - CHECKOUT
// SUPABASE VERSION
// ==========================================

const checkoutItems = document.getElementById("checkoutItems");

const checkoutTotalItems = document.querySelector(".order-summary #totalItems");

const checkoutSubtotal = document.querySelector(".order-summary #subtotal");

const shippingPrice = document.getElementById("shippingPrice");

const grandTotal = document.getElementById("grandTotal");

const orderBtn = document.getElementById("orderBtn");

const cartCount = document.getElementById("cartCount");

// ==========================================
// RUPIAH
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
// CART
// ==========================================

function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem("kenCart")) || [];
  } catch (error) {
    return [];
  }
}

// ==========================================
// SHIPPING
// ==========================================

function getShipping() {
  const radio = document.querySelector('input[name="shipping"]:checked');

  return radio ? Number(radio.value) : 15000;
}

// ==========================================
// RENDER CHECKOUT
// ==========================================

function renderCheckout() {
  const cart = getCart();

  if (!checkoutItems) return;

  if (!cart.length) {
    checkoutItems.innerHTML = `
      <div class="checkout-empty">
        <h3>
          Keranjang kosong
        </h3>

        <p>
          Silakan pilih produk terlebih dahulu.
        </p>

        <a href="catalog.html">
          Kembali ke Catalog
        </a>
      </div>
    `;

    updateSummary();

    return;
  }

  checkoutItems.innerHTML = cart
    .map(function (item) {
      const price = Number(item.price) || 0;

      const qty = Number(item.quantity) || 1;

      const total = price * qty;

      // SUPPORT DATA LAMA DAN BARU
      const imageUrl = item.image_url || item.image || "";

      return `
          <div class="checkout-product">

            <div class="checkout-product-image">

              ${
                imageUrl
                  ? `
                    <img
                      src="${escapeHTML(imageUrl)}"
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

            <div class="checkout-product-info">

              <h3>
                ${escapeHTML(item.name)}
              </h3>

              <p>
                ${formatRupiah(price)}
              </p>

              <p>
                Ukuran:
                <strong>
                  ${escapeHTML(item.size || "-")}
                </strong>
              </p>

              <p>
                Jumlah:
                <strong>
                  ${qty}
                </strong>
              </p>

            </div>

            <div class="checkout-product-total">
              ${formatRupiah(total)}
            </div>

          </div>
        `;
    })
    .join("");

  updateSummary();
}

// ==========================================
// SUMMARY
// ==========================================

function updateSummary() {
  const cart = getCart();

  let count = 0;
  let subtotalValue = 0;

  cart.forEach(function (item) {
    const qty = Number(item.quantity) || 0;

    const price = Number(item.price) || 0;

    count += qty;

    subtotalValue += price * qty;
  });

  const shipping = getShipping();

  const total = subtotalValue + shipping;

  if (checkoutTotalItems) {
    checkoutTotalItems.textContent = count;
  }

  if (checkoutSubtotal) {
    checkoutSubtotal.textContent = formatRupiah(subtotalValue);
  }

  if (shippingPrice) {
    shippingPrice.textContent = formatRupiah(shipping);
  }

  if (grandTotal) {
    grandTotal.textContent = formatRupiah(total);
  }

  if (cartCount) {
    cartCount.textContent = count;
  }
}

// ==========================================
// SHIPPING EVENT
// ==========================================

document.querySelectorAll('input[name="shipping"]').forEach(function (radio) {
  radio.addEventListener("change", updateSummary);
});

// ==========================================
// CREATE ORDER
// ==========================================

if (orderBtn) {
  orderBtn.onclick = async function (event) {
    event.preventDefault();

    if (typeof supabaseClient === "undefined") {
      alert("Supabase belum terhubung.");
      return;
    }

    const cart = getCart();

    if (!cart.length) {
      alert("Keranjang masih kosong.");
      return;
    }

    // ======================================
    // FORM
    // ======================================

    const name = document.getElementById("buyerName").value.trim();

    const phone = document.getElementById("buyerPhone").value.trim();

    const email = document.getElementById("buyerEmail").value.trim();

    const address = document.getElementById("address").value.trim();

    const city = document.getElementById("city").value.trim();

    const postalCode = document.getElementById("postalCode").value.trim();

    // ======================================
    // VALIDATION
    // ======================================

    if (!name) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    if (!phone) {
      alert("Nomor WhatsApp wajib diisi.");
      return;
    }

    if (!address) {
      alert("Alamat lengkap wajib diisi.");
      return;
    }

    if (!city) {
      alert("Kota/Kabupaten wajib diisi.");
      return;
    }

    if (!postalCode) {
      alert("Kode pos wajib diisi.");
      return;
    }

    // ======================================
    // SHIPPING
    // ======================================

    const shipping = getShipping();

    // ======================================
    // PAYMENT
    // ======================================

    const payment = document.querySelector('input[name="payment"]:checked');

    const paymentMethod = payment ? payment.value : "COD";

    // ======================================
    // TOTAL
    // ======================================

    const productSubtotal = cart.reduce(function (sum, item) {
      return sum + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);

    const total = productSubtotal + shipping;

    // ======================================
    // BUTTON LOADING
    // ======================================

    orderBtn.disabled = true;

    orderBtn.textContent = "Membuat Pesanan...";

    try {
      // ====================================
      // INSERT ORDER
      // ====================================

      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          customer_name: name,
          phone: phone,
          email: email || null,
          address: address,
          city: city,
          postal_code: postalCode,
          total: total,
          status: "Menunggu Pembayaran",
        })
        .select()
        .single();

      if (orderError) {
        console.error("ORDER ERROR:", orderError);

        throw new Error(orderError.message);
      }

      console.log("ORDER BERHASIL:", order);

      // ====================================
      // INSERT ORDER ITEMS
      // ====================================

      const orderItems = cart.map(function (item) {
        return {
          order_id: order.id,

          product_id: item.id || null,

          product_name: item.name,

          price: Number(item.price) || 0,

          quantity: Number(item.quantity) || 1,

          size: item.size || null,

          // SIMPAN GAMBAR PESANAN
          image_url: item.image_url || item.image || null,
        };
      });

      const { error: itemsError } = await supabaseClient
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("ORDER ITEMS ERROR:", itemsError);

        // Hapus order jika detail gagal
        await supabaseClient.from("orders").delete().eq("id", order.id);

        throw new Error(itemsError.message);
      }

      // ====================================
      // CLEAR CART
      // ====================================

      sessionStorage.removeItem("kenCart");

      alert("Pesanan berhasil dibuat!");

      // ====================================
      // REDIRECT
      // ====================================

      window.location.href = "orders.html";
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      alert("Pesanan gagal dibuat.\n\n" + error.message);

      orderBtn.disabled = false;

      orderBtn.textContent = "Buat Pesanan";
    }
  };
}

// ==========================================
// INITIAL
// ==========================================

renderCheckout();
