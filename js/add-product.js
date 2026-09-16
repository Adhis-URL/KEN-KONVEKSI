document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("productForm");

  if (!form) {
    console.error("Form productForm tidak ditemukan.");
    return;
  }

  // =====================================================
  // ELEMENT
  // =====================================================

  const nameInput = document.getElementById("productName");
  const priceInput = document.getElementById("productPrice");
  const stockInput = document.getElementById("productStock");
  const categoryInput = document.getElementById("productCategory");
  const conditionInput = document.getElementById("productCondition");
  const descriptionInput = document.getElementById("productDescription");

  const productImageInput = document.getElementById("productImage");

  const outfitImagesInput = document.getElementById("outfitImages");

  const imagePreview = document.getElementById("imagePreview");

  const outfitPreview = document.getElementById("outfitPreview");

  const outfitFileMessage = document.getElementById("outfitFileMessage");

  const categoryImagePreview = document.getElementById("categoryImagePreview");

  const pageTitle = document.getElementById("pageTitle");

  const saveButton = document.getElementById("saveProductBtn");

  // =====================================================
  // DATA PRODUK
  // =====================================================

  let products = JSON.parse(localStorage.getItem("kenProducts")) || [];

  // =====================================================
  // CEK MODE EDIT
  // =====================================================

  const urlParams = new URLSearchParams(window.location.search);

  const editId = urlParams.get("edit");

  let editingProduct = null;

  // =====================================================
  // OUTFIT FILE STORAGE
  // =====================================================

  /*
    Array ini digunakan untuk menyimpan
    semua foto Outfit yang dipilih.

    Jadi kalau:
    pilih 1 foto
    lalu pilih 2 foto lagi

    hasilnya:
    foto 1 + foto 2 + foto 3
  */

  let selectedOutfitFiles = [];

  /*
    Foto Outfit lama dari produk ketika EDIT
  */

  let existingOutfitImages = [];

  // =====================================================
  // MODE EDIT
  // =====================================================

  if (editId) {
    editingProduct = products.find(
      (product) => String(product.id) === String(editId),
    );

    if (!editingProduct) {
      alert("Produk yang ingin diedit tidak ditemukan.");

      window.location.href = "products.html";

      return;
    }

    pageTitle.textContent = "Edit Produk";

    saveButton.textContent = "Simpan Perubahan";

    loadProductData(editingProduct);
  }

  // =====================================================
  // LOAD DATA PRODUK
  // =====================================================

  function loadProductData(product) {
    nameInput.value = product.name || "";

    priceInput.value = Number(product.price) || 0;

    stockInput.value = Number(product.stock) || 0;

    categoryInput.value = product.category || "";

    conditionInput.value = product.condition || "";

    descriptionInput.value = product.description || "";

    // ===================================================
    // SIZE
    // ===================================================

    const sizeInputs = document.querySelectorAll('input[name="size"]');

    sizeInputs.forEach((input) => {
      input.checked =
        Array.isArray(product.sizes) && product.sizes.includes(input.value);
    });

    // ===================================================
    // GAMBAR UTAMA
    // ===================================================

    if (product.image && imagePreview) {
      imagePreview.innerHTML = `
        <img
          src="${product.image}"
          alt="${product.name}"
        />
      `;
    }

    // ===================================================
    // OUTFIT LAMA
    // ===================================================

    existingOutfitImages = Array.isArray(product.outfits)
      ? [...product.outfits]
      : [];

    renderOutfitPreview();

    updateCategoryPreview();
  }

  // =====================================================
  // CATEGORY IMAGE
  // =====================================================

  function updateCategoryPreview() {
    if (!categoryImagePreview) {
      return;
    }

    const category = categoryInput.value;

    const categoryImages = {
      "T-Shirt": "../assets/Tshirt.jpeg",

      Shirt: "../assets/Shirt.jpeg",

      Hoodie: "../assets/Hoodie.jpeg",

      Jacket: "../assets/Jacket.jpeg",

      Pants: "../assets/pants.jpeg",
    };

    if (categoryImages[category]) {
      categoryImagePreview.innerHTML = `
        <img
          src="${categoryImages[category]}"
          alt="${category}"
        />
      `;
    } else {
      categoryImagePreview.innerHTML = `
        <span>
          Pilih kategori terlebih dahulu
        </span>
      `;
    }
  }

  categoryInput.addEventListener("change", updateCategoryPreview);

  // =====================================================
  // FOTO PRODUK UTAMA
  // =====================================================

  productImageInput.addEventListener("change", function () {
    const file = productImageInput.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      imagePreview.innerHTML = `
            <img
              src="${event.target.result}"
              alt="Preview Produk"
            />
          `;
    };

    reader.readAsDataURL(file);
  });

  // =====================================================
  // FOTO OUTFIT
  // =====================================================

  outfitImagesInput.addEventListener("change", function () {
    const newFiles = Array.from(outfitImagesInput.files);

    if (newFiles.length === 0) {
      return;
    }

    /*
        Jumlah total:

        Foto lama
        +
        Foto baru
      */

    const totalFiles =
      existingOutfitImages.length +
      selectedOutfitFiles.length +
      newFiles.length;

    // =================================================
    // CEK MAKSIMAL 10
    // =================================================

    if (totalFiles > 10) {
      alert(
        `Maksimal 10 foto Outfit Wear.\n\n` +
          `Saat ini sudah ada ${
            existingOutfitImages.length + selectedOutfitFiles.length
          } foto.`,
      );

      // Reset input
      outfitImagesInput.value = "";

      return;
    }

    // =================================================
    // TAMBAHKAN FILE BARU
    // =================================================

    selectedOutfitFiles.push(...newFiles);

    // =================================================
    // RESET INPUT
    // =================================================

    /*
        Ini penting.

        Setelah memilih foto,
        input dikosongkan kembali.

        Dengan begitu kamu bisa
        membuka file picker lagi
        dan memilih foto tambahan.
      */

    outfitImagesInput.value = "";

    // =================================================
    // UPDATE PREVIEW
    // =================================================

    renderOutfitPreview();
  });

  // =====================================================
  // RENDER OUTFIT PREVIEW
  // =====================================================

  function renderOutfitPreview() {
    if (!outfitPreview) {
      return;
    }

    outfitPreview.innerHTML = "";

    // ===================================================
    // TOTAL FOTO
    // ===================================================

    const totalCount = existingOutfitImages.length + selectedOutfitFiles.length;

    // ===================================================
    // MESSAGE
    // ===================================================

    if (outfitFileMessage) {
      if (totalCount === 0) {
        outfitFileMessage.textContent =
          "Belum ada foto yang dipilih. Maksimal 10 foto.";
      } else {
        outfitFileMessage.textContent = `${totalCount} foto dipilih. Maksimal 10 foto.`;
      }
    }

    // ===================================================
    // FOTO LAMA
    // ===================================================

    existingOutfitImages.forEach(function (image, index) {
      const item = document.createElement("div");

      item.className = "outfit-preview-item";

      item.innerHTML = `
          <img
            src="${image}"
            alt="Outfit ${index + 1}"
          />

          <button
            type="button"
            class="remove-outfit-btn"
            data-type="existing"
            data-index="${index}"
          >
            ×
          </button>
        `;

      outfitPreview.appendChild(item);
    });

    // ===================================================
    // FOTO BARU
    // ===================================================

    selectedOutfitFiles.forEach(function (file, index) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const item = document.createElement("div");

        item.className = "outfit-preview-item";

        item.innerHTML = `
              <img
                src="${event.target.result}"
                alt="Outfit Baru ${index + 1}"
              />

              <button
                type="button"
                class="remove-outfit-btn"
                data-type="new"
                data-index="${index}"
              >
                ×
              </button>
            `;

        outfitPreview.appendChild(item);

        updateOutfitMessage();
      };

      reader.readAsDataURL(file);
    });

    updateOutfitMessage();
  }

  // =====================================================
  // UPDATE OUTFIT MESSAGE
  // =====================================================

  function updateOutfitMessage() {
    if (!outfitFileMessage) {
      return;
    }

    const totalCount = existingOutfitImages.length + selectedOutfitFiles.length;

    if (totalCount === 0) {
      outfitFileMessage.textContent =
        "Belum ada foto yang dipilih. Maksimal 10 foto.";
    } else {
      outfitFileMessage.textContent = `${totalCount} foto dipilih. Maksimal 10 foto.`;
    }
  }

  // =====================================================
  // REMOVE OUTFIT
  // =====================================================

  outfitPreview.addEventListener("click", function (event) {
    const button = event.target.closest(".remove-outfit-btn");

    if (!button) {
      return;
    }

    const type = button.dataset.type;

    const index = Number(button.dataset.index);

    // =================================================
    // HAPUS FOTO LAMA
    // =================================================

    if (type === "existing") {
      existingOutfitImages.splice(index, 1);
    }

    // =================================================
    // HAPUS FOTO BARU
    // =================================================

    if (type === "new") {
      selectedOutfitFiles.splice(index, 1);
    }

    renderOutfitPreview();
  });

  // =====================================================
  // SUBMIT
  // =====================================================

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // =================================================
    // DATA FORM
    // =================================================

    const name = nameInput.value.trim();

    const price = Number(priceInput.value);

    const stock = Number(stockInput.value);

    const category = categoryInput.value;

    const condition = conditionInput.value;

    const description = descriptionInput.value.trim();

    // =================================================
    // VALIDASI NAMA
    // =================================================

    if (!name) {
      alert("Nama produk wajib diisi.");

      nameInput.focus();

      return;
    }

    // =================================================
    // VALIDASI HARGA
    // =================================================

    if (!Number.isFinite(price) || price < 0) {
      alert("Harga produk tidak valid.");

      priceInput.focus();

      return;
    }

    // =================================================
    // VALIDASI STOK
    // =================================================

    if (!Number.isFinite(stock) || stock < 0) {
      alert("Stok produk tidak valid.");

      stockInput.focus();

      return;
    }

    // =================================================
    // SIZE
    // =================================================

    const selectedSizes = Array.from(
      document.querySelectorAll('input[name="size"]:checked'),
    ).map((input) => input.value);

    if (selectedSizes.length === 0) {
      alert("Pilih minimal satu ukuran.");

      return;
    }

    // =================================================
    // GAMBAR UTAMA
    // =================================================

    let mainImage = editingProduct?.image || "";

    if (productImageInput.files.length > 0) {
      mainImage = await fileToBase64(productImageInput.files[0]);
    }

    // =================================================
    // OUTFIT
    // =================================================

    let outfitImages = [...existingOutfitImages];

    // =================================================
    // KONVERSI FOTO BARU
    // =================================================

    if (selectedOutfitFiles.length > 0) {
      const newOutfitImages = await Promise.all(
        selectedOutfitFiles.map((file) => fileToBase64(file)),
      );

      outfitImages.push(...newOutfitImages);
    }

    // =================================================
    // CEK FINAL MAKSIMAL 10
    // =================================================

    if (outfitImages.length > 10) {
      alert("Maksimal 10 foto Outfit Wear.");

      return;
    }

    // =================================================
    // UPDATE PRODUK
    // =================================================

    if (editingProduct) {
      const index = products.findIndex(
        (product) => String(product.id) === String(editingProduct.id),
      );

      if (index === -1) {
        alert("Produk tidak ditemukan.");

        return;
      }

      products[index] = {
        ...products[index],

        name: name,

        price: price,

        stock: stock,

        category: category,

        condition: condition,

        sizes: selectedSizes,

        description: description,

        image: mainImage,

        outfits: outfitImages,
      };

      console.log("PRODUK DIUPDATE:", products[index]);
    }

    // =================================================
    // TAMBAH PRODUK BARU
    // =================================================
    else {
      const newProduct = {
        id: "product-" + Date.now(),

        name: name,

        price: price,

        stock: stock,

        category: category,

        condition: condition,

        sizes: selectedSizes,

        description: description,

        image: mainImage,

        outfits: outfitImages,

        createdAt: new Date().toISOString(),
      };

      products.push(newProduct);

      console.log("PRODUK BARU:", newProduct);
    }

    // =================================================
    // SIMPAN
    // =================================================

    localStorage.setItem("kenProducts", JSON.stringify(products));

    // =================================================
    // VERIFIKASI
    // =================================================

    const savedProducts = JSON.parse(localStorage.getItem("kenProducts")) || [];

    const savedProduct = savedProducts.find(
      (product) => String(product.id) === String(editingProduct?.id),
    );

    if (editingProduct && savedProduct) {
      console.log("Harga setelah disimpan:", savedProduct.price);

      console.log("Jumlah Outfit:", savedProduct.outfits?.length || 0);
    }

    // =================================================
    // SELESAI
    // =================================================

    alert(
      editingProduct
        ? "Produk berhasil diperbarui!"
        : "Produk berhasil ditambahkan!",
    );

    window.location.href = "products.html";
  });

  // =====================================================
  // FILE → BASE64
  // =====================================================

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();

      reader.onload = function () {
        resolve(reader.result);
      };

      reader.onerror = function () {
        reject(new Error("Gagal membaca file."));
      };

      reader.readAsDataURL(file);
    });
  }

  // =====================================================
  // INITIALIZE
  // =====================================================

  updateCategoryPreview();

  updateOutfitMessage();
});
