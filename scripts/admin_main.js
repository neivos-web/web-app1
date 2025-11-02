// admin_edit.js
// Usage: <script type="module" src="/js/admin_edit.js"></script>
/*
Features:
- auto-detect page name from URL (auto)
- editable tags: p, h1..h6, span, a, img
- per-element edit button (pen), inline editor, image file upload & preview
- "Ajouter un nouveau bloc" inserts a template .content-box and makes it editable
- "Save All" sends FormData to /php/save_content.php:
    - text entries are sent as JSON string under 'entries'
    - files are appended as file_<key>
- only enabled if admin (checks /php/check_session.php or ?admin=1)
*/

const EDITABLE_SELECTORS = "p, h1, h2, h3, h4, h5, h6, span, a, img";
const CONTENT_BOX_SELECTOR = ".content-box";
const NEW_BLOCK_TEMPLATE_HTML = `
  <div class="content-box editable-block">
    <div class="content-image">
      <img src="images/placeholder.jpg" alt="placeholder" />
    </div>
    <div class="content">
      <h2>Nouveau titre...</h2>
      <p>Votre texte ici...</p>
    </div>
  </div>
`;

let isAdmin = false;
let pageName = detectPageName(); // auto by default
let pendingChanges = {}; // { key: { type: 'text'|'image'|'block', value: string | File | null } }
let keyCounter = 1;

init();

async function init() {
  try {
    isAdmin = await checkAdmin();
  } catch (e) {
    console.warn("Admin check failed, falling back to URL param", e);
    isAdmin = getQueryParam("admin") === "1";
  }

  if (!isAdmin) {
    console.log("Admin mode not active — admin editor disabled.");
    return;
  }

  injectStyles();
  buildSaveBar();
  buildAddBlockButton();
  attachEditors(document);
  // observe DOM for newly inserted content-boxes
  observeDOM();
}

/* ---------- Utilities ---------- */
function detectPageName() {
  try {
    const path = window.location.pathname.split("/").filter(Boolean);
    if (path.length === 0) return "index";
    const last = path[path.length - 1];
    const file = last.split("?")[0].split("#")[0];
    if (!file) return "index";
    if (!file.includes(".")) return file;
    const name = file.replace(/\.[^/.]+$/, "");
    return name || "index";
  } catch (e) {
    return "index";
  }
}

async function checkAdmin() {
  // Try server-side session check if available
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    if (!res.ok) throw new Error("no session endpoint");
    const data = await res.json();
    return data.logged_in === true;
  } catch {
    // fallback to URL param
    return getQueryParam("admin") === "1";
  }
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function pad(n, digits = 2) {
  return String(n).padStart(digits, "0");
}

/* ---------- DOM observation ---------- */
function observeDOM() {
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        // attach editors to any new subtree
        attachEditors(node);
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

/* ---------- Attach editors ---------- */
function attachEditors(root) {
  // First: ensure content-boxes are identifiable and set data-key if missing
  const boxes = root.querySelectorAll(CONTENT_BOX_SELECTOR);
  boxes.forEach((box) => ensureBoxKey(box));

  // Attach edit buttons to every editable element inside root
  const elements = root.querySelectorAll(EDITABLE_SELECTORS);
  elements.forEach((el) => {
    // skip if inside controls (save bar, panel)
    if (el.closest(".admin-editor-bar") || el.closest(".admin-editor-control")) return;
    if (!el.dataset.key) {
      // preserve existing keys if set in HTML
      el.dataset.key = generateKey();
    } else {
      // try to parse and update keyCounter so we don't reuse the same number
      const k = parseInt(el.dataset.key.split("_").pop(), 10);
      if (!Number.isNaN(k) && k >= keyCounter) keyCounter = k + 1;
    }
    if (!el.parentElement) return;
    if (el.dataset.adminAttach === "true") return; // already attached
    addEditUI(el);
    el.dataset.adminAttach = "true";
  });
}

/* ---------- Key generation / ensure box has key ---------- */
function generateKey() {
  const key = `${pageName}_${pad(keyCounter)}`;
  keyCounter += 1;
  return key;
}

function ensureBoxKey(box) {
  if (box.dataset.key) return;
  box.dataset.key = generateKey();
  // ensure inner editable children also get keys assigned when attachEditors runs
}

/* ---------- UI: add edit button ---------- */
function addEditUI(element) {
  element.style.position = element.style.position || "";

  // create wrapper container for positioning if needed
  const wrapper = document.createElement("span");
  wrapper.className = "admin-edit-wrapper";
  // We don't want to break inline flow for inline elements like span or a -> so we insert the button as absolutely positioned.
  // Ensure parent is positioned
  const parent = element.parentElement;
  if (getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }

  // create pen button
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "admin-edit-pen";
  btn.title = "Éditer";
  btn.innerHTML = penSVG();

  // position button next to element (absolute)
  btn.style.position = "absolute";
  btn.style.top = "4px";
  btn.style.right = "4px";
  btn.style.zIndex = "9999";

  // container for the element to attach to
  // We will not move the element; instead we append button to parent
  parent.style.position = parent.style.position || "relative";
  parent.appendChild(btn);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openEditorFor(element);
  });

  // highlight on hover
  element.addEventListener("mouseenter", () => {
    element.classList.add("admin-edit-highlight");
  });
  element.addEventListener("mouseleave", () => {
    element.classList.remove("admin-edit-highlight");
  });
}

