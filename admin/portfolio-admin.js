const form = document.getElementById("portfolioForm");

const imageInput = document.getElementById("portfolioImages");

const imagePreview = document.getElementById("imagePreview");

const saveButton = document.getElementById("savePortfolioBtn");

const statusMessage = document.getElementById("statusMessage");

// =====================================================
// PREVIEW FOTO
// =====================================================

imageInput.addEventListener("change", function () {
  imagePreview.innerHTML = "";

  const files = Array.from(this.files);

  if (files.length > 10) {
    alert("Maksimal 10 foto.");

    this.value = "";

    return;
  }

  files.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const item = document.createElement("div");

      item.className = "preview-item";

      item.innerHTML = `
        <img
          src="${event.target.result}"
          alt="Preview ${index + 1}"
        >

        <span class="preview-number">
          ${index === 0 ? "Foto Utama" : index + 1}
        </span>
      `;

      imagePreview.appendChild(item);
    };

    reader.readAsDataURL(file);
  });
});

// =====================================================
// UPLOAD PORTFOLIO
// =====================================================

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("portfolioTitle").value.trim();

  const category = document.getElementById("portfolioCategory").value;

  const description = document
    .getElementById("portfolioDescription")
    .value.trim();

  const isVisible = document.getElementById("portfolioVisible").checked;

  const files = Array.from(imageInput.files);

  if (!files.length) {
    alert("Silakan pilih minimal 1 foto.");

    return;
  }

  if (files.length > 10) {
    alert("Maksimal 10 foto.");

    return;
  }

  saveButton.disabled = true;

  saveButton.textContent = "Menyimpan...";

  try {
    // =================================================
    // 1. BUAT DATA PORTFOLIO
    // =================================================

    const { data: portfolio, error: portfolioError } = await supabaseClient
      .from("portfolio")
      .insert({
        title: title,
        category: category,
        description: description,
        is_visible: isVisible,
      })
      .select()
      .single();

    if (portfolioError) {
      throw portfolioError;
    }

    // =================================================
    // 2. UPLOAD SEMUA FOTO
    // =================================================

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const extension = file.name.split(".").pop();

      const fileName = `${portfolio.id}/${Date.now()}-${i}.${extension}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("portfolio")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // ===============================================
      // 3. AMBIL URL PUBLIC
      // ===============================================

      const { data: publicUrlData } = supabaseClient.storage
        .from("portfolio")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      uploadedImages.push({
        portfolio_id: portfolio.id,
        image_url: imageUrl,
      });

      // FOTO PERTAMA = FOTO UTAMA
      if (i === 0) {
        const { error: updateError } = await supabaseClient
          .from("portfolio")
          .update({
            image_url: imageUrl,
          })
          .eq("id", portfolio.id);

        if (updateError) {
          throw updateError;
        }
      }
    }

    // =================================================
    // 4. SIMPAN FOTO TAMBAHAN
    // =================================================

    if (uploadedImages.length > 0) {
      const { error: imagesError } = await supabaseClient
        .from("portfolio_images")
        .insert(uploadedImages);

      if (imagesError) {
        throw imagesError;
      }
    }

    // =================================================
    // BERHASIL
    // =================================================

    statusMessage.textContent = "Portfolio berhasil ditambahkan!";

    statusMessage.classList.add("show");

    statusMessage.style.background = "#e8f7e8";

    statusMessage.style.color = "#176b17";

    setTimeout(() => {
      window.location.href = "portfolio.html";
    }, 1200);
  } catch (error) {
    console.error(error);

    statusMessage.textContent = "Gagal menyimpan portfolio: " + error.message;

    statusMessage.classList.add("show");

    statusMessage.style.background = "#ffe8e8";

    statusMessage.style.color = "#a00000";

    saveButton.disabled = false;

    saveButton.textContent = "Simpan Portfolio";
  }
});
