/* =========================================================
   ADMIN ORDERS - KEN KONVEKSI
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin Orders JS aktif");

  let allOrders = [];
  let currentStatus = "all";

  const ordersContainer = document.getElementById("adminOrders");
  const filterButtons = document.querySelectorAll(".admin-filter");

  /* =======================================================
     CEK SUPABASE
  ======================================================= */

  if (!window.supabaseClient) {
    console.error("supabaseClient tidak ditemukan.");

    if (ordersContainer) {
      ordersContainer.innerHTML = `
        <div class="admin-orders-empty">
          <h3>Supabase belum terhubung</h3>
          <p>Periksa file supabase-config.js.</p>
        </div>
      `;
    }

    return;
  }

  /* =======================================================
     FORMAT RUPIAH
  ======================================================= */

  function formatRupiah(value) {
    const number = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  }

  /* =======================================================
     ESCAPE HTML
     Mencegah data pembeli merusak HTML
  ======================================================= */

  function escapeHTML(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =======================================================
     FORMAT TANGGAL
  ======================================================= */

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  /* =======================================================
     FORMAT JAM
  ======================================================= */

  function formatTime(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* =======================================================
     STATUS CLASS
  ======================================================= */

  function getStatusClass(status) {
    const value = String(status || "")
      .toLowerCase()
      .trim();

    if (value === "menunggu pembayaran") {
      return "status-waiting";
    }

    if (value === "diproses") {
      return "status-processing";
    }

    if (value === "dikirim") {
      return "status-shipped";
    }

    if (value === "selesai") {
      return "status-completed";
    }

    if (value === "dibatalkan") {
      return "status-cancelled";
    }

    return "";
  }

  /* =======================================================
     AMBIL FOTO PRODUK
  ======================================================= */

  function getProductImage(product) {
    if (!product) {
      return "";
    }

    /*
     * Kemungkinan nama kolom gambar:
     *
     * image_url
     * image
     * thumbnail
     * photo
     * image_urls
     */

    if (product.image_url) {
      return product.image_url;
    }

    if (product.image) {
      return product.image;
    }

    if (product.thumbnail) {
      return product.thumbnail;
    }

    if (product.photo) {
      return product.photo;
    }

    /*
     * Jika nanti produk mempunyai
     * beberapa foto dalam image_urls.
     */

    if (Array.isArray(product.image_urls)) {
      if (product.image_urls.length > 0) {
        return product.image_urls[0];
      }
    }

    /*
     * Jika image_urls berupa JSON string.
     */

    if (typeof product.image_urls === "string") {
      try {
        const images = JSON.parse(product.image_urls);

        if (Array.isArray(images) && images.length > 0) {
          return images[0];
        }
      } catch (error) {
        /*
         * Bukan JSON.
         */
      }
    }

    return "";
  }

  /* =======================================================
     PLACEHOLDER FOTO
  ======================================================= */

  function getImageHTML(product, productName) {
    const image = getProductImage(product);

    if (image) {
      return `
        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(productName)}"
          class="admin-order-product-image"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        >

        <div
          class="admin-order-image-placeholder"
          style="display:none;"
        >
          📦
        </div>
      `;
    }

    return `
      <div class="admin-order-image-placeholder">
        📦
      </div>
    `;
  }

  /* =======================================================
     AMBIL SEMUA PESANAN
  ======================================================= */

  async function loadOrders() {
    if (!ordersContainer) {
      return;
    }

    ordersContainer.innerHTML = `
      <div class="admin-orders-empty">
        <div style="font-size:30px;">⏳</div>
        <h3>Memuat pesanan...</h3>
        <p>Tunggu sebentar.</p>
      </div>
    `;

    try {
      /*
       * Ambil orders terlebih dahulu.
       *
       * Jangan langsung bergantung pada JOIN,
       * supaya lebih mudah menyesuaikan struktur
       * database kamu.
       */

      const { data: orders, error: ordersError } = await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (ordersError) {
        console.error("Gagal mengambil orders:", ordersError);
        throw ordersError;
      }

      if (!orders || orders.length === 0) {
        allOrders = [];
        renderOrders();
        return;
      }

      /*
       * Ambil semua order_items.
       */

      const orderIds = orders.map(function (order) {
        return order.id;
      });

      const { data: orderItems, error: itemsError } = await supabaseClient
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Gagal mengambil order_items:", itemsError);
        throw itemsError;
      }

      /*
       * Ambil product_id dari order_items.
       */

      const productIds = [
        ...new Set(
          (orderItems || [])
            .map(function (item) {
              return item.product_id;
            })
            .filter(Boolean),
        ),
      ];

      let products = [];

      /*
       * Ambil data produk.
       */

      if (productIds.length > 0) {
        const { data: productData, error: productsError } = await supabaseClient
          .from("products")
          .select("*")
          .in("id", productIds);

        if (productsError) {
          console.error("Gagal mengambil products:", productsError);

          /*
           * Jangan hentikan seluruh halaman kalau
           * data product gagal diambil.
           */

          products = [];
        } else {
          products = productData || [];
        }
      }

      /*
       * Gabungkan data.
       */

      allOrders = orders.map(function (order) {
        const items = (orderItems || [])
          .filter(function (item) {
            return String(item.order_id) === String(order.id);
          })
          .map(function (item) {
            const product = products.find(function (productItem) {
              return String(productItem.id) === String(item.product_id);
            });

            return {
              ...item,
              product: product || null,
            };
          });

        return {
          ...order,
          items: items,
        };
      });

      console.log("Pesanan berhasil dimuat:", allOrders);

      renderOrders();
    } catch (error) {
      console.error("ERROR LOAD ORDERS:", error);

      ordersContainer.innerHTML = `
        <div class="admin-orders-empty">
          <div style="font-size:40px;">⚠️</div>

          <h3>Gagal memuat pesanan</h3>

          <p>
            ${escapeHTML(error.message || "Terjadi kesalahan.")}
          </p>

          <button
            type="button"
            id="retryOrders"
            style="
              margin-top:15px;
              padding:10px 18px;
              border:1px solid #111;
              background:#111;
              color:#fff;
              cursor:pointer;
            "
          >
            Coba Lagi
          </button>
        </div>
      `;

      const retryButton = document.getElementById("retryOrders");

      if (retryButton) {
        retryButton.addEventListener("click", loadOrders);
      }
    }
  }

  /* =======================================================
     RENDER SEMUA PESANAN
  ======================================================= */

  function renderOrders() {
    if (!ordersContainer) {
      return;
    }

    let filteredOrders = [...allOrders];

    /*
     * FILTER STATUS
     */

    if (currentStatus !== "all") {
      filteredOrders = filteredOrders.filter(function (order) {
        return (
          String(order.status || "").toLowerCase() ===
          String(currentStatus || "").toLowerCase()
        );
      });
    }

    /*
     * TIDAK ADA PESANAN
     */

    if (filteredOrders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="admin-orders-empty">
          <div style="font-size:45px;">📦</div>

          <h3>Tidak ada pesanan</h3>

          <p>
            Belum ada pesanan dengan status ini.
          </p>
        </div>
      `;

      return;
    }

    /*
     * RENDER
     */

    ordersContainer.innerHTML = filteredOrders
      .map(function (order) {
        return renderOrder(order);
      })
      .join("");

    /*
     * Pasang event status.
     */

    attachStatusEvents();
  }

  /* =======================================================
     RENDER SATU PESANAN
  ======================================================= */

  function renderOrder(order) {
    const orderId = order.id;

    const orderNumber =
      String(orderId).length > 12
        ? String(orderId).substring(0, 12) + "..."
        : orderId;

    const status = order.status || "Menunggu Pembayaran";

    const statusClass = getStatusClass(status);

    /*
     * DATA PEMBELI
     *
     * Kita cek beberapa kemungkinan nama kolom
     * agar kompatibel dengan database yang sudah dibuat.
     */

    const buyerName =
      order.buyer_name ||
      order.customer_name ||
      order.full_name ||
      order.name ||
      "-";

    const buyerPhone =
      order.buyer_phone ||
      order.phone ||
      order.whatsapp ||
      order.phone_number ||
      "-";

    const buyerEmail = order.buyer_email || order.email || "-";

    const city = order.city || order.regency || order.city_name || "-";

    const postalCode =
      order.postal_code || order.postcode || order.zip_code || "-";

    const address =
      order.address || order.shipping_address || order.full_address || "-";

    /*
     * TOTAL
     */

    let orderTotal = Number(
      order.total_amount ||
        order.grand_total ||
        order.total ||
        order.subtotal ||
        0,
    );

    /*
     * Kalau total pada orders kosong,
     * hitung dari order_items.
     */

    if (!orderTotal && Array.isArray(order.items)) {
      orderTotal = order.items.reduce(function (total, item) {
        const price = Number(
          item.price || item.unit_price || item.product_price || 0,
        );

        const quantity = Number(item.quantity || 1);

        return total + price * quantity;
      }, 0);
    }

    /*
     * Tanggal.
     */

    const date = formatDate(
      order.created_at || order.createdAt || order.order_date,
    );

    const time = formatTime(
      order.created_at || order.createdAt || order.order_date,
    );

    /*
     * ITEMS
     */

    const items = Array.isArray(order.items) ? order.items : [];

    const itemsHTML =
      items.length > 0
        ? items
            .map(function (item) {
              return renderOrderItem(item);
            })
            .join("")
        : `
          <div class="admin-order-no-products">
            Produk pesanan tidak ditemukan.
          </div>
        `;

    return `
      <article
        class="admin-order-card"
        data-order-id="${escapeHTML(orderId)}"
      >

        <!-- =========================================
             ORDER HEADER
        ========================================== -->

        <div class="admin-order-header">

          <div class="admin-order-title">

            <strong>
              #${escapeHTML(orderNumber)}
            </strong>

            <span>
              ${escapeHTML(date)}
              ${time ? " • " + escapeHTML(time) : ""}
            </span>

          </div>

          <select
            class="admin-order-status ${statusClass}"
            data-order-id="${escapeHTML(orderId)}"
          >

            <option
              value="Menunggu Pembayaran"
              ${status === "Menunggu Pembayaran" ? "selected" : ""}
            >
              Menunggu Pembayaran
            </option>

            <option
              value="Diproses"
              ${status === "Diproses" ? "selected" : ""}
            >
              Diproses
            </option>

            <option
              value="Dikirim"
              ${status === "Dikirim" ? "selected" : ""}
            >
              Dikirim
            </option>

            <option
              value="Selesai"
              ${status === "Selesai" ? "selected" : ""}
            >
              Selesai
            </option>

            <option
              value="Dibatalkan"
              ${status === "Dibatalkan" ? "selected" : ""}
            >
              Dibatalkan
            </option>

          </select>

        </div>

        <!-- =========================================
             BUYER
        ========================================== -->

        <div class="admin-order-buyer">

          <h2>Informasi Pembeli</h2>

          <div class="admin-buyer-grid">

            <div class="buyer-field">

              <span>Nama</span>

              <strong>
                ${escapeHTML(buyerName)}
              </strong>

            </div>

            <div class="buyer-field">

              <span>No. WhatsApp</span>

              <strong>
                ${escapeHTML(buyerPhone)}
              </strong>

            </div>

            <div class="buyer-field">

              <span>Email</span>

              <strong>
                ${escapeHTML(buyerEmail)}
              </strong>

            </div>

            <div class="buyer-field">

              <span>Kota</span>

              <strong>
                ${escapeHTML(city)}
              </strong>

            </div>

            <div class="buyer-field">

              <span>Kode Pos</span>

              <strong>
                ${escapeHTML(postalCode)}
              </strong>

            </div>

            <div class="buyer-field buyer-address">

              <span>Alamat</span>

              <strong>
                ${escapeHTML(address)}
              </strong>

            </div>

          </div>

        </div>

        <!-- =========================================
             PRODUCT
        ========================================== -->

        <div class="admin-order-products">

          <div class="admin-products-title">

            <h2>Produk Pesanan</h2>

            <span>
              ${items.length}
              ${items.length === 1 ? "produk" : "produk"}
            </span>

          </div>

          <div class="admin-order-items">

            ${itemsHTML}

          </div>

        </div>

        <!-- =========================================
             TOTAL
        ========================================== -->

        <div class="admin-order-total">

          <span>
            Total Pesanan
          </span>

          <strong>
            ${formatRupiah(orderTotal)}
          </strong>

        </div>

      </article>
    `;
  }

  /* =======================================================
     RENDER ITEM PRODUK
  ======================================================= */

  function renderOrderItem(item) {
    const product = item.product || {};

    const productName =
      item.product_name ||
      item.name ||
      product.name ||
      product.title ||
      "Produk";

    const quantity = Number(item.quantity || 1);

    const size = item.size || item.selected_size || "-";

    const price = Number(
      item.price || item.unit_price || item.product_price || product.price || 0,
    );

    const subtotal =
      Number(item.subtotal || item.total || 0) || price * quantity;

    const imageHTML = getImageHTML(product, productName);

    return `
      <div class="admin-order-product">

        <!-- FOTO -->

        <div class="admin-order-product-photo">

          ${imageHTML}

        </div>

        <!-- INFO -->

        <div class="admin-order-product-info">

          <h3>
            ${escapeHTML(productName)}
          </h3>

          <div class="admin-order-product-meta">

            <span>
              Ukuran:
              <strong>
                ${escapeHTML(size)}
              </strong>
            </span>

            <span>
              Jumlah:
              <strong>
                ${quantity}
              </strong>
            </span>

          </div>

          <p>
            ${formatRupiah(price)}
            / produk
          </p>

        </div>

        <!-- SUBTOTAL -->

        <div class="admin-order-product-subtotal">

          <strong>
            ${formatRupiah(subtotal)}
          </strong>

        </div>

      </div>
    `;
  }

  /* =======================================================
     STATUS EVENT
  ======================================================= */

  function attachStatusEvents() {
    const statusSelects = document.querySelectorAll(".admin-order-status");

    statusSelects.forEach(function (select) {
      select.addEventListener("change", async function () {
        const orderId = this.dataset.orderId;
        const newStatus = this.value;

        await updateOrderStatus(orderId, newStatus, this);
      });
    });
  }

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  async function updateOrderStatus(orderId, newStatus, selectElement) {
    const oldStatus = selectElement.dataset.oldStatus;

    selectElement.disabled = true;

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

      /*
       * Update local data.
       */

      const order = allOrders.find(function (item) {
        return String(item.id) === String(orderId);
      });

      if (order) {
        order.status = newStatus;
      }

      selectElement.dataset.oldStatus = newStatus;

      /*
       * Update class.
       */

      selectElement.classList.remove(
        "status-waiting",
        "status-processing",
        "status-shipped",
        "status-completed",
        "status-cancelled",
      );

      selectElement.classList.add(getStatusClass(newStatus));

      /*
       * Kalau sedang filter status,
       * render ulang agar pesanan berpindah.
       */

      if (currentStatus !== "all" && currentStatus !== newStatus) {
        renderOrders();
      }

      console.log("Status berhasil diubah:", orderId, newStatus);
    } catch (error) {
      console.error("Gagal mengubah status:", error);

      alert(
        "Gagal mengubah status pesanan.\n\n" +
          (error.message || "Terjadi kesalahan."),
      );

      /*
       * Kembalikan pilihan.
       */

      if (oldStatus) {
        selectElement.value = oldStatus;
      }
    } finally {
      selectElement.disabled = false;
    }
  }

  /* =======================================================
     FILTER
  ======================================================= */

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("active");
      });

      this.classList.add("active");

      currentStatus = this.dataset.status || "all";

      renderOrders();
    });
  });

  /* =======================================================
     LOAD
  ======================================================= */

  loadOrders();
});
