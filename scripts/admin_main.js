// ================== ADMIN STRUCTURED CMS ==================
// Upload-only images, full section save (with inline styles)
// ==========================================================

const pageKey = window.location.pathname.split("/").pop() || "admin_index.php";
let isAdmin = false;
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 900;

// ---- Toast / badge helpers ----
function toast(msg, timeout = 2600) {
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
    position: "fixed", right: "20px", bottom: "72px",
    background: "#16a34a", color: "#fff", padding: "8px 12px",
    borderRadius: "8px", zIndex: 9999, opacity: 0,
    transition: "opacity .18s"
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => (el.style.opacity = "1"));
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 240);
  }, 1400);
}

// ---- Session check & init ----
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

// ---- Load saved content ----
async function loadStructuredContent(page = pageKey) {
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, {
      credentials: "include"
    });
    const data = await res.json();
    if (!data.success) return console.info("No content saved for", page);

    // ===  reload full editable section if HTML saved ===
  if (data.html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.html, "text/html");
    const newMain = doc.querySelector("main");

    if (newMain) {
      const mainEl = document.querySelector("main");
      mainEl.innerHTML = newMain.innerHTML;
      console.log("Full <main> reloaded from saved HTML");
    }

    if (isAdmin) {
      initAdminEditor();
      addGlobalAddBlockButton();
    }
    return;
  }


    // === Fallback structured (legacy) ===
    const blocks = Array.isArray(data.content) ? data.content : (data.content?.blocks || []);
    if (!blocks.length) return;
    blocks.forEach(blockObj => {
      if (blockObj.elements && blockObj.elements.length) {
        blockObj.elements.forEach(el => {
          const existing = document.getElementById(el.id);
          if (existing) {
            if (el.tag === "IMG" && existing.tagName === "IMG") existing.src = el.value;
            else if (existing.tagName !== "IMG") existing.textContent = el.value;
          }
        });
      }
    });
    // Clean any wrong saved add-block button
    const badBtn = document.getElementById("add-global-block-btn");
    if (badBtn) badBtn.remove();

    //  Always recreate admin button after loading saved content
    if (isAdmin) addGlobalAddBlockButton();

    console.log("Structured content merged (partial update)");
  } catch (err) {
    console.error("loadStructuredContent error", err);
  }
}

function initAdminEditor() {
  // Avoid duplicates
  document.querySelectorAll(".delete-btn").forEach(btn => btn.remove());
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.position = "absolute";
    btn.style.top = "8px";
    btn.style.right = "8px";
    btn.style.zIndex = "1000";
  });

  document.querySelectorAll(".content-box").forEach((b, i) => {
    if (!b.dataset.blockId) b.dataset.blockId = "block_" + Date.now() + "_" + i;
    b.setAttribute("draggable", "true");
    b.dataset.order = i;
    b.style.position = b.style.position || "relative"; // ensure edit-btn stays positioned
  });

  enableInlineEditing();
  enableBlockManagement();
  enableDragReorder();
  addGlobalAddBlockButton();
}



