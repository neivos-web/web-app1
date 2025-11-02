// scripts/admin_main.js

// Detect current page (slug)
const PAGE_SLUG = window.location.pathname
  .split("/")
  .pop()
  .replace(".php", "")
  .replace(".html", "") || "home";

let IS_ADMIN = false; // will be true if user is logged in

// =====================
// Helper functions
// =====================

// Check admin session
async function checkSession() {
  const res = await fetch("/php/check_session.php");
  const data = await res.json();
  IS_ADMIN = !!data.logged_in;
  return IS_ADMIN;
}

// Save a single content block (text or image)
async function saveContent(page, key, type, value) {
  const res = await fetch("/php/save_content.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, key, type, value }),
  });
  return res.json();
}

// Upload an image and return its new URL
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
  return res.json();
}

// Load all contents from DB
async function loadContents(page) {
  const res = await fetch(`/php/get_contents.php?page=${encodeURIComponent(page)}`);
  const data = await res.json();
  if (!data.success) return;

  data.contents.forEach((item) => {
    const el = document.querySelector(`[data-key="${item.content_key}"]`);
    if (!el) return;

    if (item.content_type === "text") {
      if (el.tagName === "IMG") return;
      el.innerText = item.content_value;
    } else if (item.content_type === "image") {
      const img = el.querySelector("img") || el;
      img.src = item.content_value;
    }
  });
}

// =====================
// Inline Editing Logic
// =====================
function enableInlineEditing() {
  if (!IS_ADMIN) return;

  // Add edit button to each editable element if missing
  document.querySelectorAll("[data-editable]").forEach((editable) => {
    if (!editable.parentElement.querySelector(".edit-btn")) {
      const btn = document.createElement("button");
      btn.className = "edit-btn text-sm px-2 py-1 bg-blue-600 text-white rounded-md ml-2";
      btn.innerText = "✎";
      editable.insertAdjacentElement("afterend", btn);
    }
  });

  // Handle text & image edits
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const parent = e.target.closest("[data-key], .content-box");
      if (!parent) return;

      const editable = parent.querySelector("[data-editable]") || parent;
      const key = parent.dataset.key || Math.random().toString(36).substring(2, 10);
      const type = editable.tagName.toLowerCase() === "img" ? "image" : "text";

      if (type === "text") {
        const input = document.createElement("textarea");
        input.className = "border border-gray-300 rounded-md p-1 w-full";
        input.value = editable.innerText.trim();
        editable.replaceWith(input);
        input.focus();

        input.addEventListener("blur", async () => {
          const newValue = input.value;
          input.replaceWith(editable);
          editable.innerText = newValue;
          await saveContent(PAGE_SLUG, key, "text", newValue);
        });
      } else if (type === "image") {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);
        fileInput.click();

        fileInput.addEventListener("change", async () => {
          const file = fileInput.files[0];
          if (!file) return;
          const result = await uploadImage(PAGE_SLUG, key, file);
          if (result.success && result.url) {
            editable.src = result.url;
            await saveContent(PAGE_SLUG, key, "image", result.url);
          }
          fileInput.remove();
        });
      }
    });
  });
}

// =====================
// Add/Delete content blocks
// =====================
function setupAddDeleteButtons() {
  if (!IS_ADMIN) return;

  const addBtn = document.getElementById("add-block-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const container = document.createElement("div");
      const id = "new_" + Date.now();
      container.className = "content-box border border-dashed border-gray-400 p-3 rounded-md mt-3";
      container.dataset.key = id;
      container.innerHTML = `
        <p data-editable>New text...</p>
        <button class="edit-btn bg-blue-600 text-white px-2 py-1 rounded-md">✎</button>
        <button class="delete-btn bg-red-600 text-white px-2 py-1 rounded-md ml-1">🗑</button>
      `;
      document.querySelector("#content-area")?.appendChild(container);

      container.querySelector(".edit-btn").addEventListener("click", () => enableInlineEditing());
      container.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Delete this block?")) {
          await fetch("/php/delete_content.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: id }),
          });
          container.remove();
        }
      });
    });
  }
}

// =====================
// Save / Logout handlers
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  // Check if user logged in
  await checkSession();

  // Load contents
  await loadContents(PAGE_SLUG);

  // Enable editing only for admins
  if (IS_ADMIN) {
    enableInlineEditing();
    setupAddDeleteButtons();
  }

  // Publish all changes
  document.getElementById("save-btn")?.addEventListener("click", async () => {
    if (!IS_ADMIN) return;
    const editableElements = document.querySelectorAll("[data-editable]");
    for (const el of editableElements) {
      const key = el.dataset.key || Math.random().toString(36).substring(2, 10);
      const type = el.tagName.toLowerCase() === "img" ? "image" : "text";
      const value = type === "image" ? el.src : el.innerText.trim();
      await saveContent(PAGE_SLUG, key, type, value);
    }
    alert("✅ Modifications publiées avec succès !");
  });

  // Logout
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await fetch("/php/logout.php");
    window.location.href = "/admin.html";
  });
});
