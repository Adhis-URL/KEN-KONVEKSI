// ==========================================
// KEN KONVEKSI - CHECKOUT
// ==========================================

// ==========================================
// ELEMENT
// ==========================================

const checkoutItems = document.getElementById("checkoutItems");

const checkoutTotalItems = document.querySelector(".order-summary #totalItems");

const checkoutSubtotal = document.querySelector(".order-summary #subtotal");

const shippingPrice = document.getElementById("shippingPrice");

const grandTotal = document.getElementById("grandTotal");

const orderBtn = document.getElementById("orderBtn");

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
    const cart = JSON.parse(sessionStorage.getItem("kenCart")) || [];

    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Gagal membaca keranjang:", error);

    return [];
  }
}

// ==========================================
// AMBIL FOTO UTAMA PRODUK
// ==========================================
//
// Mendukung beberapa format:
// image_url
// image
// image_urls
// images
//
// Kalau produk punya banyak foto,
// foto pertama akan dijadikan foto utama
// untuk order_items.image_url.
//

function getProductImage(item) {
  // ------------------------------------------
  // 1. image_url
  // ------------------------------------------

  if (
    item.image_url &&
    typeof item.image_url === "string" &&
    item.image_url.trim()
  ) {
    return item.image_url.trim();
  }

  // ------------------------------------------
  // 2. image
  // ------------------------------------------

  if (item.image && typeof item.image === "string" && item.image.trim()) {
    return item.image.trim();
  }

  // ------------------------------------------
  // 3. image_urls
  // ------------------------------------------

  if (Array.isArray(item.image_urls)) {
    const firstImage = item.image_urls.find(function (image) {
      return typeof image === "string" && image.trim();
    });

    if (firstImage) {
      return firstImage.trim();
    }
  }

  // ------------------------------------------
  // 4. images
  // ------------------------------------------

  if (Array.isArray(item.images)) {
    const firstImage = item.images.find(function (image) {
      // Kalau array berisi string
      if (typeof image === "string" && image.trim()) {
        return true;
      }

      // Kalau array berisi object
      if (
        image &&
        typeof image === "object" &&
        typeof image.url === "string" &&
        image.url.trim()
      ) {
        return true;
      }

      return false;
    });

    if (typeof firstImage === "string") {
      return firstImage.trim();
    }

    if (firstImage && typeof firstImage === "object" && firstImage.url) {
      return firstImage.url.trim();
    }
  }

  // ------------------------------------------
  // Tidak ada foto
  // ------------------------------------------

  return "";
}

// ==========================================
// CART COUNT
// ==========================================

function updateCartCount() {
  const cart = getCart();

  const total = cart.reduce(function (sum, item) {
    return sum + Math.max(0, Number(item.quantity) || 0);
  }, 0);

  if (cartCount) {
    cartCount.textContent = total;
  }
}

// ==========================================
// RENDER CHECKOUT
// ==========================================

