// ==========================================
// KEN KONVEKSI - PRODUCT DETAIL
// FINAL SUPABASE VERSION
// ==========================================

let product = null;
let selectedSize = "";
let quantity = 1;

const productId = new URLSearchParams(window.location.search).get("id");

// ==========================================
// ELEMENT
// ==========================================

const mainProductImage = document.getElementById("mainProductImage");

const thumbnailList = document.getElementById("thumbnailList");

const productCategory = document.getElementById("productCategory");

const productName = document.getElementById("productName");

const productPrice = document.getElementById("productPrice");

const productCondition = document.getElementById("productCondition");

const productSizes = document.getElementById("productSizes");

const productStock = document.getElementById("productStock");

const quantityDisplay = document.getElementById("quantity");

const minusBtn = document.getElementById("minusBtn");

const plusBtn = document.getElementById("plusBtn");

const addCartBtn = document.getElementById("addCartBtn");

const buyBtn = document.getElementById("buyBtn");

const productDescription = document.getElementById("productDescription");

const outfitGrid = document.getElementById("outfitGrid");

const breadcrumbProduct = document.getElementById("breadcrumbProduct");

const cartCount = document.getElementById("cartCount");

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
// NORMALIZE SIZES
// ==========================================

function normalizeSizes(value) {
  // Supabase array
  if (Array.isArray(value)) {
    return value
      .map(function (size) {
        return String(size).trim();
      })
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  // Format Supabase PostgreSQL:
  // {S,M,L,XL}
  if (
    typeof value === "string" &&
    value.startsWith("{") &&
    value.endsWith("}")
  ) {
    return value
      .slice(1, -1)
      .split(",")
      .map(function (size) {
        return size.trim().replace(/^"|"$/g, "");
      })
      .filter(Boolean);
  }

  // Format JSON:
  // ["S","M","L","XL"]
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed
        .map(function (size) {
          return String(size).trim();
        })
        .filter(Boolean);
    }
  } catch (error) {
    // lanjut ke format comma
  }

  // Format:
  // S,M,L,XL
  return String(value)
    .split(",")
    .map(function (size) {
      return size.trim();
    })
    .filter(Boolean);
}

// ==========================================
// LOAD PRODUCT
// ==========================================

async function loadProduct() {
  if (!productId) {
    showError("ID produk tidak ditemukan.");
    return;
  }

  if (typeof supabaseClient === "undefined") {
    showError("Supabase belum terhubung.");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("PRODUCT ERROR:", error);

      showError(error.message);
      return;
    }

    if (!data) {
      showError("Produk tidak ditemukan.");
      return;
    }

    product = data;

    console.log("PRODUCT DARI SUPABASE:", product);

    renderProduct();

    await loadOutfits();

    updateCartCount();
  } catch (error) {
    console.error("LOAD PRODUCT ERROR:", error);

    showError("Terjadi kesalahan saat memuat produk.");
  }
}

// ==========================================
// RENDER PRODUCT
// ==========================================

function renderProduct() {
  if (!product) {
    return;
  }

  // ========================================
  // NAME
  // ========================================

  if (productName) {
    productName.textContent = product.name || "Tanpa Nama";
  }

  if (breadcrumbProduct) {
    breadcrumbProduct.textContent = product.name || "Product";
  }

  // ========================================
  // CATEGORY
  // ========================================

  if (productCategory) {
    productCategory.textContent = product.category || "PRODUCT";
  }

  // ========================================
  // PRICE
  // ========================================

  if (productPrice) {
    productPrice.textContent = formatRupiah(product.price);
  }

  // ========================================
  // CONDITION
  // ========================================

  const condition = String(product.condition || "").toLowerCase();

  if (productCondition) {
    if (condition === "new") {
      productCondition.textContent = "New";
    } else if (condition === "preloved" || condition === "pre-loved") {
      productCondition.textContent = "Preloved";
    } else {
      productCondition.textContent = product.condition || "-";
    }
  }

  // ========================================
  // DESCRIPTION
  // ========================================

  if (productDescription) {
    productDescription.textContent =
      product.description || "Tidak ada deskripsi produk.";
  }

  // ========================================
  // STOCK
  // ========================================

  const stock = Number(product.stock) || 0;

  if (productStock) {
    productStock.textContent = stock;
  }

  // ========================================
  // QUANTITY
  // ========================================

  quantity = stock > 0 ? 1 : 0;

  if (quantityDisplay) {
    quantityDisplay.textContent = quantity;
  }

  // ========================================
  // IMAGE
  // ========================================

  renderMainImage(product.image_url);

  renderThumbnail(product.image_url);

  // ========================================
  // SIZE
  // ========================================

  renderSizes();

  // ========================================
  // BUTTON STATE
  // ========================================

  updateButtonState();
}

// ==========================================
// UPDATE BUTTON STATE
// ==========================================

