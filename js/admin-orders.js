// =====================================================
// KEN KONVEKSI - ADMIN ORDERS
// SUPABASE VERSION
// =====================================================

const adminOrders = document.getElementById("adminOrders");

const filterButtons = document.querySelectorAll(".admin-filter");

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
// DATE
// =====================================================

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {
  if (status === "Menunggu Pembayaran") {
    return "waiting";
  }

  if (status === "Diproses") {
    return "process";
  }

  if (status === "Dikirim") {
    return "shipped";
  }

  if (status === "Selesai") {
    return "complete";
  }

  if (status === "Dibatalkan") {
    return "cancel";
  }

  return "";
}

// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {
  if (typeof supabaseClient === "undefined") {
    adminOrders.innerHTML = `

      <div class="admin-orders-empty">

        <h3>
          Supabase belum terhubung
        </h3>

        <p>
          Periksa konfigurasi Supabase.
        </p>

      </div>

    `;

    return;
  }

  try {
    // ==========================================
    // ORDERS
    // ==========================================

    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (orderError) {
      throw orderError;
    }

    orders = Array.isArray(orderData) ? orderData : [];

    if (orders.length === 0) {
      renderOrders("all");

      return;
    }

    // ==========================================
    // ORDER ITEMS
    // ==========================================

    const orderIds = orders.map((order) => order.id);

    const { data: itemData, error: itemError } = await supabaseClient
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemError) {
      throw itemError;
    }

    // ==========================================
    // PRODUCT IMAGES
    // ==========================================

    const productIds = [
      ...new Set(
        (itemData || []).map((item) => item.product_id).filter(Boolean),
      ),
    ];

    let productImages = {};

    if (productIds.length > 0) {
      const { data: products } = await supabaseClient
        .from("products")
        .select("id,image_url")
        .in("id", productIds);

      (products || []).forEach((product) => {
        productImages[product.id] = product.image_url || "";
      });
    }

    // ==========================================
    // GROUP ITEMS
    // ==========================================

    const itemsByOrder = {};

    (itemData || []).forEach((item) => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }

      itemsByOrder[item.order_id].push({
        ...item,

        image_url: item.image_url || productImages[item.product_id] || "",
      });
    });

    // ==========================================
    // GABUNG
    // ==========================================

    orders = orders.map((order) => ({
      ...order,

      items: itemsByOrder[order.id] || [],
    }));

    renderOrders("all");
  } catch (error) {
    console.error("Admin orders error:", error);

    adminOrders.innerHTML = `

      <div class="admin-orders-empty">

        <h3>
          Gagal memuat pesanan
        </h3>

        <p>
          ${escapeHTML(error.message)}
        </p>

      </div>

    `;
  }
}

// =====================================================
// RENDER
// =====================================================

