// scripts/admin_main.js
// Editable CMS main script — fixed ordering, wiring, upload + save

// ======================= SELECTORS & STATE =======================
const saveBtn = document.getElementById("save-btn");
const logoutBtn = document.getElementById("logout-btn");
const pageContainer = document.querySelector("main") || document.body;

let addBlockBtn = null;
let isAdmin = false; // default false, set by checkSession()

// ======================= SESSION CHECK =======================
async function checkSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    if (!res.ok) throw new Error("Network response not ok");
    const data = await res.json();
    // robust parsing
    isAdmin = [true, "true", "1", 1, "1"].includes(data.logged_in);
  } catch (err) {
    console.error("Error checking session:", err);
    isAdmin = false;
  }
  applyAdminVisibility();
  console.debug("checkSession -> isAdmin:", isAdmin);
  return isAdmin;
}

// ======================= VISIBILITY =======================
function applyAdminVisibility() {
  const selectors = [
    ".edit-btn", ".image-edit", ".publish-btn", "#logout-btn",
    ".menu-edit", ".submenu-edit", ".image-upload-btn", ".delete-btn", "#add-block"
  ];
  document.querySelectorAll(selectors.join(", ")).forEach(btn => {
    if (!btn) return;
    // prefer class toggling to avoid inline conflicts
    btn.style.display = isAdmin ? (btn.dataset.inline || "inline-flex") : "none";
  });

  // body class alternative for CSS-driven visibility (if you use it)
  document.body.classList.toggle("admin-visible", isAdmin);
}

// ======================= UTIL =======================
function allEditableElements() {
  return document.querySelectorAll("[data-editable]");
}
function generateKey(el) {
  const path = [];
  let current = el;
  while (current && current.tagName !== "BODY") {
    const siblings = Array.from(current.parentNode.children);
    const index = siblings.indexOf(current);
    path.unshift(`${current.tagName.toLowerCase()}[${index}]`);
    current = current.parentNode;
  }
  return path.join("/");
}
function showTooltip(msg) {
  const tip = document.createElement("div");
  tip.textContent = msg;
  tip.className = "fixed top-4 right-4 bg-green-500 text-white p-2 rounded shadow z-50";
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 2000);
}

