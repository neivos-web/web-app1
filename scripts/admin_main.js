// admin-editing.js
// Usage: <script type="module" src="/js/admin-editing.js"></script>
// Assumptions:
// - Page protected by PHP session (admin)
// - Endpoints:
//    POST /php/upload.php         -> receives file under 'file', returns JSON { success: true, path: "/uploads/..." }
//    POST /php/save_changes.php   -> receives JSON { page: "...", entries: { key: { type, value } } } returns { success: true }
//    GET  /php/load_content.php?page=... -> returns JSON of saved entries { key: { type, value } }
//    POST /php/logout.php         -> destroys session (returns {success:true})
// - There is a #save-btn and #logout-btn in page markup

const UPLOAD_ENDPOINT = '/php/upload.php';
const SAVE_ENDPOINT = '/php/save_changes.php';
const LOAD_ENDPOINT = '/php/load_content.php';
const LOGOUT_ENDPOINT = '/php/logout.php';
const UPLOAD_WEB_PREFIX = '/uploads/'; // server should return full path but keep this as fallback

const EDITABLE_SELECTOR = '[data-editable]';
const IMAGE_EDIT_BTN_SELECTOR = '.image-edit';
const EDIT_BTN_CLASS = 'ae-edit-btn';
const IMAGE_PICKER_ID = 'ae-image-picker';
const NEW_BLOCK_BTN_ID = 'ae-add-block-btn';

let pageName = detectPageName();
let keyCounter = 1;
let pendingChanges = {}; // { key: { type: 'text'|'image'|'block', value: string or File } }

document.addEventListener('DOMContentLoaded', init);

function init() {
  // wire up save & logout
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.addEventListener('click', onPublish);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', onLogout);

  // inject Add New Block button near save/logout (if not present)
  injectAddBlockButton();

  // create hidden file input for image picks
  createHiddenFilePicker();

  // load server content and apply
  loadServerContent().then(() => {
    // scan DOM and attach edit UI
    scanAndAttach();
    // observe DOM additions (new blocks)
    observeDomMutations();
  });
}

/* ---------- Page name detection ---------- */
function detectPageName() {
  try {
    const p = window.location.pathname.split('/').filter(Boolean);
    if (p.length === 0) return 'index';
    const last = p[p.length - 1];
    const name = last.includes('.') ? last.replace(/\.[^/.]+$/, '') : last;
    return name || 'index';
  } catch {
    return 'index';
  }
}

/* ---------- Load content from server ---------- */
async function loadServerContent() {
  try {
    const url = new URL(LOAD_ENDPOINT, window.location.origin);
    url.searchParams.set('page', pageName);
    const res = await fetch(url.toString(), { credentials: 'include' });
    if (!res.ok) return;
    const json = await res.json();
    if (!json || typeof json !== 'object') return;
    // apply values to DOM
    const entries = json.entries || json; // support both shapes
    Object.entries(entries).forEach(([key, meta]) => {
      const nodes = document.querySelectorAll(`[data-key="${escapeCss(key)}"]`);
      if (!nodes || nodes.length === 0) return;
      for (const node of nodes) {
        if (meta.type === 'image') {
          // meta.value should be a URL
          if (node.tagName.toLowerCase() === 'img') node.src = meta.value;
          else {
            const img = node.querySelector('img');
            if (img) img.src = meta.value;
          }
        } else {
          node.innerHTML = meta.value;
        }
      }
    });
  } catch (err) {
    console.warn('Could not load server content', err);
  }
}