function updateButtonState() {
  const stock = Number(product?.stock) || 0;

  if (stock <= 0) {
    if (addCartBtn) {
      addCartBtn.disabled = true;
      addCartBtn.textContent = "Produk Habis";
    }

    if (buyBtn) {
      buyBtn.disabled = true;
      buyBtn.textContent = "Produk Habis";
    }

    if (plusBtn) {
      plusBtn.disabled = true;
    }

    if (minusBtn) {
      minusBtn.disabled = true;
    }

    return;
  }

  if (addCartBtn) {
    addCartBtn.disabled = false;
    addCartBtn.textContent = "🛒 Tambah ke Keranjang";
  }

  if (buyBtn) {
    buyBtn.disabled = false;
    buyBtn.textContent = "Beli Sekarang";
  }

  if (plusBtn) {
    plusBtn.disabled = false;
  }

  if (minusBtn) {
    minusBtn.disabled = false;
  }
}

// ==========================================
// MAIN IMAGE
// ==========================================

function renderMainImage(imageUrl) {
  if (!mainProductImage) {
    return;
  }

  if (!imageUrl) {
    mainProductImage.innerHTML = `
      <div class="image-placeholder">
        PRODUCT
      </div>
    `;

    return;
  }

  mainProductImage.innerHTML = `
    <img
      src="${escapeHTML(imageUrl)}"
      alt="${escapeHTML(product?.name || "Produk")}"
      class="main-product-img"
      onerror="handleMainImageError(this)"
    >
  `;
}

// ==========================================
// MAIN IMAGE ERROR
// ==========================================

function handleMainImageError(image) {
  image.style.display = "none";

  if (mainProductImage) {
    mainProductImage.insertAdjacentHTML(
      "beforeend",
      `
        <div class="image-placeholder">
          Gambar tidak tersedia
        </div>
      `,
    );
  }
}

// ==========================================
// THUMBNAIL
// ==========================================

function renderThumbnail(imageUrl) {
  if (!thumbnailList) {
    return;
  }

  if (!imageUrl) {
    thumbnailList.innerHTML = "";
    return;
  }

  thumbnailList.innerHTML = `
    <button
      type="button"
      class="thumbnail active"
      data-image="${escapeHTML(imageUrl)}"
    >
      <img
        src="${escapeHTML(imageUrl)}"
        alt="${escapeHTML(product?.name || "Produk")}"
        onerror="this.style.opacity='0.3'"
      >
    </button>
  `;

  const button = thumbnailList.querySelector(".thumbnail");

  if (button) {
    button.addEventListener("click", function () {
      changeMainImage(imageUrl);

      document.querySelectorAll(".thumbnail").forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");
    });
  }
}

// ==========================================
// CHANGE MAIN IMAGE
// ==========================================

function changeMainImage(url) {
  renderMainImage(url);
}

// ==========================================
// SIZE
// ==========================================

function renderSizes() {
  if (!productSizes) {
    return;
  }

  const sizes = normalizeSizes(product.sizes);

  if (sizes.length === 0) {
    productSizes.innerHTML = `
      <p class="no-size">
        Ukuran tidak tersedia
      </p>
    `;

    selectedSize = "";

    return;
  }

  // Default size
  selectedSize = sizes[0];

  productSizes.innerHTML = sizes
    .map(function (size, index) {
      return `
          <button
            type="button"
            class="size-option ${index === 0 ? "active" : ""}"
            data-size="${escapeHTML(size)}"
          >
            ${escapeHTML(size)}
          </button>
        `;
    })
    .join("");

  const buttons = productSizes.querySelectorAll(".size-option");

  buttons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      buttons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      selectedSize = button.dataset.size;

      console.log("SIZE DIPILIH:", selectedSize);
    });
  });
}

// ==========================================
// OUTFIT WEAR
// ==========================================

