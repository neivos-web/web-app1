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
    //  Load page-specific content
    const resPage = await fetch(`/php/load_content.php?page=${encodeURIComponent(pageKey)}`);
    const dataPage = await resPage.json();
    const container = document.querySelector("#editable-container");

    if (dataPage.success && dataPage.content?.html && container) {
      container.innerHTML = dataPage.content.html;
      if (isAdmin) enableBlockManagement(); // <-- ensure buttons are added after content
    }

    // 2️⃣ Load shared menu
    const resShared = await fetch(`/php/load_content.php?page=shared`);
    const dataShared = await resShared.json();
    if (dataShared.success && dataShared.content?.menu) {
      const menuEls = document.querySelectorAll("[data-editable][data-key^='nav_']");
      const sharedMenuEntries = Object.entries(dataShared.content.menu);
      menuEls.forEach((el, i) => {
        if (sharedMenuEntries[i]) {
          el.innerHTML = sharedMenuEntries[i][1];
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
function enableInlineEditing(root = document) {
  root.querySelectorAll(".edit-btn").forEach(btn => {
    // Avoid adding multiple listeners
    if (btn.dataset.listenerAttached) return;
    btn.dataset.listenerAttached = true;

    let target = btn.dataset.target
      ? document.getElementById(btn.dataset.target)
      : btn.nextElementSibling || btn.previousElementSibling;

    if (!target) return;

    if (target.tagName === "A" && target.querySelector("img[data-editable]")) {
      target = target.querySelector("img[data-editable]");
    }

    if (target.dataset.editable !== undefined) {
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
function addDeleteAndAddBlockButtons(box) {
  // Remove previous buttons to avoid duplicates
  box.querySelectorAll(".delete-btn").forEach(btn => btn.remove());
  const nextAddBtn = box.nextElementSibling;
  if (nextAddBtn && nextAddBtn.classList.contains("add-block-btn")) nextAddBtn.remove();

  // === DELETE button ===
  const delBtn = document.createElement("button");
  delBtn.innerText = "❌";
  delBtn.className =
    "delete-btn absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-2 py-1 text-sm font-bold z-50";
  delBtn.addEventListener("click", async () => {
    if (confirm("Supprimer ce bloc ?")) {
      box.remove();
      await saveAndReload(pageKey);
    }
  });

  // === ADD button ===
  const addBtn = document.createElement("button");
  addBtn.innerText = "+ Ajouter un block";
  addBtn.className =
    "add-block-btn mt-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-md shadow-md transition";
  addBtn.addEventListener("click", async () => {
    const newBox = createContentBox();
    box.parentElement.insertBefore(newBox, addBtn);
    await saveAndReload(pageKey);
  });

  // === Attach ===
  box.style.position = "relative";
  box.prepend(delBtn);
  box.insertAdjacentElement("afterend", addBtn);
}

function enableBlockManagement() {
  document.querySelectorAll(".content-box").forEach(box => addDeleteAndAddBlockButtons(box));
}

async function saveMenu(menuContent) {
  try {
    await fetch("/php/save_content.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "shared", content: { menu: menuContent } }),
      credentials: "include"
    });
  } catch (err) {
    console.error("Erreur sauvegarde menu", err);
  }
}


// ======================= SAVE + RELOAD =======================
async function saveAndReload(page = pageKey) {
  const container = document.querySelector("#editable-container");
  if (!container) return;

  // Clone container to remove admin buttons before saving
  const clone = container.cloneNode(true);
  clone.querySelectorAll(".delete-btn, .add-block-btn").forEach(btn => btn.remove());

  const content = { html: clone.innerHTML };

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

    const container = document.querySelector("#editable-container");
    if (container && data.content?.html) {
      container.innerHTML = data.content.html;
      if (isAdmin) enableBlockManagement();
    }

    const info = document.getElementById("lastUpdated");
    if (info) info.textContent = "Dernière mise à jour : " + data.last_modified;
  } catch (err) {
    console.error("Erreur de rechargement:", err);
  }
}

// ======================= INLINE EDITOR =======================
function openInlineEditor(el) {
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

// ======================= CREATE NEW BLOCK =======================
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

  // Add admin buttons
  addDeleteAndAddBlockButtons(newBox);

  // Attach inline editor listeners to new buttons only
  enableInlineEditing(newBox);

  return newBox;
}

// ======================= INIT =======================
document.addEventListener("DOMContentLoaded", async () => {
  await checkAdminSession();
  await reloadPageContent(pageKey);
});