/* ---------- Scan DOM and attach edit buttons ---------- */
function scanAndAttach(root = document) {
  const editables = Array.from(root.querySelectorAll(EDITABLE_SELECTOR));
  editables.forEach((el) => {
    // skip if inside our controls
    if (el.closest('.ae-admin-ui')) return;
    // ensure data-key exists
    if (!el.dataset.key) {
      el.dataset.key = generateKey();
    } else {
      // update keyCounter to avoid duplicates
      const last = el.dataset.key.split('_').pop();
      const n = parseInt(last, 10);
      if (!isNaN(n) && n >= keyCounter) keyCounter = n + 1;
    }
    // don't add duplicate edit buttons
    if (!hasAttachedEditBtn(el)) addEditButton(el);
  });

  // wire image-edit buttons (.image-edit) to open file picker for the nearest image or data-key
  const imageBtns = Array.from(root.querySelectorAll(IMAGE_EDIT_BTN_SELECTOR));
  imageBtns.forEach((btn) => {
    if (btn.dataset.aeAttached === '1') return;
    btn.dataset.aeAttached = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // find closest image in parent or next sibling
      const parent = btn.parentElement;
      const img = parent ? (parent.querySelector('img[data-editable]') || parent.querySelector('img')) : null;
      // choose target key:
      let targetKey = img?.dataset.key || parent?.dataset?.key || generateKey();
      if (!img && !parent) {
        // fallback: open image picker but user must drop to the target element later
      }
      // store current target on hidden input
      const picker = document.getElementById(IMAGE_PICKER_ID);
      picker.dataset.targetKey = targetKey;
      picker.click();
    });
  });

  // also allow clicking directly on img[data-editable] to open picker
  const imgs = Array.from(root.querySelectorAll('img[data-editable]'));
  imgs.forEach((img) => {
    if (img.dataset.aeImgAttached === '1') return;
    img.dataset.aeImgAttached = '1';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const picker = document.getElementById(IMAGE_PICKER_ID);
      picker.dataset.targetKey = img.dataset.key || generateKey();
      picker.click();
    });
  });
}

/* ---------- Helpers ---------- */
function hasAttachedEditBtn(el) {
  // look for sibling edit btn
  return !!el.parentElement?.querySelector(`.${EDIT_BTN_CLASS}[data-for="${escapeCss(el.dataset.key)}"]`);
}

function addEditButton(el) {
  // create small edit button and insert before element visually (we don't change markup)
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = EDIT_BTN_CLASS + ' edit-btn ae-admin-ui';
  btn.title = 'Éditer';
  btn.dataset.for = el.dataset.key;
  btn.innerText = '✎';
  // position: try to insert before element if inline; else append inside parent at start
  // We'll insert as previous sibling to keep layout similar to provided HTML where many edit btns exist
  try {
    el.parentElement.insertBefore(btn, el);
  } catch {
    // fallback: append after
    el.parentElement.appendChild(btn);
  }

  // click opens textual editor
  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    openTextEditor(el);
  });
}

/* ---------- Inline text editor ---------- */
function openTextEditor(el) {
  // remove any existing editor
  closeInlineEditor();

  // Decide input type: textarea for blocks/paragraphs, input for small tags
  const tag = el.tagName.toLowerCase();
  const isLong = tag === 'p' || tag === 'div' || (el.innerText && el.innerText.length > 120);
  const editor = isLong ? document.createElement('textarea') : document.createElement('input');
  editor.className = 'ae-inline-editor';
  if (isLong) {
    editor.rows = 6;
  } else {
    editor.type = 'text';
  }
  // set initial value (preserving innerHTML stripped of scripts)
  editor.value = el.innerText.trim();

  // position editor overlay near element — simple replacement for better UX
  editor.style.width = '100%';
  editor.style.boxSizing = 'border-box';
  editor.style.fontSize = '14px';
  editor.style.padding = '8px';
  editor.style.margin = '6px 0';

  // create save/cancel controls
  const save = document.createElement('button');
  save.type = 'button';
  save.textContent = 'Appliquer';
  save.className = 'ae-save-btn edit-btn';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Annuler';
  cancel.className = 'edit-btn';

  // wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'ae-inline-wrapper ae-admin-ui';
  wrapper.style.marginTop = '6px';

  wrapper.appendChild(editor);
  wrapper.appendChild(save);
  wrapper.appendChild(cancel);

  // insert wrapper after the element
  el.after(wrapper);
  editor.focus();

  save.addEventListener('click', () => {
    const newVal = editor.value;
    el.innerText = newVal;
    const key = el.dataset.key || generateKey();
    el.dataset.key = key;
    pendingChanges[key] = { type: 'text', value: newVal };
    markUnsaved(el, true);
    wrapper.remove();
  });

  cancel.addEventListener('click', () => wrapper.remove());
}

