// =====================================================
// KEN KONVEKSI
// ADMIN - ADD / EDIT PRODUCT
// SUPABASE VERSION
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {
  // =====================================================
  // FORM
  // =====================================================

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
  // CEK SUPABASE
  // =====================================================

  if (typeof supabaseClient === "undefined") {
    alert(
      "Supabase belum terhubung.\n\n" +
        "Pastikan Supabase CDN dan konfigurasi supabaseClient " +
        "dipasang sebelum add-product.js.",
    );

    console.error("supabaseClient tidak ditemukan.");

    return;
  }

  // =====================================================
  // URL EDIT
  // =====================================================

  const urlParams = new URLSearchParams(window.location.search);

  const editId = urlParams.get("edit");

  // =====================================================
  // DATA EDIT
  // =====================================================

  let editingProduct = null;

  // =====================================================
  // FOTO OUTFIT BARU
  // =====================================================

  let selectedOutfitFiles = [];

  // =====================================================
  // FOTO OUTFIT LAMA
  // =====================================================

  let existingOutfitImages = [];

  // =====================================================
  // MODE EDIT
  // =====================================================

  if (editId) {
    pageTitle.textContent = "Edit Produk";

    saveButton.textContent = "Simpan Perubahan";

    await loadEditingProduct(editId);
  }

  // =====================================================
  // LOAD PRODUK UNTUK EDIT
  // =====================================================

  async function loadEditingProduct(id) {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    // ===================================================
    // ERROR
    // ===================================================

    if (error) {
      console.error("Gagal mengambil produk:", error);

      alert("Produk yang ingin diedit tidak ditemukan.");

      window.location.href = "products.html";

      return;
    }

    editingProduct = data;

    // ===================================================
    // DATA DASAR
    // ===================================================

    nameInput.value = data.name || "";

    priceInput.value = Number(data.price) || 0;

    stockInput.value = Number(data.stock) || 0;

    categoryInput.value = data.category || "";

    conditionInput.value = data.condition || "";

    descriptionInput.value = data.description || "";

    // ===================================================
    // SIZE
    // ===================================================

    const sizeInputs = document.querySelectorAll('input[name="size"]');

    sizeInputs.forEach(function (input) {
      input.checked =
        Array.isArray(data.sizes) && data.sizes.includes(input.value);
    });

    // ===================================================
    // GAMBAR UTAMA
    // ===================================================

    if (data.image_url && imagePreview) {
      imagePreview.innerHTML = `
        <img
          src="${data.image_url}"
          alt="${escapeHTML(data.name)}"
        />
      `;
    }

    // ===================================================
    // AMBIL FOTO OUTFIT
    // ===================================================

    const { data: outfits, error: outfitError } = await supabaseClient
      .from("product_outfits")
      .select("*")
      .eq("product_id", id)
      .order("created_at", {
        ascending: true,
      });

    if (outfitError) {
      console.error("Gagal mengambil Outfit Wear:", outfitError);
    }

    existingOutfitImages = Array.isArray(outfits)
      ? outfits.map(function (item) {
          return {
            id: item.id,
            url: item.image_url,
          };
        })
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
          alt="${escapeHTML(category)}"
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
  // GAMBAR PRODUK UTAMA - PREVIEW
  // =====================================================

  productImageInput.addEventListener("change", function () {
    const file = productImageInput.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File gambar utama harus berupa gambar.");

      productImageInput.value = "";

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
  // OUTFIT FILE
  // =====================================================

  outfitImagesInput.addEventListener("change", function () {
    const newFiles = Array.from(outfitImagesInput.files);

    if (newFiles.length === 0) {
      return;
    }

    // =================================================
    // VALIDASI FILE
    // =================================================

    const invalidFile = newFiles.find(function (file) {
      return !file.type.startsWith("image/");
    });

    if (invalidFile) {
      alert("Semua file Outfit Wear harus berupa gambar.");

      outfitImagesInput.value = "";

      return;
    }

    // =================================================
    // TOTAL FOTO
    // =================================================

    const totalFiles =
      existingOutfitImages.length +
      selectedOutfitFiles.length +
      newFiles.length;

    // =================================================
    // MAX 10
    // =================================================

    if (totalFiles > 10) {
      alert(
        `Maksimal 10 foto Outfit Wear.\n\n` +
          `Saat ini sudah ada ${
            existingOutfitImages.length + selectedOutfitFiles.length
          } foto.`,
      );

      outfitImagesInput.value = "";

      return;
    }

    // =================================================
    // TAMBAHKAN
    // =================================================

    selectedOutfitFiles.push(...newFiles);

    // =================================================
    // RESET INPUT
    // =================================================

    outfitImagesInput.value = "";

    // =================================================
    // PREVIEW
    // =================================================

    renderOutfitPreview();
  });

  // =====================================================
  // RENDER OUTFIT
  // =====================================================

  function renderOutfitPreview() {
    if (!outfitPreview) {
      return;
    }

    outfitPreview.innerHTML = "";

    // ===================================================
    // TOTAL
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

    existingOutfitImages.forEach(function (item, index) {
      const element = document.createElement("div");

      element.className = "outfit-preview-item";

      element.innerHTML = `
          <img
            src="${item.url}"
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

      outfitPreview.appendChild(element);
    });

    // ===================================================
    // FOTO BARU
    // ===================================================

    selectedOutfitFiles.forEach(function (file, index) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const element = document.createElement("div");

        element.className = "outfit-preview-item";

        element.innerHTML = `
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

        outfitPreview.appendChild(element);
      };

      reader.readAsDataURL(file);
    });

    updateOutfitMessage();
  }

  // =====================================================
  // UPDATE MESSAGE
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

    // ===============================================
    // FOTO LAMA
    // ===============================================

    if (type === "existing") {
      const confirmDelete = confirm("Hapus foto Outfit Wear ini?");

      if (!confirmDelete) {
        return;
      }

      existingOutfitImages.splice(index, 1);
    }

    // ===============================================
    // FOTO BARU
    // ===============================================

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
    // DISABLE BUTTON
    // =================================================

    saveButton.disabled = true;

    saveButton.textContent = "Menyimpan...";

    try {
      // ===============================================
      // DATA FORM
      // ===============================================

      const name = nameInput.value.trim();

      const price = Number(priceInput.value);

      const stock = Number(stockInput.value);

      const category = categoryInput.value;

      const condition = conditionInput.value;

      const description = descriptionInput.value.trim();

      // ===============================================
      // VALIDASI
      // ===============================================

      if (!name) {
        alert("Nama produk wajib diisi.");

        nameInput.focus();

        return;
      }

      if (!Number.isFinite(price) || price < 0) {
        alert("Harga produk tidak valid.");

        priceInput.focus();

        return;
      }

      if (!Number.isFinite(stock) || stock < 0) {
        alert("Stok produk tidak valid.");

        stockInput.focus();

        return;
      }

      // ===============================================
      // SIZE
      // ===============================================

      const selectedSizes = Array.from(
        document.querySelectorAll('input[name="size"]:checked'),
      ).map(function (input) {
        return input.value;
      });

      if (selectedSizes.length === 0) {
        alert("Pilih minimal satu ukuran.");

        return;
      }

      // ===============================================
      // ID PRODUK
      // ===============================================

      let productId = editingProduct ? editingProduct.id : null;

      // ===============================================
      // GAMBAR UTAMA
      // ===============================================

      let imageUrl = editingProduct?.image_url || null;

      // ===============================================
      // UPLOAD GAMBAR UTAMA
      // ===============================================

      if (productImageInput.files.length > 0) {
        const mainFile = productImageInput.files[0];

        const extension = getFileExtension(mainFile.name);

        const fileName = `main-${Date.now()}-${randomString(8)}.${extension}`;

        const filePath = `${productId || "new"}/${fileName}`;

        console.log("Upload gambar utama:", filePath);

        const { error: uploadError } = await supabaseClient.storage
          .from("products")
          .upload(filePath, mainFile, {
            cacheControl: "3600",

            upsert: false,
          });

        if (uploadError) {
          console.error("Upload gambar utama gagal:", uploadError);

          throw new Error("Gagal upload gambar utama: " + uploadError.message);
        }

        imageUrl = getPublicUrl(filePath);

        console.log("URL gambar utama:", imageUrl);
      }

      // ===============================================
      // SIMPAN / UPDATE DATABASE
      // ===============================================

      let savedProduct;

      // ===============================================
      // UPDATE
      // ===============================================

      if (editingProduct) {
        const { data, error } = await supabaseClient
          .from("products")
          .update({
            name: name,

            price: price,

            stock: stock,

            category: category,

            condition: condition,

            sizes: selectedSizes,

            description: description,

            image_url: imageUrl,
          })
          .eq("id", editingProduct.id)
          .select()
          .single();

        if (error) {
          console.error("Update produk gagal:", error);

          throw new Error("Gagal memperbarui produk: " + error.message);
        }

        savedProduct = data;

        productId = data.id;
      }

      // ===============================================
      // TAMBAH BARU
      // ===============================================
      else {
        const { data, error } = await supabaseClient
          .from("products")
          .insert({
            name: name,

            price: price,

            stock: stock,

            category: category,

            condition: condition,

            sizes: selectedSizes,

            description: description,

            image_url: imageUrl,
          })
          .select()
          .single();

        if (error) {
          console.error("Tambah produk gagal:", error);

          throw new Error("Gagal menambahkan produk: " + error.message);
        }

        savedProduct = data;

        productId = data.id;
      }

      // ===============================================
      // JIKA GAMBAR UTAMA PRODUK BARU
      // ===============================================

      /*
          Untuk produk baru:
          sebelumnya kita upload ke folder "new".

          Supabase sudah memberikan ID setelah insert.

          Kita tidak perlu memindahkan file.
          URL tetap valid.
        */

      // ===============================================
      // FOTO OUTFIT
      // ===============================================

      // ===============================================
      // HAPUS DATA OUTFIT LAMA YANG DIHAPUS
      // ===============================================

      if (editingProduct) {
        const keptIds = existingOutfitImages.map(function (item) {
          return item.id;
        });

        const { data: oldOutfits, error: oldOutfitError } = await supabaseClient
          .from("product_outfits")
          .select("id")
          .eq("product_id", productId);

        if (oldOutfitError) {
          console.error("Gagal mengambil Outfit lama:", oldOutfitError);
        } else {
          const deletedOutfits = oldOutfits.filter(function (item) {
            return !keptIds.includes(item.id);
          });

          for (const outfit of deletedOutfits) {
            const { error: deleteError } = await supabaseClient
              .from("product_outfits")
              .delete()
              .eq("id", outfit.id);

            if (deleteError) {
              console.error("Gagal menghapus Outfit:", deleteError);
            }
          }
        }
      }

      // ===============================================
      // UPLOAD FOTO OUTFIT BARU
      // ===============================================

      for (const file of selectedOutfitFiles) {
        const extension = getFileExtension(file.name);

        const fileName = `outfit-${Date.now()}-${randomString(8)}.${extension}`;

        const filePath = `${productId}/${fileName}`;

        console.log("Upload Outfit:", filePath);

        // =============================================
        // STORAGE
        // =============================================

        const { error: uploadError } = await supabaseClient.storage
          .from("products")
          .upload(filePath, file, {
            cacheControl: "3600",

            upsert: false,
          });

        if (uploadError) {
          console.error("Upload Outfit gagal:", uploadError);

          throw new Error(
            "Gagal upload foto Outfit Wear: " + uploadError.message,
          );
        }

        // =============================================
        // URL
        // =============================================

        const outfitUrl = getPublicUrl(filePath);

        // =============================================
        // DATABASE
        // =============================================

        const { error: outfitInsertError } = await supabaseClient
          .from("product_outfits")
          .insert({
            product_id: productId,

            image_url: outfitUrl,
          });

        if (outfitInsertError) {
          console.error("Gagal menyimpan Outfit:", outfitInsertError);

          throw new Error(
            "Gagal menyimpan data Outfit Wear: " + outfitInsertError.message,
          );
        }
      }

      // ===============================================
      // BERHASIL
      // ===============================================

      console.log("Produk berhasil disimpan:", savedProduct);

      alert(
        editingProduct
          ? "Produk berhasil diperbarui!"
          : "Produk berhasil ditambahkan!",
      );

      window.location.href = "products.html";
    } catch (error) {
      console.error("ERROR:", error);

      alert("Terjadi kesalahan:\n\n" + error.message);
    } finally {
      saveButton.disabled = false;

      saveButton.textContent = editingProduct
        ? "Simpan Perubahan"
        : "Simpan Produk";
    }
  });

  // =====================================================
  // PUBLIC URL
  // =====================================================

  function getPublicUrl(filePath) {
    const { data } = supabaseClient.storage
      .from("products")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // =====================================================
  // FILE EXTENSION
  // =====================================================

  function getFileExtension(filename) {
    const parts = filename.split(".");

    if (parts.length < 2) {
      return "jpg";
    }

    return (
      parts
        .pop()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "jpg"
    );
  }

  // =====================================================
  // RANDOM STRING
  // =====================================================

  function randomString(length) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  // =====================================================
  // ESCAPE HTML
  // =====================================================

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =====================================================
  // INITIALIZE
  // =====================================================

  updateCategoryPreview();

  updateOutfitMessage();
});