/* ---------- Editor panel (inline) ---------- */
function openEditorFor(element) {
  const key = element.dataset.key;
  if (!key) return;

  // If an editor panel already exists, remove it
  const existing = document.querySelector(".admin-inline-editor");
  if (existing) existing.remove();

  const panel = document.createElement("div");
  panel.className = "admin-inline-editor admin-editor-control";
  panel.style.position = "absolute";
  panel.style.zIndex = 10000;

  // position panel near element (simple approach)
  const rect = element.getBoundingClientRect();
  panel.style.top = `${rect.bottom + window.scrollY + 6}px`;
  panel.style.left = `${Math.max(6, rect.left + window.scrollX)}px`;
  panel.innerHTML = "";

  if (element.tagName.toLowerCase() === "img") {
    // Show file input + preview
    const preview = document.createElement("img");
    preview.src = element.src;
    preview.style.maxWidth = "240px";
    preview.style.display = "block";
    preview.style.marginBottom = "8px";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.addEventListener("change", () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      // store file in pendingChanges
      pendingChanges[key] = { type: "image", value: file };
      markUnsaved(element, true);
    });

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "admin-inline-save";
    saveBtn.textContent = "OK (prévisualisé)";
    saveBtn.addEventListener("click", () => {
      // we just close panel; actual upload happens on Save All
      panel.remove();
    });

    panel.appendChild(preview);
    panel.appendChild(fileInput);
    panel.appendChild(saveBtn);
  } else {
    // Textual element: either single-line input or textarea for long text
    const text = element.innerText.trim();
    const isLong = text.length > 120 || element.tagName.toLowerCase() === "p" || element.tagName.toLowerCase() === "div";
    const input = isLong ? document.createElement("textarea") : document.createElement("input");
    if (isLong) {
      input.rows = 6;
    } else {
      input.type = "text";
    }
    input.className = "admin-inline-input";
    input.value = text;
    input.style.width = "360px";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "admin-inline-save";
    saveBtn.textContent = "Appliquer";

    saveBtn.addEventListener("click", () => {
      const newVal = input.value;
      element.innerText = newVal;
      pendingChanges[key] = { type: "text", value: newVal };
      markUnsaved(element, true);
      panel.remove();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "admin-inline-cancel";
    cancelBtn.textContent = "Annuler";
    cancelBtn.addEventListener("click", () => panel.remove());

    panel.appendChild(input);
    panel.appendChild(saveBtn);
    panel.appendChild(cancelBtn);
  }

  document.body.appendChild(panel);

  // click outside to close
  setTimeout(() => {
    const onDocClick = (ev) => {
      if (!panel.contains(ev.target)) {
        panel.remove();
        document.removeEventListener("click", onDocClick);
      }
    };
    document.addEventListener("click", onDocClick);
  }, 10);
}

/* ---------- Mark unsaved ---------- */
function markUnsaved(el, state = true) {
  if (state) {
    el.classList.add("admin-unsaved");
  } else {
    el.classList.remove("admin-unsaved");
  }
  updateSaveCounter();
}

/* ---------- Save bar UI ---------- */
function buildSaveBar() {
  const bar = document.createElement("div");
  bar.className = "admin-editor-bar";
  bar.innerHTML = `
    <div class="admin-editor-bar-inner">
      <button id="admin-add-block" class="admin-btn">Ajouter un nouveau bloc</button>
      <div id="admin-save-count" class="admin-save-count">Modifications: 0</div>
      <div style="flex:1"></div>
      <button id="admin-save-all" class="admin-btn admin-save-primary">Save All</button>
    </div>
  `;
  document.body.appendChild(bar);

  document.getElementById("admin-save-all").addEventListener("click", saveAll);
  // Add-block handler added separately in buildAddBlockButton()
}

function buildAddBlockButton() {
  const btn = document.getElementById("admin-add-block");
  btn.addEventListener("click", () => {
    // Insert new block at end of #articles-container if exists, else body > main
    const target = document.querySelector("#articles-container") || document.querySelector("main") || document.body;
    const tmp = document.createElement("div");
    tmp.innerHTML = NEW_BLOCK_TEMPLATE_HTML;
    const newBlock = tmp.firstElementChild;
    // assign key to block and its inner editable children later when attachEditors runs
    target.appendChild(newBlock);
    // ensure the new block has a key
    ensureBoxKey(newBlock);
    // attach editors to the new block subtree
    attachEditors(newBlock);
    // mark as pending 'block' so server can insert it
    const blockKey = newBlock.dataset.key;
    pendingChanges[blockKey] = { type: "block", value: newBlock.outerHTML };
    markUnsaved(newBlock, true);
    // scroll into view
    newBlock.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ---------- Save All ---------- */
async function saveAll() {
  if (Object.keys(pendingChanges).length === 0) {
    alert("Aucune modification détectée.");
    return;
  }

  const form = new FormData();
  form.append("page", pageName);

  // Build entries object for text & blocks; files appended separately
  const entries = {};
  for (const [key, ch] of Object.entries(pendingChanges)) {
    if (ch.type === "image") {
      // ch.value is File
      form.append(`file_${key}`, ch.value, ch.value.name);
      entries[key] = { type: "image", value: "" }; // server will return new path
    } else if (ch.type === "text") {
      entries[key] = { type: "text", value: ch.value };
    } else if (ch.type === "block") {
      entries[key] = { type: "block", value: ch.value };
    }
  }

  form.append("entries", JSON.stringify(entries));

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      body: form,
      credentials: "include",
    });
    const json = await res.json();
    if (json.success) {
      // mark saved elements as saved and update any returned image paths
      if (json.saved && Array.isArray(json.saved)) {
        json.saved.forEach((s) => {
          const el = document.querySelector(`[data-key="${s.key}"]`);
          if (el) {
            markUnsaved(el, false);
            // for images, update src if provided
            if (s.type === "image" && s.path) {
              if (el.tagName.toLowerCase() === "img") {
                el.src = s.path;
              } else {
                const img = el.querySelector("img");
                if (img) img.src = s.path;
              }
            }
          }
        });
      }
      // clear pendingChanges
      pendingChanges = {};
      updateSaveCounter();
      flashSaveSuccess();
    } else {
      alert("Erreur lors de l'enregistrement: " + (json.message || "unknown"));
      console.error("Save error:", json);
    }
  } catch (err) {
    alert("Erreur lors de l'enregistrement (network). Voir console.");
    console.error(err);
  }
}

/* ---------- Helpers ---------- */
function updateSaveCounter() {
  const el = document.getElementById("admin-save-count");
  if (!el) return;
  el.textContent = `Modifications: ${Object.keys(pendingChanges).length}`;
}

function flashSaveSuccess() {
  const bar = document.querySelector(".admin-editor-bar");
  if (!bar) return;
  bar.classList.add("admin-save-success");
  setTimeout(() => bar.classList.remove("admin-save-success"), 1500);
}

/* ---------- small pen svg ---------- */
function penSVG() {
  return `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
  </svg>
  `;
}

/* ---------- Inject styles ---------- */
function injectStyles() {
  const css = `
  .admin-edit-pen { background: rgba(255,255,255,0.95); border:1px solid #ddd; padding:4px; border-radius:4px; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
  .admin-edit-pen:hover { transform: translateY(-1px); }
  .admin-edit-highlight { outline: 2px dashed rgba(8,179,229,0.45); }
  .admin-unsaved { box-shadow: 0 0 0 3px rgba(250,200,0,0.12) inset; }
  .admin-inline-editor { background:#fff; border:1px solid #e5e7eb; padding:8px; border-radius:6px; box-shadow:0 6px 18px rgba(0,0,0,0.12); }
  .admin-inline-input { font-size:14px; padding:6px; border:1px solid #cbd5e1; border-radius:4px; display:block; margin-bottom:8px; width:100%; }
  .admin-inline-save, .admin-inline-cancel { margin-right:8px; padding:6px 8px; border-radius:4px; cursor:pointer; }
  .admin-inline-save { background:#08B3E5;color:#fff;border:none; }
  .admin-inline-cancel { background:#f3f4f6;border:1px solid #e5e7eb; }
  .admin-editor-bar { position:fixed; left:12px; right:12px; bottom:12px; z-index:99999; display:flex; justify-content:center; pointer-events:auto; }
  .admin-editor-bar-inner { background: rgba(255,255,255,0.98); border:1px solid #e5e7eb; padding:10px 12px; border-radius:10px; display:flex; gap:10px; align-items:center; box-shadow: 0 8px 20px rgba(2,6,23,0.08); width: calc(100% - 24px); max-width:1100px; }
  .admin-btn { padding:8px 10px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; cursor:pointer; }
  .admin-save-primary { background:#08B3E5;color:#fff;border:none; }
  .admin-save-success { animation: adminSavePulse 1s ease; }
  @keyframes adminSavePulse { 0%{ box-shadow: 0 0 0 0 rgba(42,211,152,0.0);} 50%{ box-shadow: 0 0 0 8px rgba(42,211,152,0.14);} 100%{box-shadow:0 0 0 0 rgba(42,211,152,0);} }
  .admin-save-count { font-weight:600; color:#374151; }
  .admin-editor-control { max-width: 420px; }
  `;
  const s = document.createElement("style");
  s.textContent = css;
  document.head.appendChild(s);
}
