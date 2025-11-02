// ======================= CONFIG / STATE =======================
let isAdmin = false;
const pendingChanges = {}; // { page: { key: { type, value } } }
const pageKey = window.location.pathname.split("/").pop() || "index.php";

// ======================= SESSION CHECK =======================
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    const data = await res.json();
    isAdmin = data.logged_in === true;

    if (!isAdmin) {
      console.log("Visitor mode");
      return; // visitor can still see menus etc.
    }

    console.log("Admin mode enabled");
    initAdminEditor();
  } catch (err) {
    console.error("Session check failed", err);
  }
}

// ======================= ADMIN EDITOR =======================
function initAdminEditor() {
  // Show all edit buttons for admin
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.position = "relative";
    btn.style.zIndex = 50;
  });

  enableInlineEditing();
  enableBlockManagement();
}

// ======================= INLINE EDITING =======================
function enableInlineEditing() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    const targetId = btn.dataset.target;
    let target = targetId ? document.getElementById(targetId) : btn.nextElementSibling || btn.previousElementSibling;

    if (target && target.tagName === "A" && target.querySelector("img[data-editable]")) {
      target = target.querySelector("img[data-editable]");
    }

    if (target && target.dataset.editable !== undefined) {
      const key = target.dataset.key || `${pageKey}_${Date.now()}`;
      btn.addEventListener("click", e => {
        e.stopPropagation();
        openInlineEditor(target, key);
      });
    }
  });
}

function openInlineEditor(el, key) {
  if (el.dataset.editing === "true") return;
  el.dataset.editing = "true";
  let inputEl;

  if (el.tagName === "IMG") {
    inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.accept = "image/*";
    inputEl.addEventListener("change", async () => {
      const file = inputEl.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);
      formData.append("page", pageKey);

      try {
        const res = await fetch("/php/upload_image.php", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        const data = await res.json();

        if (data.success) {
          el.src = data.url;
          pendingChanges[key] = { type: "image", value: data.url };
        } else alert("Erreur upload image.");
      } catch (err) {
        console.error(err);
      } finally {
        inputEl.remove();
        delete el.dataset.editing;
      }
    });
    inputEl.click();
    return;
  }

  const isLong = el.textContent.length > 60 || ["P", "DIV"].includes(el.tagName);
  inputEl = isLong ? document.createElement("textarea") : document.createElement("input");
  inputEl.value = el.textContent.trim();
  inputEl.classList.add("border", "border-blue-400", "rounded", "p-1", "w-full");
  el.style.display = "none";
  el.parentElement.insertBefore(inputEl, el);
  inputEl.focus();

  inputEl.addEventListener("blur", () => {
    el.textContent = inputEl.value;
    pendingChanges[key] = { type: "text", value: inputEl.value };
    cleanupEdit(el, inputEl);
  });

  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && inputEl.tagName !== "TEXTAREA") inputEl.blur();
  });
}

function cleanupEdit(el, inputEl) {
  inputEl.remove();
  el.style.display = "";
  delete el.dataset.editing;
}

// ======================= BLOCK MANAGEMENT =======================
function enableBlockManagement() {
  document.querySelectorAll(".content-box").forEach(box => {
    addDeleteAndAddBlockButtons(box);
  });
}

function addDeleteAndAddBlockButtons(box) {
  // Delete ❌
  const delBtn = document.createElement("button");
  delBtn.innerText = "❌";
  delBtn.className = "delete-btn absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-2 py-1 text-sm font-bold z-50";
  delBtn.addEventListener("click", () => {
    if (confirm("Supprimer ce bloc ?")) {
      box.remove();
      publishChanges();
    }
  });

  // Add + block
  const addBtn = document.createElement("button");
  addBtn.innerText = "+ Ajouter un block";
  addBtn.className = "add-block-btn mt-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-md shadow-md transition";
  addBtn.addEventListener("click", () => {
    const newBox = createContentBox();
    box.parentElement.insertBefore(newBox, addBtn);
    publishChanges();
  });

  box.style.position = "relative";
  box.prepend(delBtn);
  box.insertAdjacentElement("afterend", addBtn);
}

function createContentBox() {
  const newBox = document.createElement("div");
  newBox.className = "content-box bg-white p-6 rounded-lg shadow-md";

  newBox.innerHTML = `
    <div class="content-image mb-4">
      <button class="edit-btn">✎</button>
      <img src="images/default.png" alt="Nouvelle image" data-editable class="w-full h-auto rounded-lg">
    </div>
    <div class="content">
      <button class="edit-btn">✎</button>
      <h2 data-editable>Nouveau Titre</h2>
      <button class="edit-btn">✎</button>
      <p data-editable>Nouveau paragraphe. Cliquez pour modifier ce texte.</p>
    </div>
  `;

  addDeleteAndAddBlockButtons(newBox);
  enableInlineEditing(); // re-bind edit handlers

  return newBox;
}

// ======================= SAVE / PUBLISH =======================
async function publishChanges() {
  const content = {};
  document.querySelectorAll("[data-editable]").forEach((el, i) => {
    content[`item_${i}`] = el.tagName === "IMG" ? el.src : el.innerHTML;
  });

  try {
    const res = await fetch("/php/save_changes.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pageKey, content }),
      credentials: "include"
    });
    const data = await res.json();
    if (!data.success) console.error("Erreur de sauvegarde:", data.error);
  } catch (err) {
    console.error("Erreur réseau", err);
  }
}

// ======================= LOGOUT =======================
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await fetch("/php/logout.php", { credentials: "include" });
    window.location.href = "./admin.html";
  });
}

// ======================= INIT =======================
document.addEventListener("DOMContentLoaded", checkAdminSession);
