// scripts/admin_main.js
// Admin inline editing with robust event-delegation and dropdown-safe behavior

// ======================= CONFIG / STATE =======================
let isAdmin = false;
const pendingChanges = {}; // { element_key: { type, value } }

// ======================= HELPERS =======================
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    if (!res.ok) throw new Error("Session check failed");
    const data = await res.json();
    isAdmin = data.logged_in === true || data.logged_in === "true";
    document.body.classList.toggle("admin-mode", isAdmin);
  } catch (err) {
    console.error("checkAdminSession:", err);
    isAdmin = false;
    document.body.classList.remove("admin-mode");
  }
}

function generateKey(el) {
  // fallback key generator if data-key missing
  const path = [];
  let curr = el;
  while (curr && curr.tagName && curr.tagName !== "BODY") {
    const siblings = Array.from(curr.parentNode?.children || []);
    const index = siblings.indexOf(curr);
    path.unshift(`${curr.tagName.toLowerCase()}[${index}]`);
    curr = curr.parentNode;
  }
  return path.join("/");
}

function pageName() {
  return window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
}

function setDirtyUIFor(key) {
  const el = document.querySelector(`[data-key="${key}"]`);
  if (el) el.classList.add("admin-pending-edit");
  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) saveBtn.classList.add("pulse-save");
}

// ======================= LOAD / SAVE =======================
async function loadSiteContent() {
  const page = pageName();
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load content");
    const data = await res.json();

    data.forEach(item => {
      const key = item.element_key || item.key;
      if (!key) return;
      let el = document.querySelector(`[data-key="${key}"]`);
      if (!el) {
        el = document.querySelector(`[data-editable][data-key]`) || document.querySelector(`[data-editable]`);
      }
      if (!el) return;

      // ensure attribute
      if (!el.hasAttribute("data-editable")) el.setAttribute("data-editable", "");

      if (item.type === "image" && (el.tagName === "IMG" || el.querySelector && el.querySelector("img"))) {
        if (el.tagName === "IMG") el.src = item.value;
        else {
          const img = el.querySelector("img");
          if (img) img.src = item.value;
        }
      } else if (item.type === "link") {
        try {
          const linkData = JSON.parse(item.value);
          el.innerText = linkData.text;
          if (el.tagName === "A") el.setAttribute("href", linkData.href);
        } catch (err) { console.warn("Invalid link json:", item.value); }
      } else if (item.type === "json") {
        try { el.__json = JSON.parse(item.value); } catch (err) { el.__json = item.value; }
      } else {
        el.innerText = item.value;
      }

      if (!el.getAttribute("data-key")) el.setAttribute("data-key", key);
    });

    // after load, ensure buttons exist
    addEditButtonsToAll();
    console.log("Content loaded for page:", page);
  } catch (err) {
    console.error("loadSiteContent:", err);
  }
}

async function saveAllPendingChanges() {
  const page = pageName();
  const updates = Object.entries(pendingChanges).map(([element_key, v]) => ({
    element_key,
    type: v.type,
    value: v.value
  }));

  if (updates.length === 0) {
    alert("Aucune modification à publier.");
    return;
  }

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({ page, updates })
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("save_content error:", txt);
      alert("Erreur lors de la sauvegarde (voir console)");
      return;
    }

    // clear UI markers
    Object.keys(pendingChanges).forEach(k => {
      const el = document.querySelector(`[data-key="${k}"]`);
      if (el) el.classList.remove("admin-pending-edit");
    });
    for (const k of Object.keys(pendingChanges)) delete pendingChanges[k];

    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) {
      saveBtn.classList.add("saved");
      setTimeout(() => saveBtn.classList.remove("saved"), 700);
    }

    alert("Modifications publiées.");
    console.log("Saved updates:", updates);
  } catch (err) {
    console.error("saveAllPendingChanges:", err);
    alert("Erreur réseau lors de la sauvegarde (voir console).");
  }
}

// ======================= ADMIN BUTTONS: CREATE / VISIBILITY =======================
function setAdminButtonsVisibility(show) {
  document.querySelectorAll(".admin-inline-btn").forEach(b => {
    b.style.display = show ? "" : "none";
  });
  document.querySelectorAll(".image-edit").forEach(b => {
    b.style.display = show ? "" : "none";
  });
  document.querySelectorAll(".menu-edit, .submenu-edit").forEach(b => b.style.display = show ? "" : "none");
}

