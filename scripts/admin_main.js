const pageKey = window.location.pathname.split("/").pop() || "admin_index.php";
let isAdmin = false;
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 900;

function showToast(msg) {
  let t = document.getElementById("cms-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "cms-toast";
    Object.assign(t.style, {
      position: "fixed", right: "20px", bottom: "20px",
      background: "rgba(0,0,0,0.8)", color: "white", padding: "10px 14px",
      borderRadius: "8px", zIndex: 9999, fontFamily: "Inter,system-ui",
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._hide);
  t._hide = setTimeout(()=> t.style.opacity = "0", 2600);
}

function showSaveTooltip() {
  const tip = document.createElement("div");
  tip.innerText = "Sauvegardé";
  Object.assign(tip.style, {
    position: "fixed", right: "20px", bottom: "72px",
    background: "#16a34a", color: "white", padding: "8px 12px", borderRadius: "8px",
    zIndex: 9999, opacity: "0", transition: "opacity .2s"
  });
  document.body.appendChild(tip);
  requestAnimationFrame(()=> tip.style.opacity = "1");
  setTimeout(()=> { tip.style.opacity = "0"; setTimeout(()=> tip.remove(), 300); }, 1600);
}

// ---- session check & load ----
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    const json = await res.json();
    isAdmin = json.logged_in === true;
    if (isAdmin) initAdminEditor();
  } catch(e) {
    console.warn("session check failed", e);
  } finally {
    await loadStructuredContent();
  }
}
document.addEventListener("DOMContentLoaded", checkAdminSession);

// ---- load structured content (blocks) ----
async function loadStructuredContent(page = pageKey) {
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, { credentials: "include" });
    const data = await res.json();
    if (!data.success) return console.warn("No content for", page);

    // Expect data.content to be JSON array of blocks OR old format (we try to auto-detect)
    const blocks = Array.isArray(data.content) ? data.content : (data.content.blocks || []);
    if (!blocks.length) {
      // fallback: if stored as a single HTML string, do nothing here (your previous save method)
      if (typeof data.content === "string") {
        const container = document.querySelector("#editable-container");
        if (container) container.innerHTML = data.content;
      }
      return;
    }

    // Clear existing container then rebuild from saved blocks (preserve order)
    const container = document.querySelector("#editable-container");
    if (!container) return console.warn("#editable-container missing");
    container.innerHTML = ""; // rebuild

    blocks.sort((a,b) => (a.order||0) - (b.order||0)).forEach(blockObj => {
      const block = document.createElement("div");
      const bid = blockObj.blockId || ("block_" + Date.now() + Math.floor(Math.random()*1000));
      block.className = "content-box";
      block.dataset.blockId = bid;

      // build inner HTML from blockObj.elements or blockObj.html (legacy)
      if (Array.isArray(blockObj.elements)) {
        const markup = [];
        blockObj.elements.forEach(el => {
          if (el.tag === "IMG") {
            const id = el.id || (bid + "_img_" + Math.floor(Math.random()*1000));
            markup.push(`<div class="content-image"><button class="edit-btn">✎</button><img id="${id}" data-editable src="${el.value}" /></div>`);
          } else {
            const id = el.id || (bid + "_el_" + Math.floor(Math.random()*1000));
            markup.push(`<div class="content"><button class="edit-btn">✎</button><${el.tag.toLowerCase()} id="${id}" data-editable>${(el.value||"")}</${el.tag.toLowerCase()}></div>`);
          }
        });
        block.innerHTML = markup.join("");
      } else if (blockObj.html) {
        block.innerHTML = blockObj.html;
      }

      // append and set up controls
      container.appendChild(block);
    });

    // re-init admin UI
    if (isAdmin) initAdminEditor();
    console.log("Loaded structured content");
  } catch (err) {
    console.error("loadStructuredContent error", err);
  }
}

// ---- admin UI initialization ----
function initAdminEditor() {
  // ensure every content-box has data-block-id
  document.querySelectorAll(".content-box").forEach((b,i) => {
    if (!b.dataset.blockId) b.dataset.blockId = "block_" + Date.now() + "_" + i;
  });

  // show edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.zIndex = 50;
    btn.style.cursor = "pointer";
  });

  enableInlineEditing();
  enableBlockManagement();
}

