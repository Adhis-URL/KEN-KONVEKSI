// =====================================================
// ADMIN ORDERS
// =====================================================

// Ambil semua order

let orders = JSON.parse(localStorage.getItem("kenOrders")) || [];

// =====================================================
// ELEMENT
// =====================================================

const adminOrders = document.getElementById("adminOrders");

const filterButtons = document.querySelectorAll(".admin-filter");

// =====================================================
// RUPIAH
// =====================================================

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

// =====================================================
// DATE
// =====================================================

function formatDate(dateString) {
  const date = new Date(dateString);

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
// RENDER ORDERS
// =====================================================

function renderOrders(statusFilter = "all") {
  adminOrders.innerHTML = "";

  let filteredOrders;

  if (statusFilter === "all") {
    filteredOrders = orders;
  } else {
    filteredOrders = orders.filter((order) => order.status === statusFilter);
  }

  // ==============================
  // EMPTY
  // ==============================

  if (filteredOrders.length === 0) {
    adminOrders.innerHTML = `

            <div
                class="admin-orders-empty">

                Belum ada pesanan.

            </div>

        `;

    return;
  }

  // Pesanan terbaru di atas

  const sortedOrders = [...filteredOrders].reverse();

  sortedOrders.forEach((order) => {
    // ==========================
    // PRODUCTS
    // ==========================

    let productsHTML = "";

    order.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;

      productsHTML += `

                        <div
                            class="admin-product">

                            <div
                                class="admin-product-image">

                                PRODUCT

                            </div>


                            <div
                                class="admin-product-info">

                                <h3>
                                    ${item.name}
                                </h3>

                                <p>
                                    Size:
                                    ${item.size}
                                </p>

                                <p>
                                    Jumlah:
                                    ${item.quantity}
                                </p>

                            </div>


                            <div
                                class="admin-product-price">

                                ${formatRupiah(itemTotal)}

                            </div>

                        </div>

                    `;
    });

    // ==========================
    // CARD
    // ==========================

    const card = document.createElement("article");

    card.className = "admin-order-card";

    card.innerHTML = `

                <div
                    class="admin-order-header">


                    <div>

                        <div
                            class="admin-order-id">

                            ${order.id}

                        </div>

                        <div
                            class="admin-order-date">

                            ${formatDate(order.date)}

                        </div>

                    </div>


                    <div
                        class="admin-status
                        ${getStatusClass(order.status)}">

                        ${order.status}

                    </div>


                </div>



                <div
                    class="admin-order-content">


                    <!-- PRODUCTS -->

                    <div
                        class="admin-products">

                        ${productsHTML}

                    </div>



                    <!-- CUSTOMER -->

                    <div
                        class="customer-info">

                        <h3>
                            Informasi Pembeli
                        </h3>


                        <div
                            class="customer-row">

                            <span>
                                Nama
                            </span>

                            <strong>
                                ${order.customer.name}
                            </strong>

                        </div>


                        <div
                            class="customer-row">

                            <span>
                                WhatsApp
                            </span>

                            <strong>
                                ${order.customer.phone}
                            </strong>

                        </div>


                        <div
                            class="customer-row">

                            <span>
                                Email
                            </span>

                            <strong>
                                ${order.customer.email || "-"}
                            </strong>

                        </div>


                        <div
                            class="customer-row">

                            <span>
                                Alamat
                            </span>

                            <strong
                                class="customer-address">

                                ${order.customer.address}

                                <br>

                                ${order.customer.city}

                                <br>

                                ${order.customer.postalCode}

                            </strong>

                        </div>

                    </div>


                </div>



                <!-- FOOTER -->

                <div
                    class="admin-order-footer">


                    <div
                        class="status-control">

                        <label>
                            Ubah Status
                        </label>


                        <select
                            class="status-select"
                            data-id="${order.id}">


                            <option
                                value="Menunggu Pembayaran"
                                ${order.status === "Menunggu Pembayaran" ? "selected" : ""}>

                                Menunggu Pembayaran

                            </option>


                            <option
                                value="Diproses"
                                ${order.status === "Diproses" ? "selected" : ""}>

                                Diproses

                            </option>


                            <option
                                value="Dikirim"
                                ${order.status === "Dikirim" ? "selected" : ""}>

                                Dikirim

                            </option>


                            <option
                                value="Selesai"
                                ${order.status === "Selesai" ? "selected" : ""}>

                                Selesai

                            </option>


                            <option
                                value="Dibatalkan"
                                ${order.status === "Dibatalkan" ? "selected" : ""}>

                                Dibatalkan

                            </option>


                        </select>

                    </div>


                    <div
                        class="admin-total">

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

  // =================================================
  // STATUS CHANGE
  // =================================================

  const statusSelects = document.querySelectorAll(".status-select");

  statusSelects.forEach((select) => {
    select.addEventListener("change", function () {
      const orderId = this.dataset.id;

      const newStatus = this.value;

      // Cari order

      const orderIndex = orders.findIndex((order) => order.id === orderId);

      if (orderIndex === -1) {
        return;
      }

      // Update status

      orders[orderIndex].status = newStatus;

      // Simpan

      localStorage.setItem("kenOrders", JSON.stringify(orders));

      // Render ulang

      renderOrders(statusFilter);
    });
  });
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

renderOrders();
