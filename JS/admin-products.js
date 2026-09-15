// =====================================================
// ADMIN PRODUCTS
// =====================================================

// Ambil produk dari localStorage

let products = JSON.parse(localStorage.getItem("kenProducts")) || [];

// =====================================================
// ELEMENT
// =====================================================

const adminProducts = document.getElementById("adminProducts");

const productCount = document.getElementById("productCount");

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
// RENDER
// =====================================================

function renderProducts() {
  adminProducts.innerHTML = "";

  productCount.textContent = products.length;

  // Tidak ada produk

  if (products.length === 0) {
    adminProducts.innerHTML = `

            <div
                class="admin-product-empty">

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

  products.forEach((product) => {
    const card = document.createElement("article");

    card.className = "admin-product-card";

    // IMAGE

    let imageHTML = "";

    if (product.image) {
      imageHTML = `

                    <img
                        src="${product.image}"
                        alt="${product.name}">

                `;
    } else {
      imageHTML = `
                    PRODUCT
                `;
    }

    card.innerHTML = `

                <div
                    class="admin-product-image">

                    ${imageHTML}

                </div>


                <div
                    class="admin-product-body">

                    <div
                        class="admin-product-category">

                        ${product.category}

                    </div>


                    <h3>
                        ${product.name}
                    </h3>


                    <div
                        class="admin-product-price">

                        ${formatRupiah(product.price)}

                    </div>


                    <div
                        class="admin-product-stock">

                        Stok:
                        ${product.stock}

                    </div>


                    <div
                        class="admin-product-actions">

                        <button
                            onclick="editProduct('${product.id}')">

                            Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteProduct('${product.id}')">

                            Hapus

                        </button>

                    </div>

                </div>

            `;

    adminProducts.appendChild(card);
  });
}

// =====================================================
// DELETE
// =====================================================

function deleteProduct(id) {
  const product = products.find((item) => item.id === id);

  if (!product) {
    return;
  }

  const confirmDelete = confirm(`Hapus produk "${product.name}"?`);

  if (!confirmDelete) {
    return;
  }

  products = products.filter((item) => item.id !== id);

  localStorage.setItem("kenProducts", JSON.stringify(products));

  renderProducts();
}

// =====================================================
// EDIT
// =====================================================

function editProduct(id) {
  window.location.href = `add-product.html?edit=${encodeURIComponent(id)}`;
}

// =====================================================
// INITIALIZE
// =====================================================

renderProducts();
