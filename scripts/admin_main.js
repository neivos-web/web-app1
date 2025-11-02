// scripts/admin_main.js
// Admin inline editing (Option A) — works with your provided HTML & PHP endpoints

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
  while (curr && curr.tagName !== "BODY") {
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
  // Visual indicator that an element has pending changes (adds small yellow outline)
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
      // support item.element_key or item.key
      const key = item.element_key || item.key;
      if (!key) return;
      // Prefer a selector by data-key first. Fallback: query any [data-editable] that matches generateKey (rare).
      let el = document.querySelector(`[data-key="${key}"]`);
      if (!el) {
        // fallback: try to find by data-editable attribute with same textual content (best-effort)
        el = document.querySelector(`[data-editable][data-key]`) || document.querySelector(`[data-editable]`);
      }
      if (!el) return;

      if (item.type === "image") {
        el.src = item.value;
      } else if (item.type === "link") {
        try {
          const linkData = JSON.parse(item.value);
          el.innerText = linkData.text;
          if (el.tagName === "A") el.setAttribute("href", linkData.href);
        } catch (err) {
          console.warn("Invalid link json:", item.value);
        }
      } else if (item.type === "json") {
        try {
          el.__json = JSON.parse(item.value);
        } catch (err) {
          el.__json = item.value;
        }
      } else {
        // text
        el.innerText = item.value;
      }

      // ensure element has data-key for future saves
      if (!el.getAttribute("data-key")) el.setAttribute("data-key", key);
    });

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
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ page, updates })
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("save_content error:", txt);
      alert("Erreur lors de la sauvegarde (voir console)");
      return;
    }
    // success
    Object.keys(pendingChanges).forEach(k => {
      const el = document.querySelector(`[data-key="${k}"]`);
      if (el) el.classList.remove("admin-pending-edit");
    });
    // clear pending
    for (const k of Object.keys(pendingChanges)) delete pendingChanges[k];

    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) {
      saveBtn.classList.add("saved");
      setTimeout(() => saveBtn.classList.remove("saved"), 600);
    }
    console.log("Saved updates:", updates);
    alert("Modifications publiées.");
  } catch (err) {
    console.error("saveAllPendingChanges:", err);
    alert("Erreur réseau lors de la sauvegarde (voir console).");
  }
}

// ======================= ATTACH EXISTING BUTTON HANDLERS =======================
function setAdminButtonsVisibility(show) {
  const btns = document.querySelectorAll(".edit-btn, .image-edit, .menu-edit, .submenu-edit");
  btns.forEach(b => {
    b.style.display = show ? "" : "none";
  });
}

