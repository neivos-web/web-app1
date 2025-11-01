// ======================= SELECTORS & STATE =======================
const saveBtn = document.getElementById("save-btn");
const logoutBtn = document.getElementById("logout-btn");
const pageContainer = document.querySelector("main") || document.body;

let addBlockBtn = null;
let isAdmin = true; // admin flag from session check (PHP)

async function checkSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    if (!res.ok) throw new Error("Network response not ok");
    const data = await res.json();
    
    // Set global flag
    isAdmin = data.logged_in === true || data.logged_in === "true";

    return isAdmin;
  } catch (err) {
    console.error("Error checking session:", err);
    isAdmin = false;
    return false;
  }
}


function applyAdminVisibility() {
  const selectors = [
    ".edit-btn",
    ".image-edit",
    ".publish-btn",
    "#logout-btn",
    ".menu-edit",         
    ".submenu-edit",      
    ".image-upload-btn",  
    ".delete-btn",        
    "#add-block"          
  ];

  document.querySelectorAll(selectors.join(", ")).forEach(btn => {
    btn.style.display = isAdmin ? "inline-flex" : "none";
  });
}



// ======================= UTILITY =======================
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

function escapeHtml(str = "") {
  return ("" + str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function showTooltip(msg) {
  const tip = document.createElement("div");
  tip.textContent = msg;
  tip.className = "fixed top-4 right-4 bg-green-500 text-white p-2 rounded shadow z-50";
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 2500);
}

// ======================= SMALL HELPERS =======================

// find the most appropriate editable element related to an edit button
function findEditableTargetForButton(btn) {
  // 1) previous sibling with data-editable
  if (btn.previousElementSibling && btn.previousElementSibling.hasAttribute && btn.previousElementSibling.hasAttribute("data-editable")) {
    return btn.previousElementSibling;
  }
  // 2) next sibling with data-editable
  if (btn.nextElementSibling && btn.nextElementSibling.hasAttribute && btn.nextElementSibling.hasAttribute("data-editable")) {
    return btn.nextElementSibling;
  }
  // 3) search in parent for a direct data-editable (useful for menu items where edit button sits next to control)
  const parent = btn.parentElement;
  if (parent) {
      const prefer = parent.querySelector('a[data-editable], img[data-editable], h1[data-editable], h2[data-editable], p[data-editable], span[data-editable]');
    if (prefer) return prefer;

    // find only direct child editable elements (ignore submenu)
    const any = [...parent.children].find(el => el.hasAttribute && el.hasAttribute("data-editable"));
    if (any) return any;
  }
  // 4) search previous siblings' descendants
  let sib = btn.previousElementSibling;
  while (sib) {
    const found = sib.querySelector && sib.querySelector('[data-editable]');
    if (found) return found;
    sib = sib.previousElementSibling;
  }
  // 5) search next siblings' descendants
  sib = btn.nextElementSibling;
  while (sib) {
    const found = sib.querySelector && sib.querySelector('[data-editable]');
    if (found) return found;
    sib = sib.nextElementSibling;
  }
  // 6) fallback - closest ancestor with data-editable
  const anc = btn.closest('[data-editable]');
  if (anc) return anc;
  return null;
}

// rudimentary upload helper that matches your backend signature (assumes php/upload.php returns {"url":"..."} )
async function uploadFileToServer(file, key, pageFolder) {
  try {
    const fd = new FormData();
    fd.append('file', file);
    // attach metadata expected by your backend
    const q = `?page=${encodeURIComponent(pageFolder)}&key=${encodeURIComponent(key)}`;
    const url = `/php/upload.php${q}`;
    const res = await fetch(url, { method: 'POST', body: fd, credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Upload failed');
    return json.url || json.data?.url || json.path || null;
  } catch (err) {
    console.error('Upload error', err);
    throw err;
  }
}

// ensure pageFolder string used for upload endpoint
function currentPageFolder() {
  return window.location.pathname
    .replace(/\//g, "_")
    .replace(".html", "")
    .replace(/^_+|_+$/g, "") || "general";
}

// ======================= SAVE & LOAD =======================
async function saveSiteContent() {
  const elements = document.querySelectorAll('[contenteditable], img, video, a');
  const data = [];

  elements.forEach(el => {
    const key = generateKey(el);
    const page = window.location.pathname
      .replace(/\//g, "_")
      .replace(".html", "")
      .replace(/^_+|_+$/g, "") || "general";

    let type, value;

    if (el.tagName === 'IMG') type = 'image', value = el.src;
    else if (el.tagName === 'VIDEO') type = 'video', value = el.src;
    else if (el.tagName === 'A') type = 'link', value = JSON.stringify({ text: el.innerText || "", href: el.href || "" });
    else type = 'text', value = el.innerText ? el.innerText.trim() : "";

    data.push({ page, key, type, value });
  });

  const res = await fetch('/php/save_content.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    console.error("Failed to save content", await res.text());
    throw new Error("Save failed");
  }
  showTooltip("Contenu sauvegardé !");
}

async function loadSiteContent() {
  try {
    const pageParam = window.location.pathname
      .replace(/\//g, "_")
      .replace(".html", "")
      .replace(/^_+|_+$/g, "") || "general";

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
        case "A": {
          if (typeof value === "object") { el.textContent = value.text || ""; el.href = value.href || ""; }
          else el.textContent = value;
          break;
        }
        default: el.innerText = value; break;
      }
    });
   // showTooltip("Contenu chargé !");
  } catch (err) {
    console.error(err);
  }
}

// ======================= STATIC ELEMENT EDITING =======================
function enableEditingForStaticElements() {
  // attach to all edit buttons that are not image-edit
  document.querySelectorAll(".edit-btn:not(.image-edit)").forEach(btn => {
    if (btn.dataset.behaviorsAttached) return;
    btn.dataset.behaviorsAttached = "true";

    btn.addEventListener("click", async e => {
      e.stopPropagation();

      // find the right editable target (robust search)
      const target = findEditableTargetForButton(btn);
      if (!target) {
        // if none found, and this button sits inside a dropdown item, try to open the dropdown (UX)
        // if it's a menu toggle, try to toggle group visibility
        const parent = btn.parentElement;
        if (parent && parent.classList.contains('group')) {
          // do nothing, but avoid error
        }
        return;
      }

      // make editable in place
      target.contentEditable = "true";
      target.focus();
      const r = document.createRange(); r.selectNodeContents(target);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);

      // on blur - save and disable editing
      target.addEventListener("blur", async () => {
        target.contentEditable = "false";
        try { await saveSiteContent(); showTooltip("Mis à jour"); } catch (err) { console.error(err); }
      }, { once: true });
    });
  });
}

// ======================= CONTENT BOXES =======================

function enableHoverImageUploads() {
  document.querySelectorAll("img[data-editable]").forEach(img => {
    if (img.dataset.hoverUploadAttached) return;
    img.dataset.hoverUploadAttached = "true";

    // Wrap img in a relative container if not already wrapped
    const wrapper = document.createElement("div");
    wrapper.className = "image-edit-hover-wrapper";
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // Create upload button + hidden file input
    const btn = document.createElement("button");
    btn.className = "image-upload-btn";
    btn.innerHTML = "📷";
    wrapper.appendChild(btn);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.className = "hidden";
    wrapper.appendChild(fileInput);

    // Only show button for admin
    btn.style.display = isAdmin ? "flex" : "none";

    btn.addEventListener("click", e => {
      e.stopPropagation();
      fileInput.click();
    });

    fileInput.addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file) return;

      const key = generateKey(img);
      const pageFolder = currentPageFolder();

      try {
        const uploadedUrl = await uploadFileToServer(file, key, pageFolder);
        img.src = uploadedUrl;
        await saveSiteContent();
        showTooltip("Image mise à jour");
      } catch (err) {
        console.error(err);
        alert("Erreur upload image");
      }
    });
  });
}