function renderOrders(statusFilter = "all") {
  adminOrders.innerHTML = "";

  let filteredOrders;

  if (statusFilter === "all") {
    filteredOrders = orders;
  } else {
    filteredOrders = orders.filter((order) => order.status === statusFilter);
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (filteredOrders.length === 0) {
    adminOrders.innerHTML = `

      <div class="admin-orders-empty">

        <h3>
          Belum ada pesanan
        </h3>

        <p>
          Pesanan customer akan muncul di sini.
        </p>

      </div>

    `;

    return;
  }

  // ==========================================
  // ORDER CARD
  // ==========================================

  filteredOrders.forEach((order) => {
    let productsHTML = "";

    // ========================================
    // PRODUCTS
    // ========================================

    if (!order.items || order.items.length === 0) {
      productsHTML = `

          <div class="admin-product">

            <div class="admin-product-info">

              <h3>
                Detail produk tidak ditemukan
              </h3>

            </div>

          </div>

        `;
    } else {
      order.items.forEach((item) => {
        const price = Number(item.price) || 0;

        const quantity = Number(item.quantity) || 0;

        const itemTotal = price * quantity;

        const image = item.image_url || "";

        productsHTML += `

              <div
                class="admin-product"
              >

                <div
                  class="admin-product-image"
                >

                  ${
                    image
                      ? `
                        <img
                          src="${escapeHTML(image)}"
                          alt="${escapeHTML(item.product_name)}"
                          onerror="
                            this.style.display='none';
                          "
                        />
                      `
                      : `
                        <div class="image-placeholder">
                          PRODUCT
                        </div>
                      `
                  }

                </div>


                <div
                  class="admin-product-info"
                >

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

                  <p>
                    Harga:
                    ${formatRupiah(price)}
                  </p>

                </div>


                <div
                  class="admin-product-price"
                >

                  ${formatRupiah(itemTotal)}

                </div>

              </div>

            `;
      });
    }

    // ========================================
    // CARD
    // ========================================

    const card = document.createElement("article");

    card.className = "admin-order-card";

    card.innerHTML = `

        <div
          class="admin-order-header"
        >

          <div>

            <div
              class="admin-order-id"
            >

              ${escapeHTML(order.id)}

            </div>

            <div
              class="admin-order-date"
            >

              ${formatDate(order.created_at)}

            </div>

          </div>


          <div
            class="admin-status
            ${getStatusClass(order.status)}"
          >

            ${escapeHTML(order.status)}

          </div>

        </div>


        <div
          class="admin-order-content"
        >


          <!-- PRODUCTS -->

          <div
            class="admin-products"
          >

            ${productsHTML}

          </div>


          <!-- CUSTOMER -->

          <div
            class="customer-info"
          >

            <h3>
              Informasi Pembeli
            </h3>


            <div
              class="customer-row"
            >

              <span>
                Nama
              </span>

              <strong>
                ${escapeHTML(order.customer_name)}
              </strong>

            </div>


            <div
              class="customer-row"
            >

              <span>
                WhatsApp
              </span>

              <strong>
                ${escapeHTML(order.phone)}
              </strong>

            </div>


            <div
              class="customer-row"
            >

              <span>
                Email
              </span>

              <strong>
                ${escapeHTML(order.email || "-")}
              </strong>

            </div>


            <div
              class="customer-row"
            >

              <span>
                Alamat
              </span>

              <strong
                class="customer-address"
              >

                ${escapeHTML(order.address)}

                <br />

                ${escapeHTML(order.city || "")}

                <br />

                ${escapeHTML(order.postal_code || "")}

              </strong>

            </div>


          </div>


        </div>


        <!-- FOOTER -->

        <div
          class="admin-order-footer"
        >


          <div
            class="status-control"
          >

            <label>
              Ubah Status
            </label>


            <select
              class="status-select"
              data-id="${escapeHTML(order.id)}"
            >

              <option
                value="Menunggu Pembayaran"
                ${order.status === "Menunggu Pembayaran" ? "selected" : ""}
              >
                Menunggu Pembayaran
              </option>


              <option
                value="Diproses"
                ${order.status === "Diproses" ? "selected" : ""}
              >
                Diproses
              </option>


              <option
                value="Dikirim"
                ${order.status === "Dikirim" ? "selected" : ""}
              >
                Dikirim
              </option>


              <option
                value="Selesai"
                ${order.status === "Selesai" ? "selected" : ""}
              >
                Selesai
              </option>


              <option
                value="Dibatalkan"
                ${order.status === "Dibatalkan" ? "selected" : ""}
              >
                Dibatalkan
              </option>

            </select>

          </div>


          <div
            class="admin-total"
          >

            <span>
              Total Pembayaran
            </span>

            <strong>
              ${formatRupiah(order.total)}
            </strong>

          </div>


        </div>

      `;

    adminOrders.appendChild(card);
  });

  // ==========================================
  // STATUS CHANGE
  // ==========================================

  const statusSelects = document.querySelectorAll(".status-select");

  statusSelects.forEach((select) => {
    select.addEventListener("change", async function () {
      const orderId = this.dataset.id;

      const newStatus = this.value;

      const oldText = this.dataset.oldText || "";

      this.disabled = true;

      try {
        const { error } = await supabaseClient
          .from("orders")
          .update({
            status: newStatus,
          })
          .eq("id", orderId);

        if (error) {
          throw error;
        }

        // Update local data

        const index = orders.findIndex((order) => order.id === orderId);

        if (index !== -1) {
          orders[index].status = newStatus;
        }

        renderOrders(getActiveFilter());
      } catch (error) {
        console.error("Gagal mengubah status:", error);

        alert("Gagal mengubah status pesanan.\n\n" + error.message);

        this.disabled = false;
      }
    });
  });
}

// =====================================================
// ACTIVE FILTER
// =====================================================

function getActiveFilter() {
  const active = document.querySelector(".admin-filter.active");

  return active ? active.dataset.status : "all";
}

// =====================================================
// FILTER
// =====================================================

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    this.classList.add("active");

    renderOrders(this.dataset.status);
  });
});

// =====================================================
// INITIALIZE
// =====================================================

loadOrders();
