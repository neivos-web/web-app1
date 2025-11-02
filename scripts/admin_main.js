// admin_main.js — improved admin editing + click-dropdowns (Option A)
// Works with your existing HTML (uses existing .edit-btn / .image-edit / .menu-edit / .submenu-edit buttons).
// Backend endpoints (PHP/SQL) are unchanged: /php/check_session.php, /php/load_content.php, /php/save_content.php, /php/upload.php, /php/logout.php

// ======================= CONFIG / STATE =======================
let isAdmin = false;

// ======================= HELPERS =======================
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    if (!res.ok) throw new Error("Session check failed");
    const data = await res.json();
    isAdmin = data.logged_in === true || data.logged_in === "true";
    if (isAdmin) document.body.classList.add("admin-mode");
    else document.body.classList.remove("admin-mode");
  } catch (err) {
    console.error("checkAdminSession:", err);
    isAdmin = false;
    document.body.classList.remove("admin-mode");
  }
}

function generateKey(el) {
  const path = [];
  let curr = el;
  while (curr && curr.tagName !== "BODY") {
    const siblings = Array.from(curr.parentNode.children);
    const index = siblings.indexOf(curr);
    path.unshift(`${curr.tagName.toLowerCase()}[${index}]`);
    curr = curr.parentNode;
  }
  return path.join("/");
}

// ======================= SAVE / LOAD =======================
async function saveContent() {
  const elements = Array.from(document.body.querySelectorAll("*")).filter(el =>
    !["SCRIPT", "STYLE"].includes(el.tagName) &&
    !el.classList.contains("add-block-btn") &&
    !el.classList.contains("edit-btn")
  );

  const data = [];
  const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";

  elements.forEach(el => {
    const key = generateKey(el);
    let type = "text";
    let value = el.innerText || "";
    if (el.tagName === "IMG") { type = "image"; value = el.src; }
    else if (el.tagName === "A") { type = "link"; value = JSON.stringify({ text: el.innerText, href: el.getAttribute("href") || el.href || "" }); }
    data.push({ page, key, type, value });
  });

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!res.ok) {
      console.error("saveContent error:", await res.text());
      alert("Erreur lors de la sauvegarde (voir console).");
    } else {
      console.log("✅ Content saved");
      // small visual feedback
      const saveBtn = document.getElementById("save-btn");
      if (saveBtn) {
        saveBtn.classList.add("opacity-75");
        setTimeout(() => saveBtn.classList.remove("opacity-75"), 500);
      }
    }
  } catch (err) {
    console.error("saveContent:", err);
  }
}

