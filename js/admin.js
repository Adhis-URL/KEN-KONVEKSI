// =====================================================
// KEN KONVEKSI
// ADMIN DASHBOARD - SUPABASE
// =====================================================

// =====================================================
// ELEMENT
// =====================================================

const totalOrders = document.getElementById("totalOrders");

const waitingOrders = document.getElementById("waitingOrders");

const processOrders = document.getElementById("processOrders");

const totalSales = document.getElementById("totalSales");

const recentOrders = document.getElementById("recentOrders");

// =====================================================
// FORMAT RUPIAH
// =====================================================

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0,
  }).format(Number(number) || 0);
}

// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const d = new Date(date);

  return (
    d.toLocaleDateString("id-ID", {
      day: "2-digit",

      month: "long",

      year: "numeric",
    }) +
    " pukul " +
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",

      minute: "2-digit",
    })
  );
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
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

// =====================================================
// LOAD ORDERS DARI SUPABASE
// =====================================================

async function loadDashboardOrders() {
  console.log("Dashboard: mengambil data orders...");

  // Cek Supabase

  if (typeof supabaseClient === "undefined") {
    console.error("supabaseClient tidak ditemukan.");

    recentOrders.innerHTML = `
      <div class="admin-empty">
        Supabase belum terhubung.
      </div>
    `;

    return;
  }

  try {
    // =================================================
    // AMBIL DATA ORDERS
    // =================================================

    const { data: orders, error } = await supabaseClient

      .from("orders")

      .select("*")

      .order("created_at", {
        ascending: false,
      });

    // =================================================
    // ERROR
    // =================================================

    if (error) {
      console.error("Supabase orders error:", error);

      recentOrders.innerHTML = `
        <div class="admin-empty">
          Gagal mengambil pesanan.
          <br>
          <small>
            ${escapeHTML(error.message)}
          </small>
        </div>
      `;

      return;
    }

    console.log("Dashboard orders:", orders);

    // =================================================
    // DATA KOSONG
    // =================================================

    const orderList = Array.isArray(orders) ? orders : [];

    // =================================================
    // TOTAL PESANAN
    // =================================================

    totalOrders.textContent = orderList.length;

    // =================================================
    // MENUNGGU PEMBAYARAN
    // =================================================

    waitingOrders.textContent = orderList.filter(function (order) {
      return order.status === "Menunggu Pembayaran";
    }).length;

    // =================================================
    // DIPROSES
    // =================================================

    processOrders.textContent = orderList.filter(function (order) {
      return order.status === "Diproses";
    }).length;

    // =================================================
    // TOTAL PENJUALAN
    // =================================================

    let sales = 0;

    orderList.forEach(function (order) {
      if (order.status !== "Dibatalkan") {
        sales += Number(order.total) || 0;
      }
    });

    totalSales.textContent = formatRupiah(sales);

    // =================================================
    // TIDAK ADA PESANAN
    // =================================================

    if (orderList.length === 0) {
      recentOrders.innerHTML = `
        <div class="admin-empty">
          Belum ada pesanan.
        </div>
      `;

      return;
    }

    // =================================================
    // AMBIL 5 PESANAN TERBARU
    // =================================================

    const latestOrders = orderList.slice(0, 5);

    recentOrders.innerHTML = "";

    // =================================================
    // TAMPILKAN PESANAN
    // =================================================

    latestOrders.forEach(function (order) {
      const row = document.createElement("div");

      row.className = "recent-order";

      const orderId = String(order.id || "");

      const shortId =
        orderId.length > 18 ? orderId.substring(0, 18) + "..." : orderId;

      const customerName = order.customer_name || "Pembeli";

      const status = order.status || "Menunggu Pembayaran";

      const total = formatRupiah(order.total);

      row.innerHTML = `

          <div class="recent-order-info">

            <strong>
              ${escapeHTML(shortId)}
            </strong>

            <span>
              ${escapeHTML(customerName)}
            </span>

            <small>
              ${formatDate(order.created_at)}
            </small>

          </div>


          <span
            class="order-status ${statusClass(status)}"
          >
            ${escapeHTML(status)}
          </span>


          <strong class="recent-order-total">
            ${total}
          </strong>

        `;

      recentOrders.appendChild(row);
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    recentOrders.innerHTML = `
      <div class="admin-empty">
        Terjadi kesalahan saat
        mengambil pesanan.
        <br>
        <small>
          ${escapeHTML(error.message)}
        </small>
      </div>
    `;
  }
}

// =====================================================
// JALANKAN
// =====================================================

loadDashboardOrders();
