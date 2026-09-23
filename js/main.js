// =====================================================
// KEN KONVEKSI - MAIN JS
// WEBSITE UTAMA
// =====================================================

console.log("KEN KONVEKSI website berhasil dijalankan!");

// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL = "https://zdpkanqgwlmbrkanyrjo.supabase.co";

const SUPABASE_KEY = "sb_publishable_olOOWAKiJRqq--6seYsA5Q_mOjo2CF7";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =====================================================
// FORMAT RUPIAH
// =====================================================

function formatRupiah(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(price) || 0);
}

// =====================================================
// NEW ARRIVALS
// =====================================================

async function loadNewArrivals() {
  const container = document.getElementById("newArrivals");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="empty-products">
      <p>Memuat koleksi terbaru...</p>
    </div>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(4);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="empty-products">
          <p>Belum ada produk terbaru.</p>
          <span>Tambahkan produk melalui Admin Panel.</span>
        </div>
      `;

      return;
    }

    container.innerHTML = data
      .map(function (product) {
        const productName = product.name || "Produk KEN KONVEKSI";

        const image = product.image_url
          ? `
            <img
              src="${escapeHTML(product.image_url)}"
              alt="${escapeHTML(productName)}"
              loading="lazy"
            />
          `
          : `
            <div class="image-placeholder">
              PRODUCT
            </div>
          `;

        const isNew = String(product.condition || "").toLowerCase() === "new";

        return `
          <a
            href="product.html?id=${encodeURIComponent(product.id)}"
            class="product-card-link"
          >
            <article class="product-card">

              <div class="product-image">

                ${
                  isNew
                    ? `
                      <span class="product-badge">
                        NEW
                      </span>
                    `
                    : ""
                }

                ${image}

              </div>

              <div class="product-info">

                <p class="product-category">
                  ${escapeHTML(product.category || "CLOTHING")}
                </p>

                <h3>
                  ${escapeHTML(productName)}
                </h3>

                <p class="product-price">
                  ${formatRupiah(product.price)}
                </p>

              </div>

            </article>
          </a>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Supabase Products Error:", error);

    container.innerHTML = `
      <div class="empty-products">
        <p>Gagal mengambil produk.</p>
        <span>
          Periksa koneksi Supabase.
        </span>
      </div>
    `;
  }
}

// =====================================================
// OUR WORK / PORTFOLIO
// =====================================================

async function loadPortfolio() {
  const container = document.getElementById("portfolioGrid");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="portfolio-empty">
      <p>Memuat hasil pekerjaan...</p>
    </div>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("portfolio")
      .select(
        `
        id,
        title,
        category,
        description,
        image_url,
        is_visible,
        created_at
      `,
      )
      .eq("is_visible", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    // ===============================================
    // BELUM ADA DATA
    // ===============================================

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="portfolio-empty">
          <p>
            Belum ada hasil pekerjaan
            yang ditampilkan.
          </p>

          <span>
            Tambahkan portfolio melalui
            Admin Panel.
          </span>
        </div>
      `;

      return;
    }

    // ===============================================
    // TAMPILKAN PORTFOLIO
    // ===============================================

    container.innerHTML = data
      .map(function (item) {
        const image = item.image_url
          ? `
            <img
              src="${escapeHTML(item.image_url)}"
              alt="${escapeHTML(item.title || "Hasil pekerjaan KEN KONVEKSI")}"
              loading="lazy"
            />
          `
          : `
            <div class="portfolio-image-placeholder">
              KEN KONVEKSI
            </div>
          `;

        const category = item.category || "PROJECT";

        const title = item.title || "Hasil Pekerjaan";

        const description = item.description || "Hasil produksi KEN KONVEKSI.";

        return `
          <article class="portfolio-card">

            <div class="portfolio-image">

              ${image}

              <span class="portfolio-category">
                ${escapeHTML(category)}
              </span>

            </div>

            <div class="portfolio-info">

              <h3>
                ${escapeHTML(title)}
              </h3>

              <p>
                ${escapeHTML(description)}
              </p>

            </div>

          </article>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Supabase Portfolio Error:", error);

    container.innerHTML = `
      <div class="portfolio-empty">

        <p>
          Gagal memuat hasil pekerjaan.
        </p>

        <span>
          Periksa koneksi Supabase
          dan RLS tabel portfolio.
        </span>

      </div>
    `;
  }
}

// =====================================================
// JALANKAN
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  loadNewArrivals();

  loadPortfolio();
});