function addEditButtonsToAll() {
  // Add edit buttons for every [data-editable] element that doesn't already have one.
  document.querySelectorAll("[data-editable]").forEach(el => {
    // ensure data-key
    let key = el.getAttribute("data-key");
    if (!key) {
      key = generateKey(el);
      el.setAttribute("data-key", key);
    }

    // If an inline admin button already exists immediately after this element, skip.
    const next = el.nextElementSibling;
    if (next && next.classList && (next.classList.contains("admin-inline-btn") || next.classList.contains("image-edit"))) return;

    // For images, we keep a small image-edit button BEFORE or after image (if element is IMG or contains IMG).
    if (el.tagName === "IMG" || el.querySelector && el.querySelector("img")) {
      // put small image-edit button before the element (to avoid breaking layout)
      const imgBtn = document.createElement("button");
      imgBtn.type = "button";
      imgBtn.className = "image-edit admin-inline-btn";
      imgBtn.title = "Modifier l'image";
      imgBtn.innerText = "📷";
      // insert before image
      el.insertAdjacentElement("beforebegin", imgBtn);
      return;
    }

    // create default inline edit button
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "edit-btn admin-inline-btn";
    btn.title = "Modifier";
    btn.innerText = "✎";
    // insert after element
    el.insertAdjacentElement("afterend", btn);
  });

  // For explicit menu/edit buttons that are present in markup but may be hidden, mark them admin-inline-btn
  document.querySelectorAll(".menu-edit, .submenu-edit, .edit-btn, .image-edit").forEach(b => {
    b.classList.add("admin-inline-btn");
  });

  // set visibility based on isAdmin
  setAdminButtonsVisibility(isAdmin);
}

// Mutation observer: if new elements with [data-editable] appear, add buttons
const mo = new MutationObserver((mutations) => {
  let added = false;
  for (const m of mutations) {
    if (m.addedNodes && m.addedNodes.length) {
      m.addedNodes.forEach(n => {
        if (n.nodeType === 1 && n.hasAttribute && n.hasAttribute("data-editable")) added = true;
        if (n.querySelector && n.querySelector("[data-editable]")) added = true;
      });
    }
  }
  if (added) addEditButtonsToAll();
});
mo.observe(document.body, { childList: true, subtree: true });

// ======================= EVENT DELEGATION (single click handler) =======================
document.addEventListener("click", async (ev) => {
  const target = ev.target;

  // ---------------- image-edit (file upload) ----------------
  if (target.closest && target.closest(".image-edit")) {
    ev.preventDefault(); ev.stopPropagation();
    if (!isAdmin) return;
    const btn = target.closest(".image-edit");
    // find related image: prefer nextElementSibling img OR parent img[data-editable]
    const parent = btn.parentElement;
    let img = btn.nextElementSibling;
    if (!img || img.tagName !== "IMG") {
      img = parent.querySelector("img[data-editable]") || parent.querySelector("img");
      if (!img) {
        // try nearest in header/main/footer
        img = parent.closest("header,main,footer")?.querySelector("img[data-editable]") || parent.closest("header,main,footer")?.querySelector("img");
      }
    }
    if (!img) { console.warn("image-edit: no image target"); return; }

    const key = img.getAttribute("data-key") || generateKey(img);
    img.setAttribute("data-key", key);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.click();

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) { fileInput.remove(); return; }
      const fd = new FormData(); fd.append("file", file);
      try {
        const res = await fetch(`/php/upload.php?page=${encodeURIComponent(pageName())}&key=${encodeURIComponent(key)}`, {
          method: "POST", credentials: "include", body: fd
        });
        const json = await res.json();
        if (json && json.url) {
          img.src = json.url;
          pendingChanges[key] = { type: "image", value: json.url };
          setDirtyUIFor(key);
        } else {
          console.error("upload response:", json);
          alert("Erreur d'upload (voir console).");
        }
      } catch (err) {
        console.error("upload error:", err);
        alert("Erreur d'upload (voir console).");
      } finally {
        fileInput.remove();
      }
    }, { once: true });

    return;
  }

  // ---------------- submenu / menu edit (these buttons just delegate to the related element) ----------------
  if (target.closest && (target.closest(".menu-edit") || target.closest(".submenu-edit"))) {
    ev.preventDefault(); ev.stopPropagation();
    if (!isAdmin) return;
    const btn = target.closest(".menu-edit, .submenu-edit");
    // find nearest editable element inside same container (link or text)
    const parent = btn.parentElement;
    const editable = parent.querySelector("[data-key]") || parent.querySelector("[data-editable]") || parent.querySelector("a,button,span");
    if (!editable) { console.warn("menu-edit: no target"); return; }
    // trigger the same flow as edit-btn (simulate a click on synthetic edit button after element)
    openEditorForElement(editable);
    return;
  }

  // ---------------- plain inline edit button ----------------
  if (target.closest && target.closest(".edit-btn")) {
    ev.preventDefault(); ev.stopPropagation();
    if (!isAdmin) return;
    const btn = target.closest(".edit-btn");
    // find the element this button relates to: prefer previousElementSibling (inserted by addEditButtonsToAll)
    let editable = btn.previousElementSibling;
    if (!editable || !editable.hasAttribute || !editable.hasAttribute("data-editable")) {
      // fallback: parent query
      editable = btn.parentElement?.querySelector("[data-key]") || btn.parentElement?.querySelector("[data-editable]") || btn.nextElementSibling;
    }
    if (!editable) { console.warn("edit-btn: target not found"); return; }
    openEditorForElement(editable);
    return;
  }

  // ---------------- clicking outside dropdown closes them (normal behavior) ----------------
  // Let other handlers continue...
}, { capture: true });

