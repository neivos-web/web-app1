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
    showTooltip("Contenu chargé !");
  } catch (err) {
    console.error(err);
  }
}

// ======================= STATIC ELEMENT EDITING =======================
function enableEditingForStaticElements() {
  document.querySelectorAll(".edit-btn:not(.image-edit)").forEach(btn => {
    if (btn.dataset.behaviorsAttached) return;
    btn.dataset.behaviorsAttached = "true";

    btn.addEventListener("click", async e => {
      e.stopPropagation();
      const target = btn.nextElementSibling;
      if (!target || !target.hasAttribute("data-editable")) return;
      target.contentEditable = "true";
      target.focus();
      const r = document.createRange(); r.selectNodeContents(target);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);

      target.addEventListener("blur", async () => {
        target.contentEditable = "false";
        await saveSiteContent();
      }, { once: true });
    });
  });
}

// ======================= CONTENT BOXES =======================
function attachContentBoxBehaviors(box) {
  if (box.dataset.behaviorsAttached) return;
  box.dataset.behaviorsAttached = "true";

  // DELETE BUTTON
  const delBtn = box.querySelector(".delete-btn");
  if (delBtn) delBtn.style.display = isAdmin ? "inline-flex" : "none";
  if (delBtn) delBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (confirm("Supprimer ce bloc ?")) box.remove();
  });

  // IMAGE UPLOAD
  const editBtn = box.querySelector(".image-edit");
  const fileInput = box.querySelector(".file-input");
  const img = box.querySelector("img[data-editable]");
  if (editBtn) editBtn.style.display = isAdmin ? "inline-flex" : "none";
  if (editBtn && fileInput) {
    editBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { if (img) img.src = reader.result; };
      reader.readAsDataURL(file);
    });
  }

  // TEXT EDIT
  box.querySelectorAll("[data-editable]").forEach(el => {
    if (el.tagName === "IMG" || el.tagName === "VIDEO" || el.tagName === "A") return;
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

// ======================= EVENT LISTENERS =======================
saveBtn?.addEventListener("click", saveSiteContent);
logoutBtn?.addEventListener("click", () => { window.location.href = "/php/logout.php"; });

document.addEventListener("DOMContentLoaded", async () => {
  const sessionValid = await checkSession();

  if (!sessionValid) {
    showTooltip("Non connecté ! Redirection…");
    setTimeout(() => window.location.href = "/admin.html", 1500);
    return;
  }

  // Force admin for everyone logged in
  isAdmin = true;
  showTooltip("Connecté en tant qu'admin");

  // Load content
  await loadSiteContent();
  enableEditingForStaticElements();

  // Attach behaviors to existing content boxes
  document.querySelectorAll(".content-box").forEach(attachContentBoxBehaviors);

  // Show and attach Add Block button
  addBlockBtn = document.getElementById("add-block");
  if (addBlockBtn) {
    addBlockBtn.style.display = "inline-block"; // now visible
    addBlockBtn.addEventListener("click", () => {
      const box = createNewContentBox();
      pageContainer.appendChild(box);
    });
  }
});
