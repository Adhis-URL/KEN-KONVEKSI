// =====================================================
// KEN KONVEKSI - OUTFIT WEAR
// SUPABASE VERSION
// =====================================================

const outfitGrid = document.getElementById("outfitGrid");
const outfitCount = document.getElementById("outfitCount");

// =====================================================
// FORMAT
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
// LOAD OUTFIT
// =====================================================

async function loadOutfits() {
  if (typeof supabaseClient === "undefined") {
    console.error("Supabase belum tersedia.");

    outfitGrid.innerHTML = `
      <div class="outfit-empty">
        <h3>Supabase belum terhubung</h3>
        <p>Periksa konfigurasi Supabase.</p>
      </div>
    `;

    return;
  }

  outfitGrid.innerHTML = `
    <div class="outfit-loading">
      Memuat outfit...
    </div>
  `;

  try {
    const { data, error } = await supabaseClient

      .from("product_outfits")

      .select(
        `
        id,
        image_url,
        product_id,
        created_at,
        products (
          id,
          name,
          image_url
        )
      `,
      )

      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Supabase outfit error:", error);

      outfitGrid.innerHTML = `
        <div class="outfit-empty">
          <h3>Gagal memuat outfit</h3>
          <p>${escapeHTML(error.message)}</p>
        </div>
      `;

      return;
    }

    const outfits = Array.isArray(data) ? data : [];

    console.log("Outfit dari Supabase:", outfits);

    // UPDATE JUMLAH
    if (outfitCount) {
      outfitCount.textContent = outfits.length;
    }

    // JIKA KOSONG
    if (outfits.length === 0) {
      outfitGrid.innerHTML = `
        <div class="outfit-empty">
          <h3>Belum ada Outfit Wear</h3>
          <p>
            Upload foto Outfit Wear melalui Admin → Tambah Produk.
          </p>
        </div>
      `;

      return;
    }

    // =================================================
    // RENDER
    // =================================================

    outfitGrid.innerHTML = outfits
      .map(function (outfit) {
        const product = outfit.products || {};

        const productName = product.name || "KEN KONVEKSI";

        return `
        <article class="outfit-card">

          <a
            href="product.html?id=${encodeURIComponent(
              product.id || outfit.product_id,
            )}"
            class="outfit-image"
          >

            <img
              src="${escapeHTML(outfit.image_url)}"
              alt="${escapeHTML(productName)}"
              loading="lazy"
              onerror="this.style.display='none'"
            >

          </a>


          <div class="outfit-info">

            <span>KEN KONVEKSI STYLE</span>

            <h3>
              ${escapeHTML(productName)}
            </h3>

            <a
              href="product.html?id=${encodeURIComponent(
                product.id || outfit.product_id,
              )}"
            >
              Lihat Produk →
            </a>

          </div>

        </article>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Outfit error:", error);

    outfitGrid.innerHTML = `
      <div class="outfit-empty">
        <h3>Terjadi kesalahan</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;
  }
}

// =====================================================
// START
// =====================================================

loadOutfits();