// ---------------- openEditorForElement: unified editor for text/link ----------------
function openEditorForElement(el) {
  if (!el) return;
  const tag = el.tagName;
  let key = el.getAttribute("data-key");
  if (!key) { key = generateKey(el); el.setAttribute("data-key", key); }

  // If it's an anchor -> link editor
  if (tag === "A") {
    openLinkEditor(el, key);
    return;
  }

  // If it's an image container (not direct IMG) but contains image, open image edit flow
  if (tag === "IMG" || el.querySelector && el.querySelector("img")) {
    const img = (tag === "IMG") ? el : el.querySelector("img");
    if (img) {
      // find existing image-edit button and simulate click by calling logic above
      // create a temporary file input and reuse the upload endpoint
      const fileInput = document.createElement("input"); fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      fileInput.click();
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0]; if (!file) { fileInput.remove(); return; }
        const fd = new FormData(); fd.append("file", file);
        try {
          const res = await fetch(`/php/upload.php?page=${encodeURIComponent(pageName())}&key=${encodeURIComponent(key)}`, {
            method: "POST", credentials: "include", body: fd
          });
          const json = await res.json();
          if (json && json.url) {
            img.src = json.url;
            pendingChanges[key] = { type: "image", value: json.url };
            setDirtyUIFor(key);
          } else {
            console.error("upload response:", json);
            alert("Erreur d'upload (voir console).");
          }
        } catch (err) {
          console.error("upload error:", err);
          alert("Erreur d'upload (voir console).");
        } finally {
          fileInput.remove();
        }
      }, { once: true });
      return;
    }
  }

  // For text-like elements: use contentEditable (we DON'T replace the element; stays in the DOM)
  // Make element editable, focus it, and use blur or Ctrl+Enter to commit
  el.setAttribute("contenteditable", "true");
  el.classList.add("admin-editing");
  el.focus();

  // place caret at end
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } catch (err) { /* ignore caret placement errors */ }

  // Add instruction tooltip (only once)
  if (!el.__admin_instruction) {
    const instr = document.createElement("div");
    instr.className = "admin-edit-instr";
    instr.innerText = "Éditer puis appuyez sur Ctrl+Entrée ou cliquez en dehors pour enregistrer";
    instr.style.cssText = "font-size:12px;color:#444;margin-top:4px";
    el.insertAdjacentElement("afterend", instr);
    el.__admin_instruction = instr;
  }

  // commit handler
  const commit = () => {
    if (!el) return;
    el.removeAttribute("contenteditable");
    el.classList.remove("admin-editing");
    if (el.__admin_instruction) { el.__admin_instruction.remove(); el.__admin_instruction = null; }
    const newVal = el.innerText.trim();
    pendingChanges[key] = { type: "text", value: newVal };
    setDirtyUIFor(key);
  };

  // on blur -> commit
  const onBlur = () => {
    commit();
    el.removeEventListener("blur", onBlur);
    el.removeEventListener("keydown", onKeydown);
  };
  el.addEventListener("blur", onBlur, { once: true });

  const onKeydown = (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
      ev.preventDefault();
      el.blur(); // triggers blur handler
    }
  };
  el.addEventListener("keydown", onKeydown);
}