// ======================= SAVE / LOAD =======================
async function saveSiteContent() {
  try {
    // gather all elements we want to persist
    const elements = document.querySelectorAll('[contenteditable], img[data-editable], video[data-editable], a[data-editable]');
    const data = [];

    elements.forEach(el => {
      const key = generateKey(el);
      const page = window.location.pathname.replace(/\//g, "_").replace(".html", "").replace(/^_+|_+$/g, "") || "general";

      let type, value;
      if (el.tagName === 'IMG') { type = 'image'; value = el.src; }
      else if (el.tagName === 'VIDEO') { type = 'video'; value = el.src; }
      else if (el.tagName === 'A') { type = 'link'; value = { text: el.innerText || "", href: el.href || "" }; }
      else { type = 'text'; value = el.innerText ? el.innerText.trim() : ""; }

      data.push({ page, key, type, value });
    });

    const res = await fetch('/php/save_content.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Save failed:", txt);
      throw new Error("Save failed");
    }
    showTooltip("Contenu sauvegardé !");
    console.debug("Saved", data);
  } catch (err) {
    console.error("saveSiteContent error:", err);
    alert("Erreur lors de la sauvegarde. Voir console pour détails.");
  }
}

async function loadSiteContent() {
  try {
    const pageParam = window.location.pathname.replace(/\//g, "_").replace(".html", "").replace(/^_+|_+$/g, "") || "general";
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(pageParam)}`, { credentials: "include" });
    if (!res.ok) throw new Error("Erreur lors du chargement");
    const data = await res.json();

    Object.keys(data.other || {}).forEach(key => {
      const el = Array.from(allEditableElements()).find(e => generateKey(e) === key);
      if (!el) return;
      const stored = data.other[key];
      const value = stored?.value ?? stored;
      switch (el.tagName) {
        case "IMG": el.src = value; break;
        case "VIDEO": el.src = value; break;
        case "A":
          if (typeof value === "object") { el.textContent = value.text || ""; el.href = value.href || ""; }
          else el.textContent = value;
          break;
        default: el.innerText = value; break;
      }
    });
    console.debug("Loaded content keys:", Object.keys(data.other || {}));
  } catch (err) {
    console.error("loadSiteContent error:", err);
  }
}

// ======================= EDIT BUTTON HELPERS =======================
function findEditableTargetForButton(btn) {
  if (!btn) return null;
  // 1) previous sibling
  if (btn.previousElementSibling && btn.previousElementSibling.hasAttribute && btn.previousElementSibling.hasAttribute("data-editable")) {
    return btn.previousElementSibling;
  }
  // 2) next sibling
  if (btn.nextElementSibling && btn.nextElementSibling.hasAttribute && btn.nextElementSibling.hasAttribute("data-editable")) {
    return btn.nextElementSibling;
  }
  // 3) search parent direct children
  const parent = btn.parentElement;
  if (parent) {
    const prefer = parent.querySelector('a[data-editable], img[data-editable], h1[data-editable], h2[data-editable], p[data-editable], span[data-editable]');
    if (prefer) return prefer;
    const any = [...parent.children].find(el => el.hasAttribute && el.hasAttribute("data-editable"));
    if (any) return any;
  }
  // 4/5) search siblings' descendants
  let sib = btn.previousElementSibling;
  while (sib) {
    const found = sib.querySelector && sib.querySelector('[data-editable]');
    if (found) return found;
    sib = sib.previousElementSibling;
  }
  sib = btn.nextElementSibling;
  while (sib) {
    const found = sib.querySelector && sib.querySelector('[data-editable]');
    if (found) return found;
    sib = sib.nextElementSibling;
  }
  // 6) closest ancestor with data-editable
  return btn.closest ? btn.closest('[data-editable]') : null;
}

// Add inline editing behavior for textual elements
function enableEditingForStaticElements() {
  document.querySelectorAll(".edit-btn:not(.image-edit)").forEach(btn => {
    if (btn.dataset.behaviorsAttached) return;
    btn.dataset.behaviorsAttached = "true";
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      const target = findEditableTargetForButton(btn);
      if (!target) {
        // if button sits near a dropdown, try toggling that dropdown visibility
        const grp = btn.closest('.group, .relative');
        if (grp) {
          const menu = grp.querySelector('[data-dropdown]') || grp.querySelector('.absolute');
          if (menu) { menu.classList.toggle('hidden'); menu.classList.toggle('block'); }
        }
        return;
      }
      // make editable in place
      // for headings use single-line input, for others a textarea
      const tag = target.tagName;
      if (tag === "IMG" || tag === "VIDEO" || tag === "A") return;
      target.contentEditable = "true";
      target.focus();
      const r = document.createRange(); r.selectNodeContents(target);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      target.addEventListener("blur", async () => {
        target.contentEditable = "false";
        try { await saveSiteContent(); } catch (err) { console.error(err); }
      }, { once: true });
    });
  });
}

// ======================= IMAGE / UPLOAD WIRING =======================
function wireImageEditButtons() {
  document.querySelectorAll('.image-edit').forEach(btn => {
    if (btn.dataset.wired === 'true') return;
    btn.dataset.wired = 'true';

    const parent = btn.parentElement;
    let img = null;
    if (btn.nextElementSibling && btn.nextElementSibling.tagName === 'IMG') img = btn.nextElementSibling;
    if (!img && parent) img = parent.querySelector && parent.querySelector('img[data-editable]');
    if (!img) img = document.querySelector('img[data-editable]');

    let fileInput = parent && parent.querySelector('input[type="file"].file-input');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'hidden file-input';
      // ensure near the button
      if (btn.nextElementSibling) btn.parentNode.insertBefore(fileInput, btn.nextElementSibling);
      else btn.parentNode.appendChild(fileInput);
    }

    // visibility depending on admin
    btn.style.display = isAdmin ? (btn.dataset.inline || "inline-flex") : "none";

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isAdmin) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const key = img ? generateKey(img) : (`image_${Date.now()}`);
      const pageFolder = window.location.pathname.replace(/\//g, "_").replace(".html", "").replace(/^_+|_+$/g, "") || "general";

      try {
        const fd = new FormData();
        fd.append('file', file);
        const url = `/php/upload.php?page=${encodeURIComponent(pageFolder)}&key=${encodeURIComponent(key)}`;
        const res = await fetch(url, { method: 'POST', body: fd, credentials: 'include' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Upload failed');
        if (json.url && img) img.src = json.url;
        await saveSiteContent();
        showTooltip("Image mise à jour");
      } catch (err) {
        console.error("Upload error:", err);
        alert("Erreur upload image (voir console).");
      }
    });
  });
}

// ======================= AUTO-INSERT EDIT BUTTONS =======================
function ensureEditButtons() {
  document.querySelectorAll('[data-editable]').forEach(target => {
    // skip if button exists adjacent
    const prev = target.previousElementSibling;
    const next = target.nextElementSibling;
    const hasAdj = (el) => el && el.classList && (el.classList.contains('edit-btn') || el.classList.contains('image-edit') || el.classList.contains('menu-edit') || el.classList.contains('submenu-edit'));
    if (hasAdj(prev) || hasAdj(next)) return;

    let btn;
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'image-edit';
      btn.textContent = '📷';
      btn.title = 'Modifier l\'image';
      // insert BEFORE the image so nextElementSibling === target
      target.parentNode.insertBefore(btn, target);
    } else {
      const isMenuControl = !!(target.closest('.group') || (target.id && target.id.toLowerCase().includes('dropdown')) || target.classList.contains('menu-toggle') || target.closest('.relative'));
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = isMenuControl ? 'menu-edit' : 'edit-btn';
      btn.textContent = '✎';
      btn.title = 'Éditer';
      target.parentNode.insertBefore(btn, target);
    }
  });

  // style defaults and minimal click fallback
  const shouldShow = typeof isAdmin !== 'undefined' ? isAdmin : false;
  document.querySelectorAll('.edit-btn, .image-edit, .menu-edit, .submenu-edit').forEach(b => {
    b.style.display = shouldShow ? (b.dataset.inline || "inline-flex") : "none";
    b.style.alignItems = 'center';
    b.style.justifyContent = 'center';
    b.style.cursor = 'pointer';
    if (!b.dataset.autoAttached) {
      b.dataset.autoAttached = 'true';
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        // image handling fallback
        if (b.classList.contains('image-edit')) {
          const fileInput = b.parentElement && b.parentElement.querySelector('input[type="file"].file-input');
          if (fileInput) fileInput.click();
          return;
        }
        // else trigger inline edit (if enableEditing didn't attach)
        const target = b.nextElementSibling && b.nextElementSibling.hasAttribute && b.nextElementSibling.hasAttribute('data-editable') ? b.nextElementSibling : findEditableTargetForButton(b);
        if (target) {
          target.contentEditable = 'true';
          target.focus();
          const range = document.createRange(); range.selectNodeContents(target);
          const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
          target.addEventListener('blur', async () => {
            target.contentEditable = 'false';
            try { await saveSiteContent(); showTooltip('Mis à jour'); } catch(e) { console.error(e); }
          }, { once: true });
        }
      });
    }
  });
}

// ======================= DROPDOWNS / NAV =======================
function wireDropdownToggles() {
  // generic: any element with data-dropdown-button and data-dropdown-target attributes
  document.querySelectorAll('[data-dropdown-button]').forEach(btn => {
    const targetSelector = btn.getAttribute('data-dropdown-target');
    if (!targetSelector) return;
    const menu = document.querySelector(targetSelector);
    if (!menu) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle('hidden');
      menu.classList.toggle('block');
    });
  });

  // close on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('[data-dropdown-target]').forEach(m => {
      m.classList.add('hidden');
      m.classList.remove('block');
    });
  });

  // also wire menu-toggle hamburger
  const ham = document.getElementById('menu-toggle');
  if (ham) ham.addEventListener('click', () => {
    const menu = document.getElementById('menu');
    if (menu) menu.classList.toggle('hidden');
  });
}

// ======================= CONTENT BOX BEHAVIORS =======================
function attachContentBoxBehaviors(box) {
  if (box.dataset.behaviorsAttached) return;
  box.dataset.behaviorsAttached = 'true';

  const img = box.querySelector("img[data-editable]");
  let editBtn = box.querySelector(".image-edit");
  let fileInput = box.querySelector(".file-input");

  if (img && (!editBtn || !fileInput)) {
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.className = "hidden file-input";
    editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn image-edit absolute top-2 left-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md";
    editBtn.title = "Edit image";
    editBtn.textContent = "📷";
    const imgParent = img.parentElement;
    if (imgParent && getComputedStyle(imgParent).position === 'static') imgParent.style.position = 'relative';
    imgParent.insertBefore(editBtn, imgParent.firstChild);
    imgParent.insertBefore(fileInput, img);
  }

  const delBtn = box.querySelector(".delete-btn");
  if (delBtn) {
    delBtn.style.display = isAdmin ? "inline-flex" : "none";
    delBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (confirm("Supprimer ce bloc ?")) box.remove();
    });
  }

  if (editBtn && fileInput && img) {
    editBtn.style.display = isAdmin ? "inline-flex" : "none";
    editBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file) return;
      const key = generateKey(img);
      const pageFolder = window.location.pathname.replace(/\//g, "_").replace(".html", "").replace(/^_+|_+$/g, "") || "general";
      try {
        const fd = new FormData();
        fd.append('file', file);
        const url = `/php/upload.php?page=${encodeURIComponent(pageFolder)}&key=${encodeURIComponent(key)}`;
        const res = await fetch(url, { method: 'POST', body: fd, credentials: 'include' });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || 'upload failed');
        if (j.url) img.src = j.url;
        await saveSiteContent();
        showTooltip("Image mise à jour");
      } catch (err) {
        console.error("Upload failed:", err);
      }
    });
  }

  // attach text editing for elements inside the box
  box.querySelectorAll("[data-editable]").forEach(el => {
    if (el.tagName === "IMG" || el.tagName === "VIDEO" || el.tagName === "A") return;
    if (el.dataset.clickAttached) return;
    el.dataset.clickAttached = "true";
    el.addEventListener("click", () => {
      const orig = el.innerText;
      const input = document.createElement(el.tagName === "H2" ? "input" : "textarea");
      input.value = orig;
      input.className = "border border-blue-400 rounded p-1 w-full";
      el.replaceWith(input);
      input.focus();
      const save = () => { el.innerText = input.value || orig; input.replaceWith(el); saveSiteContent(); };
      input.addEventListener("blur", save);
      input.addEventListener("keydown", ev => { if (ev.key === "Enter" && el.tagName === "H2") { ev.preventDefault(); save(); } });
    });
  });
}

// ======================= ADD / CREATE BOX =======================
function createNewContentBox() {
  const box = document.createElement("div");
  box.className = "content-box bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 relative";
  box.innerHTML = `
    <div class="content-image flex-1 relative">
      <input type="file" accept="image/*" class="hidden file-input">
      <button class="edit-btn image-edit absolute top-2 left-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md">📷</button>
      <img src="https://placehold.co/600x400" alt="Nouvelle image" data-editable>
    </div>
    <div class="content flex-1">
      <div class="flex justify-between items-center mb-2">
        <h2 data-editable contenteditable="true" class="text-2xl font-bold">Nouveau titre</h2>
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center">×</button>
      </div>
      <p data-editable contenteditable="true">Nouveau contenu ici.</p>
    </div>
  `;
  attachContentBoxBehaviors(box);
  return box;
}

// ======================= REFRESH VISIBILITY (exposed) =======================
function refreshAdminVisibility() {
  const show = !!isAdmin;
  document.querySelectorAll('.edit-btn, .image-edit, .menu-edit, .submenu-edit, .image-upload-btn, .delete-btn, #add-block').forEach(el => {
    el.style.display = show ? (el.dataset.inline || "inline-flex") : "none";
  });
  wireImageEditButtons();
}

// expose to console
window.__refreshAdminVisibility = refreshAdminVisibility;

// ======================= INIT SEQUENCE =======================
async function initEditableCMS() {
  // 1. Wait for session info
  await checkSession();

  // 2. Ensure DOM-created buttons are inserted
  ensureEditButtons();

  // 3. Wire image buttons and dropdowns (so they exist before visibility applied)
  wireImageEditButtons();
  wireDropdownToggles();

  // 4. Attach editing behaviors
  enableEditingForStaticElements();
  document.querySelectorAll(".content-box").forEach(attachContentBoxBehaviors);
  enableHoverImageUploads();

  // 5. Now apply visibility (final)
  applyAdminVisibility();

  // 6. Load saved content
  await loadSiteContent();

  // 7. Attach save/logout/addBlock handlers
  saveBtn?.addEventListener("click", saveSiteContent);
  logoutBtn?.addEventListener("click", () => { window.location.href = "/php/logout.php"; });

  addBlockBtn = document.getElementById("add-block");
  if (addBlockBtn) {
    addBlockBtn.style.display = isAdmin ? "inline-block" : "none";
    addBlockBtn.addEventListener("click", () => {
      const box = createNewContentBox();
      pageContainer.appendChild(box);
      attachContentBoxBehaviors(box);
      wireImageEditButtons();
      showTooltip("Nouveau bloc ajouté");
    });
  }

  console.debug("Editable CMS initialised. isAdmin=", isAdmin);
}

document.addEventListener("DOMContentLoaded", initEditableCMS);
