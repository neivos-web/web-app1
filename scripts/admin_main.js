// admin_structured.js (upload-only images, saves blocks+order+elements)
// Drop into your project and include after DOM. Requires container with id="editable-container".

const pageKey = window.location.pathname.split("/").pop() || "admin_index.php";
let isAdmin = false;
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 900;

// ---- UI helpers ----
function toast(msg, timeout = 2600) {
  let t = document.getElementById("cms-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "cms-toast";
    Object.assign(t.style, {
      position: "fixed", right: "20px", bottom: "20px",
      background: "rgba(0,0,0,0.8)", color: "#fff", padding: "10px 14px",
      borderRadius: "8px", zIndex: 9999, fontFamily: "Inter,system-ui,Segoe UI",
      transition: "opacity .25s", opacity: 0
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.style.opacity = "0", timeout);
}

function showSavedBadge() {
  const el = document.createElement("div");
  el.innerText = "Sauvegardé";
  Object.assign(el.style, {
    position: "fixed", right: "20px", bottom: "72px",
    background: "#16a34a", color: "#fff", padding: "8px 12px", borderRadius: "8px",
    zIndex: 9999, opacity: 0, transition: "opacity .18s"
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => el.style.opacity = "1");
  setTimeout(() => { el.style.opacity = "0"; setTimeout(()=>el.remove(), 240); }, 1400);
}

// ---- session check & init ----
async function checkAdminSession() {
  try {
    const r = await fetch("/php/check_session.php", { credentials: "include" });
    const j = await r.json();
    isAdmin = j.logged_in === true;
    if (isAdmin) initAdminEditor();
  } catch (e) {
    console.warn("session check failed", e);
  } finally {
    await loadStructuredContent();
  }
}
document.addEventListener("DOMContentLoaded", checkAdminSession);

// ---- load saved content (rebuild blocks) ----
async function loadStructuredContent(page = pageKey) {
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, { credentials: "include" });
    const data = await res.json();
    if (!data.success) return console.info("No content saved for", page);

    const blocks = Array.isArray(data.content) ? data.content : (data.content.blocks || []);
    if (!blocks.length) return;

    blocks.forEach(blockObj => {
      if (blockObj.elements && blockObj.elements.length) {
        blockObj.elements.forEach(el => {
          const existing = document.getElementById(el.id);
          if (existing) {
            // update text or image only
            if (el.tag === "IMG" && existing.tagName === "IMG") existing.src = el.value;
            else if (existing.tagName !== "IMG") existing.textContent = el.value;
          }
          // do NOT create new elements, leave layout untouched
        });
      }
    });

    console.log("✅ Structured content merged");
  } catch (err) {
    console.error("loadStructuredContent error", err);
  }
}


// ---- escape helper (prevent XSS when injecting saved text) ----
function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- admin UI init ----
function initAdminEditor() {
  document.querySelectorAll(".content-box").forEach((b, i) => {
    if (!b.dataset.blockId) b.dataset.blockId = "block_" + Date.now() + "_" + i;
    b.setAttribute("draggable", "true");
    b.dataset.order = i;
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.zIndex = 60;
    btn.style.cursor = "pointer";
  });

  enableInlineEditing();
  enableBlockManagement();
  enableDragReorder();
}

// ---- inline editing (text + images) ----
function enableInlineEditing() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    const tgtSelector = btn.dataset.target;
    let target = tgtSelector ? document.querySelector(tgtSelector) : (btn.nextElementSibling || btn.previousElementSibling);
    if (!target) return;
    if (target.tagName === "A" && target.querySelector("img[data-editable]")) target = target.querySelector("img[data-editable]");
    if (!target || target.dataset.editable === undefined) return;
    cloneAddClick(btn, target);
  });

  document.querySelectorAll("[data-editable]").forEach(el => {
    el.onclick = (e) => {
      if (!isAdmin) return;
      openInlineEditor(el);
    };
  });
}