function attachContentBoxBehaviors(box) {
  if (box.dataset.behaviorsAttached) return;
  box.dataset.behaviorsAttached = "true";

  // ensure image-upload UI exists for static boxes (some static boxes had no file input / image-edit)
  const img = box.querySelector("img[data-editable]");
  let editBtn = box.querySelector(".image-edit");
  let fileInput = box.querySelector(".file-input");

  if (img && (!editBtn || !fileInput)) {
    // create wrapper/button + hidden file input and insert before the img
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.className = "hidden file-input";

    editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn image-edit absolute top-2 left-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md";
    editBtn.title = "Edit image";
    editBtn.textContent = "📷";

    // position: try to make the parent relatively positioned
    const imgParent = img.parentElement;
    if (imgParent && getComputedStyle(imgParent).position === 'static') {
      imgParent.style.position = 'relative';
    }

    // insert the button and file input into DOM
    imgParent.insertBefore(editBtn, imgParent.firstChild);
    imgParent.insertBefore(fileInput, img);
  }

  // DELETE BUTTON
  const delBtn = box.querySelector(".delete-btn");
  if (delBtn) delBtn.style.display = isAdmin ? "inline-flex" : "none";
  if (delBtn) delBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (confirm("Supprimer ce bloc ?")) box.remove();
  });

  // IMAGE UPLOAD wiring (use server uploader if available)
  if (editBtn && fileInput && img) {
    editBtn.style.display = isAdmin ? "inline-flex" : "none";

    editBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file) return;

      // try to upload to server
      const key = generateKey(img);
      const pageFolder = currentPageFolder();

      try {
        // attempt server upload (if your /php/upload.php returns {url: '...'})
        const uploadedUrl = await uploadFileToServer(file, key, pageFolder).catch(err => null);
        if (uploadedUrl) {
          img.src = uploadedUrl;
        } else {
          // fallback to dataURL preview if upload failed / not available
          const reader = new FileReader();
          reader.onload = () => { img.src = reader.result; };
          reader.readAsDataURL(file);
        }
        // save changes
        await saveSiteContent();
        showTooltip("Image mise à jour");
      } catch (err) {
        console.error("Upload failed:", err);
        // fallback to local preview
        const reader = new FileReader();
        reader.onload = () => { img.src = reader.result; };
        reader.readAsDataURL(file);
      }
    });
  }

  // TEXT EDIT
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
      const save = () => { el.innerText = input.value || orig; input.replaceWith(el); };
      input.addEventListener("blur", save);
      input.addEventListener("keydown", ev => { if (ev.key === "Enter" && el.tagName === "H2") { ev.preventDefault(); save(); } });
    });
  });
}

