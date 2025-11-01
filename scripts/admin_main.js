// scripts/admin_main.js
// Admin editing wiring for Outsiders site.
// - Uses existing buttons only (edit-btn, image-edit, add-block-btn).
// - Endpoints: /php/check_session.php, /php/save_content.php, /php/load_content.php, /php/upload.php

let isAdmin = false;

// ------------------------ Helpers ------------------------
function by(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function one(sel, root = document) { return root.querySelector(sel); }

function generateKey(el) {
  // Use explicit data-editable if present (stable across pages)
  if (!el) return "";
  if (el.dataset && el.dataset.key) return el.dataset.key;

  const path = [];
  let curr = el;
  while (curr && curr.tagName && curr.tagName !== "BODY") {
    const siblings = Array.from(curr.parentNode ? curr.parentNode.children : []);
    const idx = siblings.indexOf(curr);
    path.unshift(`${curr.tagName.toLowerCase()}[${idx}]`);
    curr = curr.parentNode;
  }
  return path.join("/");
}

function currentPageName() {
  return window.location.pathname.replace(/\//g, "_").replace(".html", "").replace(/^_+|_+$/g, "") || "general";
}

function showTooltip(msg) {
  const tip = document.createElement("div");
  tip.textContent = msg;
  tip.className = "fixed top-4 right-4 bg-brand-green text-white p-2 rounded shadow z-50";
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 1800);
}

// ------------------------ Session ------------------------
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    if (!res.ok) { isAdmin = false; return false; }
    const data = await res.json();
    isAdmin = data.logged_in === true || data.logged_in === "true";
    return isAdmin;
  } catch (err) {
    console.error("check session error", err);
    isAdmin = false;
    return false;
  }
}

// ------------------------ Load / Save ------------------------
async function loadSiteContent() {
  const page = currentPageName();
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load");
    const json = await res.json();

    // Accept two shapes:
    // 1) array of {key, type, value}
    // 2) { other: {key: {value, type}} } (legacy)
    if (Array.isArray(json)) {
      json.forEach(item => applyStoredItem(item));
    } else if (json && typeof json === "object") {
      if (json.other && typeof json.other === "object") {
        Object.keys(json.other).forEach(k => {
          const stored = json.other[k];
          applyStoredItem({ key: k, type: stored.type || 'text', value: stored.value ?? stored });
        });
      } else {
        // maybe it's a flat object: { key1: {value, type}, ... }
        Object.keys(json).forEach(k => {
          const stored = json[k];
          if (stored && stored.value !== undefined) {
            applyStoredItem({ key: k, type: stored.type || 'text', value: stored.value });
          }
        });
      }
    }
    console.log("Loaded content for", page);
  } catch (err) {
    console.warn("loadSiteContent", err);
  }

  function applyStoredItem(item) {
    if (!item || !item.key) return;
    // First try query by data-editable
    let el = document.querySelector(`[data-editable="${item.key}"]`);
    if (!el) {
      // fallback: find element whose generated key equals stored key
      el = Array.from(document.querySelectorAll("[data-editable], img[data-editable], a[data-editable]"))
        .find(e => generateKey(e) === item.key);
    }
    if (!el) return;

    if (item.type === "image" || item.type === "img") el.src = item.value;
    else if (item.type === "link" || item.type === "a") {
      try {
        const ld = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
        if (ld) { el.innerText = ld.text || el.innerText; el.href = ld.href || el.href; }
      } catch (e) {
        // fallback: set plain text
        el.innerText = item.value;
      }
    } else {
      el.innerText = item.value;
    }
  }
}

async function saveContent() {
  // collect only elements that have data-editable OR are images with data-editable or anchors with data-editable
  const elements = Array.from(document.querySelectorAll("[data-editable]"));
  const page = currentPageName();
  const payload = [];

  elements.forEach(el => {
    const key = generateKey(el);
    if (!key) return;
    let type = "text", value = "";
    if (el.tagName === "IMG") { type = "image"; value = el.src || ""; }
    else if (el.tagName === "A") { type = "link"; value = JSON.stringify({ text: el.innerText || "", href: el.href || "" }); }
    else { type = "text"; value = el.innerText || ""; }

    payload.push({ page, key, type, value });
  });

  if (payload.length === 0) {
    console.log("No editable elements to save.");
    return;
  }

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("Save failed:", txt);
      alert("Erreur lors de la sauvegarde. Voir console.");
      return;
    }
    showTooltip("Contenu sauvegardé");
    console.log("Saved", payload.length, "items.");
  } catch (err) {
    console.error("saveContent error", err);
    alert("Erreur lors de la sauvegarde. Voir console.");
  }
}

