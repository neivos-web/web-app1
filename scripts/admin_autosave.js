// admin_autosave.js
const pageKey = window.location.pathname.split("/").pop() || "admin_index.php";
let isAdmin = false;
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 900;

// small toast helper
function showToast(msg) {
  let t = document.getElementById("cms-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "cms-toast";
    t.style = "position:fixed;right:20px;bottom:20px;background:rgba(0,0,0,0.75);color:#fff;padding:10px 12px;border-radius:8px;z-index:9999;font-family:Inter,system-ui;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._hide);
  t._hide = setTimeout(()=> t.style.opacity = "0", 2500);
}

// small saved tooltip
function showSaved() {
  const tip = document.createElement("div");
  tip.innerText = "Sauvegardé";
  tip.style = "position:fixed;right:20px;bottom:20px;background:#16a34a;color:white;padding:8px 12px;border-radius:8px;z-index:99999;opacity:0;transition:opacity .25s";
  document.body.appendChild(tip);
  requestAnimationFrame(()=> tip.style.opacity = "1");
  setTimeout(()=> { tip.style.opacity = "0"; setTimeout(()=> tip.remove(),300); }, 1500);
}

// ---------------- load content ----------------
async function loadStructuredContent(page = pageKey) {
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, { credentials: "include" });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.content)) return;

    // apply values by id
    data.content.forEach(item => {
      if (!item.id) return;
      const el = document.getElementById(item.id);
      if (!el) return;
      if (el.tagName === "IMG") {
        el.src = item.value;
      } else {
        el.textContent = item.value;
      }
    });
    console.log("Content loaded");
  } catch (err) {
    console.error("Load error", err);
  }
}

// --------------- session check ---------------
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    const d = await res.json();
    isAdmin = d.logged_in === true;
  } catch(e) {
    isAdmin = false;
  }
  if (isAdmin) initAdminEditor(); 
  await loadStructuredContent();
}

// --------------- editor init -----------------
function initAdminEditor() {
  // Add edit button to each element with id
  document.querySelectorAll("[id]").forEach(el => {
    // skip admin UI containers to avoid double buttons
    if (el.closest("#cms-toast")) return;
    // do not add edit button to <html> or <body>
    if (["HTML","BODY","HEAD"].includes(el.tagName)) return;

    // ensure element is focusable / editable
    if (el.tagName !== "IMG" && el.tagName !== "VIDEO" && el.tagName !== "A") {
      el.setAttribute("contenteditable", "true");
      // prevent accidental submission of forms when editing
      el.addEventListener("keydown", e => {
        if (e.key === "Enter" && el.tagName !== "DIV" && el.tagName !== "P") {
          e.preventDefault();
          el.blur();
        }
      });
      el.addEventListener("input", () => scheduleSave());
      el.addEventListener("blur", () => scheduleSave());
    }

    // place a small inline edit button if not already present
    if (!el._editBtnAdded) {
      const btn = document.createElement("button");
      btn.className = "cms-edit-btn";
      btn.title = "Éditer";
      btn.innerText = "✎";
      Object.assign(btn.style, {
        position: "absolute", zIndex: 9999, width: "26px", height: "26px",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "50%", background: "#08B3E5", color: "white", border: "none",
        cursor: "pointer", fontSize: "13px"
      });

      // compute a wrapper position: place relative parent
      let parent = el;
      // if element is not positioned, wrap with relative container for button
      if (getComputedStyle(el).position === "static") {
        const wrapper = document.createElement("span");
        wrapper.style.display = "inline-block";
        wrapper.style.position = "relative";
        el.replaceWith(wrapper);
        wrapper.appendChild(el);
        parent = el;
      } else {
        // ensure its parent is positioned
        const p = el.parentElement;
        if (p && getComputedStyle(p).position === "static") p.style.position = "relative";
      }

      // attach near top-left of element
      btn.style.top = "6px";
      btn.style.left = "6px";
      // for block elements, absolutely position inside parent
      const containerForBtn = el.parentElement || document.body;
      containerForBtn.appendChild(btn);

      // clicking button for images prompts upload/URL; for others focus
      btn.addEventListener("click", async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (el.tagName === "IMG") {
          // option: upload file or paste url
          const choice = confirm("Cliquez OK to upload from file. Cancel to paste image URL.");
          if (choice) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.addEventListener("change", async () => {
              const f = input.files[0];
              if (!f) return;
              // upload file
              try {
                const url = await uploadFile(f);
                el.src = url;
                scheduleSave();
                showToast("Image uploadée");
              } catch(err) { showToast("Échec upload"); console.error(err); }
            });
            input.click();
          } else {
            const url = prompt("Image URL:");
            if (url) { el.src = url; scheduleSave(); }
          }
        } else {
          el.focus();
        }
      });

      el._editBtnAdded = true;
    }
  });

  // set draggable on content-boxes and wire reorder
  document.querySelectorAll(".content-box").forEach(box => { box.setAttribute("draggable", "true"); });
  enableDragReorder();

  // add global save button (optional) if you want manual trigger
  addGlobalPublishButton();
}

