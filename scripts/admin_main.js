// admin-editing.js
// Full inline editor module (tag-based editors)
// Requires endpoints:
//   POST  /php/upload.php        -> { success: true, path: "/uploads/..." }
//   POST  /php/save_changes.php  -> { success: true }
//   GET   /php/load_content.php?page=... -> { entries: { key: { type, value, (href) } } }
//   POST  /php/logout.php        -> { success: true }
// Optional session check endpoint: /php/check_session.php returning { logged_in: true }

const SAVE_ENDPOINT = '/php/save_changes.php';
const UPLOAD_ENDPOINT = '/php/upload.php';
const LOAD_ENDPOINT = '/php/load_content.php';
const LOGOUT_ENDPOINT = '/php/logout.php';
const CHECK_SESSION_ENDPOINT = '/php/check_session.php';

const EDIT_BTN_CLASS = 'ae-edit-btn';
const INLINE_WRAPPER_CLASS = 'ae-inline-wrapper';
const IMAGE_PICKER_ID = 'ae-image-picker';
const ADD_BLOCK_BTN_ID = 'ae-add-block-btn';
const SAVE_COUNT_ID = 'ae-save-count';

const EDITABLE_SELECTOR = '[data-editable]';
const CONTENT_BOX_SELECTOR = '.content-box';

let pageName = detectPageName();
let keyCounter = 1;
let pendingChanges = {}; // { key: { type:'text'|'link'|'image'|'block', value: string | File | {text,href} } }
let isAdmin = true; // we will do a session-check attempt but page is usually admin-protected

document.addEventListener('DOMContentLoaded', async () => {
  try { isAdmin = await checkSession(); } catch (e) { /* fallback true */ }
  if (!isAdmin) {
    console.log('Admin session not detected — editor won\'t activate.');
    return;
  }
  injectStyles();
  createImagePicker();
  attachGlobalHandlers();
  await loadServerContent();
  scanAndAttach(document);
  injectAddBlockButton();
  observeDomMutations();
  updateSaveCounter();
});

