// =====================================================
// ADMIN DASHBOARD
// =====================================================

let orders = JSON.parse(localStorage.getItem("kenOrders")) || [];

// =====================================================
// ELEMENT
// =====================================================

const totalOrders = document.getElementById("totalOrders");

const waitingOrders = document.getElementById("waitingOrders");

const processOrders = document.getElementById("processOrders");

const totalSales = document.getElementById("totalSales");

const recentOrders = document.getElementById("recentOrders");

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
// STATUS CLASS
// =====================================================

function statusClass(status) {
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
// DASHBOARD
// =====================================================

function renderDashboard() {
  // TOTAL ORDER

  totalOrders.textContent = orders.length;

  // WAITING

  waitingOrders.textContent = orders.filter(
    (order) => order.status === "Menunggu Pembayaran",
  ).length;

  // PROCESS

  processOrders.textContent = orders.filter(
    (order) => order.status === "Diproses",
  ).length;

  // SALES

  let sales = 0;

  orders.forEach((order) => {
    if (order.status !== "Dibatalkan") {
      sales += Number(order.total);
    }
  });

  totalSales.textContent = formatRupiah(sales);

  // =================================================
  // RECENT ORDERS
  // =================================================

  recentOrders.innerHTML = "";

  if (orders.length === 0) {
    recentOrders.innerHTML = `

            <div class="admin-empty">

                Belum ada pesanan.

            </div>

        `;

    return;
  }

  const latestOrders = [...orders].reverse().slice(0, 5);

  latestOrders.forEach((order) => {
    const row = document.createElement("div");

    row.className = "recent-order";

    row.innerHTML = `

                <strong>

                    ${order.id}

                </strong>


                <span>

                    ${order.customer.name}

                </span>


                <span
                    class="order-status
                    ${statusClass(order.status)}">

                    ${order.status}

                </span>


                <strong>

                    ${formatRupiah(order.total)}

                </strong>

            `;

    recentOrders.appendChild(row);
  });
}

// =====================================================
// INITIALIZE
// =====================================================

renderDashboard();
