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
    }
    return;
  }


  
}


function initAdminEditor() {
  // Avoid duplicates if reloaded
  document.querySelectorAll(".delete-btn").forEach(btn => btn.remove());
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.zIndex = 60;
  });


  enableInlineEditing();
  enableDragReorder();
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



// ---- Create new block ----

// ---- Global add block button ----
// ---- Floating "Add Block" button ----


// ---- Drag reorder ----

// ---- Build JSON structure (for legacy mode) ----



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

// ---- Debounce + save ----
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  toast("Changements détectés — sauvegarde bientôt...");
  saveTimer = setTimeout(() => saveStructuredContent(pageKey), ms);
}

// ---- Save full editable section ----
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

    showSavedBadge();
    toast("Contenu principal sauvegardé !");
  } catch (err) {
    console.error("Erreur de sauvegarde", err);
    toast("Erreur réseau lors de la sauvegarde");
  }
}



// Expose manual save
window.cms = window.cms || {};
window.cms.saveNow = () => saveStructuredContent(pageKey);

// Reinit helper
window.addEventListener("cms:reinit", () => initAdminEditor());