/* ---------------- utilities ---------------- */
function detectPageName() {
  try {
    const path = window.location.pathname.split('/').filter(Boolean);
    if (path.length === 0) return 'index';
    const last = path[path.length - 1];
    return last.includes('.') ? last.replace(/\.[^/.]+$/, '') : last;
  } catch {
    return 'index';
  }
}
function pad(n, d = 2) { return String(n).padStart(d, '0'); }
function generateKey() { const k = `${pageName}_${pad(keyCounter)}`; keyCounter += 1; return k; }
function escapeCss(s) { return s.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1'); }

/* ---------------- session check (optional) ---------------- */
async function checkSession() {
  try {
    const res = await fetch(CHECK_SESSION_ENDPOINT, { credentials: 'include' });
    if (!res.ok) throw new Error('no-check');
    const j = await res.json();
    return j.logged_in === true || j.admin === true;
  } catch {
    // fallback: if page contains #save-btn assume admin
    return !!document.getElementById('save-btn');
  }
}

/* ---------------- load existing content ---------------- */
async function loadServerContent() {
  try {
    const url = new URL(LOAD_ENDPOINT, window.location.origin);
    url.searchParams.set('page', pageName);
    const res = await fetch(url.toString(), { credentials: 'include' });
    if (!res.ok) return;
    const j = await res.json();
    const entries = j.entries || j;
    if (!entries) return;
    Object.entries(entries).forEach(([key, meta]) => {
      // meta expected: { type, value } (for link: meta.text & meta.href)
      const nodes = document.querySelectorAll(`[data-key="${escapeCss(key)}"]`);
      if (!nodes.length) return;
      nodes.forEach((node) => {
        if (meta.type === 'image') {
          if (node.tagName.toLowerCase() === 'img') node.src = meta.value;
          else {
            const img = node.querySelector('img');
            if (img) img.src = meta.value;
          }
        } else if (meta.type === 'link') {
          if (typeof meta.text !== 'undefined') node.innerText = meta.text;
          if (typeof meta.href !== 'undefined') node.setAttribute('href', meta.href);
        } else {
          node.innerHTML = meta.value;
        }
      });
    });
  } catch (err) {
    console.warn('loadServerContent error', err);
  }
}

/* ---------------- scanning & attach edit buttons ---------------- */
function scanAndAttach(root = document) {
  // Ensure content-boxes get keys
  const boxes = Array.from(root.querySelectorAll(CONTENT_BOX_SELECTOR));
  boxes.forEach((b) => {
    if (!b.dataset.key) b.dataset.key = generateKey();
  });

  const editables = Array.from(root.querySelectorAll(EDITABLE_SELECTOR));
  editables.forEach((el) => {
    if (el.closest('.ae-admin-ui')) return; // avoid controls
    if (!el.dataset.key) el.dataset.key = generateKey();
    // update keyCounter to avoid reuse
    const lastPart = el.dataset.key.split('_').pop();
    const n = parseInt(lastPart, 10);
    if (!isNaN(n) && n >= keyCounter) keyCounter = n + 1;
    if (!hasEditBtn(el)) addEditButton(el);
    attachDirectHandlers(el);
  });
}

function hasEditBtn(el) {
  return !!el.parentElement?.querySelector(`.${EDIT_BTN_CLASS}[data-for="${escapeCss(el.dataset.key)}"]`);
}

function addEditButton(el) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${EDIT_BTN_CLASS} ae-admin-ui`;
  btn.title = 'Éditer';
  btn.dataset.for = el.dataset.key;
  btn.innerText = '✎';
  // Insert before element where markup expects: many pages have the edit-btn manually placed.
  // We try to insert before the element when possible to match your HTML.
  try {
    el.parentElement.insertBefore(btn, el);
  } catch {
    el.after(btn);
  }
  btn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    openEditorFor(el);
  });
}

/* ---------------- open inline editor (tag-based) ---------------- */
function openEditorFor(el) {
  closeAnyInlineEditor();
  const tag = el.tagName.toLowerCase();

  if (tag === 'img') {
    openImagePickerFor(el);
    return;
  }
  if (tag === 'a') {
    openLinkEditor(el);
    return;
  }

  const isBlock = ['p', 'div', 'section', 'article', 'pre', 'blockquote'].includes(tag) || el.classList.contains('content-box') || ['h1','h2','h3','h4','h5','h6'].includes(tag);
  const wrapper = document.createElement('div');
  wrapper.className = `${INLINE_WRAPPER_CLASS} ae-admin-ui`;
  wrapper.style.margin = '8px 0';

  const input = isBlock ? document.createElement('textarea') : document.createElement('input');
  input.className = 'ae-inline-input';
  if (isBlock) {
    input.rows = 6;
    input.style.width = '100%';
  } else {
    input.type = 'text';
    input.style.width = '50%';
  }
  // Prefill with plain text
  input.value = tag === 'input' || tag === 'textarea' ? el.value || el.innerText : el.innerText.trim();

  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.className = 'ae-apply-btn edit-btn';
  applyBtn.textContent = 'Appliquer';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'edit-btn';
  cancelBtn.textContent = 'Annuler';

  wrapper.appendChild(input);
  wrapper.appendChild(applyBtn);
  wrapper.appendChild(cancelBtn);

  el.after(wrapper);
  input.focus();

  applyBtn.addEventListener('click', () => {
    const newVal = input.value;
    el.innerText = newVal;
    const key = ensureKey(el);
    pendingChanges[key] = { type: 'text', value: newVal };
    markUnsaved(el, true);
    wrapper.remove();
    updateSaveCounter();
  });

  cancelBtn.addEventListener('click', () => {
    wrapper.remove();
  });

  // support Esc to cancel
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') wrapper.remove();
  });
}

/* ---------------- link editor ---------------- */
function openLinkEditor(aEl) {
  closeAnyInlineEditor();
  const wrapper = document.createElement('div');
  wrapper.className = `${INLINE_WRAPPER_CLASS} ae-admin-ui`;
  wrapper.style.margin = '8px 0';

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'ae-inline-input';
  labelInput.style.width = '48%';
  labelInput.value = aEl.innerText.trim();

  const hrefInput = document.createElement('input');
  hrefInput.type = 'text';
  hrefInput.className = 'ae-inline-input';
  hrefInput.style.width = '48%';
  hrefInput.style.marginLeft = '8px';
  hrefInput.value = aEl.getAttribute('href') || '';

  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.className = 'ae-apply-btn edit-btn';
  applyBtn.textContent = 'Appliquer';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'edit-btn';
  cancelBtn.textContent = 'Annuler';

  wrapper.appendChild(labelInput);
  wrapper.appendChild(hrefInput);
  wrapper.appendChild(applyBtn);
  wrapper.appendChild(cancelBtn);

  aEl.after(wrapper);
  labelInput.focus();

  applyBtn.addEventListener('click', () => {
    const text = labelInput.value;
    const href = hrefInput.value;
    aEl.innerText = text;
    aEl.setAttribute('href', href);
    const key = ensureKey(aEl);
    pendingChanges[key] = { type: 'link', text, href };
    markUnsaved(aEl, true);
    wrapper.remove();
    updateSaveCounter();
  });

  cancelBtn.addEventListener('click', () => wrapper.remove());
  // ESC cancels
  labelInput.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') wrapper.remove(); });
  hrefInput.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') wrapper.remove(); });
}

/* ---------------- image picker / uploader ---------------- */
function createImagePicker() {
  if (document.getElementById(IMAGE_PICKER_ID)) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.id = IMAGE_PICKER_ID;
  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener('change', (ev) => {
    const files = input.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const targetKey = input.dataset.targetKey;
    // preview local if node exists
    const node = document.querySelector(`[data-key="${escapeCss(targetKey)}"]`);
    if (node) {
      if (node.tagName.toLowerCase() === 'img') node.src = URL.createObjectURL(file);
      else {
        const img = node.querySelector('img');
        if (img) img.src = URL.createObjectURL(file);
      }
    }
    // store File in pendingChanges; upload occurs on Publish
    pendingChanges[targetKey] = { type: 'image', value: file };
    markUnsaved(node || document.body, true);
    updateSaveCounter();
    // clear value for next pick
    input.value = '';
    delete input.dataset.targetKey;
  });
}

function openImagePickerFor(imgEl) {
  const key = ensureKey(imgEl);
  const picker = document.getElementById(IMAGE_PICKER_ID);
  if (!picker) return;
  picker.dataset.targetKey = key;
  picker.click();
}

/* ---------------- common helpers ---------------- */
function ensureKey(el) {
  if (!el.dataset.key) el.dataset.key = generateKey();
  return el.dataset.key;
}
function markUnsaved(node, yes = true) {
  if (!node) return;
  if (yes) node.classList.add('ae-unsaved');
  else node.classList.remove('ae-unsaved');
}
function updateSaveCounter() {
  const saveBtn = document.getElementById('save-btn');
  if (!saveBtn) return;
  let badge = document.getElementById(SAVE_COUNT_ID);
  if (!badge) {
    badge = document.createElement('span');
    badge.id = SAVE_COUNT_ID;
    badge.style.marginLeft = '8px';
    badge.style.fontWeight = '700';
    saveBtn.after(badge);
  }
  const count = Object.keys(pendingChanges).length;
  badge.textContent = count > 0 ? `(${count})` : '';
}
function closeAnyInlineEditor() {
  const ex = document.querySelector(`.${INLINE_WRAPPER_CLASS}`);
  if (ex) ex.remove();
}

/* ---------------- open editor routing: direct handlers ---------------- */
function attachDirectHandlers(el) {
  // prevent default navigation for anchors and open editor on click
  if (el.tagName.toLowerCase() === 'a') {
    if (el.dataset.aAttached) return;
    el.dataset.aAttached = '1';
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      openLinkEditor(el);
    });
    return;
  }

  // for images, we will also allow clicking the element to open the picker
  if (el.tagName.toLowerCase() === 'img') {
    if (el.dataset.imgAttached) return;
    el.dataset.imgAttached = '1';
    el.style.cursor = 'pointer';
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      openImagePickerFor(el);
    });
    return;
  }

  // for other elements, no direct override needed: user clicks the edit button.
}

/* ---------------- Publish (Save All) ---------------- */
async function publishAll() {
  if (Object.keys(pendingChanges).length === 0) {
    alert('Aucune modification à publier.');
    return;
  }
  // 1) Upload all image Files first and replace pendingChanges values with server paths
  const entries = {}; // final entries to send
  for (const [key, meta] of Object.entries(pendingChanges)) {
    if (meta.type === 'image' && meta.value instanceof File) {
      try {
        const up = await uploadFile(meta.value, key);
        if (up && up.success && up.path) {
          entries[key] = { type: 'image', value: up.path };
          // update DOM image src if present
          const node = document.querySelector(`[data-key="${escapeCss(key)}"]`);
          if (node) {
            if (node.tagName.toLowerCase() === 'img') node.src = up.path;
            else {
              const img = node.querySelector('img');
              if (img) img.src = up.path;
            }
            markUnsaved(node, false);
          }
        } else {
          entries[key] = { type: 'image', value: '' };
        }
      } catch (err) {
        console.error('uploadFile error', err);
        entries[key] = { type: 'image', value: '' };
      }
    } else if (meta.type === 'text') {
      entries[key] = { type: 'text', value: meta.value };
    } else if (meta.type === 'link') {
      entries[key] = { type: 'link', text: meta.text, href: meta.href };
    } else if (meta.type === 'block') {
      entries[key] = { type: 'block', value: meta.value };
    } else {
      // fallback: attempt to read DOM
      const node = document.querySelector(`[data-key="${escapeCss(key)}"]`);
      if (node) entries[key] = { type: 'text', value: node.innerHTML };
    }
  }

  // 2) POST entries JSON to SAVE_ENDPOINT
  try {
    const payload = { page: pageName, entries };
    const res = await fetch(SAVE_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (j && j.success) {
      // clear pendingChanges and UI marks
      Object.keys(entries).forEach((k) => {
        const node = document.querySelector(`[data-key="${escapeCss(k)}"]`);
        if (node) markUnsaved(node, false);
      });
      pendingChanges = {};
      updateSaveCounter();
      flashSaveSuccess();
      alert('Contenu publié avec succès.');
    } else {
      console.error('Save failed', j);
      alert('Erreur lors de la sauvegarde. Voir console.');
    }
  } catch (err) {
    console.error('Publish error', err);
    alert('Erreur réseau lors de la publication.');
  }
}

/* ---------------- file upload helper ---------------- */
async function uploadFile(file, key) {
  const fd = new FormData();
  fd.append('file', file, file.name);
  fd.append('key', key);
  fd.append('page', pageName);
  const res = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    body: fd,
  });
  if (!res.ok) throw new Error('upload failed');
  return await res.json();
}

/* ---------------- add new block template ---------------- */
function injectAddBlockButton() {
  if (document.getElementById(ADD_BLOCK_BTN_ID)) return;
  const container = document.querySelector('.extra-right-buttons') || document.querySelector('nav .container') || document.body;
  if (!container) return;
  const btn = document.createElement('button');
  btn.id = ADD_BLOCK_BTN_ID;
  btn.type = 'button';
  btn.className = 'bg-white border px-3 py-2 rounded-md text-sm';
  btn.textContent = 'Ajouter un nouveau bloc';
  btn.style.marginRight = '8px';
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn && saveBtn.parentElement) saveBtn.parentElement.insertBefore(btn, saveBtn);
  else container.appendChild(btn);

  btn.addEventListener('click', () => {
    const target = document.querySelector('#articles-container') || document.querySelector('main') || document.body;
    const tmp = document.createElement('div');
    tmp.innerHTML = `
      <div class="content-box new-content-box" style="border:1px dashed #e5e7eb; padding:12px; margin-bottom:12px;">
        <div class="content-image">
          <img src="images/placeholder.jpg" alt="placeholder" data-editable />
        </div>
        <div class="content">
          <h2 data-editable>Nouveau titre...</h2>
          <p data-editable>Votre texte ici...</p>
        </div>
      </div>`;
    const newBlock = tmp.firstElementChild;
    target.appendChild(newBlock);
    // assign key(s) and attach editors
    scanAndAttach(newBlock);
    // register pending change as block (store outerHTML)
    const bk = newBlock.dataset.key || generateKey();
    newBlock.dataset.key = bk;
    pendingChanges[bk] = { type: 'block', value: newBlock.outerHTML };
    markUnsaved(newBlock, true);
    updateSaveCounter();
    newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ---------------- logout handler & global bindings ---------------- */
function attachGlobalHandlers() {
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.addEventListener('click', (e) => { e.preventDefault(); publishAll(); });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Déconnexion ?')) return;
    try {
      const res = await fetch(LOGOUT_ENDPOINT, { method: 'POST', credentials: 'include' });
      const j = await res.json();
      if (j && j.success) window.location.href = '/admin.html';
      else window.location.href = '/admin.html';
    } catch { window.location.href = '/admin.html'; }
  });

  // click outside any editor closes it
  document.addEventListener('click', (ev) => {
    const target = ev.target;
    if (target.closest('.ae-admin-ui')) return;
    closeAnyInlineEditor();
  });
}

/* ---------------- observe DOM mutations to attach new nodes ---------------- */
function observeDomMutations() {
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) scanAndAttach(n);
        });
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

/* ---------------- helper: open image picker for an element (exposed) ---------------- */
function openImagePickerForNode(node) { openImagePickerFor(node); }

/* ---------------- small UI effects ---------------- */
function flashSaveSuccess() {
  const btn = document.getElementById('save-btn');
  if (!btn) return;
  btn.style.transition = 'box-shadow 0.3s';
  btn.style.boxShadow = '0 0 0 8px rgba(34,228,172,0.12)';
  setTimeout(() => (btn.style.boxShadow = ''), 900);
}

/* ---------------- utilities for the module scope ---------------- */
function closeAnyInlineEditor() {
  const ex = document.querySelector(`.${INLINE_WRAPPER_CLASS}`);
  if (ex) ex.remove();
}

/* ---------------- CSS injection ---------------- */
function injectStyles() {
  const css = `
  .${EDIT_BTN_CLASS}{ background:#22e4ac;color:#fff;border-radius:6px;padding:2px 6px;border:none;cursor:pointer;margin-right:6px;font-size:0.9rem; }
  .${EDIT_BTN_CLASS}:hover{ background:#06a0c5; transform:translateY(-1px); }
  .ae-inline-wrapper{ background:#fff;border:1px solid #e5e7eb;padding:8px;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.06); z-index:9999; }
  .ae-inline-input{ font-size:14px;padding:6px;border:1px solid #cbd5e1;border-radius:4px; display:block; margin-bottom:8px; }
  .ae-unsaved{ box-shadow: inset 0 0 0 3px rgba(250,200,0,0.12); }
  .${INLINE_WRAPPER_CLASS} .edit-btn{ margin-right:8px; }
  #${ADD_BLOCK_BTN_ID}{ cursor:pointer; }
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}
