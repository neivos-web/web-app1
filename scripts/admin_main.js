// ======================= CONFIG / STATE =======================
let isAdmin = false;
const pageKey = window.location.pathname.split("/").pop() || "index.php";

// ======================= SESSION CHECK =======================
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    const data = await res.json();
    isAdmin = data.logged_in === true;
    if (isAdmin) initAdminEditor();
    await loadPageContent(); // always load content for everyone
  } catch (err) {
    console.error("Session check failed", err);
    await loadPageContent();
  }
}

// ======================= LOAD CONTENT =======================
async function loadPageContent() {
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(pageKey)}`);
    const data = await res.json();
    if (data.success && data.content) {
      Object.entries(data.content).forEach(([_, value], i) => {
        const editable = document.querySelectorAll("[data-editable]")[i];
        if (editable) {
          if (editable.tagName === "IMG") editable.src = value;
          else editable.innerHTML = value;
        }
      });
    }
  } catch (err) {
    console.error("Erreur chargement contenu", err);
  }
}

// ======================= ADMIN EDITOR =======================
function initAdminEditor() {
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
      btn.addEventListener("click", e => {
        e.stopPropagation();
        openInlineEditor(target);
      });
    }
  });
}


function cleanupEdit(el, inputEl) {
  inputEl.remove();
  el.style.display = "";
  delete el.dataset.editing;
}

// ======================= BLOCK MANAGEMENT =======================
function enableBlockManagement() {
  document.querySelectorAll(".content-box").forEach(box => addDeleteAndAddBlockButtons(box));
}

function addDeleteAndAddBlockButtons(box) {
  const delBtn = document.createElement("button");
  delBtn.innerText = "❌";
  delBtn.className = "delete-btn absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-2 py-1 text-sm font-bold z-50";
  delBtn.addEventListener("click", async () => {
    if (confirm("Supprimer ce bloc ?")) {
      box.remove();
      await autoSave();
    }
  });

  const addBtn = document.createElement("button");
  addBtn.innerText = "+ Ajouter un block";
  addBtn.className = "add-block-btn mt-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-md shadow-md transition";
  addBtn.addEventListener("click", async () => {
    const newBox = createContentBox();
    box.parentElement.insertBefore(newBox, addBtn);
    await autoSave();
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
  enableInlineEditing();
  return newBox;
}

// ======================= AUTO SAVE =======================
async function autoSave() {
  const content = {};
  document.querySelectorAll("[data-editable]").forEach((el, i) => {
    content[`item_${i}`] = el.tagName === "IMG" ? el.src : el.innerHTML;
  });
  try {
    const res = await fetch("/php/save_content.php", {
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

// ======================= INIT =======================
document.addEventListener("DOMContentLoaded", checkAdminSession);
// ======================= AUTO SAVE + RELOAD =======================

// Auto-save after each edit
async function saveAndReload(page = pageKey) {
  const content = {};
  document.querySelectorAll("[data-editable]").forEach((el, i) => {
    content[`item_${i}`] = el.tagName === "IMG" ? el.src : el.innerHTML;
  });

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, content }),
      credentials: "include"
    });

    const data = await res.json();
    if (!data.success) {
      console.error("Erreur de sauvegarde:", data.error);
      return;
    }

    console.log(`Sauvegardé à ${data.updated}`);
    await reloadPageContent(page);
  } catch (err) {
    console.error("Erreur réseau", err);
  }
}

// ======================= RELOAD FROM DATABASE =======================
async function reloadPageContent(page = pageKey) {
  try {
    const res = await fetch(`/php/load_content.php?page=${page}`, { credentials: "include" });
    const data = await res.json();

    if (!data.success) {
      console.warn("Aucun contenu trouvé pour", page);
      return;
    }

    console.log("Rechargement depuis la base de données...");

    const entries = Object.entries(data.content);
    document.querySelectorAll("[data-editable]").forEach((el, i) => {
      const entry = entries[i];
      if (!entry) return;
      const value = entry[1];
      if (el.tagName === "IMG") el.src = value;
      else el.innerHTML = value;
    });

    const info = document.getElementById("lastUpdated");
    if (info) info.textContent = "Dernière mise à jour : " + data.last_modified;
  } catch (err) {
    console.error("Erreur de rechargement:", err);
  }
}

// ======================= INLINE EDITING (AUTO-SAVE) =======================
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
          await saveAndReload(pageKey);
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

  inputEl.addEventListener("blur", async () => {
    el.textContent = inputEl.value;
    cleanupEdit(el, inputEl);
    await saveAndReload(pageKey);
  });

  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && inputEl.tagName !== "TEXTAREA") inputEl.blur();
  });
}

// ======================= INIT =======================
document.addEventListener("DOMContentLoaded", async () => {
  await checkAdminSession();
  await reloadPageContent(pageKey);
});