// ---- inline editing ----
function enableInlineEditing() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    // avoid duplicate listeners: remove previous if present
    btn.replaceWith(btn.cloneNode(true));
  });
  // re-query after clone
  document.querySelectorAll(".edit-btn").forEach(btn => {
    const tgt = btn.dataset.target ? document.querySelector(btn.dataset.target) : (btn.nextElementSibling || btn.previousElementSibling);
    if (!tgt) return;
    let target = tgt.tagName === "A" && tgt.querySelector("img[data-editable]") ? tgt.querySelector("img[data-editable]") : tgt;
    if (!target || target.dataset.editable === undefined) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openInlineEditor(target);
    });
  });
}

function openInlineEditor(el) {
  if (el.dataset.editing === "true") return;
  el.dataset.editing = "true";

  if (el.tagName === "IMG") {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.addEventListener("change", () => {
      const f = input.files[0];
      if (!f) { delete el.dataset.editing; return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        el.src = ev.target.result; // dataURL
        delete el.dataset.editing;
        scheduleSave();
        showToast("Image sélectionnée — sauvegarde prévue");
      };
      reader.readAsDataURL(f);
    });
    input.click();
    return;
  }

  const isLong = (el.textContent||"").length > 60 || ["P","DIV"].includes(el.tagName);
  const input = isLong ? document.createElement("textarea") : document.createElement("input");
  input.value = (el.textContent||"").trim();
  input.className = "border rounded p-1 w-full";
  el.style.display = "none";
  el.parentElement.insertBefore(input, el);
  input.focus();

  input.addEventListener("blur", () => {
    el.textContent = input.value;
    input.remove();
    el.style.display = "";
    delete el.dataset.editing;
    scheduleSave();
  });
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && input.tagName !== "TEXTAREA") input.blur();
  });
}

// ---- block management ----
function addDeleteAndAddBlockButtons(box) {
  box.querySelectorAll(".delete-btn").forEach(b => b.remove());
  const next = box.nextElementSibling;
  if (next && next.classList.contains("add-block-btn")) next.remove();

  const del = document.createElement("button");
  del.innerText = "❌";
  del.className = "delete-btn absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 z-50";
  del.addEventListener("click", () => {
    if (!confirm("Supprimer ce bloc ?")) return;
    box.remove();
    scheduleSave();
  });

  const addBtn = document.createElement("button");
  addBtn.innerText = "+ Ajouter un block";
  addBtn.className = "add-block-btn mt-4 bg-sky-600 text-white px-4 py-2 rounded-md";
  addBtn.addEventListener("click", () => {
    const newBox = createContentBox();
    box.parentElement.insertBefore(newBox, addBtn);
    initAdminEditor();
    addDeleteAndAddBlockButtons(newBox);
    scheduleSave();
  });

  box.style.position = "relative";
  box.prepend(del);
  box.insertAdjacentElement("afterend", addBtn);
}

function enableBlockManagement() {
  document.querySelectorAll(".content-box").forEach(b => {
    if (!b.dataset.blockId) b.dataset.blockId = "block_" + Date.now() + Math.floor(Math.random()*1000);
    addDeleteAndAddBlockButtons(b);
  });
}

function createContentBox() {
  const newBox = document.createElement("div");
  const uid = "block_" + Date.now();
  newBox.className = "content-box bg-white p-6 rounded-lg shadow-md";
  newBox.innerHTML = `
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
  
 
  
  // attach edit buttons in newBox
  newBox.querySelectorAll(".edit-btn").forEach(btn => btn.style.display = "inline-flex");
  return newBox;
}


// ---- saving ----
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  showToast("Changements détectés — sauvegarde bientôt...");
  saveTimer = setTimeout(() => saveStructuredContent(pageKey), ms);
}

async function saveStructuredContent(page = pageKey) {
  const container = document.querySelector("#editable-container");
  if (!container) return console.warn("editable container not found");

  // build blocks array in DOM order
  const blocks = [...container.querySelectorAll(".content-box")].map((box, index) => {
    const elements = [...box.querySelectorAll("[data-editable]")].map(el => ({
      id: el.id || null,
      html: el.outerHTML
    }));
    return {
      blockId: box.dataset.blockId || ("block_" + index + "_" + Date.now()),
      order: index,
      elements
    };
  });

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ page, content: blocks })    });
    const data = await res.json();
    if (!data.success) return showToast("Erreur sauvegarde", false);
    console.log("Saved", data.updated);
    showSaveTooltip();
    showToast("Sauvegardé");
  } catch (err) {
    console.error("save error", err);
    showToast("Erreur réseau lors de la sauvegarde");
  }
}

// optional manual save
window.cms = window.cms || {};
window.cms.saveNow = () => saveStructuredContent(pageKey);
