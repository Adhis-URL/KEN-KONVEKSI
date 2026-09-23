// ==========================================
// KEN KONVEKSI - ORDERS
// ==========================================

const ordersList = document.getElementById("ordersList");

const loadingOrders = document.getElementById("loadingOrders");

const emptyOrders = document.getElementById("emptyOrders");

const cartCount = document.getElementById("cartCount");

const filterButtons = document.querySelectorAll(".filter-btn");

let allOrders = [];

let currentStatus = "all";

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
// CART COUNT
// ==========================================

function updateCartCount() {
  try {
    const cart = JSON.parse(sessionStorage.getItem("kenCart")) || [];

    const total = cart.reduce(function (sum, item) {
      return sum + Math.max(0, Number(item.quantity) || 0);
    }, 0);

    if (cartCount) {
      cartCount.textContent = total;
    }
  } catch (error) {
    if (cartCount) {
      cartCount.textContent = "0";
    }
  }
}

// ==========================================
// GET SAVED ORDER IDS
// ==========================================

function getSavedOrderIds() {
  try {
    const ids = JSON.parse(localStorage.getItem("kenOrderIds")) || [];

    if (!Array.isArray(ids)) {
      return [];
    }

    return ids;
  } catch (error) {
    return [];
  }
}

// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {
  if (!ordersList || !loadingOrders || !emptyOrders) {
    return;
  }

  loadingOrders.style.display = "block";

  emptyOrders.style.display = "none";

  ordersList.innerHTML = "";

  const orderIds = getSavedOrderIds();

  /*
   * Kalau belum pernah melakukan
   * order dari browser ini.
   */

  if (!orderIds.length) {
    loadingOrders.style.display = "none";

    emptyOrders.style.display = "block";

    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .select(
        `
          *,
          order_items (
            id,
            product_id,
            product_name,
            price,
            quantity,
            size,
            image_url
          )
          `,
      )
      .in("id", orderIds)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("LOAD ORDERS ERROR:", error);

      throw new Error(error.message);
    }

    allOrders = Array.isArray(data) ? data : [];

    loadingOrders.style.display = "none";

    renderOrders();
  } catch (error) {
    console.error(error);

    loadingOrders.style.display = "none";

    ordersList.innerHTML = `
      <div class="empty-orders">

        <div class="empty-order-icon">
          ⚠️
        </div>

        <h2>
          Gagal memuat pesanan
        </h2>

        <p>
          ${escapeHTML(error.message)}
        </p>

        <button
          type="button"
          onclick="loadOrders()"
        >
          Coba Lagi
        </button>

      </div>
    `;
  }
}

// ==========================================
// RENDER ORDERS
// ==========================================

function renderOrders() {
  if (!ordersList) {
    return;
  }

  let orders = [...allOrders];

  if (currentStatus !== "all") {
    orders = orders.filter(function (order) {
      return order.status === currentStatus;
    });
  }

  if (!orders.length) {
    ordersList.innerHTML = `
      <div class="empty-orders">

        <div class="empty-order-icon">
          📦
        </div>

        <h2>
          Tidak ada pesanan
        </h2>

        <p>
          Belum ada pesanan dengan status ini.
        </p>

      </div>
    `;

    return;
  }

  ordersList.innerHTML = orders
    .map(function (order) {
      const createdAt = order.created_at
        ? new Date(order.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "-";

      const status = order.status || "Menunggu Pembayaran";

      const items = Array.isArray(order.order_items) ? order.order_items : [];

      const itemsHTML = items
        .map(function (item) {
          const image = item.image_url || "";

          const price = Number(item.price) || 0;

          const quantity = Number(item.quantity) || 1;

          return `
                    <div class="order-product">

                      <div class="order-product-image">

                        ${
                          image
                            ? `
                              <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(item.product_name)}"
                              >
                            `
                            : `
                              <div class="image-placeholder">
                                PRODUCT
                              </div>
                            `
                        }

                      </div>

                      <div class="order-product-info">

                        <h3>
                          ${escapeHTML(item.product_name)}
                        </h3>

                        <p>
                          Size:
                          ${escapeHTML(item.size || "-")}
                        </p>

                        <p>
                          Jumlah:
                          ${quantity}
                        </p>

                      </div>

                      <strong class="order-product-price">
                        ${formatRupiah(price * quantity)}
                      </strong>

                    </div>
                  `;
        })
        .join("");

      return `
            <article class="order-card">

              <div class="order-card-header">

                <div>

                  <strong>
                    ${escapeHTML(order.id)}
                  </strong>

                  <p>
                    ${createdAt}
                  </p>

                </div>

                <span class="order-status">
                  ${escapeHTML(status)}
                </span>

              </div>

              <div class="order-card-body">

                ${
                  itemsHTML ||
                  `
                    <p>
                      Tidak ada detail produk.
                    </p>
                  `
                }

              </div>

              <div class="order-card-footer">

                <span>
                  Total Pembayaran
                </span>

                <strong>
                  ${formatRupiah(order.total)}
                </strong>

              </div>

            </article>
          `;
    })
    .join("");
}

// ==========================================
// FILTER
// ==========================================

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    currentStatus = button.dataset.status || "all";

    renderOrders();
  });
});

// ==========================================
// INITIAL
// ==========================================

updateCartCount();

loadOrders();

window.addEventListener("pageshow", function () {
  updateCartCount();

  loadOrders();
});