async function loadSiteContent() {
  const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
  try {
    const res = await fetch(`/php/load_content.php?page=${page}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load content");
    const data = await res.json();

    data.forEach(item => {
      // we used data-editable="KEY" attributes in markup — older code used data-editable attributes with keys
      // the DB stores keys generated with generateKey, so we expect item.key to equal that key.
      // But your HTML uses data-editable without explicit values in many places.
      // To support both patterns: try selector for [data-editable="KEY"] first, else fall back to first [data-editable] inside same path.
      const el = document.querySelector(`[data-editable="${item.key}"]`) || document.querySelector(`[data-editable]`);
      if (!el) return;
      if (item.type === "text") el.innerText = item.value;
      else if (item.type === "image") el.src = item.value;
      else if (item.type === "link") {
        try {
          const linkData = JSON.parse(item.value);
          el.innerText = linkData.text;
          el.setAttribute("href", linkData.href);
        } catch (err) {
          console.warn("Invalid link JSON:", item.value);
        }
      }
    });

    console.log("Content loaded for page:", page);
  } catch (err) {
    console.error("loadSiteContent:", err);
  }
}

// ======================= ATTACH BEHAVIORS (use existing HTML buttons) =======================

/**
 * Show or hide admin buttons already present in HTML (.edit-btn, .image-edit, .menu-edit, .submenu-edit).
 * We do not create new buttons. We only attach handlers to existing ones and hide them when not admin.
 */
function setAdminButtonsVisibility(show) {
  const btns = document.querySelectorAll(".edit-btn, .image-edit, .menu-edit, .submenu-edit");
  btns.forEach(b => {
    b.style.display = show ? "" : "none"; // let CSS decide exact inline vs inline-flex
  });
}

/**
 * Attach handlers to the existing .edit-btn (text/link) buttons.
 * Option A: edit button is placed next to the target <a> (or other target).
 */
function attachEditButtons() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    if (btn.dataset.attached === "true") return;
    btn.dataset.attached = "true";

    // Try to find the target element:
    // Prefer: previousElementSibling (common pattern in HTML), else look within parent for [data-editable], else search next sibling.
    let target = btn.previousElementSibling;
    if (!target || !target.hasAttribute || !target.hasAttribute("data-editable")) {
      target = btn.parentNode.querySelector("[data-editable]") || btn.previousElementSibling || btn.nextElementSibling;
    }
    if (!target) {
      console.warn("edit-btn: target not found for", btn);
      return;
    }

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // If <a> — prompt for new text and href (keeps link functionality)
      if (target.tagName === "A") {
        const currentText = target.innerText.trim();
        const currentHref = target.getAttribute("href") || "";
        const newText = prompt("Modifier le texte du lien:", currentText);
        if (newText === null) return; // cancel
        const newHref = prompt("Modifier l'URL (href):", currentHref);
        if (newHref === null) return; // cancel
        target.innerText = newText.trim();
        target.setAttribute("href", newHref.trim());
        await saveContent();
        return;
      }

      // If IMG (rare) — forward to image handler by triggering click on nearest .image-edit if exists
      if (target.tagName === "IMG") {
        const imgBtn = btn.parentNode.querySelector(".image-edit") || btn.previousElementSibling;
        if (imgBtn) imgBtn.click();
        return;
      }

      // Otherwise replace with a textarea for editing text content
      const textarea = document.createElement("textarea");
      textarea.value = target.innerText.trim();
      textarea.style.width = "100%";
      textarea.style.minHeight = "40px";
      textarea.style.zIndex = "9999";
      // preserve classes/attributes for layout after replace
      textarea.className = "temp-inline-editor";

      target.replaceWith(textarea);
      textarea.focus();

      textarea.addEventListener("blur", async () => {
        // restore original element type: if target was block (e.g., H1/P), keep same tag, else default to P
        let restored;
        try {
          restored = document.createElement(target.tagName);
        } catch (err) {
          restored = document.createElement("div");
        }
        restored.innerText = textarea.value.trim();
        restored.setAttribute("data-editable", target.getAttribute("data-editable") || "");
        textarea.replaceWith(restored);
        await saveContent();
        // re-attach edit button behavior if needed (because DOM node replaced)
        attachEditButtons();
        attachExistingImageEdits();
      }, { once: true });
    });
  });
}

/**
 * Attach handlers to existing .image-edit buttons (they open file picker and upload).
 */
function attachExistingImageEdits() {
  document.querySelectorAll(".image-edit").forEach(btn => {
    if (btn.dataset.attached === "true") return;
    btn.dataset.attached = "true";

    // find target image: usually nextElementSibling in your HTML, else search parent for img[data-editable]
    const next = btn.nextElementSibling;
    const target = (next && next.tagName === "IMG") ? next : btn.parentNode.querySelector("img[data-editable]") || btn.closest("section")?.querySelector("img[data-editable]");

    if (!target) {
      console.warn("image-edit: image target not found for", btn);
      return;
    }

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      fileInput.click();

      fileInput.addEventListener("change", async (ev) => {
        const file = ev.target.files[0];
        if (!file) { fileInput.remove(); return; }

        const key = generateKey(target);
        const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";

        const fd = new FormData();
        fd.append("file", file);

        try {
          const res = await fetch(`/php/upload.php?page=${page}&key=${encodeURIComponent(key)}`, { method: "POST", body: fd, credentials: "include" });
          const json = await res.json();
          if (json.url) {
            target.src = json.url;
            await saveContent();
          } else {
            console.error("upload returned no url:", json);
            alert("Erreur upload (voir console).");
          }
        } catch (err) {
          console.error("upload error:", err);
          alert("Erreur upload (voir console).");
        } finally {
          fileInput.remove();
        }
      }, { once: true });
    });
  });
}

/**
 * Attach behaviors to a new content box (called when a new box is programmatically created).
 * We'll keep it simple: attach existing edit/image handlers to elements inside the box.
 */
function attachContentBoxBehaviors(box) {
  // find any inline edit buttons inside this box and mark them unattached to be attached below
  box.querySelectorAll(".edit-btn, .image-edit").forEach(b => { b.dataset.attached = ""; });
  // attach handlers on all inside the box
  attachEditButtons();
  attachExistingImageEdits();
  addAddBlockButtonToBox(box);
}

function addAddBlockButtonToBox(box) {
  if (!isAdmin) return;
  if (box.querySelector(".add-block-btn")) return;

  const btn = document.createElement("button");
  btn.className = "add-block-btn bg-blue-600 text-white px-3 py-1 rounded-md mt-4 hover:bg-blue-700 shadow-md";
  btn.textContent = "Ajouter un bloc";
  box.appendChild(btn);

  btn.addEventListener("click", () => {
    const newBox = createNewContentBox();
    box.parentNode.insertBefore(newBox, box.nextSibling);
    attachContentBoxBehaviors(newBox);
  });
}

function createNewContentBox() {
  const box = document.createElement("div");
  box.className = "content-box bg-white rounded shadow-md p-6 mt-6 relative";
  box.innerHTML = `
    <div class="content-image">
      <img src="https://via.placeholder.com/400x200" alt="Nouvelle image" data-editable>
    </div>
    <div class="content">
      <h2 data-editable> Nouveau titre </h2>
      <p data-editable> Nouveau paragraphe... </p>
    </div>
  `;
  return box;
}

// ======================= DROPDOWNS (click toggle, uses existing menu buttons) =======================
function initClickDropdowns() {
  // We will use existing HTML structure. Each top-level menu item is a .relative (or .group) div.
  const menuItems = document.querySelectorAll("nav .relative, nav .group, nav > div");
  // We'll attach to the primary button inside the group (first BUTTON or link).
  menuItems.forEach(item => {
    // find submenu — usually a DIV that was hidden with group-hover
    const submenu = item.querySelector("div[id^='dropdownMenu'], div.absolute, div[role='menu'], .absolute");
    // find clickable toggle: prefer an existing button inside the item (not the edit buttons)
    const candidates = Array.from(item.querySelectorAll("button, a")).filter(el => {
      // skip admin edit buttons
      if (el.classList.contains("edit-btn") || el.classList.contains("menu-edit") || el.classList.contains("submenu-edit") || el.classList.contains("image-edit")) return false;
      // skip language selector etc.
      if (el.id === "menu-toggle") return false;
      return true;
    });
    if (!submenu || candidates.length === 0) return;

    const toggle = candidates[0]; // first real button/link (this keeps existing a href behavior)
    // ensure submenu hidden initially (for desktop)
    submenu.classList.add("hidden");

    // if toggle is an <a> (link to page) we must preserve navigation on normal click.
    // Behavior: if admin clicks the edit button, we edit. If admin clicks the toggle arrow (we don't add new arrow),
    // user expects clicking the menu label to open submenu instead of navigating. We'll make it so:
    // - On small screens (when menu is collapsed), clicking label should open submenu (prevent navigation).
    // - On desktop: clicking label toggles submenu but if the <a> has href and user wants to navigate, they can open link in new tab.
    // We'll implement a tolerant toggle: if href exists and user clicked with ctrl/meta, let navigation proceed.
    toggle.addEventListener("click", (e) => {
      // If this is a plain link and user holds ctrl/meta/shift or middle click, allow navigation
      if (toggle.tagName === "A" && (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) {
        return; // allow browser default
      }

      // Prevent navigation when clicking to toggle the submenu
      if (toggle.tagName === "A") e.preventDefault();

      // Toggle submenu visibility
      const isHidden = submenu.classList.contains("hidden");
      // hide other submenus
      document.querySelectorAll("nav div.absolute").forEach(d => d.classList.add("hidden"));
      if (isHidden) submenu.classList.remove("hidden");
      else submenu.classList.add("hidden");
    });
  });

  // Close submenus when clicking outside
  document.addEventListener("click", (e) => {
    const insideNav = e.target.closest("nav");
    if (!insideNav) {
      document.querySelectorAll("nav div.absolute").forEach(d => d.classList.add("hidden"));
    }
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll("nav div.absolute").forEach(d => d.classList.add("hidden"));
    }
  });
}

// ======================= EXTRA: Save & Logout buttons =======================
function attachUtilityButtons() {
  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await saveContent();
    });
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("/php/logout.php", { method: "POST", credentials: "include" });
        // redirect to admin login (existing behaviour in your PHP)
        window.location.href = "/admin.html";
      } catch (err) {
        console.error("logout error:", err);
        window.location.href = "/admin.html";
      }
    });
  }
}

// ======================= INITIALIZATION =======================
async function initAdminEditing() {
  await checkAdminSession();

  // hide admin buttons by default; if admin, we'll show them later
  setAdminButtonsVisibility(false);

  if (!isAdmin) {
    // still attach mobile menu toggle and normal navigation usability
    initClickDropdowns();
    return;
  }

  // show existing edit buttons in HTML (Option A)
  setAdminButtonsVisibility(true);

  // load DB content into page (keeps SQL backend)
  await loadSiteContent();

  // attach handlers to existing buttons
  attachEditButtons();
  attachExistingImageEdits();

  // attach behaviors for any content-boxes already present
  document.querySelectorAll(".content-box").forEach(box => {
    // ensure attachContentBoxBehaviors exists and works
    attachContentBoxBehaviors(box);
  });

  // ensure dropdowns use click toggles (not hover)
  initClickDropdowns();

  // utilities
  attachUtilityButtons();

  // small accessibility: keyboard focus toggles for dropdowns
  document.querySelectorAll("nav button, nav a").forEach(el => {
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        el.click();
        ev.preventDefault();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initAdminEditing);
