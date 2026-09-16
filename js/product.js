// =====================================================
// KEN KONVEKSI - PRODUCT DETAIL
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  // ===================================================
  // GET PRODUCT ID FROM URL
  // ===================================================

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // ===================================================
  // GET PRODUCTS FROM LOCAL STORAGE
  // ===================================================

  const products = JSON.parse(localStorage.getItem("kenProducts")) || [];

  // ===================================================
  // FIND PRODUCT
  // ===================================================

  const product = products.find(function (item) {
    return String(item.id) === String(productId);
  });

  // ===================================================
  // ELEMENTS
  // ===================================================

  const productName = document.getElementById("productName");

  const breadcrumbProduct = document.getElementById("breadcrumbProduct");

  const productCategory = document.getElementById("productCategory");

  const productPrice = document.getElementById("productPrice");

  const productCondition = document.getElementById("productCondition");

  const productStock = document.getElementById("productStock");

  const productDescription = document.getElementById("productDescription");

  const mainProductImage = document.getElementById("mainProductImage");

  const thumbnailList = document.getElementById("thumbnailList");

  const outfitGrid = document.getElementById("outfitGrid");

  const sizeContainer = document.getElementById("productSizes");

  const quantityElement = document.getElementById("quantity");

  const minusBtn = document.getElementById("minusBtn");

  const plusBtn = document.getElementById("plusBtn");

  const addCartBtn = document.getElementById("addCartBtn");

  const buyBtn = document.getElementById("buyBtn");

  // ===================================================
  // CART BADGE
  // ===================================================

  const cartBadge = document.querySelector(".cart-btn span");

  // ===================================================
  // FORMAT RUPIAH
  // ===================================================

  function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(number) || 0);
  }

  // ===================================================
  // UPDATE CART BADGE
  // ===================================================

  function updateCartBadge() {
    if (!cartBadge) return;

    const cart = JSON.parse(localStorage.getItem("kenCart")) || [];

    const totalQuantity = cart.reduce(function (total, item) {
      return total + Number(item.quantity || 0);
    }, 0);

    cartBadge.textContent = totalQuantity;
  }

  // ===================================================
  // PRODUCT NOT FOUND
  // ===================================================

  if (!product) {
    document.title = "Produk Tidak Ditemukan | KEN KONVEKSI";

    if (productName) {
      productName.textContent = "Produk Tidak Ditemukan";
    }

    if (breadcrumbProduct) {
      breadcrumbProduct.textContent = "Produk Tidak Ditemukan";
    }

    if (productDescription) {
      productDescription.textContent = "Produk yang kamu cari tidak tersedia.";
    }

    if (mainProductImage) {
      mainProductImage.innerHTML = `
        <div class="image-placeholder">
          PRODUCT NOT FOUND
        </div>
      `;
    }

    updateCartBadge();

    return;
  }

  // ===================================================
  // PRODUCT INFORMATION
  // ===================================================

  document.title = `${product.name} | KEN KONVEKSI`;

  productName.textContent = product.name;

  breadcrumbProduct.textContent = product.name;

  productCategory.textContent = String(product.category || "").toUpperCase();

  productPrice.textContent = formatRupiah(product.price);

  productCondition.textContent = product.condition || "-";

  const stock = Number(product.stock) || 0;

  productStock.textContent = stock;

  productDescription.textContent =
    product.description || "Tidak ada deskripsi produk.";

  // ===================================================
  // MAIN PRODUCT IMAGE
  // ===================================================

  if (product.image) {
    mainProductImage.innerHTML = `
      <img
        src="${product.image}"
        alt="${product.name}"
      />
    `;
  } else {
    mainProductImage.innerHTML = `
      <div class="image-placeholder">
        PRODUCT
      </div>
    `;
  }

  // ===================================================
  // THUMBNAILS
  // ===================================================

  function renderThumbnails() {
    if (!thumbnailList) return;

    thumbnailList.innerHTML = "";

    // FOTO UTAMA
    if (product.image) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "thumbnail active";

      button.innerHTML = `
        <img
          src="${product.image}"
          alt="${product.name}"
        />
      `;

      button.addEventListener("click", function () {
        setMainImage(product.image);
        setActiveThumbnail(button);
      });

      thumbnailList.appendChild(button);
    }

    // FOTO OUTFIT
    if (Array.isArray(product.outfits)) {
      product.outfits.forEach(function (image, index) {
        if (!image) return;

        const button = document.createElement("button");

        button.type = "button";
        button.className = "thumbnail";

        button.innerHTML = `
            <img
              src="${image}"
              alt="Outfit ${index + 1}"
            />
          `;

        button.addEventListener("click", function () {
          setMainImage(image);
          setActiveThumbnail(button);
        });

        thumbnailList.appendChild(button);
      });
    }

    // TIDAK ADA FOTO
    if (thumbnailList.children.length === 0) {
      thumbnailList.innerHTML = `
        <button
          class="thumbnail active"
          type="button"
        >
          PRODUCT
        </button>
      `;
    }
  }

  // ===================================================
  // CHANGE MAIN IMAGE
  // ===================================================

  function setMainImage(image) {
    if (!mainProductImage) return;

    mainProductImage.innerHTML = `
      <img
        src="${image}"
        alt="${product.name}"
      />
    `;
  }

  // ===================================================
  // ACTIVE THUMBNAIL
  // ===================================================

  function setActiveThumbnail(activeButton) {
    if (!thumbnailList) return;

    const buttons = thumbnailList.querySelectorAll(".thumbnail");

    buttons.forEach(function (button) {
      button.classList.remove("active");
    });

    activeButton.classList.add("active");
  }

  // ===================================================
  // PRODUCT SIZE
  // ===================================================

  let selectedSize = null;

  function renderSizes() {
    if (!sizeContainer) return;

    sizeContainer.innerHTML = "";

    const sizes = Array.isArray(product.sizes) ? product.sizes : [];

    if (sizes.length === 0) {
      sizeContainer.innerHTML = `
        <span>
          Ukuran tidak tersedia
        </span>
      `;

      return;
    }

    sizes.forEach(function (size, index) {
      const button = document.createElement("button");

      button.type = "button";

      button.textContent = size;

      if (index === 0) {
        button.classList.add("selected");
        selectedSize = size;
      }

      button.addEventListener("click", function () {
        sizeContainer.querySelectorAll("button").forEach(function (btn) {
          btn.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedSize = size;
      });

      sizeContainer.appendChild(button);
    });
  }

  // ===================================================
  // GET SELECTED SIZE
  // ===================================================

  function getSelectedSize() {
    if (selectedSize) {
      return selectedSize;
    }

    const selectedButton = sizeContainer?.querySelector(".selected");

    if (!selectedButton) {
      return null;
    }

    return selectedButton.textContent.trim();
  }

  // ===================================================
  // QUANTITY
  // ===================================================

  let quantity = 1;

  function updateQuantity() {
    if (!quantityElement) return;

    quantityElement.textContent = quantity;
  }

  updateQuantity();

  // MINUS
  if (minusBtn) {
    minusBtn.addEventListener("click", function () {
      if (quantity > 1) {
        quantity--;

        updateQuantity();
      }
    });
  }

  // PLUS
  if (plusBtn) {
    plusBtn.addEventListener("click", function () {
      if (quantity < stock) {
        quantity++;

        updateQuantity();
      }
    });
  }

  // ===================================================
  // OUTFIT WEAR
  // ===================================================

  function renderOutfits() {
    if (!outfitGrid) return;

    outfitGrid.innerHTML = "";

    const outfits = Array.isArray(product.outfits) ? product.outfits : [];

    if (outfits.length === 0) {
      outfitGrid.innerHTML = `
        <div class="outfit-empty">
          <p>
            Belum ada foto Outfit Wear.
          </p>
        </div>
      `;

      return;
    }

    outfits.forEach(function (image, index) {
      if (!image) return;

      const card = document.createElement("div");

      card.className = "outfit-card";

      card.innerHTML = `
          <img
            src="${image}"
            alt="Outfit ${index + 1}"
          />
        `;

      outfitGrid.appendChild(card);
    });
  }

  // ===================================================
  // ADD TO CART
  // ===================================================

  if (addCartBtn) {
    addCartBtn.addEventListener("click", function () {
      // CEK STOK
      if (stock <= 0) {
        alert("Maaf, produk ini sedang habis.");

        return;
      }

      // CEK SIZE
      const size = getSelectedSize();

      if (!size) {
        alert("Silakan pilih ukuran terlebih dahulu.");

        return;
      }

      // GET CART
      let cart = JSON.parse(localStorage.getItem("kenCart")) || [];

      // CARI ITEM YANG SAMA
      const existingItem = cart.find(function (item) {
        return String(item.id) === String(product.id) && item.size === size;
      });

      if (existingItem) {
        const newQuantity = Number(existingItem.quantity) + quantity;

        if (newQuantity > stock) {
          alert(`Stok hanya tersedia ${stock} pcs.`);

          return;
        }

        existingItem.quantity = newQuantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          size: size,
          quantity: quantity,
          image: product.image || "",
        });
      }

      // SAVE
      localStorage.setItem("kenCart", JSON.stringify(cart));

      // UPDATE BADGE
      updateCartBadge();

      alert(`${product.name} berhasil ditambahkan ke keranjang!`);
    });
  }

  // ===================================================
  // BUY NOW
  // ===================================================

  if (buyBtn) {
    buyBtn.addEventListener("click", function () {
      // CEK STOK
      if (stock <= 0) {
        alert("Maaf, produk ini sedang habis.");

        return;
      }

      // CEK SIZE
      const size = getSelectedSize();

      if (!size) {
        alert("Silakan pilih ukuran terlebih dahulu.");

        return;
      }

      const buyItem = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        size: size,
        quantity: quantity,
        image: product.image || "",
      };

      localStorage.setItem("kenCart", JSON.stringify([buyItem]));

      updateCartBadge();

      window.location.href = "checkout.html";
    });
  }

  // ===================================================
  // INITIALIZE
  // ===================================================

  renderThumbnails();
  renderSizes();
  renderOutfits();
  updateCartBadge();
});