// ---- Inline editing (text + images) ----
function enableInlineEditing() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    const tgtSelector = btn.dataset.target;
    let target = tgtSelector ? document.querySelector(tgtSelector) :
      (btn.nextElementSibling || btn.previousElementSibling);
    if (!target) return;
    if (target.tagName === "A" && target.querySelector("img[data-editable]"))
      target = target.querySelector("img[data-editable]");
    if (!target || target.dataset.editable === undefined) return;
    btn.addEventListener("click", e => { e.stopPropagation(); openInlineEditor(target); });
  });

  document.querySelectorAll("[data-editable]").forEach(el => {
    el.onclick = e => {
      if (!isAdmin) return;
      openInlineEditor(el);
    };
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
        const res = await fetch("/php/upload_image.php", {
          method: "POST", body: fd, credentials: "include"
        });
        const j = await res.json();
        if (j.success && j.url) {
          el.src = j.url;
          scheduleSave();
          toast("Image uploadée — sauvegarde en cours...");
        } else {
          toast("Erreur upload image");
        }
      } catch (err) {
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

// ---- Block add/delete ----
function addDeleteAndAddButtons(box) {
  box.querySelectorAll(".delete-btn").forEach(b => b.remove());
  const del = document.createElement("button");
  del.innerText = "❌";
  del.className = "delete-btn absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 z-50";
  //Object.assign(del.style, { position: "absolute", right: "8px", top: "8px", zIndex: 70 });
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

// ---- Create new block ----
function createContentBox() {
  const uid = "block_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const box = document.createElement("div");
  box.className = "content-box bg-white p-6 rounded-lg shadow-md";
  box.dataset.blockId = uid;
  box.dataset.order = document.querySelectorAll(".content-box").length;
  box.innerHTML = `
    <div class="content-image mb-4">
      <button class="edit-btn">✎</button>
      <img id="${uid}_img" data-editable src="images/default.png" alt="Nouvelle image" data-editable class="w-full h-auto rounded-lg" data-key="">
    </div>
    <div class="content">
      <button class="edit-btn">✎</button>
      <h2 id="${uid}_title" data-editable >Nouveau Titre</h2>
      <button class="edit-btn">✎</button>
      <p id="${uid}_text" data-editable >Nouveau paragraphe. Cliquez pour modifier ce texte.</p>
    </div>
    
  `;
  return box;
}

// ---- Global add block button ----
// ---- Floating "Add Block" button ----
function addGlobalAddBlockButton() {
  // always remove old (in case it was saved or duplicated)
  const oldBtn = document.getElementById("add-global-block-btn");
  if (oldBtn) oldBtn.remove();
  let btn = document.getElementById("add-global-block-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "add-global-block-btn";
    btn.innerHTML = '<span style="font-size:20px;margin-right:6px;">＋</span>Ajouter un bloc';
    btn.className =
      "add-block-btn fixed bottom-6 right-6 bg-sky-600 text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium hover:bg-sky-700 transition transform hover:scale-110 z-[9999]";

    btn.addEventListener("click", () => {
      const container = document.querySelector("#editable-container");
      if (!container) return;

      const newBox = createContentBox();
      container.appendChild(newBox);

      // Reinitialize for new block
      addDeleteAndAddButtons(newBox);
      enableInlineEditing();
      enableDragReorder();

      // Keep button always last visually
      container.appendChild(btn);

      scheduleSave();
      toast("Nouveau bloc ajouté !");
    });

    document.body.appendChild(btn);
  }
}

// ---- Drag reorder ----
function enableDragReorder() {
  const container = document.querySelector("#editable-container");
  if (!container) return;
  let dragSrc = null;
  container.querySelectorAll(".content-box").forEach(box => {
    box.addEventListener("dragstart", e => {
      dragSrc = box; e.dataTransfer.effectAllowed = "move"; box.style.opacity = "0.5";
    });
    box.addEventListener("dragend", () => {
      box.style.opacity = "";
      dragSrc = null;
      Array.from(container.children).forEach((ch, idx) => ch.dataset.order = idx);
      scheduleSave();
    });
    box.addEventListener("dragover", e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; });
    box.addEventListener("drop", e => {
      e.preventDefault();
      if (!dragSrc || dragSrc === box) return;
      const rect = box.getBoundingClientRect();
      const halfway = rect.top + rect.height / 2;
      if (e.clientY < halfway) box.parentNode.insertBefore(dragSrc, box);
      else box.parentNode.insertBefore(dragSrc, box.nextSibling);
    });
  });
}

// ---- Build JSON structure (for legacy mode) ----
function buildBlocksFromDOM() {
  const blocks = [];
  const editableElements = document.querySelectorAll("[data-editable]");
  editableElements.forEach((el, idx) => {
    if (
      el.closest(".edit-btn") ||
      el.closest(".delete-btn") ||
      el.id === "add-global-block-btn" ||
      el.dataset.admin === "true"
    ) return;
    // detect if inside a .content-box (else fallback to misc)
    const parentBox = el.closest(".content-box");
    const blockId = parentBox?.dataset.blockId || ("misc_" + Date.now() + "_" + idx);

    // find or create block
    let blk = blocks.find(b => b.blockId === blockId);
    if (!blk) {
      blk = { blockId, order: blocks.length, elements: [] };
      blocks.push(blk);
    }

    // push element
    blk.elements.push({
      id: el.id || ("el_" + idx + "_" + Date.now()),
      tag: el.tagName,
      value: el.tagName === "IMG" ? el.src : (el.textContent || "").trim()
    });
  });

  // maintain proper order
  blocks.forEach((b, i) => (b.order = i));
  return blocks;
}



// ---- Helper: Capture full section with computed styles ----
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

async function reloadMainContent() {
  try {
    const res = await fetch(`/php/load_content.php?page=${pageKey}`, { credentials: "include" });
    const data = await res.json();
    if (!data.html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.html, "text/html");
    const newMain = doc.querySelector("main");
    if (!newMain) return;

    const mainEl = document.querySelector("main");
    mainEl.innerHTML = newMain.innerHTML;

    // Reinitialize admin tools immediately
    initAdminEditor();
    addGlobalAddBlockButton();
    toast("Zone principale rechargée !");
    document.dispatchEvent(new Event("cms:content-reloaded"));

  } catch (err) {
    console.error("Erreur de rechargement du contenu :", err);
    toast("Erreur lors du rechargement du contenu");
  }
}


// ---- Debounce + save ----
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  toast("Changements détectés — sauvegarde bientôt...");
  saveTimer = setTimeout(() => saveStructuredContent(pageKey), ms);
}

// ---- Save full editable section ----
// ---- Save everything (structured + full HTML snapshot) ----
// ---- Save everything (structured + full HTML snapshot) ----
// ---- Save everything (structured + full HTML snapshot) ----
async function saveStructuredContent(page = pageKey) {
  const mainEl = document.querySelector("main");
  if (!mainEl) {
    console.error(" Aucun <main> trouvé");
    toast("Erreur : balise <main> introuvable");
    return;
  }

  // Build structured backup
  const blocks = buildBlocksFromDOM();

  // Clone main content (everything inside <main>)
  const clone = mainEl.cloneNode(true);

  // Remove admin UI controls before saving
  clone.querySelectorAll(".edit-btn, .delete-btn, #add-global-block-btn, input, textarea")
       .forEach(el => el.remove());

  // Remove non-content sections (header/footer)
  ["header", "footer", "nav"].forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Remove hidden elements
  clone.querySelectorAll("*").forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") el.remove();
  });

  // Capture full styled HTML for <main>
  const styledHTML = getStyledOuterHTML(clone);

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        html: styledHTML,
        content: blocks
      })
    });

    const j = await res.json();
    if (!j.success) throw new Error(j.error || "Unknown error");
    
    toast("Contenu principal sauvegardé !");
    showSavedBadge();
    await reloadMainContent()
  } catch (err) {
    console.error("Erreur de sauvegarde", err);
    toast("Erreur réseau lors de la sauvegarde");
  }
}



// Expose manual save
window.cms = window.cms || {};
window.cms.saveNow = () => saveStructuredContent(pageKey);
window.cms.reinit = () => initAdminEditor();

// Reinit helper
window.addEventListener("cms:reinit", () => initAdminEditor());
