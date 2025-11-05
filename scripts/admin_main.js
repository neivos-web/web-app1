// ================== ADMIN STRUCTURED CMS ==================
// Save & load editable sections with full inline styles
// Excludes header, footer, and admin buttons
// ==========================================================

const pageKey = window.location.pathname.split("/").pop() || "index.php";
let isAdmin = false;
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 900;

// ---- Toast helpers ----
function toast(msg, timeout = 2500) {
  let t = document.getElementById("cms-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "cms-toast";
    Object.assign(t.style, {
      position: "fixed", right: "20px", bottom: "20px",
      background: "rgba(0,0,0,0.8)", color: "#fff",
      padding: "10px 14px", borderRadius: "8px",
      zIndex: 9999, fontFamily: "Inter,system-ui,Segoe UI",
      transition: "opacity .25s", opacity: 0
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._hide);
  t._hide = setTimeout(() => (t.style.opacity = "0"), timeout);
}

function showSavedBadge() {
  const el = document.createElement("div");
  el.innerText = "Sauvegardé";
  Object.assign(el.style, {
    position: "fixed", right: "20px", bottom: "70px",
    background: "#16a34a", color: "#fff",
    padding: "8px 12px", borderRadius: "8px",
    zIndex: 9999, opacity: 0, transition: "opacity .2s"
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => (el.style.opacity = "1"));
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 250);
  }, 1400);
}

// ---- Admin session ----
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    const j = await res.json();
    isAdmin = j.logged_in === true;
    if (isAdmin) initAdminEditor();
  } catch (e) {
    console.warn("Session check failed", e);
  } finally {
    await loadStructuredContent();
  }
}
document.addEventListener("DOMContentLoaded", checkAdminSession);

// ---- Inline editing ----
function enableInlineEditing() {
  document.querySelectorAll("[data-editable]").forEach(el => {
    el.onclick = e => {
      if (!isAdmin) return;
      openInlineEditor(el);
    };
  });
}

function openInlineEditor(el) {
  if (el.dataset.editing === "true") return;
  el.dataset.editing = "true";
  const tag = el.tagName;
  const isLong = (el.textContent || "").length > 60 || ["P", "DIV"].includes(tag);
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
  input.addEventListener("keydown", ev => {
    if (ev.key === "Enter" && input.tagName !== "TEXTAREA") input.blur();
  });
}

// ---- Add/Delete/Drag Blocks ----
function addDeleteAndAddButtons(box) {
  box.querySelectorAll(".delete-btn").forEach(b => b.remove());
  const del = document.createElement("button");
  del.innerText = "❌";
  del.className = "delete-btn absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1";
  del.addEventListener("click", () => {
    if (!confirm("Supprimer ce bloc ?")) return;
    box.remove(); scheduleSave();
  });
  box.style.position = "relative";
  box.prepend(del);
}

function createContentBox() {
  const uid = "block_" + Date.now();
  const box = document.createElement("div");
  box.className = "content-box bg-white p-6 rounded-lg shadow-md";
  box.dataset.blockId = uid;
  box.innerHTML = `
    <div class="content">
      <h2 id="${uid}_title" data-editable>Nouveau Titre</h2>
      <p id="${uid}_text" data-editable>Votre nouveau contenu ici.</p>
    </div>`;
  return box;
}

function addGlobalAddBlockButton() {
  const old = document.getElementById("add-global-block-btn");
  if (old) old.remove();
  const btn = document.createElement("button");
  btn.id = "add-global-block-btn";
  btn.innerHTML = '<span style="font-size:20px;margin-right:6px;">＋</span>Ajouter un bloc';
  btn.className = "fixed bottom-6 right-6 bg-sky-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-sky-700 transition transform hover:scale-110 z-[9999]";
  btn.onclick = () => {
    const c = document.querySelector("#editable-container");
    if (!c) return;
    const box = createContentBox();
    c.appendChild(box);
    addDeleteAndAddButtons(box);
    enableInlineEditing();
    c.appendChild(btn);
    scheduleSave();
    toast("Bloc ajouté !");
  };
  document.body.appendChild(btn);
}

// ---- Initialize editor ----
function initAdminEditor() {
  document.querySelectorAll(".content-box").forEach((b, i) => {
    if (!b.dataset.blockId) b.dataset.blockId = "block_" + Date.now() + "_" + i;
    addDeleteAndAddButtons(b);
  });
  enableInlineEditing();
  addGlobalAddBlockButton();
}

// ---- Helper: Extract computed inline styles ----
function getStyledOuterHTML(el) {
  const clone = el.cloneNode(true);
  const origNodes = el.querySelectorAll("*");
  const cloneNodes = clone.querySelectorAll("*");
  cloneNodes.forEach((node, i) => {
    const style = window.getComputedStyle(origNodes[i]);
    let cssText = "";
    for (let prop of style) cssText += `${prop}:${style.getPropertyValue(prop)};`;
    node.setAttribute("style", cssText);
  });
  const mainStyle = window.getComputedStyle(el);
  let mainCss = "";
  for (let prop of mainStyle) mainCss += `${prop}:${mainStyle.getPropertyValue(prop)};`;
  clone.setAttribute("style", mainCss);
  return clone.outerHTML;
}

// ---- Save ----
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  toast("Changements détectés — sauvegarde bientôt...");
  saveTimer = setTimeout(() => saveStructuredContent(pageKey), ms);
}

async function saveStructuredContent(page = pageKey) {
  const blocks = [];
  document.querySelectorAll(".content-box").forEach((box, i) => {
    blocks.push({ id: box.dataset.blockId || i, html: box.outerHTML });
  });

  // 🔹 Keep only editable-root sections
  const editableRoots = document.querySelectorAll("[data-editable-root]");
  let styledHTML = "";
  editableRoots.forEach(root => styledHTML += getStyledOuterHTML(root));

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, html: styledHTML, content: blocks })
    });
    const j = await res.json();
    if (!j.success) {
      toast("Erreur de sauvegarde");
      console.error(j);
      return;
    }
    console.log("Page sauvegardée avec styles !");
    showSavedBadge();
    toast("Page sauvegardée !");
  } catch (err) {
    console.error("Erreur save:", err);
    toast("Erreur réseau sauvegarde");
  }
}

// ---- Load ----
async function loadStructuredContent(page = pageKey) {
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, { credentials: "include" });
    const j = await res.json();
    if (!j.success) return console.log("Aucun contenu trouvé pour", page);

    if (j.html) {
      const tmp = document.createElement("div");
      tmp.innerHTML = j.html;
      const savedRoots = tmp.querySelectorAll("[data-editable-root]");
      const currentRoots = document.querySelectorAll("[data-editable-root]");
      currentRoots.forEach((section, i) => {
        if (savedRoots[i]) section.innerHTML = savedRoots[i].innerHTML;
      });
      console.log("HTML restauré (sections éditables)");
    }

    if (isAdmin) initAdminEditor();
    toast("Contenu chargé");
  } catch (err) {
    console.error("Erreur load:", err);
    toast("Erreur réseau lors du chargement");
  }
}

// Expose manual save
window.cms = window.cms || {};
window.cms.saveNow = () => saveStructuredContent(pageKey);