// ------------------------ Edit wiring (no new buttons) ------------------------
function findNearestEditableForButton(btn) {
  // prefer previous sibling then next sibling then parent query
  if (!btn) return null;
  const prev = btn.previousElementSibling;
  if (prev && prev.hasAttribute && prev.hasAttribute("data-editable")) return prev;
  const next = btn.nextElementSibling;
  if (next && next.hasAttribute && next.hasAttribute("data-editable")) return next;
  // search parent
  const parent = btn.parentElement;
  if (parent) {
    const direct = parent.querySelector("[data-editable]");
    if (direct) return direct;
  }
  // fallback: closest ancestor with data-editable
  return btn.closest("[data-editable]");
}

function wireEditButtons() {
  // wire existing .edit-btn elements (do not create new ones)
  by(".edit-btn").forEach(btn => {
    // avoid double attach
    if (btn.dataset.wired === "true") return;
    btn.dataset.wired = "true";

    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!isAdmin) return;
      const target = findNearestEditableForButton(btn);
      if (!target) return;

      // if it's a link, create two inline inputs: text + href (side-by-side)
      if (target.tagName === "A") {
        // create container
        const container = document.createElement("span");
        container.style.display = "inline-flex";
        container.style.gap = "6px";
        container.style.alignItems = "center";
        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.value = target.innerText || "";
        textInput.style.minWidth = "120px";
        textInput.style.font = "inherit";
        const hrefInput = document.createElement("input");
        hrefInput.type = "text";
        hrefInput.value = target.href || "";
        hrefInput.placeholder = "URL";
        hrefInput.style.minWidth = "180px";
        hrefInput.style.font = "inherit";

        container.appendChild(textInput);
        container.appendChild(hrefInput);

        target.replaceWith(container);
        textInput.focus();

        // save when both blurred (use small delay to allow switching between inputs)
        let blurTimer = null;
        function commitAndRestore() {
          const newA = document.createElement("a");
          newA.href = hrefInput.value || "#";
          newA.innerText = textInput.value || hrefInput.value || "Lien";
          newA.setAttribute("data-editable", "true");
          // preserve data-editable if original had it
          if (target.dataset && target.dataset.key) newA.dataset.key = target.dataset.key;
          container.replaceWith(newA);
          // re-wire the new anchor (it might have adjacent edit-btn)
          wireEditButtons(); // safe small cost
          // save content
          saveContent();
        }

        textInput.addEventListener("blur", () => { blurTimer = setTimeout(commitAndRestore, 150); });
        hrefInput.addEventListener("blur", () => { blurTimer = setTimeout(commitAndRestore, 150); });

        // Enter key commit for both
        [textInput, hrefInput].forEach(inp => {
          inp.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") { ev.preventDefault(); clearTimeout(blurTimer); commitAndRestore(); }
          });
        });
        return;
      }

      // For other elements: inline input or textarea depending on tag / content length
      const isShort = (target.innerText || "").length < 80 && /^H[1-6]$/i.test(target.tagName);
      let input;
      if (isShort) {
        input = document.createElement("input");
        input.type = "text";
      } else {
        input = document.createElement("textarea");
        input.style.minHeight = "60px";
      }
      input.value = target.innerText || "";
      input.style.font = "inherit";
      input.style.width = "100%";
      // keep some classes so the layout remains
      input.className = "inline-edit-input";

      // replace but attempt to keep layout (if target is block-level, keep block)
      const isBlock = getComputedStyle(target).display === "block" || ["P", "DIV", "SECTION", "H1", "H2", "H3", "H4"].includes(target.tagName);
      if (isBlock) input.style.display = "block";
      else input.style.display = "inline-block";

      target.replaceWith(input);
      input.focus();

      // Save on blur or Ctrl+Enter
      const done = async () => {
        const newEl = document.createElement(target.tagName);
        newEl.innerText = input.value;
        newEl.setAttribute("data-editable", "true");
        // preserve data-editable if existed on old element: try to reuse
        if (target.dataset && target.dataset.key) newEl.dataset.key = target.dataset.key;
        input.replaceWith(newEl);
        // re-wire the new element's edit button wiring (edit-btn sits adjacent)
        wireEditButtons();
        await saveContent();
      };

      input.addEventListener("blur", () => { setTimeout(done, 50); }, { once: true });
      input.addEventListener("keydown", (ev) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") { ev.preventDefault(); done(); }
      });
    });
  });
}

