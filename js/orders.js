// =====================================================
// KEN KONVEKSI
// ORDERS SYSTEM - SUPABASE
// =====================================================

// =====================================================
// ELEMENT
// =====================================================

const ordersList = document.getElementById("ordersList");

const emptyOrders = document.getElementById("emptyOrders");

const loadingOrders = document.getElementById("loadingOrders");

const cartCount = document.getElementById("cartCount");

const filterButtons = document.querySelectorAll(".filter-btn");

// =====================================================
// DATA
// =====================================================

let orders = [];

// =====================================================
// RUPIAH
// =====================================================

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(Number(number) || 0);
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {
  switch (status) {
    case "Menunggu Pembayaran":
      return "status-waiting";

    case "Diproses":
      return "status-process";

    case "Dikirim":
      return "status-shipped";

    case "Selesai":
      return "status-complete";

    case "Dibatalkan":
      return "status-cancel";

    default:
      return "";
  }
}

// =====================================================
// LOAD ORDERS FROM SUPABASE
// =====================================================

async function loadOrders() {
  console.log("Memuat pesanan dari Supabase...");

  // Pastikan Supabase tersedia

  if (typeof supabaseClient === "undefined") {
    console.error("supabaseClient tidak tersedia.");

    showError("Supabase belum terhubung.");

    return;
  }

  try {
    // ================================================
    // AMBIL ORDERS
    // ================================================

    const { data: orderData, error: orderError } = await supabaseClient

      .from("orders")

      .select("*")

      .order("created_at", {
        ascending: false,
      });

    if (orderError) {
      console.error("Order error:", orderError);

      showError(orderError.message);

      return;
    }

    orders = Array.isArray(orderData) ? orderData : [];

    console.log("Orders ditemukan:", orders);

    // ================================================
    // KALAU TIDAK ADA ORDER
    // ================================================

    if (orders.length === 0) {
      loadingOrders.style.display = "none";

      emptyOrders.style.display = "block";

      ordersList.innerHTML = "";

      return;
    }

    // ================================================
    // AMBIL ORDER ITEMS
    // ================================================

    const orderIds = orders.map((order) => order.id);

    const { data: itemData, error: itemError } = await supabaseClient

      .from("order_items")

      .select("*")

      .in("order_id", orderIds);

    if (itemError) {
      console.error("Order items error:", itemError);
    }

    const items = Array.isArray(itemData) ? itemData : [];

    console.log("Order items ditemukan:", items);

    // ================================================
    // GABUNGKAN ITEMS KE ORDER
    // ================================================

    orders = orders.map((order) => {
      return {
        ...order,

        items: items.filter((item) => item.order_id === order.id),
      };
    });

    // ================================================
    // SELESAI LOADING
    // ================================================

    loadingOrders.style.display = "none";

    emptyOrders.style.display = "none";

    renderOrders();
  } catch (error) {
    console.error("Load orders error:", error);

    showError(error.message);
  }
}

// =====================================================
// SHOW ERROR
// =====================================================

function showError(message) {
  loadingOrders.style.display = "none";

  emptyOrders.style.display = "none";

  ordersList.innerHTML = `

    <div
      class="empty-orders"
      style="display:block;"
    >

      <div class="empty-order-icon">
        ⚠️
      </div>

      <h2>
        Gagal memuat pesanan
      </h2>

      <p>
        ${escapeHTML(message)}
      </p>

      <button
        type="button"
        onclick="loadOrders()"
        style="
          margin-top:20px;
          padding:12px 24px;
          border:none;
          background:#111;
          color:#fff;
          cursor:pointer;
        "
      >
        Coba Lagi
      </button>

    </div>

  `;
}

// =====================================================
// RENDER ORDERS
// =====================================================