// ---- enable inline editing for a single block (newly added) ----
function enableInlineEditingForBlock(block) {
  block.querySelectorAll("[data-editable]").forEach(el => {
    el.onclick = (e) => {
      if (!isAdmin) return;
      openInlineEditor(el);
    };
  });
  block.querySelectorAll(".edit-btn").forEach(btn => {
    const tgt = btn.nextElementSibling || btn.previousElementSibling;
    if (!tgt || tgt.dataset.editable === undefined) return;
    btn.addEventListener("click", (e) => { e.stopPropagation(); openInlineEditor(tgt); });
  });
}

function cloneAddClick(btn, target) {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    openInlineEditor(target);
  });
}

function openInlineEditor(el) {
  if (!isAdmin) return;
  if (el.dataset.editing === "true") return;
  el.dataset.editing = "true";

  if (el.tagName === "IMG") {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.addEventListener("change", async () => {
      const f = input.files[0];
      if (!f) { delete el.dataset.editing; return; }
      try {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("page", pageKey);
        const res = await fetch("/php/upload_image.php", { method: "POST", body: fd, credentials: "include" });
        const j = await res.json();
        if (j.success && j.url) {
          el.src = j.url;
          scheduleSave();
          toast("Image uploadée — sauvegarde en cours...");
        } else {
          console.error("upload_image failed", j);
          toast("Erreur upload image");
        }
      } catch (err) {
        console.error("upload error", err);
        toast("Erreur réseau upload");
      } finally {
        delete el.dataset.editing;
        input.remove();
      }
    });
    input.click();
    return;
  }

  const tag = el.tagName;
  const isLong = (el.textContent || "").length > 60 || ["P","DIV"].includes(tag);
  const input = isLong ? document.createElement("textarea") : document.createElement("input");
  input.value = (el.textContent || "").trim();
  input.className = "border border-blue-300 rounded p-1 w-full";
  el.style.display = "none";
  el.parentElement.insertBefore(input, el);
  input.focus();

  function finalize() {
    el.textContent = input.value;
    input.remove();
    el.style.display = "";
    delete el.dataset.editing;
    scheduleSave();
  }

  input.addEventListener("blur", finalize);
  input.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && input.tagName !== "TEXTAREA") input.blur(); });
}

// ---- block add/delete ----
function addDeleteAndAddButtons(box) {
  box.querySelectorAll(".delete-btn").forEach(b => b.remove());
  const del = document.createElement("button");
  del.innerText = "❌";
  del.className = "delete-btn";
  Object.assign(del.style, { position: "absolute", right: "8px", top: "8px", zIndex: 70 });
  del.addEventListener("click", () => {
    if (!confirm("Supprimer ce bloc ?")) return;
    box.remove(); scheduleSave();
  });
  box.style.position = "relative";
  box.prepend(del);
}

function enableBlockManagement() {
  document.querySelectorAll(".content-box").forEach((b, idx) => {
    if (!b.dataset.blockId) b.dataset.blockId = "block_" + Date.now() + "_" + idx;
    b.dataset.order = idx;
    addDeleteAndAddButtons(b);
  });
}

// ---- create new content box ----
function createContentBox() {
  const uid = "block_" + Date.now() + "_" + Math.floor(Math.random()*1000);
  const box = document.createElement("div");
  box.className = "content-box bg-white p-6 rounded-lg shadow-md";
  box.dataset.blockId = uid;
  box.dataset.order = document.querySelectorAll(".content-box").length;
  box.innerHTML = `
    <div class="content-image mb-4">
      <button class="edit-btn">✎</button>
      <img id="${uid}_img" data-editable src="images/default.png" alt="Nouvelle image" class="w-full h-auto rounded-lg" />
    </div>
    <div class="content">
      <button class="edit-btn">✎</button>
      <h2 id="${uid}_title" data-editable>Nouveau Titre</h2>
      <button class="edit-btn">✎</button>
      <p id="${uid}_text" data-editable>Nouveau paragraphe. Cliquez pour modifier ce texte.</p>
    </div>
  `;
  return box;
}