// ======================= ADD NEW BOX =======================
function createNewContentBox() {
  const box = document.createElement("div");
  box.className = "content-box bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 relative";
  box.innerHTML = `
    <div class="content-image flex-1">
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
// --- Auto-insert missing edit buttons for every [data-editable] element ---
// Place this after your other functions and run it once after DOMContentLoaded
function ensureEditButtons() {
  document.querySelectorAll('[data-editable]').forEach(target => {
    // skip if an edit button is already adjacent (previous sibling or next sibling)
    const prev = target.previousElementSibling;
    const next = target.nextElementSibling;
    if ((prev && (prev.classList && (prev.classList.contains('edit-btn') || prev.classList.contains('image-edit') || prev.classList.contains('menu-edit') || prev.classList.contains('submenu-edit'))))
     || (next && (next.classList && (next.classList.contains('edit-btn') || next.classList.contains('image-edit') || next.classList.contains('menu-edit') || next.classList.contains('submenu-edit'))))) {
      return;
    }

    // decide button type
    let btn;
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'image-edit';
      btn.textContent = '📷';
      btn.title = 'Modifier l\'image';
      // insert the button BEFORE the image so btn.nextElementSibling === image (your code expects nextElementSibling)
      target.parentNode.insertBefore(btn, target);
    } else {
      // for anchors that are top-level menu buttons, prefer "menu-edit" for styling if parent is .group or has dropdown
      const isMenuControl = target.closest('.group') || target.id?.toLowerCase().includes('dropdown') || target.classList.contains('menu-toggle') || target.closest('.relative');
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = isMenuControl ? 'menu-edit' : 'edit-btn';
      btn.textContent = '✎';
      btn.title = 'Éditer';
      // insert the button BEFORE the editable element so btn.nextElementSibling === target (matches enableEditingForStaticElements)
      target.parentNode.insertBefore(btn, target);
    }
  });

  // ensure new buttons follow the same display rules as your code (visible only for admin)
  const shouldShow = typeof isAdmin !== 'undefined' ? isAdmin : true;
  document.querySelectorAll('.edit-btn, .image-edit, .menu-edit, .submenu-edit').forEach(b => {
    b.style.display = shouldShow ? 'inline-flex' : 'none';
    b.style.alignItems = 'center';
    b.style.justifyContent = 'center';
    b.style.cursor = 'pointer';
    // protect against double attaching
    if (!b.dataset.autoAttached) {
      b.dataset.autoAttached = 'true';
      // keep existing click wiring: rely on enableEditingForStaticElements() & attachContentBoxBehaviors()
      // but as a fallback, add a minimal click that triggers click on nearest edit flow:
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        // if there is an image next, trigger the file input if present
        const next = b.nextElementSibling;
        if (b.classList.contains('image-edit')) {
          const fileInput = b.parentElement && b.parentElement.querySelector('input[type="file"].file-input');
          if (fileInput) fileInput.click();
        }
        // otherwise, if the enableEditingForStaticElements hasn't attached, try to make the target editable
        if (!b.classList.contains('image-edit')) {
          const target = b.nextElementSibling && b.nextElementSibling.hasAttribute && b.nextElementSibling.hasAttribute('data-editable') ? b.nextElementSibling : findEditableTargetForButton ? findEditableTargetForButton(b) : null;
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
        }
      });
    }
  });
}

// ---------- Extra wiring for existing buttons & dropdowns ----------

/**
 * Ensure every .image-edit button has an associated hidden file input and a click handler.
 * If the button already has a sibling input[type=file].file-input we reuse it.
 */
function wireImageEditButtons() {
  document.querySelectorAll('.image-edit').forEach(btn => {
    // don't wire twice
    if (btn.dataset.wired === 'true') return;
    btn.dataset.wired = 'true';

    // find nearest image target (following sibling, parent, or next data-editable image)
    const parent = btn.parentElement;
    let img = null;
    // common patterns: button is before the <img> or inside same parent
    if (btn.nextElementSibling && btn.nextElementSibling.tagName === 'IMG') img = btn.nextElementSibling;
    if (!img && parent) img = parent.querySelector && parent.querySelector('img[data-editable]');
    if (!img) {
      // fallback: search nearby
      img = document.querySelector('img[data-editable]'); // last resort
    }

    // find or create file input
    let fileInput = parent && parent.querySelector('input[type="file"].file-input');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'hidden file-input';
      // insert after the button (so fileInput is near the button)
      if (btn.nextElementSibling) btn.parentNode.insertBefore(fileInput, btn.nextElementSibling);
      else btn.parentNode.appendChild(fileInput);
    }

    // show/hide depending on isAdmin state
    btn.style.display = (typeof isAdmin !== 'undefined' && isAdmin) ? 'inline-flex' : 'none';

    // click -> open file picker
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!fileInput) return;
      fileInput.click();
    });

    // when a file is selected, upload and update the img.src
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      // prefer to generate a key from the img or fallback to a path generated from location
      const key = img ? generateKey(img) : (`image_${Date.now()}`);
      const pageFolder = currentPageFolder();
      try {
        const uploadedUrl = await uploadFileToServer(file, key, pageFolder).catch(err => null);
        if (uploadedUrl && img) {
          img.src = uploadedUrl;
        } else if (img) {
          // fallback to local preview if upload not available
          const reader = new FileReader();
          reader.onload = () => { img.src = reader.result; };
          reader.readAsDataURL(file);
        }
        await saveSiteContent();
        showTooltip('Image mise à jour');
      } catch (err) {
        console.error('Upload error (wired button):', err);
        alert('Erreur upload image');
      }
    });
  });
}

/**
 * Make menu dropdowns toggle on click (useful for mobile / touch).
 * Example: #dropdownButtonPortefeuille toggles #dropdownMenuPortefeuille
 */
function wireDropdownToggles() {
  const mapping = [
    { button: document.getElementById('dropdownButtonPortefeuille'), menu: document.getElementById('dropdownMenuPortefeuille') },
    // add other dropdown button/menu pairs if you have them (e.g. training dropdown)
  ];

  mapping.forEach(pair => {
    if (!pair.button || !pair.menu) return;
    pair.button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      pair.menu.classList.toggle('hidden');
      pair.menu.classList.toggle('block'); // ensure it can show (block) when not hidden
      // if you're using absolute positioning, remove any inline transform that blocks visibility
    });
  });

  // close dropdowns when clicking outside
  document.addEventListener('click', () => {
    mapping.forEach(pair => {
      if (!pair.menu) return;
      pair.menu.classList.add('hidden');
      pair.menu.classList.remove('block');
    });
  });

  // also close when resizing (avoid stuck open dropdown)
  window.addEventListener('resize', () => {
    mapping.forEach(pair => {
      if (!pair.menu) return;
      pair.menu.classList.add('hidden');
      pair.menu.classList.remove('block');
    });
  });
}

/**
 * Make sure edit buttons are visible/hide after session check (call after isAdmin final value)
 */
function refreshAdminVisibility() {
  const show = typeof isAdmin !== 'undefined' ? isAdmin : false;
  document.querySelectorAll('.edit-btn, .image-edit, .menu-edit, .submenu-edit, .image-upload-btn, .delete-btn, #add-block').forEach(el => {
    el.style.display = show ? 'inline-flex' : 'none';
  });

  // ensure file inputs created and wired
  wireImageEditButtons();
}

// call these when DOM ready and after you determine isAdmin
document.addEventListener('DOMContentLoaded', () => {
  // initial wiring (in case your other init code already ran)
  wireImageEditButtons();
  wireDropdownToggles();
});

// also expose refresh function so you can call it after checkSession resolves
window.__refreshAdminVisibility = refreshAdminVisibility;

// ======================= EVENT LISTENERS =======================
saveBtn?.addEventListener("click", saveSiteContent);
logoutBtn?.addEventListener("click", () => { window.location.href = "/php/logout.php"; });

document.addEventListener("DOMContentLoaded", async () => {
  const sessionValid = await checkSession();

  // Load content regardless — session check just sets isAdmin
  await loadSiteContent();
  //ensureEditButtons();

  // enable editing UI and behavior
  enableEditingForStaticElements();

  // Attach behaviors to existing content boxes
  document.querySelectorAll(".content-box").forEach(attachContentBoxBehaviors);
  refreshAdminVisibility();
  // Show and attach Add Block button
  addBlockBtn = document.getElementById("add-block");
  if (addBlockBtn) {
    addBlockBtn.style.display = isAdmin ? "inline-block" : "none";
    addBlockBtn.addEventListener("click", () => {
      const box = createNewContentBox();
      pageContainer.appendChild(box);
      enableHoverImageUploads();

    });
  }
});