// ---------------- Link editor (small inline form) ----------------
function openLinkEditor(aEl, key) {
  if (!aEl) return;
  if (!key) {
    key = aEl.getAttribute("data-key") || generateKey(aEl);
    aEl.setAttribute("data-key", key);
  }
  // if a small existing editor exists, remove it
  const existing = aEl.parentElement.querySelector(".inline-link-editor");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.className = "inline-link-editor p-2 bg-white shadow rounded flex gap-2 items-center";
  container.style.zIndex = 9999;
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.value = aEl.innerText.trim();
  textInput.placeholder = "Texte du lien";
  const hrefInput = document.createElement("input");
  hrefInput.type = "text";
  hrefInput.value = aEl.getAttribute("href") || "";
  hrefInput.placeholder = "URL (href)";
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "OK";
  saveBtn.className = "px-2 py-1 rounded bg-brand-green text-white";
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Annuler";
  cancelBtn.className = "px-2 py-1 rounded border";

  container.append(textInput, hrefInput, saveBtn, cancelBtn);
  aEl.insertAdjacentElement("afterend", container);
  textInput.focus();

  saveBtn.addEventListener("click", () => {
    const newText = textInput.value.trim();
    const newHref = hrefInput.value.trim();
    aEl.innerText = newText;
    aEl.setAttribute("href", newHref);
    pendingChanges[key] = { type: "link", value: JSON.stringify({ text: newText, href: newHref }) };
    setDirtyUIFor(key);
    container.remove();
  });

  cancelBtn.addEventListener("click", () => container.remove());
  // close on outside click
  const onDocClick = (ev) => { if (!ev.target.closest || !ev.target.closest(".inline-link-editor")) { container.remove(); document.removeEventListener("click", onDocClick); } };
  setTimeout(() => document.addEventListener("click", onDocClick));
}

// ======================= DROPDOWNS =======================
function initDropdowns() {
  // select menu containers where we want toggles
  const menuContainers = document.querySelectorAll("nav > div, nav .relative, nav .group");
  menuContainers.forEach(item => {
    // prefer an absolute submenu in this container
    const submenu = item.querySelector("div.absolute, .absolute, [role='menu'], #dropdownMenuPortefeuille");
    if (!submenu) return;

    // find a toggle that is NOT an admin button
    const toggle = Array.from(item.querySelectorAll("button, a")).find(el => {
      // skip admin UI buttons
      if (el.classList && (el.classList.contains("admin-inline-btn") || el.classList.contains("image-edit") || el.classList.contains("menu-edit") || el.classList.contains("submenu-edit"))) return false;
      if (el.id === "menu-toggle") return false;
      return true;
    });
    if (!toggle) return;

    // ensure submenu hidden initially
    submenu.classList.add("hidden");

    // toggle behavior
    const onToggleClick = (e) => {
      // if anchor and ctrl/meta/middle click -> let it navigate
      if (toggle.tagName === "A" && (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) { return; }
      if (toggle.tagName === "A") e.preventDefault();

      // close all other nav submenus
      document.querySelectorAll("nav .absolute").forEach(d => d.classList.add("hidden"));

      submenu.classList.toggle("hidden");
      e.stopPropagation();
    };

    // make keyboard accessible
    toggle.addEventListener("click", onToggleClick);
  });

  // close when clicking outside nav
  document.addEventListener("click", (e) => {
    if (!e.target.closest("nav")) {
      document.querySelectorAll("nav .absolute").forEach(d => d.classList.add("hidden"));
    }
  });

  // esc to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll("nav .absolute").forEach(d => d.classList.add("hidden"));
  });
}

// ======================= UTILITIES (save / logout) =======================
function attachUtilityButtons() {
  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await saveAllPendingChanges();
    });
  }
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try { await fetch("/php/logout.php", { method: "POST", credentials: "include" }); } catch (err) { console.warn("logout call failed:", err); }
      finally { window.location.href = "/admin.html"; }
    });
  }
}

// ======================= INIT =======================
async function initAdminEditing() {
  await checkAdminSession();

  // populate existing content from DB only if admin (but it's fine to load anyway)
  if (isAdmin) {
    await loadSiteContent();
  } else {
    // still add buttons but they'll be hidden
    addEditButtonsToAll();
  }

  addEditButtonsToAll();
  setAdminButtonsVisibility(isAdmin);

  // init dropdowns (works while admin buttons exist)
  initDropdowns();

  // attach utilities
  attachUtilityButtons();

  // small accessibility helper
  document.querySelectorAll("nav button, nav a").forEach(el => {
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        el.click();
      }
    });
  });

  // small CSS helpers injected
  const style = document.createElement("style");
  style.innerHTML = `
    .admin-pending-edit { outline: 2px dashed #f59e0b !important; }
    .admin-editing { background: rgba(255,255,255,0.95); border: 1px dashed #22e4ac; padding: 2px; }
    .inline-link-editor { display:flex; gap:8px; margin-top:6px; }
    #save-btn.pulse-save { transform: scale(1.02); transition: transform .15s; }
    #save-btn.saved { background: #10b981 !important; transform: scale(1.02); }
    .admin-inline-btn { margin-left:6px; font-size:0.85rem; cursor:pointer; border-radius:4px; padding:2px 6px; background:#22e4ac; color:white; border:none; }
    .admin-inline-btn:hover { opacity:0.9; }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", initAdminEditing);