// ------------------------ Image wiring ------------------------
function wireImageEditButtons() {
  by(".image-edit").forEach(btn => {
    if (btn.dataset.wiredImage === "true") return;
    btn.dataset.wiredImage = "true";

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!isAdmin) return;
      // find nearest image element
      const parent = btn.parentElement;
      let img = parent && parent.querySelector && parent.querySelector("img[data-editable]");
      if (!img) {
        // fallback: next sibling
        if (btn.nextElementSibling && btn.nextElementSibling.tagName === "IMG") img = btn.nextElementSibling;
      }
      if (!img) return;

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      fileInput.click();

      fileInput.addEventListener("change", async (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) { fileInput.remove(); return; }

        // upload to /php/upload.php?page=...&key=...
        const key = generateKey(img);
        const page = currentPageName();
        const fd = new FormData();
        fd.append("file", file);

        try {
          const res = await fetch(`/php/upload.php?page=${encodeURIComponent(page)}&key=${encodeURIComponent(key)}`, {
            method: "POST",
            body: fd,
            credentials: "include"
          });
          if (!res.ok) throw new Error("upload failed");
          const json = await res.json();
          if (json && (json.url || json.path)) {
            img.src = json.url || json.path;
            await saveContent();
            showTooltip("Image mise à jour");
          } else {
            // as fallback, preview local
            const reader = new FileReader();
            reader.onload = () => { img.src = reader.result; saveContent(); };
            reader.readAsDataURL(file);
          }
        } catch (err) {
          console.error("upload error", err);
          alert("Erreur upload image (voir console)");
        } finally {
          fileInput.remove();
        }
      }, { once: true });
    });
  });
}

// ------------------------ Content-box add-block wiring ------------------------
function createNewContentBox() {
  const box = document.createElement("div");
  box.className = "content-box bg-white rounded shadow-md p-6 mt-6 relative";
  box.innerHTML = `
    <div class="content-image">
      <button class="image-edit" type="button">📷</button>
      <img src="https://via.placeholder.com/600x320" alt="Nouvelle image" data-editable>
    </div>
    <div class="content">
      <h2 data-editable>Nouveau titre</h2>
      <p data-editable>Nouveau paragraphe...</p>
    </div>
  `;
  return box;
}

function wireAddBlockButtons() {
  by(".add-block-btn").forEach(btn => {
    if (btn.dataset.wiredAdd === "true") return;
    btn.dataset.wiredAdd = "true";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!isAdmin) return;
      // find parent content-box or insert after btn's container
      const box = btn.closest(".content-box");
      const parent = box ? box.parentNode : (btn.parentNode || document.querySelector("main") || document.body);
      const newBox = createNewContentBox();
      if (box && box.nextSibling) parent.insertBefore(newBox, box.nextSibling);
      else parent.appendChild(newBox);

      // wire new box internals
      // small delay to let DOM render
      setTimeout(() => {
        wireImageEditButtons();
        wireEditButtons();
        wireAddBlockButtons();
      }, 60);
    });
  });
}

// ------------------------ Dropdown hover + click fixes ------------------------
function wireDropdowns() {
  // handle .group containers that include menus
  by(".group, .relative.group").forEach(group => {
    // find the menu element inside (absolute dropdown)
    const menu = group.querySelector(".absolute, .dropdown-menu, #dropdownMenuPortefeuille, .group > div");
    // For robustness, pick any child that has 'hidden' and is positioned absolute
    let menuEl = menu;
    if (!menuEl) {
      menuEl = Array.from(group.children).find(ch => ch.classList && (ch.classList.contains("absolute") || ch.classList.contains("dropdown")));
    }
    // mouseenter/mouseleave for desktop (hover)
    group.addEventListener("mouseenter", () => {
      if (!menuEl) return;
      menuEl.classList.remove("hidden");
      menuEl.classList.add("block");
    });
    group.addEventListener("mouseleave", () => {
      if (!menuEl) return;
      menuEl.classList.add("hidden");
      menuEl.classList.remove("block");
    });

    // Also wire click on toggle button to open on mobile
    const toggle = group.querySelector("button, [data-toggle]");
    if (toggle) {
      toggle.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!menuEl) return;
        menuEl.classList.toggle("hidden");
        menuEl.classList.toggle("block");
      });
    }
  });

  // close dropdowns when clicking outside
  document.addEventListener("click", () => {
    by(".group .absolute, .group > div.absolute, .group .dropdown").forEach(m => {
      m.classList.add("hidden");
      m.classList.remove("block");
    });
  });
}

// ------------------------ Initial wiring ------------------------
async function initAdminMain() {
  await checkAdminSession();
  if (!isAdmin) {
    console.log("Admin session not present; editing UI disabled.");
    return;
  }

  // Load stored content first
  await loadSiteContent();

  // Wire existing buttons present in DOM (no creation)
  wireEditButtons();
  wireImageEditButtons();
  wireAddBlockButtons();
  wireDropdowns();

  // Ensure content-box internals are wired
  by(".content-box").forEach(box => {
    // wire if content-box contains built-in edit/add buttons
    by(".edit-btn", box).forEach(() => {}); // just to ensure selector exists
  });

  // Save & logout buttons
  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveContent);
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => { window.location.href = "/php/logout.php"; });

  // Accessibility: allow keyboard activation for edit buttons
  by(".edit-btn, .image-edit, .add-block-btn").forEach(b => {
    b.setAttribute("tabindex", "0");
    b.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); b.click(); } });
  });

  console.log("Admin editing wired.");
}

// run
document.addEventListener("DOMContentLoaded", initAdminMain);