// --------------- drag & drop reorder ---------------
function enableDragReorder() {
  let dragEl = null;
  document.addEventListener("dragstart", (e) => {
    const t = e.target;
    if (t && t.classList && t.classList.contains("content-box")) {
      dragEl = t;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", t.id || "");
      t.style.opacity = "0.6";
    }
  });
  document.addEventListener("dragend", (e) => {
    if (dragEl) dragEl.style.opacity = "";
    dragEl = null;
  });
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    const dropTarget = e.target.closest(".content-box");
    if (!dragEl) return;
    const parent = dragEl.parentElement;
    if (!parent) return;
    if (!dropTarget || dropTarget === dragEl) {
      scheduleSave();
      return;
    }
    // place before or after depending on pointer
    const rect = dropTarget.getBoundingClientRect();
    const halfway = rect.top + rect.height / 2;
    if (e.clientY < halfway) parent.insertBefore(dragEl, dropTarget);
    else parent.insertBefore(dragEl, dropTarget.nextElementSibling);
    scheduleSave();
  });
}

// --------------- upload helper ---------------
async function uploadFile(file) {
  // send multipart form to upload_media.php
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/php/upload_media.php", {
    method: "POST",
    body: fd,
    credentials: "include"
  });
  const j = await res.json();
  if (!j.success) throw new Error(j.error || "upload failed");
  return j.url;
}

// convert dataURL to blob and upload
async function uploadDataUrl(dataUrl, filename = "img.png") {
  // convert
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const f = new File([blob], filename, { type: blob.type });
  return uploadFile(f);
}

// --------------- collect content & order ---------------
async function collectStructuredContent() {
  // find all elements with id, in document order
  const nodes = Array.from(document.querySelectorAll("body [id]"));
  const out = [];
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    const id = el.id;
    if (!id) continue;
    const tag = el.tagName;
    let value;
    if (tag === "IMG" || tag === "VIDEO") {
      value = el.src || el.getAttribute("src") || "";
      // if data URL, upload first and replace
      if (value && value.startsWith("data:")) {
        try {
          const url = await uploadDataUrl(value, `${id.replace(/[^a-z0-9]/gi,'')}.png`);
          el.src = url;
          value = url;
        } catch (err) {
          console.error("Upload failed for", id, err);
        }
      }
    } else if (tag === "A") {
      value = el.href || "";
    } else {
      value = (el.textContent || "").trim();
    }
    // determine order index: if element is inside a content-box, prefer index among siblings
    let order = i;
    out.push({ id, tag, value, order });
  }
  return out;
}

// --------------- debounce save ----------------
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  showToast("Changements détectés — sauvegarde programmée");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveStructuredContent(pageKey), ms);
}

// --------------- save to server ----------------
async function saveStructuredContent(page = pageKey) {
  const arr = await collectStructuredContent();
  if (!arr.length) { console.warn("Nothing to save"); return; }

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      credentials: "include",
      body: JSON.stringify({ page, content: arr })
    });
    const data = await res.json();
    if (!data.success) {
      console.error("Save error", data.error);
      showToast("Erreur sauvegarde");
      return;
    }
    console.log("Saved", data.updated);
    showSaved();
  } catch (err) {
    console.error("Network save error", err);
    showToast("Erreur réseau");
  }
}

// --------------- global publish button ---------------
function addGlobalPublishButton() {
  if (document.getElementById("cms-publish")) return;
  const btn = document.createElement("button");
  btn.id = "cms-publish";
  btn.innerText = "Publier";
  Object.assign(btn.style, { position: "fixed", right: "20px", bottom: "80px", zIndex: 9999, padding: "8px 12px", background: "#0369a1", color: "white", borderRadius:"8px", border:"none", cursor:"pointer"});
  btn.addEventListener("click", () => saveStructuredContent(pageKey));
  document.body.appendChild(btn);
}

// --------------- init ---------------
document.addEventListener("DOMContentLoaded", () => {
  checkAdminSession();
});