// ---- global single add block button ----
function addGlobalAddBlockButton() {
  const existing = document.getElementById("add-global-block-btn");
  if (existing) existing.remove();

  const btn = document.createElement("button");
  btn.id = "add-global-block-btn";
  btn.innerText = "+ Ajouter un block";
  btn.className = "add-block-btn";
  Object.assign(btn.style, { display: "block", marginTop: "20px" });

  btn.addEventListener("click", () => {
    const container = document.querySelector("#editable-container");
    const newBox = createContentBox();
    container.appendChild(newBox);

    // Initialize only the new block
    addDeleteAndAddButtons(newBox);
    enableInlineEditingForBlock(newBox);
    enableDragReorder();

    scheduleSave();
  });

  const container = document.querySelector("#editable-container");
  if (container) container.appendChild(btn);
}

// ---- drag & drop ordering ----
function enableDragReorder() {
  const container = document.querySelector("#editable-container");
  if (!container) return;
  let dragSrc = null;

  container.querySelectorAll(".content-box").forEach(box => {
    box.addEventListener("dragstart", (e) => {
      dragSrc = box;
      e.dataTransfer.effectAllowed = "move";
      box.style.opacity = "0.5";
    });
    box.addEventListener("dragend", () => {
      box.style.opacity = "";
      dragSrc = null;
      Array.from(container.children).forEach((ch, idx) => ch.dataset.order = idx);
      scheduleSave();
    });
    box.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; });
    box.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!dragSrc || dragSrc === box) return;
      const rect = box.getBoundingClientRect();
      const halfway = rect.top + rect.height / 2;
      if (e.clientY < halfway) box.parentNode.insertBefore(dragSrc, box);
      else box.parentNode.insertBefore(dragSrc, box.nextSibling);
    });
  });
}

// ---- collect blocks from DOM in current order ----
function buildBlocksFromDOM() {
  const blocks = [];
  const allEditable = document.querySelectorAll("[data-editable]");

  allEditable.forEach((el, idx) => {
    const parentBox = el.closest(".content-box");
    if (parentBox && !parentBox.dataset.blockId) {
      parentBox.dataset.blockId = "block_" + Date.now() + "_" + Math.floor(Math.random()*1000);
    }
    const blockId = parentBox?.dataset.blockId || ("single_" + idx + "_" + Date.now());

    let blk = blocks.find(b => b.blockId === blockId);
    if (!blk) {
      blk = { blockId, order: blocks.length, elements: [] };
      blocks.push(blk);
    }

    blk.elements.push({
      id: el.id || ("el_" + idx + "_" + Date.now()),
      tag: el.tagName,
      value: el.tagName === "IMG" ? el.src : (el.textContent || "").trim()
    });
  });

  blocks.forEach((b, i) => { b.order = i; });
  return blocks;
}

// ---- debounce + save ----
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  toast("Changements détectés — sauvegarde bientôt...");
  saveTimer = setTimeout(() => saveStructuredContent(pageKey), ms);
}

async function saveStructuredContent(page = pageKey) {
  const blocks = buildBlocksFromDOM();
  if (!blocks.length) return console.warn("Nothing to save (no blocks).");

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, content: blocks })
    });
    const j = await res.json();
    if (!j.success) {
      console.error("Save failed:", j);
      toast("Erreur sauvegarde");
      return;
    }
    console.log("Saved:", j.updated);
    showSavedBadge();
    toast("Sauvegardé");
  } catch (err) {
    console.error("save error", err);
    toast("Erreur réseau lors de la sauvegarde");
  }
}

// expose manual save
window.cms = window.cms || {};
window.cms.saveNow = () => saveStructuredContent(pageKey);

// ---- helpful: init if user adds blocks via server / other flows ----
window.addEventListener("cms:reinit", () => initAdminEditor());

// ---- init global add button ----
document.addEventListener("DOMContentLoaded", () => {
  addGlobalAddBlockButton();
});