function renderCheckout() {
  const cart = getCart();

  if (!checkoutItems) {
    return;
  }

  // ========================================
  // KERANJANG KOSONG
  // ========================================

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

    if (orderBtn) {
      orderBtn.disabled = true;
    }

    updateSummary();

    return;
  }

  // ========================================
  // AKTIFKAN BUTTON
  // ========================================

  if (orderBtn) {
    orderBtn.disabled = false;
  }

  // ========================================
  // RENDER PRODUK
  // ========================================

  checkoutItems.innerHTML = cart
    .map(function (item) {
      const price = Number(item.price) || 0;

      const quantity = Math.max(1, Number(item.quantity) || 1);

      const total = price * quantity;

      const imageUrl = getProductImage(item);

      return `
        <div class="checkout-product">

          <!-- FOTO PRODUK -->

          <div class="checkout-product-image">

            ${
              imageUrl
                ? `
                  <img
                    src="${escapeHTML(imageUrl)}"
                    alt="${escapeHTML(item.name || "Produk")}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  >

                  <div
                    class="image-placeholder"
                    style="display:none;"
                  >
                    PRODUCT
                  </div>
                `
                : `
                  <div class="image-placeholder">
                    PRODUCT
                  </div>
                `
            }

          </div>


          <!-- INFORMASI PRODUK -->

          <div class="checkout-product-info">

            <h3>
              ${escapeHTML(item.name || "Produk")}
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
                ${quantity}
              </strong>
            </p>

          </div>


          <!-- TOTAL PRODUK -->

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
    const quantity = Math.max(0, Number(item.quantity) || 0);

    const price = Number(item.price) || 0;

    count += quantity;

    subtotalValue += price * quantity;
  });

  // ========================================
  // TOTAL ITEMS
  // ========================================

  if (checkoutTotalItems) {
    checkoutTotalItems.textContent = count;
  }

  // ========================================
  // SUBTOTAL
  // ========================================

  if (checkoutSubtotal) {
    checkoutSubtotal.textContent = formatRupiah(subtotalValue);
  }

  // ========================================
  // ONGKIR
  // ========================================
  //
  // Ongkir masih ditentukan admin.
  //

  if (shippingPrice) {
    shippingPrice.textContent = "Mengikuti Jarak Lokasi";
  }

  // ========================================
  // GRAND TOTAL
  // ========================================
  //
  // Untuk sementara total =
  // subtotal produk.
  //

  if (grandTotal) {
    grandTotal.textContent = formatRupiah(subtotalValue);
  }

  updateCartCount();
}

// ==========================================
// CREATE ORDER
// ==========================================

if (orderBtn) {
  orderBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    // ======================================
    // CEK SUPABASE
    // ======================================

    if (typeof supabaseClient === "undefined") {
      alert("Supabase belum terhubung.");

      return;
    }

    // ======================================
    // GET CART
    // ======================================

    const cart = getCart();

    if (!cart.length) {
      alert("Keranjang masih kosong.");

      return;
    }

    // ======================================
    // FORM PEMBELI
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
    // PAYMENT
    // ======================================

    const payment = document.querySelector('input[name="payment"]:checked');

    const paymentMethod = payment ? payment.value : "COD";

    // ======================================
    // PRODUCT SUBTOTAL
    // ======================================

    const productSubtotal = cart.reduce(function (sum, item) {
      const price = Number(item.price) || 0;

      const quantity = Math.max(1, Number(item.quantity) || 1);

      return sum + price * quantity;
    }, 0);

    // ======================================
    // TOTAL
    // ======================================
    //
    // Ongkir belum diketahui.
    //

    const total = productSubtotal;

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

      // ====================================
      // ORDER ERROR
      // ====================================

      if (orderError) {
        console.error("ORDER ERROR:", orderError);

        throw new Error(orderError.message);
      }

      // ====================================
      // ORDER ITEMS
      // ====================================
      //
      // Foto utama produk disimpan ke
      // order_items.image_url.
      //
      // Ini yang nantinya digunakan
      // Admin Pesanan untuk menampilkan
      // foto produk.
      //

      const orderItems = cart.map(function (item) {
        const imageUrl = getProductImage(item);

        return {
          order_id: order.id,

          product_id: item.id || null,

          product_name: item.name || "Produk",

          price: Number(item.price) || 0,

          quantity: Math.max(1, Number(item.quantity) || 1),

          size: item.size || null,

          // FOTO PRODUK
          image_url: imageUrl || null,
        };
      });

      // ====================================
      // INSERT ORDER ITEMS
      // ====================================

      const { error: itemsError } = await supabaseClient

        .from("order_items")

        .insert(orderItems);

      // ====================================
      // ORDER ITEMS ERROR
      // ====================================

      if (itemsError) {
        console.error("ORDER ITEMS ERROR:", itemsError);

        // Hapus order jika item gagal
        await supabaseClient.from("orders").delete().eq("id", order.id);

        throw new Error(itemsError.message);
      }

      // ====================================
      // SIMPAN ORDER ID
      // ====================================

      let savedOrders = [];

      try {
        savedOrders = JSON.parse(localStorage.getItem("kenOrderIds")) || [];

        if (!Array.isArray(savedOrders)) {
          savedOrders = [];
        }
      } catch (error) {
        savedOrders = [];
      }

      if (!savedOrders.includes(order.id)) {
        savedOrders.push(order.id);
      }

      localStorage.setItem("kenOrderIds", JSON.stringify(savedOrders));

      // ====================================
      // SIMPAN NOMOR PEMBELI
      // ====================================

      localStorage.setItem("kenBuyerPhone", phone);

      // ====================================
      // SIMPAN EMAIL PEMBELI
      // ====================================

      if (email) {
        localStorage.setItem("kenBuyerEmail", email);
      }

      // ====================================
      // CLEAR CART
      // ====================================

      sessionStorage.removeItem("kenCart");

      localStorage.setItem("kenCartCount", "0");

      // ====================================
      // SUCCESS
      // ====================================

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
  });
}

// ==========================================
// INITIAL
// ==========================================

renderCheckout();

updateCartCount();

// ==========================================
// PAGE SHOW
// ==========================================

window.addEventListener("pageshow", function () {
  renderCheckout();

  updateCartCount();
});
