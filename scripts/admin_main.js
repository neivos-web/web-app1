// =========================
// Admin Inline Editing Script
// =========================

// Detect current page (slug)
const PAGE_SLUG =
  window.location.pathname.split("/").pop().replace(".php", "").replace(".html", "") || "home";

// =====================
// Helper functions
// =====================

// Check if user is logged in (PHP session)
async function checkLoginStatus() {
  const res = await fetch("/php/check_session.php");
  const data = await res.json().catch(() => ({}));
  return data.logged_in || false;
}

// Save a single content block (text or image)
async function saveContent(page, key, type, value) {
  const res = await fetch("/php/save_content.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, key, type, value }),
  });
  return res.json().catch(() => ({ success: false }));
}

// Upload an image and return its URL
async function uploadImage(page, key, file) {
  const formData = new FormData();
  formData.append("page", page);
  formData.append("key", key);
  formData.append("type", "image");
  formData.append("file", file);

  const res = await fetch("/php/save_content.php", {
    method: "POST",
    body: formData,
  });
  return res.json().catch(() => ({ success: false }));
}

// Load all contents for current page
async function loadContents(page) {
  const res = await fetch(`/php/get_contents.php?page=${encodeURIComponent(page)}`);
  const data = await res.json().catch(() => ({ success: false }));
  if (!data.success) return;

  data.contents.forEach((item) => {
    const el = document.querySelector(`[data-key="${item.content_key}"]`);
    if (!el) return;
    if (item.content_type === "text") {
      el.innerText = item.content_value;
    } else if (item.content_type === "image") {
      const img = el.tagName === "IMG" ? el : el.querySelector("img");
      if (img) img.src = item.content_value;
    }
  });
}

// =====================
// Inline Editing Logic
// =====================
function enableInlineEditing() {
  // Make all edit buttons visible for admin
  document.querySelectorAll(".edit-btn, .menu-edit, .image-edit, .delete-btn, .add-block-btn")
    .forEach((btn) => (btn.style.display = "inline-flex"));

  // Handle editing
  document.body.addEventListener("click", async (e) => {
    const target = e.target;

    // Edit button click
    if (target.classList.contains("edit-btn") || target.classList.contains("menu-edit") || target.classList.contains("image-edit")) {
      const parent = target.closest("[data-key], .content-box");
      if (!parent) return;

      const editable = parent.querySelector("[data-editable]") || parent;
      const key = parent.dataset.key || Math.random().toString(36).substring(2, 10);
      const isImage = editable.tagName.toLowerCase() === "img" || target.classList.contains("image-edit");

      if (isImage) {
        // Image editing
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";
        document.body.appendChild(input);
        input.click();

        input.addEventListener("change", async () => {
          const file = input.files[0];
          if (!file) return;
          const result = await uploadImage(PAGE_SLUG, key, file);
          if (result.success && result.url) {
            editable.src = result.url;
            await saveContent(PAGE_SLUG, key, "image", result.url);
          } else {
            alert("Erreur lors du téléversement de l'image.");
          }
          input.remove();
        });
      } else {
        // Text editing
        const textarea = document.createElement("textarea");
        textarea.value = editable.innerText.trim();
        textarea.className = "border border-gray-300 rounded-md p-1 w-full";
        editable.replaceWith(textarea);
        textarea.focus();

        textarea.addEventListener("blur", async () => {
          const newValue = textarea.value;
          textarea.replaceWith(editable);
          editable.innerText = newValue;
          await saveContent(PAGE_SLUG, key, "text", newValue);
        });
      }
    }

    // Delete block
    if (target.classList.contains("delete-btn")) {
      const box = target.closest(".content-box");
      if (!box) return;
      const key = box.dataset.key;
      if (confirm("Supprimer ce bloc ?")) {
        await fetch("/php/delete_content.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: PAGE_SLUG, key }),
        });
        box.remove();
      }
    }

    // 🔵 Add new block
    if (target.classList.contains("add-block-btn")) {
      const container = document.getElementById("content-container") || document.body;
      const key = "block_" + Math.random().toString(36).substring(2, 9);

      const newBox = document.createElement("div");
      newBox.className = "content-box border border-gray-200 rounded-md p-4 my-4 relative";
      newBox.dataset.key = key;

      newBox.innerHTML = `
        <button class="edit-btn absolute top-1 right-1 bg-brand-green text-white px-2 py-1 rounded">✎</button>
        <button class="delete-btn absolute top-1 right-10 bg-red-500 text-white px-2 py-1 rounded">🗑</button>
        <h3 data-editable>Titre de section</h3>
        <p data-editable>Votre contenu ici...</p>
      `;

      container.appendChild(newBox);
    }
  });
}

// =====================
// Init
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  const loggedIn = await checkLoginStatus();

  if (!loggedIn) {
    console.log("Non-admin view: hiding edit controls");
    document.querySelectorAll(".edit-btn, .menu-edit, .image-edit, .delete-btn, .add-block-btn")
      .forEach((btn) => (btn.style.display = "none"));
    return;
  }

  console.log("Admin mode enabled for:", PAGE_SLUG);
  enableInlineEditing();
  await loadContents(PAGE_SLUG);

  // Save button
  document.getElementById("save-btn")?.addEventListener("click", async () => {
    const editableElements = document.querySelectorAll("[data-editable]");
    for (const el of editableElements) {
      const key = el.closest("[data-key]")?.dataset.key || Math.random().toString(36).substring(2, 10);
      const type = el.tagName.toLowerCase() === "img" ? "image" : "text";
      const value = type === "image" ? el.src : el.innerText.trim();
      await saveContent(PAGE_SLUG, key, type, value);
    }
    alert("Modifications publiées avec succès !");
  });

  // Logout button
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await fetch("/php/logout.php");
    window.location.href = "/admin.html";
  });
});
