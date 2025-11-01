// ======================= SELECTORS & STATE =======================
const saveBtn = document.getElementById("save-btn");
const logoutBtn = document.getElementById("logout-btn");
const pageContainer = document.querySelector("main") || document.body;

let addBlockBtn = null;
let isAdmin = true;

// ======================= SESSION & ADMIN =======================
async function checkSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    const data = await res.json();
    isAdmin = data.logged_in === true || data.logged_in === "true";
  } catch (err) {
    console.error("Error checking session:", err);
    isAdmin = false;
  }
  return isAdmin;
}

async function applyAdminVisibility() {
  await checkSession();
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
  document.querySelectorAll(selectors.join(", ")).forEach(el => {
    el.style.display = isAdmin ? "inline-flex" : "none";
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

function showTooltip(msg) {
  const tip = document.createElement("div");
  tip.textContent = msg;
  tip.className = "fixed top-4 right-4 bg-green-500 text-white p-2 rounded shadow z-50";
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 2500);
}

function currentPageFolder() {
  return window.location.pathname
    .replace(/\//g, "_")
    .replace(".html", "")
    .replace(/^_+|_+$/g, "") || "general";
}

async function uploadFileToServer(file, key, pageFolder) {
  try {
    const fd = new FormData();
    fd.append('file', file);
    const q = `?page=${encodeURIComponent(pageFolder)}&key=${encodeURIComponent(key)}`;
    const res = await fetch(`/php/upload.php${q}`, { method: 'POST', body: fd, credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Upload failed');
    return json.url || json.data?.url || json.path || null;
  } catch (err) {
    console.error('Upload error', err);
    throw err;
  }
}

// ======================= SAVE & LOAD =======================
async function saveSiteContent() {
  const elements = document.querySelectorAll('[contenteditable], img, video, a');
  const data = [];
  elements.forEach(el => {
    const key = generateKey(el);
    const page = currentPageFolder();
    let type, value;
    if (el.tagName === 'IMG') type = 'image', value = el.src;
    else if (el.tagName === 'VIDEO') type = 'video', value = el.src;
    else if (el.tagName === 'A') type = 'link', value = JSON.stringify({ text: el.innerText || "", href: el.href || "" });
    else type = 'text', value = el.innerText ? el.innerText.trim() : "";
    data.push({ page, key, type, value });
  });
  try {
    const res = await fetch('/php/save_content.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    showTooltip("Contenu sauvegardé !");
  } catch (err) {
    console.error("Failed to save content", err);
  }
}

async function loadSiteContent() {
  try {
    const page = currentPageFolder();
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, { credentials: "include" });
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
        case "A": el.textContent = value.text || ""; el.href = value.href || ""; break;
        default: el.innerText = value; break;
      }
    });
  } catch (err) { console.error(err); }
}

// ======================= EDITING & IMAGE UPLOAD =======================
function enableEditingForStaticElements() {
  document.querySelectorAll(".edit-btn:not(.image-edit)").forEach(btn => {
    if (btn.dataset.behaviorsAttached) return;
    btn.dataset.behaviorsAttached = "true";
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      const target = findEditableTargetForButton(btn);
      if (!target) return;
      target.contentEditable = "true";
      target.focus();
      const r = document.createRange(); r.selectNodeContents(target);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      target.addEventListener("blur", async () => {
        target.contentEditable = "false";
        await saveSiteContent();
        showTooltip("Mis à jour");
      }, { once: true });
    });
  });
}

function enableImageUploads() {
  document.querySelectorAll("img[data-editable]").forEach(img => {
    if (img.dataset.uploadAttached) return;
    img.dataset.uploadAttached = "true";

    const wrapper = document.createElement("div");
    wrapper.className = "relative";
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    const btn = document.createElement("button");
    btn.className = "image-upload-btn absolute top-2 left-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center";
    btn.textContent = "📷";
    wrapper.appendChild(btn);

    const fileInput = document.createElement("input");
    fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.className = "hidden";
    wrapper.appendChild(fileInput);

    btn.style.display = isAdmin ? "flex" : "none";

    btn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async e => {
      const file = e.target.files[0]; if (!file) return;
      const key = generateKey(img);
      const folder = currentPageFolder();
      try {
        const uploadedUrl = await uploadFileToServer(file, key, folder);
        img.src = uploadedUrl;
        await saveSiteContent();
        showTooltip("Image mise à jour");
      } catch (err) { console.error(err); alert("Erreur upload image"); }
    });
  });
}

// ======================= CONTENT BOXES =======================
function attachContentBoxBehaviors(box) {
  if (box.dataset.behaviorsAttached) return;
  box.dataset.behaviorsAttached = "true";

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

  const delBtn = box.querySelector(".delete-btn");
  if (delBtn) {
    delBtn.style.display = isAdmin ? "inline-flex" : "none";
    delBtn.addEventListener("click", () => { if (confirm("Supprimer ce bloc ?")) box.remove(); });
  }
}

// ======================= ADD BLOCK =======================
function createNewContentBox() {
  const box = document.createElement("div");
  box.className = "content-box bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 relative";
  box.innerHTML = `
    <div class="content-image flex-1">
      <input type="file" accept="image/*" class="hidden file-input">
      <button class="edit-btn image-edit absolute top-2 left-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center">📷</button>
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
  enableImageUploads();
  return box;
}

// ======================= INIT =======================
document.addEventListener("DOMContentLoaded", async () => {
  await checkSession();
  applyAdminVisibility();
  enableEditingForStaticElements();
  enableImageUploads();

  document.querySelectorAll(".content-box").forEach(attachContentBoxBehaviors);

  addBlockBtn = document.getElementById("add-block");
  if (addBlockBtn) {
    addBlockBtn.style.display = isAdmin ? "inline-block" : "none";
    addBlockBtn.addEventListener("click", () => {
      const box = createNewContentBox();
      pageContainer.appendChild(box);
    });
  }

  loadSiteContent();
});

saveBtn?.addEventListener("click", saveSiteContent);
logoutBtn?.addEventListener("click", () => { window.location.href = "/php/logout.php"; });