function closeInlineEditor() {
  const ex = document.querySelector('.ae-inline-wrapper');
  if (ex) ex.remove();
}

/* ---------- Hidden file picker ---------- */
function createHiddenFilePicker() {
  if (document.getElementById(IMAGE_PICKER_ID)) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  input.id = IMAGE_PICKER_ID;
  input.addEventListener('change', async (ev) => {
    const files = input.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const key = input.dataset.targetKey || generateKey();
    // immediately show preview if element exists with key
    const targetNode = document.querySelector(`[data-key="${escapeCss(key)}"]`);
    if (targetNode) {
      // if it's an img tag, preview by local URL
      if (targetNode.tagName.toLowerCase() === 'img') {
        targetNode.src = URL.createObjectURL(file);
      } else {
        const img = targetNode.querySelector('img');
        if (img) img.src = URL.createObjectURL(file);
      }
    }
    // Save in pendingChanges as File; upload will happen on publish
    pendingChanges[key] = { type: 'image', value: file };
    markUnsaved(targetNode || document.body, true);
    // clear picker value
    input.value = '';
  });
  document.body.appendChild(input);
}

/* ---------- Publish (Save All) ---------- */
async function onPublish() {
  if (Object.keys(pendingChanges).length === 0) {
    alert('Aucune modification à publier.');
    return;
  }
  // First upload all image files, get their server paths
  const entries = {}; // final entries to send to save endpoint
  // iterate pendingChanges
  for (const [key, meta] of Object.entries(pendingChanges)) {
    if (meta.type === 'image' && meta.value instanceof File) {
      try {
        const uploadRes = await uploadFile(meta.value, key);
        if (uploadRes && uploadRes.success && uploadRes.path) {
          entries[key] = { type: 'image', value: uploadRes.path };
          // update DOM images to server path
          const node = document.querySelector(`[data-key="${escapeCss(key)}"]`);
          if (node) {
            if (node.tagName.toLowerCase() === 'img') node.src = uploadRes.path;
            else {
              const img = node.querySelector('img');
              if (img) img.src = uploadRes.path;
            }
            markUnsaved(node, false);
          }
        } else {
          // failed upload; record empty and continue
          entries[key] = { type: 'image', value: '' };
        }
      } catch (err) {
        console.error('Upload error', err);
        entries[key] = { type: 'image', value: '' };
      }
    } else if (meta.type === 'text' || meta.type === 'block') {
      entries[key] = { type: meta.type, value: meta.value };
    } else {
      // fallback: try to read DOM
      const node = document.querySelector(`[data-key="${escapeCss(key)}"]`);
      if (node) entries[key] = { type: 'text', value: node.innerHTML };
    }
  }

  // send entries JSON to save endpoint
  try {
    const payload = { page: pageName, entries };
    const res = await fetch(SAVE_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json && json.success) {
      // clear pendingChanges, mark saved
      pendingChanges = {};
      updateSaveCounter();
      flashSaveSuccess();
      alert('Publier OK');
    } else {
      console.error('Save error', json);
      alert('Erreur lors de la sauvegarde (voir console).');
    }
  } catch (err) {
    console.error('Save exception', err);
    alert('Erreur réseau pendant la sauvegarde.');
  }
}

/* ---------- File upload helper ---------- */
async function uploadFile(file, key) {
  const form = new FormData();
  form.append('file', file, file.name);
  form.append('key', key);
  form.append('page', pageName);
  const res = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) return null;
  return await res.json(); // expect { success: true, path: "/uploads/..." }
}

