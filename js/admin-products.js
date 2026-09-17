// =====================================================
// ADMIN PRODUCTS - SUPABASE
// =====================================================

let products = [];

// =====================================================
// ELEMENT
// =====================================================

const adminProducts = document.getElementById("adminProducts");

const productCount = document.getElementById("productCount");

// =====================================================
// SUPABASE CHECK
// =====================================================

if (!window.supabaseClient) {
  console.error("Supabase Client tidak ditemukan.");
}

// =====================================================
// RUPIAH
// =====================================================

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number || 0);
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {
  if (text === null || text === undefined) {
    return "";
  }

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {
  try {
    // ---------------------------------------------------
    // CEK SUPABASE
    // ---------------------------------------------------

    if (!window.supabaseClient) {
      adminProducts.innerHTML = `
        <div class="admin-product-empty">

          <div style="font-size:40px;">
            ⚠️
          </div>

          <h2>
            Supabase belum terhubung
          </h2>

          <p>
            Periksa konfigurasi Supabase pada halaman admin.
          </p>

        </div>
      `;

      return;
    }

    // ---------------------------------------------------
    // LOADING
    // ---------------------------------------------------

    adminProducts.innerHTML = `
      <div class="admin-product-empty">

        <div style="font-size:40px;">
          ⏳
        </div>

        <h2>
          Memuat produk...
        </h2>

        <p>
          Tunggu sebentar.
        </p>

      </div>
    `;

    // ---------------------------------------------------
    // GET PRODUCTS
    // ---------------------------------------------------

    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    // ---------------------------------------------------
    // ERROR
    // ---------------------------------------------------

    if (error) {
      console.error("Supabase Error:", error);

      adminProducts.innerHTML = `
        <div class="admin-product-empty">

          <div style="font-size:40px;">
            ⚠️
          </div>

          <h2>
            Gagal mengambil produk
          </h2>

          <p>
            ${escapeHTML(error.message)}
          </p>

        </div>
      `;

      return;
    }

    // ---------------------------------------------------
    // SAVE DATA
    // ---------------------------------------------------

    products = data || [];

    // ---------------------------------------------------
    // RENDER
    // ---------------------------------------------------

    renderProducts();
  } catch (error) {
    console.error("Load Products Error:", error);

    adminProducts.innerHTML = `
      <div class="admin-product-empty">

        <div style="font-size:40px;">
          ⚠️
        </div>

        <h2>
          Terjadi kesalahan
        </h2>

        <p>
          ${escapeHTML(error.message)}
        </p>

      </div>
    `;
  }
}

// =====================================================
// RENDER PRODUCTS
// =====================================================

function renderProducts() {
  adminProducts.innerHTML = "";

  productCount.textContent = products.length;

  // ---------------------------------------------------
  // EMPTY
  // ---------------------------------------------------

  if (products.length === 0) {
    adminProducts.innerHTML = `
      <div class="admin-product-empty">

        <div style="font-size:40px;">
          👕
        </div>

        <h2>
          Belum ada produk
        </h2>

        <p>
          Tambahkan produk pertama kamu.
        </p>

      </div>
    `;

    return;
  }

  // ---------------------------------------------------
  // PRODUCTS
  // ---------------------------------------------------

  products.forEach((product) => {
    const card = document.createElement("article");

    card.className = "admin-product-card";

    // -------------------------------------------------
    // IMAGE
    // -------------------------------------------------

    let imageHTML = "";

    if (product.image_url) {
      imageHTML = `
        <img
          src="${escapeHTML(product.image_url)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
        >
      `;
    } else {
      imageHTML = `
        <div class="image-placeholder">
          PRODUCT
        </div>
      `;
    }

    // -------------------------------------------------
    // DATA
    // -------------------------------------------------

    const category = product.category || "Product";

    const condition = product.condition || "New";

    const stock = product.stock ?? 0;

    // -------------------------------------------------
    // CARD HTML
    // -------------------------------------------------

    card.innerHTML = `

      <div class="admin-product-image">

        ${imageHTML}

      </div>


      <div class="admin-product-body">

        <div class="admin-product-category">

          ${escapeHTML(category)}

        </div>


        <h3>

          ${escapeHTML(product.name)}

        </h3>


        <div class="admin-product-price">

          ${formatRupiah(product.price)}

        </div>


        <div class="admin-product-stock">

          Stok:
          ${stock}

        </div>


        <div
          style="
            margin-top:8px;
            font-size:13px;
            color:#777;
          "
        >

          Kondisi:
          ${escapeHTML(condition)}

        </div>


        <div class="admin-product-actions">

          <button
            type="button"
            onclick="editProduct('${product.id}')"
          >

            Edit

          </button>


          <button
            type="button"
            class="delete-btn"
            onclick="deleteProduct('${product.id}')"
          >

            Hapus

          </button>

        </div>

      </div>

    `;

    adminProducts.appendChild(card);
  });
}

// =====================================================
// EXTRACT STORAGE PATH
// =====================================================

function getStoragePath(url) {
  if (!url) {
    return null;
  }

  try {
    const parsedURL = new URL(url);

    // Contoh URL:
    //
    // https://xxxxx.supabase.co/storage/v1/object/public/products/produk/foto.jpg
    //
    // hasil:
    //
    // produk/foto.jpg

    const marker = "/storage/v1/object/public/products/";

    const index = parsedURL.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(
      parsedURL.pathname.substring(index + marker.length),
    );
  } catch (error) {
    console.warn("URL Storage tidak valid:", url);

    return null;
  }
}

// =====================================================
// DELETE STORAGE FILE
// =====================================================

async function deleteStorageFile(url) {
  const path = getStoragePath(url);

  if (!path) {
    console.warn("Storage path tidak ditemukan:", url);

    return {
      success: false,
      skipped: true,
    };
  }

  const { error } = await supabaseClient.storage
    .from("products")
    .remove([path]);

  if (error) {
    console.error("Gagal menghapus file Storage:", path, error);

    return {
      success: false,
      error,
    };
  }

  console.log("File Storage berhasil dihapus:", path);

  return {
    success: true,
  };
}

// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(id) {
  const product = products.find((item) => item.id === id);

  if (!product) {
    return;
  }

  // ---------------------------------------------------
  // CONFIRM
  // ---------------------------------------------------

  const confirmDelete = confirm(
    `Hapus produk "${product.name}"?\n\n` +
      `Foto produk dan foto Outfit Wear juga akan dihapus ` +
      `dari Supabase Storage.`,
  );

  if (!confirmDelete) {
    return;
  }

  try {
    // -------------------------------------------------
    // DISABLE BUTTON / LOADING
    // -------------------------------------------------

    console.log("Menghapus produk:", product.name);

    // =================================================
    // 1. AMBIL DATA OUTFIT
    // =================================================

    const { data: outfits, error: outfitFetchError } = await supabaseClient
      .from("product_outfits")
      .select("*")
      .eq("product_id", id);

    if (outfitFetchError) {
      console.error("Gagal mengambil data Outfit:", outfitFetchError);

      alert("Gagal mengambil data Outfit Wear:\n\n" + outfitFetchError.message);

      return;
    }

    // =================================================
    // 2. HAPUS FOTO UTAMA
    // =================================================

    let mainImageFailed = false;

    if (product.image_url) {
      const result = await deleteStorageFile(product.image_url);

      if (!result.success && !result.skipped) {
        mainImageFailed = true;
      }
    }

    // =================================================
    // 3. HAPUS FOTO OUTFIT
    // =================================================

    let outfitImagesFailed = false;

    if (outfits && outfits.length > 0) {
      for (const outfit of outfits) {
        if (outfit.image_url) {
          const result = await deleteStorageFile(outfit.image_url);

          if (!result.success && !result.skipped) {
            outfitImagesFailed = true;
          }
        }
      }
    }

    // =================================================
    // 4. HAPUS DATA OUTFIT
    // =================================================

    const { error: outfitDeleteError } = await supabaseClient
      .from("product_outfits")
      .delete()
      .eq("product_id", id);

    if (outfitDeleteError) {
      console.error("Gagal menghapus data Outfit:", outfitDeleteError);

      alert(
        "Foto mungkin sudah dihapus, " +
          "tetapi data Outfit Wear gagal dihapus:\n\n" +
          outfitDeleteError.message,
      );

      return;
    }

    // =================================================
    // 5. HAPUS PRODUK
    // =================================================

    const { error: productDeleteError } = await supabaseClient
      .from("products")
      .delete()
      .eq("id", id);

    if (productDeleteError) {
      console.error("Gagal menghapus produk:", productDeleteError);

      alert("Gagal menghapus produk:\n\n" + productDeleteError.message);

      return;
    }

    // =================================================
    // 6. HAPUS DARI ARRAY
    // =================================================

    products = products.filter((item) => item.id !== id);

    // =================================================
    // 7. RENDER ULANG
    // =================================================

    renderProducts();

    // =================================================
    // 8. HASIL
    // =================================================

    if (mainImageFailed || outfitImagesFailed) {
      alert(
        "Produk berhasil dihapus dari database.\n\n" +
          "Namun ada satu atau beberapa foto yang gagal " +
          "dihapus dari Storage. Silakan cek Supabase Storage.",
      );
    } else {
      alert("Produk dan semua foto berhasil dihapus.");
    }

    console.log("Produk berhasil dihapus sepenuhnya:", product.name);
  } catch (error) {
    console.error("Delete Product Error:", error);

    alert("Terjadi kesalahan saat menghapus produk:\n\n" + error.message);
  }
}

// =====================================================
// EDIT PRODUCT
// =====================================================

function editProduct(id) {
  window.location.href = `add-product.html?edit=${encodeURIComponent(id)}`;
}

// =====================================================
// INITIALIZE
// =====================================================

loadProducts();
