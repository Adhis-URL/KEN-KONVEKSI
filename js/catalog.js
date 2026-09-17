// ==========================================
// KEN KONVEKSI - CATALOG
// SUPABASE VERSION
// ==========================================

// ==========================================
// ELEMENT
// ==========================================

const catalogProducts = document.getElementById("catalogProducts");

const productCount = document.getElementById("productCount");

const searchInput = document.getElementById("searchInput");

const conditionFilter = document.getElementById("conditionFilter");

const sortProducts = document.getElementById("sortProducts");

const resetFilter = document.getElementById("resetFilter");

const categoryButtons = document.querySelectorAll(".category-btn");

const sizeButtons = document.querySelectorAll(".size-btn");

// ==========================================
// DATA
// ==========================================

let products = [];

// ==========================================
// FILTER STATE
// ==========================================

let selectedCategory = "all";
let selectedSize = "all";

// ==========================================
// FORMAT RUPIAH
// ==========================================

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(number) || 0);
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// NORMALIZE CATEGORY
// ==========================================

function normalizeCategory(category) {
  return String(category || "")
    .toLowerCase()
    .replace(/[\s-]/g, "");
}

// ==========================================
// LOAD PRODUCTS FROM SUPABASE
// ==========================================

async function loadProducts() {
  // Cek Supabase

  if (typeof supabaseClient === "undefined") {
    console.error("supabaseClient belum tersedia.");

    catalogProducts.innerHTML = `

      <div class="catalog-empty">

        <h3>
          Supabase belum terhubung
        </h3>

        <p>
          Pastikan konfigurasi Supabase
          sudah dipasang sebelum catalog.js.
        </p>

      </div>

    `;

    return;
  }

  // Loading

  catalogProducts.innerHTML = `

    <div class="catalog-empty">

      <h3>
        Memuat produk...
      </h3>

      <p>
        Silakan tunggu sebentar.
      </p>

    </div>

  `;

  try {
    const { data, error } = await supabaseClient

      .from("products")

      .select("*")

      .order("created_at", {
        ascending: false,
      });

    // Error Supabase

    if (error) {
      console.error("Supabase error:", error);

      catalogProducts.innerHTML = `

        <div class="catalog-empty">

          <h3>
            Gagal memuat produk
          </h3>

          <p>
            ${escapeHTML(error.message)}
          </p>

        </div>

      `;

      return;
    }

    // Simpan data

    products = Array.isArray(data) ? data : [];

    console.log("Produk dari Supabase:", products);

    // Render

    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);

    catalogProducts.innerHTML = `

      <div class="catalog-empty">

        <h3>
          Terjadi kesalahan
        </h3>

        <p>
          ${escapeHTML(error.message)}
        </p>

      </div>

    `;
  }
}

// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {
  // ========================================
  // FILTER PRODUK
  // ========================================

  let filteredProducts = products.filter(function (product) {
    // ======================================
    // SEARCH
    // ======================================

    const searchText = searchInput.value.toLowerCase().trim();

    const productName = String(product.name || "").toLowerCase();

    const matchSearch = productName.includes(searchText);

    // ======================================
    // CATEGORY
    // ======================================

    const productCategory = normalizeCategory(product.category);

    const matchCategory =
      selectedCategory === "all" || productCategory === selectedCategory;

    // ======================================
    // SIZE
    // ======================================

    const productSizes = Array.isArray(product.sizes) ? product.sizes : [];

    const matchSize =
      selectedSize === "all" || productSizes.includes(selectedSize);

    // ======================================
    // CONDITION
    // ======================================

    const productCondition = String(product.condition || "").toLowerCase();

    const matchCondition =
      conditionFilter.value === "all" ||
      productCondition === conditionFilter.value;

    return matchSearch && matchCategory && matchSize && matchCondition;
  });

  // ========================================
  // SORT
  // ========================================

  if (sortProducts.value === "price-low") {
    filteredProducts.sort(function (a, b) {
      return Number(a.price) - Number(b.price);
    });
  }

  if (sortProducts.value === "price-high") {
    filteredProducts.sort(function (a, b) {
      return Number(b.price) - Number(a.price);
    });
  }

  if (sortProducts.value === "featured") {
    filteredProducts.sort(function (a, b) {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }

  // ========================================
  // PRODUCT COUNT
  // ========================================

  productCount.textContent = `${filteredProducts.length} produk`;

  // ========================================
  // EMPTY
  // ========================================

  if (filteredProducts.length === 0) {
    catalogProducts.innerHTML = `

      <div class="catalog-empty">

        <h3>
          Produk belum tersedia
        </h3>

        <p>
          Belum ada produk yang sesuai
          dengan filter.
        </p>

      </div>

    `;

    return;
  }

  // ========================================
  // RENDER PRODUCT CARD
  // ========================================

  catalogProducts.innerHTML = filteredProducts

    .map(function (product) {
      // ====================================
      // IMAGE
      // ====================================

      const imageHTML = product.image_url
        ? `

              <img
                src="${escapeHTML(product.image_url)}"
                alt="${escapeHTML(product.name)}"
                loading="lazy"
              />

            `
        : `

              <div class="image-placeholder">
                PRODUCT
              </div>

            `;

      // ====================================
      // SIZES
      // ====================================

      const sizes =
        Array.isArray(product.sizes) && product.sizes.length > 0
          ? product.sizes.join(" • ")
          : "-";

      // ====================================
      // CONDITION
      // ====================================

      const condition = String(product.condition || "").toLowerCase();

      const conditionLabel = condition === "new" ? "NEW" : "PRE-LOVED";

      // ====================================
      // PRODUCT CARD
      // ====================================

      return `

          <article class="catalog-card">

            <a
              href="product.html?id=${encodeURIComponent(product.id)}"
              class="catalog-image"
            >

              <span
                class="product-label ${condition === "new" ? "new" : ""}"
              >

                ${conditionLabel}

              </span>


              ${imageHTML}

            </a>


            <div class="catalog-info">


              <!-- CATEGORY -->

              <p class="catalog-category">

                ${escapeHTML(product.category || "").toUpperCase()}

              </p>


              <!-- NAME -->

              <h3>

                ${escapeHTML(product.name)}

              </h3>


              <!-- PRICE -->

              <p class="catalog-price">

                ${formatRupiah(product.price)}

              </p>


              <!-- META -->

              <div class="catalog-meta">

                <span>
                  ${escapeHTML(sizes)}
                </span>

                <span>
                  Stok ${Number(product.stock) || 0}
                </span>

              </div>


            </div>

          </article>

        `;
    })

    .join("");
}

// ==========================================
// CATEGORY BUTTON
// ==========================================

categoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    categoryButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedCategory = normalizeCategory(button.dataset.category);

    renderProducts();
  });
});

// ==========================================
// SIZE BUTTON
// ==========================================

sizeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    sizeButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedSize = button.dataset.size || "all";

    renderProducts();
  });
});

// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener("input", function () {
  renderProducts();
});

// ==========================================
// CONDITION
// ==========================================

conditionFilter.addEventListener("change", function () {
  renderProducts();
});

// ==========================================
// SORT
// ==========================================

sortProducts.addEventListener("change", function () {
  renderProducts();
});

// ==========================================
// RESET
// ==========================================

resetFilter.addEventListener("click", function () {
  // Search

  searchInput.value = "";

  // Condition

  conditionFilter.value = "all";

  // Category

  selectedCategory = "all";

  // Size

  selectedSize = "all";

  // Category button

  categoryButtons.forEach(function (button) {
    button.classList.remove("active");

    if (normalizeCategory(button.dataset.category) === "all") {
      button.classList.add("active");
    }
  });

  // Size button

  sizeButtons.forEach(function (button) {
    button.classList.remove("active");

    if (button.dataset.size === "all") {
      button.classList.add("active");
    }
  });

  // Sort

  sortProducts.value = "featured";

  // Render

  renderProducts();
});

// ==========================================
// INITIAL LOAD
// ==========================================

loadProducts();
