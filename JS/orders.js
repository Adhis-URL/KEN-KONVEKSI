// =====================================================
// ORDERS SYSTEM
// =====================================================

// Ambil data pesanan

let orders = JSON.parse(localStorage.getItem("kenOrders")) || [];

// =====================================================
// ELEMENT
// =====================================================

const ordersList = document.getElementById("ordersList");

const emptyOrders = document.getElementById("emptyOrders");

const cartCount = document.getElementById("cartCount");

const filterButtons = document.querySelectorAll(".filter-btn");

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
// DATE FORMAT
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
// RENDER ORDERS
// =====================================================

function renderOrders(statusFilter = "all") {
  ordersList.innerHTML = "";

  // Filter order

  let filteredOrders;

  if (statusFilter === "all") {
    filteredOrders = orders;
  } else {
    filteredOrders = orders.filter((order) => order.status === statusFilter);
  }

  // Kalau tidak ada

  if (filteredOrders.length === 0) {
    emptyOrders.style.display = "block";

    return;
  }

  emptyOrders.style.display = "none";

  // Tampilkan dari terbaru

  const reversedOrders = [...filteredOrders].reverse();

  reversedOrders.forEach((order) => {
    const orderCard = document.createElement("article");

    orderCard.className = "order-card";

    // ==========================
    // PRODUCTS
    // ==========================

    let productsHTML = "";

    order.items.forEach((item) => {
      const subtotal = item.price * item.quantity;

      productsHTML += `

                        <div
                            class="order-product">

                            <div
                                class="order-product-image">

                                PRODUCT

                            </div>


                            <div
                                class="order-product-info">

                                <h3>
                                    ${item.name}
                                </h3>

                                <p>
                                    Size: ${item.size}
                                </p>

                                <p>
                                    Jumlah:
                                    ${item.quantity}
                                </p>

                            </div>


                            <div
                                class="order-product-price">

                                ${formatRupiah(subtotal)}

                            </div>

                        </div>

                    `;
    });

    // ==========================
    // ORDER CARD
    // ==========================

    orderCard.innerHTML = `

                <div
                    class="order-card-header">

                    <div>

                        <div
                            class="order-number">

                            ${order.id}

                        </div>

                        <div
                            class="order-date">

                            ${formatDate(order.date)}

                        </div>

                    </div>


                    <div
                        class="order-status
                        ${getStatusClass(order.status)}">

                        ${order.status}

                    </div>

                </div>


                <div
                    class="order-products">

                    ${productsHTML}

                </div>


                <div
                    class="order-card-footer">

                    <div
                        class="order-payment">

                        Pembayaran:
                        <strong>
                            ${order.payment}
                        </strong>

                    </div>


                    <div
                        class="order-total">

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
// FILTER
// =====================================================

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    this.classList.add("active");

    const status = this.dataset.status;

    renderOrders(status);
  });
});

// =====================================================
// CART COUNT
// =====================================================

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("kenCart")) || [];

  let total = 0;

  cart.forEach((item) => {
    total += item.quantity;
  });

  cartCount.textContent = total;
}

// =====================================================
// INITIALIZE
// =====================================================

updateCartCount();

renderOrders();