function attachEditButtons() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    if (btn.dataset.attached === "true") return;
    btn.dataset.attached = "true";

    // find associated editable element:
    // 1) prefer previousElementSibling with data-key/data-editable
    // 2) parentNode.querySelector('[data-key]') or '[data-editable]'
    let target = btn.previousElementSibling;
    if (!target || (!target.hasAttribute || (!target.hasAttribute("data-key") && !target.hasAttribute("data-editable")))) {
      target = btn.parentNode?.querySelector("[data-key]") || btn.parentNode?.querySelector("[data-editable]") || btn.nextElementSibling;
    }
    if (!target) {
      console.warn("No target for .edit-btn", btn);
      return;
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // get element key
      let key = target.getAttribute("data-key");
      if (!key) {
        key = generateKey(target);
        target.setAttribute("data-key", key);
      }

      // LINKS
      if (target.tagName === "A") {
        const currentText = target.innerText.trim();
        const currentHref = target.getAttribute("href") || "";
        // small inline editor popup
        const container = document.createElement("div");
        container.className = "inline-link-editor p-2 bg-white shadow rounded flex gap-2 items-center";
        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.value = currentText;
        textInput.placeholder = "Texte du lien";
        const hrefInput = document.createElement("input");
        hrefInput.type = "text";
        hrefInput.value = currentHref;
        hrefInput.placeholder = "URL (href)";
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "OK";
        saveBtn.className = "px-2 py-1 rounded bg-brand-green text-white";
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Annuler";
        cancelBtn.className = "px-2 py-1 rounded border";

        container.appendChild(textInput);
        container.appendChild(hrefInput);
        container.appendChild(saveBtn);
        container.appendChild(cancelBtn);

        // place after target
        target.insertAdjacentElement("afterend", container);
        textInput.focus();

        saveBtn.addEventListener("click", async () => {
          const newText = textInput.value.trim();
          const newHref = hrefInput.value.trim();
          target.innerText = newText;
          target.setAttribute("href", newHref);
          pendingChanges[key] = { type: "link", value: JSON.stringify({ text: newText, href: newHref }) };
          setDirtyUIFor(key);
          container.remove();
        });

        cancelBtn.addEventListener("click", () => container.remove());
        return;
      }

      // IMAGE target (click image-edit button instead)
      if (target.tagName === "IMG") {
        const imgBtn = btn.parentNode?.querySelector(".image-edit") || btn.previousElementSibling;
        if (imgBtn) imgBtn.click();
        return;
      }

      // TEXT editing: replace with textarea
      const textarea = document.createElement("textarea");
      textarea.className = "admin-inline-textarea p-2 border rounded";
      textarea.value = target.innerText.trim();
      textarea.style.width = "100%";
      textarea.style.minHeight = "60px";

      // keep reference of original tag to restore proper tag
      const originalTag = target.tagName;
      const originalAttrs = {};
      Array.from(target.attributes || []).forEach(a => originalAttrs[a.name] = a.value);

      target.replaceWith(textarea);
      textarea.focus();

      // commit on blur or Ctrl+Enter
      const commit = async () => {
        const newVal = textarea.value.trim();
        // create restored element same tag as original (if it's content container), else use P
        let restored;
        try {
          restored = document.createElement(originalTag);
        } catch (err) {
          restored = document.createElement("div");
        }
        restored.innerText = newVal;
        // reassign data-key/data-editable attributes
        if (originalAttrs["data-key"]) restored.setAttribute("data-key", originalAttrs["data-key"]);
        else restored.setAttribute("data-key", key);
        restored.setAttribute("data-editable", "");

        // replace textarea
        textarea.replaceWith(restored);

        pendingChanges[key] = { type: "text", value: newVal };
        setDirtyUIFor(key);

        // re-attach buttons (because DOM changed)
        attachEditButtons();
        attachExistingImageEdits();
      };

      textarea.addEventListener("blur", commit, { once: true });
      textarea.addEventListener("keydown", (ev) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
          textarea.blur();
        }
      });
    });
  });
}