/* ---------- Add new block button & template ---------- */
function injectAddBlockButton() {
  // add near #save-btn container (.extra-right-buttons) or admin bar
  const container = document.querySelector('.extra-right-buttons') || document.querySelector('nav .container') || document.body;
  if (!container) return;
  if (document.getElementById(NEW_BLOCK_BTN_ID)) return;
  const btn = document.createElement('button');
  btn.id = NEW_BLOCK_BTN_ID;
  btn.type = 'button';
  btn.className = 'bg-white border px-3 py-2 rounded-md text-sm';
  btn.textContent = 'Ajouter un nouveau bloc';
  btn.style.marginRight = '8px';
  // insert before save btn if exists
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn && saveBtn.parentElement) saveBtn.parentElement.insertBefore(btn, saveBtn);
  else container.appendChild(btn);

  btn.addEventListener('click', () => {
    const target = document.querySelector('#articles-container') || document.querySelector('main') || container;
    const tmp = document.createElement('div');
    tmp.innerHTML = `
      <div class="content-box new-content-box" style="border:1px dashed #e5e7eb; padding:12px; margin-bottom:12px;">
        <div class="content-image">
          <img src="images/placeholder.jpg" alt="placeholder" data-editable>
        </div>
        <div class="content">
          <h2 data-editable>Nouveau titre...</h2>
          <p data-editable>Votre texte ici...</p>
        </div>
      </div>
    `;
    const newBlock = tmp.firstElementChild;
    // append
    target.appendChild(newBlock);
    // ensure keys and attach editors
    scanAndAttach(newBlock);
    // register block as pending (store outerHTML)
    const blockKey = newBlock.dataset.key || generateKey();
    newBlock.dataset.key = blockKey;
    pendingChanges[blockKey] = { type: 'block', value: newBlock.outerHTML };
    updateSaveCounter();
    newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ---------- Logout ---------- */
async function onLogout() {
  if (!confirm('Déconnexion ?')) return;
  try {
    const res = await fetch(LOGOUT_ENDPOINT, { method: 'POST', credentials: 'include' });
    const j = await res.json();
    if (j && j.success) {
      window.location.href = '/admin.html';
    } else {
      alert('Erreur déconnexion');
    }
  } catch (err) {
    console.error('Logout error', err);
    window.location.href = '/admin.html';
  }
}

/* ---------- Visual helpers ---------- */
function markUnsaved(node, yes = true) {
  if (!node) return;
  if (yes) node.classList.add('ae-unsaved');
  else node.classList.remove('ae-unsaved');
  updateSaveCounter();
}

function updateSaveCounter() {
  const saveBtn = document.getElementById('save-btn');
  if (!saveBtn) return;
  const count = Object.keys(pendingChanges).length;
  // optionally update label
  const badgeId = 'ae-save-count';
  let badge = document.getElementById(badgeId);
  if (!badge) {
    badge = document.createElement('span');
    badge.id = badgeId;
    badge.style.marginLeft = '8px';
    badge.style.fontWeight = '700';
    saveBtn.after(badge);
  }
  badge.textContent = count > 0 ? `(${count})` : '';
}

function flashSaveSuccess() {
  const btn = document.getElementById('save-btn');
  if (!btn) return;
  btn.style.transition = 'box-shadow 0.3s';
  btn.style.boxShadow = '0 0 0 6px rgba(34, 228, 172, 0.18)';
  setTimeout(() => (btn.style.boxShadow = ''), 900);
}

/* ---------- MutationObserver for dynamic content ---------- */
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

/* ---------- Key generation ---------- */
function generateKey() {
  const k = `${pageName}_${String(keyCounter).padStart(2, '0')}`;
  keyCounter += 1;
  return k;
}

/* ---------- Utility escape for CSS selector use ---------- */
function escapeCss(s) {
  return s.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
}
