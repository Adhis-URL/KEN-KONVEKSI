// ==========================================
// KEN KONVEKSI - CATALOG
// ==========================================

// Ambil produk dari Admin
let products = JSON.parse(localStorage.getItem("kenProducts")) || [];

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
  }).format(number);
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
// RENDER PRODUCTS
// ==========================================

function renderProducts() {
  // Ambil data terbaru dari localStorage
  products = JSON.parse(localStorage.getItem("kenProducts")) || [];

  // Filter produk
  let filteredProducts = products.filter(function (product) {
    // SEARCH
    const searchText = searchInput.value.toLowerCase().trim();

    const productName = String(product.name || "").toLowerCase();

    const matchSearch = productName.includes(searchText);

    // CATEGORY
    const productCategory = normalizeCategory(product.category);

    const matchCategory =
      selectedCategory === "all" || productCategory === selectedCategory;

    // SIZE
    const productSizes = Array.isArray(product.sizes) ? product.sizes : [];

    const matchSize =
      selectedSize === "all" || productSizes.includes(selectedSize);

    // CONDITION
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
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
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
          Belum ada produk yang sesuai dengan filter.
        </p>

      </div>

    `;

    return;
  }

  // ========================================
  // RENDER
  // ========================================

  catalogProducts.innerHTML = filteredProducts
    .map(function (product) {
      const imageHTML = product.image
        ? `
              <img
                src="${product.image}"
                alt="${product.name}"
              />
            `
        : `
              <div class="image-placeholder">
                PRODUCT
              </div>
            `;

      const sizes = Array.isArray(product.sizes)
        ? product.sizes.join(" • ")
        : "-";

      const condition = String(product.condition || "").toLowerCase();

      const conditionLabel = condition === "new" ? "NEW" : "PRE-LOVED";

      return `

          <article class="catalog-card">

            <a
              href="product.html?id=${product.id}"
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

              <p class="catalog-category">
                ${String(product.category || "").toUpperCase()}
              </p>


              <h3>
                ${product.name}
              </h3>


              <p class="catalog-price">
                ${formatRupiah(product.price)}
              </p>


              <div class="catalog-meta">

                <span>
                  ${sizes}
                </span>

                <span>
                  Stok ${product.stock}
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

    selectedCategory = button.dataset.category;

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

    selectedSize = button.dataset.size;

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
  searchInput.value = "";

  conditionFilter.value = "all";

  selectedCategory = "all";
  selectedSize = "all";

  categoryButtons.forEach(function (button) {
    button.classList.remove("active");

    if (button.dataset.category === "all") {
      button.classList.add("active");
    }
  });

  sizeButtons.forEach(function (button) {
    button.classList.remove("active");

    if (button.dataset.size === "all") {
      button.classList.add("active");
    }
  });

  sortProducts.value = "featured";

  renderProducts();
});

// ==========================================
// INITIAL LOAD
// ==========================================

renderProducts();