function renderOrders(statusFilter = "all") {
  ordersList.innerHTML = "";

  // ================================================
  // FILTER
  // ================================================

  let filteredOrders;

  if (statusFilter === "all") {
    filteredOrders = orders;
  } else {
    filteredOrders = orders.filter((order) => order.status === statusFilter);
  }

  // ================================================
  // KOSONG
  // ================================================

  if (filteredOrders.length === 0) {
    emptyOrders.style.display = "block";

    return;
  }

  emptyOrders.style.display = "none";

  // ================================================
  // ORDER TERBARU DI ATAS
  // ================================================

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  );

  // ================================================
  // RENDER
  // ================================================

  sortedOrders.forEach((order) => {
    const orderCard = document.createElement("article");

    orderCard.className = "order-card";

    // ============================================
    // PRODUCTS
    // ============================================

    let productsHTML = "";

    const orderItems = Array.isArray(order.items) ? order.items : [];

    orderItems.forEach((item) => {
      const subtotal = Number(item.price || 0) * Number(item.quantity || 0);

      const imageUrl = item.image_url || item.image || "";

      let imageHTML;

      if (imageUrl) {
        imageHTML = `

              <img
                src="${escapeHTML(imageUrl)}"
                alt="${escapeHTML(item.product_name || "Produk")}"
                class="order-product-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<span>PRODUCT</span>';"
              >

            `;
      } else {
        imageHTML = `
              <span>PRODUCT</span>
            `;
      }

      productsHTML += `

            <div class="order-product">

              <div class="order-product-image">

                ${imageHTML}

              </div>


              <div class="order-product-info">

                <h3>
                  ${escapeHTML(item.product_name || item.name || "Produk")}
                </h3>


                <p>
                  Size:
                  ${escapeHTML(item.size || "-")}
                </p>


                <p>
                  Jumlah:
                  ${Number(item.quantity || 0)}
                </p>

              </div>


              <div class="order-product-price">

                ${formatRupiah(subtotal)}

              </div>

            </div>

          `;
    });

    // ============================================
    // KALAU ITEM KOSONG
    // ============================================

    if (!productsHTML) {
      productsHTML = `

          <div class="order-product">

            <div class="order-product-info">

              <p>
                Detail produk tidak ditemukan.
              </p>

            </div>

          </div>

        `;
    }

    // ============================================
    // PAYMENT
    // ============================================

    const payment = order.payment_method || order.payment || "-";

    // ============================================
    // ORDER ID
    // ============================================

    const orderNumber = order.order_code || order.id || "-";

    // ============================================
    // HTML CARD
    // ============================================

    orderCard.innerHTML = `

        <div class="order-card-header">

          <div>

            <div class="order-number">

              ${escapeHTML(orderNumber)}

            </div>


            <div class="order-date">

              ${formatDate(order.created_at)}

            </div>

          </div>


          <div
            class="order-status ${getStatusClass(order.status)}"
          >

            ${escapeHTML(order.status || "Menunggu Pembayaran")}

          </div>

        </div>


        <div class="order-products">

          ${productsHTML}

        </div>


        <div class="order-card-footer">

          <div class="order-payment">

            Pembayaran:

            <strong>
              ${escapeHTML(payment)}
            </strong>

          </div>


          <div class="order-total">

            <span>
              Total Pembayaran
            </span>


            <strong>

              ${formatRupiah(order.total)}

            </strong>

          </div>

        </div>

      `;

    ordersList.appendChild(orderCard);
  });
}

// =====================================================
// FILTER BUTTON
// =====================================================

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) => btn.classList.remove("active"));

    this.classList.add("active");

    const status = this.dataset.status;

    renderOrders(status);
  });
});

// =====================================================
// CART COUNT
// =====================================================

function updateCartCount() {
  let cart = [];

  try {
    cart = JSON.parse(sessionStorage.getItem("kenCart")) || [];
  } catch (error) {
    cart = [];
  }

  let total = 0;

  cart.forEach((item) => {
    total += Number(item.quantity) || 0;
  });

  if (cartCount) {
    cartCount.textContent = total;
  }
}

// =====================================================
// INITIALIZE
// =====================================================

updateCartCount();

loadOrders();
