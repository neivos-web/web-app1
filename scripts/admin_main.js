// admin_structured.js
// Requires: page elements marked with data-editable and data-key (option 1)

const pageKey = window.location.pathname.split("/").pop() || "admin_index.php";
let isAdmin = false;
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 1200;

// small toast helper
function showToast(msg, ok = true) {
  let toast = document.getElementById("cms-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cms-toast";
    toast.style = `
      position: fixed; right: 20px; bottom: 20px;
      background: rgba(0,0,0,0.8); color: white;
      padding: 10px 14px; border-radius: 8px; z-index: 9999;
      font-family: Inter, system-ui, sans-serif; font-size: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  toast.style.transition = "opacity 0.4s";
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => { toast.style.opacity = "0"; }, 3000);
}

function showSaveTooltip() {
  let tooltip = document.createElement("div");
  tooltip.innerText = " Sauvegardé";
  tooltip.className =
    "fixed bottom-4 right-4 bg-green-600 text-white px-3 py-2 rounded shadow-md z-50 opacity-0 transition-opacity";
  document.body.appendChild(tooltip);

  setTimeout(() => (tooltip.style.opacity = "1"), 10);
  setTimeout(() => {
    tooltip.style.opacity = "0";
    setTimeout(() => tooltip.remove(), 500);
  }, 2000);
}

// ----------------- session & init -----------------
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    const data = await res.json();
    isAdmin = data.logged_in === true;
    if (isAdmin) initAdminEditor();
    await loadStructuredContent();
  } catch (err) {
    console.warn("session check failed", err);
    await loadStructuredContent();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkAdminSession();
});

// ----------------- load structured content -----------------
async function loadStructuredContent(page = pageKey) {
  try {
    const res = await fetch(`/php/load_content.php?page=${page}`, { credentials: "include" });
    const data = await res.json();

    if (!data.success || !Array.isArray(data.content)) return;

    data.content.forEach(saved => {
      const el = document.getElementById(saved.id);
      if (!el) return;

      if (el.tagName === "IMG") el.src = saved.value;
      else el.textContent = saved.value;
    });

    console.log("✅ Content loaded for", page);
  } catch (err) {
    console.error("Load error:", err);
  }
}


// ----------------- Admin UI -----------------
function initAdminEditor() {
  // show edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.zIndex = 50;
    btn.style.cursor = "pointer";
    // allow mapping to specific target via data-target attribute if desired
  });

  enableInlineEditing();
  enableBlockManagement();
}

// ----------------- Inline editing -----------------
function enableInlineEditing() {
  // Attach click handler to edit buttons which are placed next to editable elements
  document.querySelectorAll(".edit-btn").forEach(btn => {
    // compute target: dataset.target (selector) OR nextElementSibling/previousElementSibling
    const tgtSelector = btn.dataset.target;
    let target = null;
    if (tgtSelector) target = document.querySelector(tgtSelector);
    if (!target) target = btn.nextElementSibling || btn.previousElementSibling;
    if (!target) return;

    // if anchor containing img, target image
    if (target.tagName === "A" && target.querySelector("img[data-editable]")) {
      target = target.querySelector("img[data-editable]");
    }

    if (!target || target.dataset.editable === undefined) return;

    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      openInlineEditor(target);
    });
  });
}

function cleanupEdit(el, inputEl) {
  inputEl.remove();
  el.style.display = "";
  delete el.dataset.editing;
}

// ----------------- open editor -----------------
function openInlineEditor(el) {
  if (el.dataset.editing === "true") return;
  el.dataset.editing = "true";

  // image upload (convert to base64 client-side)
  if (el.tagName === "IMG") {
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = "image/*";
    inputFile.addEventListener("change", () => {
      const f = inputFile.files[0];
      if (!f) {
        delete el.dataset.editing;
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        el.src = e.target.result; // dataURL base64
        delete el.dataset.editing;
        scheduleSave();
        showToast("Image prête — sauvegarde programmée");
      };
      reader.readAsDataURL(f);
    });
    inputFile.click();
    return;
  }

  const isLong = (el.textContent || "").length > 60 || ["P", "DIV"].includes(el.tagName);
  const input = isLong ? document.createElement("textarea") : document.createElement("input");
  input.value = (el.textContent || "").trim();
  input.className = "border border-blue-400 rounded p-1 w-full";
  el.style.display = "none";
  el.parentElement.insertBefore(input, el);
  input.focus();
  input.addEventListener("blur", async () => {
    el.textContent = input.value;
    cleanupEdit(el, input);
    scheduleSave();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.tagName !== "TEXTAREA") input.blur();
  });
}

// ----------------- block management -----------------
function addDeleteAndAddBlockButtons(box) {
  box.querySelectorAll(".delete-btn").forEach(b => b.remove());
  const next = box.nextElementSibling;
  if (next && next.classList.contains("add-block-btn")) next.remove();

  const del = document.createElement("button");
  del.innerText = "❌";
  del.className = "delete-btn absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 z-50";
  del.addEventListener("click", async () => {
    if (!confirm("Supprimer ce bloc ?")) return;
    box.remove();
    scheduleSave();
  });

  const addBtn = document.createElement("button");
  addBtn.innerText = "+ Ajouter un block";
  addBtn.className = "add-block-btn mt-4 bg-sky-600 text-white px-4 py-2 rounded-md";
  addBtn.addEventListener("click", () => {
    const newBox = createContentBox();
    box.parentElement.insertBefore(newBox, addBtn);
    // re-init
    enableInlineEditing();
    addDeleteAndAddBlockButtons(newBox);
    scheduleSave();
  });

  box.style.position = "relative";
  box.prepend(del);
  box.insertAdjacentElement("afterend", addBtn);
}

function enableBlockManagement() {
  document.querySelectorAll(".content-box").forEach(b => addDeleteAndAddBlockButtons(b));
}

// ----------------- create new block -----------------
function createContentBox() {
  const newBox = document.createElement("div");
  newBox.className = "content-box bg-white p-6 rounded-lg shadow-md";
  newBox.innerHTML = `
    <div class="content-image mb-4">
      <button class="edit-btn">✎</button>
      <img src="images/default.png" alt="Nouvelle image" data-editable class="w-full h-auto rounded-lg" data-key="">
    </div>
    <div class="content">
      <button class="edit-btn">✎</button>
      <h2 data-editable data-key="">Nouveau Titre</h2>
      <button class="edit-btn">✎</button>
      <p data-editable data-key="">Nouveau paragraphe. Cliquez pour modifier ce texte.</p>
    </div>
  `;
  // attach edit buttons in newBox
  newBox.querySelectorAll(".edit-btn").forEach(btn => btn.style.display = "inline-flex");
  return newBox;
}

// ----------------- collect structured content -----------------
function collectStructuredContent(containerSelector = "#editable-container") {
  const container = document.querySelector(containerSelector);
  if (!container) return [];
  const out = [];
  container.querySelectorAll("[data-editable]").forEach(el => {
    const key = el.dataset.key || null;
    const id = el.id || null;
    const tag = el.tagName;
    const value = tag === "IMG" ? el.src : (el.textContent || "").trim();
    out.push({ key, id, tag, value });
  });
  return out;
}

// ----------------- debounce save -----------------
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveStructuredContent(pageKey), ms);
  showToast("Changements détectés — sauvegarde bientôt...");
}

// ----------------- save structured content -----------------
async function saveStructuredContent(page = pageKey) {
  const editableElements = document.querySelectorAll("[data-editable][id]");

  if (!editableElements.length) return console.warn("No editable elements found!");

  const contentData = [...editableElements].map(el => ({
    id: el.id,
    tag: el.tagName,
    value: el.tagName === "IMG" ? el.src : el.textContent.trim()
  }));

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, content: contentData }),
      credentials: "include"
    });

    const data = await res.json();
    if (!data.success) return console.error("Save error:", data.error);

    console.log("Saved at", data.updated);
    showSaveTooltip(); 
  } catch (err) {
    console.error("Network error saving:", err);
  }
}


// ----------------- Expose manual save (optional) -----------------
window.cms = window.cms || {};
window.cms.saveNow = () => saveStructuredContent(pageKey);