async function loadOutfits() {
  if (!outfitGrid) {
    return;
  }

  outfitGrid.innerHTML = `
    <p>
      Memuat Outfit Wear...
    </p>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("product_outfits")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("OUTFIT ERROR:", error);

      outfitGrid.innerHTML = `
        <p>
          Outfit Wear belum tersedia.
        </p>
      `;

      return;
    }

    if (!data || data.length === 0) {
      outfitGrid.innerHTML = `
        <div class="outfit-empty">
          <p>
            Belum ada foto Outfit Wear.
          </p>
        </div>
      `;

      return;
    }

    outfitGrid.innerHTML = data
      .map(function (outfit) {
        if (!outfit.image_url) {
          return "";
        }

        return `
            <div class="outfit-item">

              <img
                src="${escapeHTML(outfit.image_url)}"
                alt="Outfit Wear"
                loading="lazy"
                onerror="this.style.display='none'"
              >

            </div>
          `;
      })
      .join("");
  } catch (error) {
    console.error("OUTFIT LOAD ERROR:", error);

    outfitGrid.innerHTML = `
      <p>
        Gagal memuat Outfit Wear.
      </p>
    `;
  }
}

// ==========================================
// QUANTITY MINUS
// ==========================================

if (minusBtn) {
  minusBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (!product) {
      return;
    }

    if (quantity > 1) {
      quantity--;
    }

    if (quantityDisplay) {
      quantityDisplay.textContent = quantity;
    }
  });
}

// ==========================================
// QUANTITY PLUS
// ==========================================

if (plusBtn) {
  plusBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (!product) {
      return;
    }

    const stock = Number(product.stock) || 0;

    if (quantity < stock) {
      quantity++;
    } else {
      alert(`Maksimal pembelian ${stock} barang.`);
    }

    if (quantityDisplay) {
      quantityDisplay.textContent = quantity;
    }
  });
}

// ==========================================
// GET CART
// ==========================================

function getCart() {
  try {
    const data = sessionStorage.getItem("kenCart");

    if (!data) {
      return [];
    }

    const cart = JSON.parse(data);

    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("CART READ ERROR:", error);

    return [];
  }
}

// ==========================================
// SAVE CART
// ==========================================

function saveCart(cart) {
  try {
    sessionStorage.setItem("kenCart", JSON.stringify(cart));

    return true;
  } catch (error) {
    console.error("CART SAVE ERROR:", error);

    alert("Keranjang tidak dapat disimpan.");

    return false;
  }
}

// ==========================================
// CREATE CART ITEM
// ==========================================

function createCartItem() {
  return {
    // ID SUPABASE
    id: product.id,

    // NAMA
    name: product.name,

    // HARGA
    price: Number(product.price) || 0,

    // GAMBAR SUPABASE
    image_url: product.image_url || "",

    // SUPPORT DATA LAMA
    image: product.image_url || "",

    // UKURAN
    size: selectedSize,

    // JUMLAH
    quantity: quantity,

    // STOK
    stock: Number(product.stock) || 0,
  };
}

// ==========================================
// ADD TO CART
// ==========================================

if (addCartBtn) {
  addCartBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (!product) {
      alert("Produk masih dimuat.");
      return;
    }

    if (!selectedSize) {
      alert("Silakan pilih ukuran.");
      return;
    }

    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      alert("Produk sedang habis.");
      return;
    }

    if (quantity <= 0) {
      alert("Jumlah produk tidak valid.");
      return;
    }

    const cart = getCart();

    const index = cart.findIndex(function (item) {
      return item.id === product.id && item.size === selectedSize;
    });

    // ====================================
    // PRODUK SUDAH ADA
    // ====================================

    if (index !== -1) {
      const oldQuantity = Number(cart[index].quantity) || 0;

      const newQuantity = oldQuantity + quantity;

      cart[index].quantity = Math.min(newQuantity, stock);

      // Update data terbaru
      cart[index].name = product.name;

      cart[index].price = Number(product.price) || 0;

      cart[index].image_url = product.image_url || "";

      cart[index].image = product.image_url || "";

      cart[index].stock = stock;

      if (newQuantity > stock) {
        alert(`Jumlah disesuaikan dengan stok. Maksimal ${stock} barang.`);
      }
    } else {
      // ==================================
      // PRODUK BARU
      // ==================================

      cart.push(createCartItem());
    }

    // ====================================
    // SAVE
    // ====================================

    if (!saveCart(cart)) {
      return;
    }

    updateCartCount();

    alert("Produk berhasil masuk ke keranjang.");
  });
}

// ==========================================
// BUY NOW
// ==========================================

if (buyBtn) {
  buyBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (!product) {
      alert("Produk masih dimuat.");
      return;
    }

    if (!selectedSize) {
      alert("Silakan pilih ukuran.");
      return;
    }

    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      alert("Produk sedang habis.");
      return;
    }

    if (quantity <= 0) {
      alert("Jumlah produk tidak valid.");
      return;
    }

    const cart = [createCartItem()];

    if (!saveCart(cart)) {
      return;
    }

    window.location.href = "checkout.html";
  });
}

// ==========================================
// CART COUNT
// ==========================================

function updateCartCount() {
  const cart = getCart();

  const total = cart.reduce(function (sum, item) {
    return sum + Number(item.quantity || 0);
  }, 0);

  if (cartCount) {
    cartCount.textContent = total;
  }
}

// ==========================================
// ERROR
// ==========================================

function showError(message) {
  if (mainProductImage) {
    mainProductImage.innerHTML = `
      <div class="image-placeholder">
        ${escapeHTML(message)}
      </div>
    `;
  }

  if (productName) {
    productName.textContent = "Produk tidak ditemukan";
  }

  if (addCartBtn) {
    addCartBtn.disabled = true;
  }

  if (buyBtn) {
    buyBtn.disabled = true;
  }
}

// ==========================================
// START
// ==========================================

loadProduct();