function attachExistingImageEdits() {
  document.querySelectorAll(".image-edit").forEach(btn => {
    if (btn.dataset.attached === "true") return;
    btn.dataset.attached = "true";

    // find target image: prefer nextElementSibling img OR parent img[data-editable]
    const nxt = btn.nextElementSibling;
    const target = (nxt && nxt.tagName === "IMG") ? nxt : btn.parentNode?.querySelector("img[data-editable]") || btn.closest("header,main,footer")?.querySelector("img[data-editable]");

    if (!target) {
      console.warn("image-edit: image target not found", btn);
      return;
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      let key = target.getAttribute("data-key");
      if (!key) {
        key = generateKey(target);
        target.setAttribute("data-key", key);
      }

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      fileInput.click();

      fileInput.addEventListener("change", async (ev) => {
        const file = ev.target.files[0];
        if (!file) { fileInput.remove(); return; }

        const fd = new FormData();
        fd.append("file", file);

        const page = pageName();
        try {
          const res = await fetch(`/php/upload.php?page=${encodeURIComponent(page)}&key=${encodeURIComponent(key)}`, {
            method: "POST",
            credentials: "include",
            body: fd
          });
          const json = await res.json();
          if (json && json.url) {
            target.src = json.url;
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
    });
  });
}

// menu-edit and submenu-edit handlers: allow editing top-level and nested submenu items
function attachMenuEdits() {
  document.querySelectorAll(".menu-edit, .submenu-edit").forEach(btn => {
    if (btn.dataset.attached === "true") return;
    btn.dataset.attached = "true";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 1. Find nearest editable element: prefer [data-key] or [data-editable] in parent
      const parent = btn.closest("li, div, nav") || btn.parentNode;
      const target = parent.querySelector("[data-key]") || parent.querySelector("[data-editable]") || parent.querySelector("a,button");
      if (!target) return;

      // 2. If there's a sibling .edit-btn, trigger its click
      const siblingEdit = parent.querySelector(".edit-btn");
      if (siblingEdit) {
        siblingEdit.click();
        return;
      }

      // 3. Otherwise, create a temporary fake button to trigger attachEditButtons logic
      const fakeBtn = document.createElement("button");
      fakeBtn.className = "edit-btn-temp";
      parent.appendChild(fakeBtn);
      fakeBtn.dataset.attached = "";
      attachEditButtons();
      fakeBtn.click();
      fakeBtn.remove();
    });
  });
}


// ======================= DROPDOWNS (click toggle) =======================
function initClickDropdowns() {
  const menuContainers = document.querySelectorAll("nav > div, nav .relative, nav .group");
  menuContainers.forEach(item => {
    const submenu = item.querySelector("div.absolute, #dropdownMenuPortefeuille, .absolute");
    const toggle = Array.from(item.querySelectorAll("button, a")).find(el => {
      // skip admin buttons
      if (el.classList.contains("edit-btn") || el.classList.contains("menu-edit") || el.classList.contains("submenu-edit") || el.classList.contains("image-edit")) return false;
      if (el.id === "menu-toggle") return false;
      return true;
    });
    if (!submenu || !toggle) return;

    submenu.classList.add("hidden");

    toggle.addEventListener("click", (e) => {
      // allow navigation if ctrl/meta/shift or middle click
      if (toggle.tagName === "A" && (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) {
        return;
      }
      // if anchor with href, prevent navigation so toggle opens submenu
      if (toggle.tagName === "A") e.preventDefault();

      // close others
      document.querySelectorAll("nav .absolute").forEach(d => d.classList.add("hidden"));

      const isHidden = submenu.classList.contains("hidden");
      submenu.classList.toggle("hidden", !isHidden);
    });
  });

  // close when clicking outside
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
      try {
        await fetch("/php/logout.php", { method: "POST", credentials: "include" });
      } catch (err) {
        console.warn("logout call failed:", err);
      } finally {
        window.location.href = "/admin.html";
      }
    });
  }
}

// ======================= INIT =======================
async function initAdminEditing() {
  await checkAdminSession();

  // hide admin icons initially, show only if admin
  setAdminButtonsVisibility(isAdmin);

  // always init dropdown behavior and mobile menu toggle
  initClickDropdowns();

  if (!isAdmin) {
    // still attach mobile
    return;
  }

  // load content that exists in DB
  await loadSiteContent();

  // attach admin-specific behaviors to existing buttons
  attachEditButtons();
  attachExistingImageEdits();
  attachMenuEdits();
  attachUtilityButtons();

  // small accessibility: Enter/Space on focused nav elements toggles
  document.querySelectorAll("nav button, nav a").forEach(el => {
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        el.click();
      }
    });
  });

  // style helpers (optional small CSS hooks)
  const style = document.createElement("style");
  style.innerHTML = `
    .admin-pending-edit { outline: 2px dashed #f59e0b !important; }
    #save-btn.pulse-save { transform: scale(1.02); transition: transform .15s; }
    #save-btn.saved { background: #10b981 !important; transform: scale(1.02); }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", initAdminEditing);
