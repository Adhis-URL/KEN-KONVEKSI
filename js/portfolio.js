// =====================================================
// KEN KONVEKSI
// ADMIN - OUR WORK / PORTFOLIO
// =====================================================

// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL = "https://zdpkanqgwlmbrkanyrjo.supabase.co";

const SUPABASE_KEY = "sb_publishable_olOOWAKiJRqq--6seYsA5Q_mOjo2CF7";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// ELEMENT
// =====================================================

const form = document.getElementById("portfolioForm");

const imageInput = document.getElementById("projectImage");

const imagePreview = document.getElementById("imagePreview");

const projectsContainer = document.getElementById("projectsContainer");

const saveButton = document.getElementById("saveProjectBtn");

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
// PREVIEW GAMBAR
// =====================================================

if (imageInput) {
  imageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
      imagePreview.innerHTML = "<span>No image selected</span>";

      return;
    }

    // Pastikan file gambar
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");

      this.value = "";

      imagePreview.innerHTML = "<span>No image selected</span>";

      return;
    }

    const imageURL = URL.createObjectURL(file);

    imagePreview.innerHTML = `
        <img
          src="${imageURL}"
          alt="Project Preview"
        >
      `;
  });
}

// =====================================================
// LOAD PROJECTS
// =====================================================

async function loadProjects() {
  if (!projectsContainer) {
    return;
  }

  projectsContainer.innerHTML = `
    <div class="empty-project">
      Loading projects...
    </div>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("portfolio")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      projectsContainer.innerHTML = `
        <div class="empty-project">

          <p>
            Belum ada project.
          </p>

          <span>
            Tambahkan project pertama
            melalui form di atas.
          </span>

        </div>
      `;

      return;
    }

    projectsContainer.innerHTML = data
      .map(function (project) {
        const image = project.image_url || "";

        return `
            <div class="project-card">

              <!-- IMAGE -->

              <div class="project-image">

                ${
                  image
                    ? `
                      <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                          project.title || "Project KEN KONVEKSI",
                        )}"
                        loading="lazy"
                      >
                    `
                    : `
                      <span>
                        No Image
                      </span>
                    `
                }

              </div>


              <!-- CONTENT -->

              <div class="project-content">

                <div class="project-category">
                  ${escapeHTML(project.category || "PROJECT")}
                </div>


                <h3>
                  ${escapeHTML(project.title || "Tanpa Judul")}
                </h3>


                <p>
                  ${escapeHTML(project.description || "")}
                </p>


                <!-- STATUS -->

                ${
                  project.is_visible
                    ? `
                      <span
                        class="
                          project-status
                          status-visible
                        "
                      >
                        Published
                      </span>
                    `
                    : `
                      <span
                        class="
                          project-status
                          status-hidden
                        "
                      >
                        Hidden
                      </span>
                    `
                }


                <!-- ACTION -->

                <div class="project-actions">

                  <button
                    type="button"
                    class="btn-delete"
                    data-id="${escapeHTML(project.id)}"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>
          `;
      })
      .join("");

    // ===============================================
    // DELETE BUTTON
    // ===============================================

    const deleteButtons = projectsContainer.querySelectorAll(".btn-delete");

    deleteButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const id = this.dataset.id;

        deleteProject(id);
      });
    });
  } catch (error) {
    console.error("Load Portfolio Error:", error);

    projectsContainer.innerHTML = `
      <div class="empty-project">

        <p>
          Gagal memuat portfolio.
        </p>

        <span>
          ${escapeHTML(error.message)}
        </span>

      </div>
    `;
  }
}

// =====================================================
// SAVE PROJECT
// =====================================================

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("projectTitle").value.trim();

    const category = document.getElementById("projectCategory").value;

    const description = document
      .getElementById("projectDescription")
      .value.trim();

    const visibility =
      document.getElementById("projectVisibility").value === "true";

    const file = imageInput.files[0];

    // =============================================
    // VALIDASI
    // =============================================

    if (!title) {
      alert("Judul project wajib diisi.");

      return;
    }

    if (!category) {
      alert("Silakan pilih kategori.");

      return;
    }

    if (!description) {
      alert("Deskripsi project wajib diisi.");

      return;
    }

    if (!file) {
      alert("Silakan pilih foto project.");

      return;
    }

    // =============================================
    // BUTTON LOADING
    // =============================================

    saveButton.disabled = true;

    saveButton.textContent = "Saving...";

    try {
      // =========================================
      // BUAT NAMA FILE
      // =========================================

      const extension = file.name.split(".").pop().toLowerCase();

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `projects/${fileName}`;

      // =========================================
      // UPLOAD GAMBAR
      // =========================================

      const { error: uploadError } = await supabaseClient.storage
        .from("portfolio")
        .upload(filePath, file, {
          cacheControl: "3600",

          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // =========================================
      // PUBLIC URL
      // =========================================

      const { data: publicData } = supabaseClient.storage
        .from("portfolio")
        .getPublicUrl(filePath);

      const imageURL = publicData.publicUrl;

      // =========================================
      // INSERT DATABASE
      // =========================================

      const { error: insertError } = await supabaseClient
        .from("portfolio")
        .insert({
          title: title,

          category: category,

          description: description,

          image_url: imageURL,

          is_visible: visibility,
        });

      if (insertError) {
        throw insertError;
      }

      // =========================================
      // BERHASIL
      // =========================================

      alert("Portfolio berhasil ditambahkan!");

      // Reset form

      form.reset();

      imagePreview.innerHTML = "<span>No image selected</span>";

      // Reload daftar

      await loadProjects();
    } catch (error) {
      console.error("Save Portfolio Error:", error);

      alert("Gagal menyimpan portfolio:\n\n" + error.message);
    } finally {
      saveButton.disabled = false;

      saveButton.textContent = "Save Project";
    }
  });
}

// =====================================================
// DELETE PROJECT
// =====================================================

async function deleteProject(id) {
  const confirmed = confirm("Apakah kamu yakin ingin menghapus project ini?");

  if (!confirmed) {
    return;
  }

  try {
    // =============================================
    // AMBIL DATA PROJECT
    // =============================================

    const { data: project, error: getError } = await supabaseClient
      .from("portfolio")
      .select("id,image_url")
      .eq("id", id)
      .single();

    if (getError) {
      throw getError;
    }

    // =============================================
    // HAPUS DATABASE
    // =============================================

    const { error: deleteError } = await supabaseClient
      .from("portfolio")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    // =============================================
    // HAPUS GAMBAR STORAGE
    // =============================================

    if (project && project.image_url) {
      const marker = "/storage/v1/object/public/portfolio/";

      const imageIndex = project.image_url.indexOf(marker);

      if (imageIndex !== -1) {
        const filePath = project.image_url.substring(
          imageIndex + marker.length,
        );

        await supabaseClient.storage.from("portfolio").remove([filePath]);
      }
    }

    // =============================================
    // BERHASIL
    // =============================================

    alert("Portfolio berhasil dihapus.");

    await loadProjects();
  } catch (error) {
    console.error("Delete Portfolio Error:", error);

    alert("Gagal menghapus portfolio:\n\n" + error.message);
  }
}

// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  loadProjects();
});
