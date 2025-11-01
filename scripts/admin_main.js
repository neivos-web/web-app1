// scripts/admin_main.js
// Admin editing & dropdown fixes for Outsiders site
// Assumes session check on server side (PHP). Uses existing endpoints:
// - /php/upload.php?page=...&key=...
// - /php/save_content.php
// - /php/load_content.php
// This file attaches behavior to the existing buttons in your HTML (no new buttons created).

const isAdmin = true; // PHP already gated page - keep true here

/* -------------------- Helpers -------------------- */
function pageId() {
  return window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
}

// Prefer element's data-editable if provided; else compute stable DOM path
function generateKey(el) {
  if (!el) return null;
  if (el.dataset && el.dataset.key) return el.dataset.key;
  const path = [];
  let curr = el;
  while (curr && curr.tagName !== "BODY") {
    const siblings = Array.from(curr.parentNode ? curr.parentNode.children : []);
    const idx = siblings.indexOf(curr);
    path.unshift(`${curr.tagName.toLowerCase()}[${idx}]`);
    curr = curr.parentNode;
  }
  return path.join("/");
}

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, { credentials: "include", ...opts });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

/* -------------------- Load / Save -------------------- */
async function saveContent() {
  // Collect only elements that are meant to be editable (have data-editable OR img with data-editable)
  const editableEls = Array.from(document.querySelectorAll("[data-editable]"));
  const data = [];
  const page = pageId();

  editableEls.forEach(el => {
    const key = generateKey(el);
    let type = "text";
    let value = "";

    if (el.tagName === "IMG") {
      type = "image";
      value = el.src || "";
    } else if (el.tagName === "A") {
      type = "link";
      value = JSON.stringify({ text: el.innerText || "", href: el.href || "" });
    } else {
      type = "text";
      value = el.innerText || "";
    }
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
      console.error("Save failed:", await res.text());
    } else {
      console.log("Content saved");
    }
  } catch (err) {
    console.error("Save error", err);
  }
}

async function loadSiteContent() {
  const page = pageId();
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(page)}`, { credentials: "include" });
    if (!res.ok) throw new Error("load failed");
    const payload = await res.json();
    // payload expected to be array of items { key, type, value } or object - support both
    const items = Array.isArray(payload) ? payload : (payload.other || []);
    items.forEach(item => {
      // Try to find element by data-editable first
      let el = document.querySelector(`[data-editable="${item.key}"]`);
      if (!el) {
        // fallback: try to find element whose generated key matches
        el = Array.from(document.querySelectorAll("[data-editable]")).find(e => generateKey(e) === item.key);
      }
      if (!el) return;
      if (item.type === "image" || item.type === "img") el.src = item.value;
      else if (item.type === "link" || el.tagName === "A") {
        try {
          const linkData = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
          if (linkData) {
            el.innerText = linkData.text || el.innerText;
            if (linkData.href) el.href = linkData.href;
          }
        } catch (e) {
          el.innerText = item.value;
        }
      } else {
        el.innerText = item.value;
      }
    });
    console.log("Loaded content for", page);
  } catch (err) {
    console.warn("Could not load saved content:", err);
  }
}

/* -------------------- Inline editing -------------------- */
/* Finds the appropriate editable target near an edit button */
function findEditableTarget(btn) {
  // 1) previous sibling that has data-editable
  if (btn.previousElementSibling && btn.previousElementSibling.hasAttribute && btn.previousElementSibling.hasAttribute("data-editable")) {
    return btn.previousElementSibling;
  }
  // 2) next sibling
  if (btn.nextElementSibling && btn.nextElementSibling.hasAttribute && btn.nextElementSibling.hasAttribute("data-editable")) {
    return btn.nextElementSibling;
  }
  // 3) within parent: direct child with data-editable
  if (btn.parentElement) {
    const prefer = btn.parentElement.querySelector("[data-editable]");
    if (prefer) return prefer;
  }
  // 4) search nearby up to two parents
  let p = btn.parentElement;
  for (let i=0;i<3 && p;i++){
    const cand = p.querySelector("[data-editable]");
    if (cand) return cand;
    p = p.parentElement;
  }
  return null;
}

function makeInputForTextElement(el) {
  // Create appropriate input or textarea depending on tag
  if (!el) return;
  const tag = el.tagName;
  const isInline = ["SPAN","A","STRONG","EM","B"].includes(tag);
  const input = isInline ? document.createElement("input") : document.createElement("textarea");
  input.value = el.innerText.trim();
  // Styling: inherit font + minimal
  input.style.font = "inherit";
  input.style.fontSize = "inherit";
  input.style.padding = "4px";
  input.style.minWidth = "140px";
  if (input.tagName === "TEXTAREA") input.style.minHeight = "60px";
  input.className = "inline-editor";
  return input;
}

function attachEditButtons() {
  // Wire .edit-btn present in DOM
  document.querySelectorAll(".edit-btn").forEach(btn => {
    if (btn.dataset.attached) return;
    btn.dataset.attached = "1";
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const target = findEditableTarget(btn);
      if (!target) return console.warn("No target for edit-btn", btn);
      // If it's an anchor, create two inputs: text + href
      if (target.tagName === "A") {
        const wrapper = document.createElement("span");
        wrapper.style.display = "inline-flex";
        wrapper.style.gap = "6px";
        const textIn = document.createElement("input");
        textIn.value = target.innerText;
        textIn.style.font = "inherit";
        textIn.style.padding = "4px";
        textIn.style.minWidth = "120px";
        const hrefIn = document.createElement("input");
        hrefIn.value = target.href;
        hrefIn.style.font = "inherit";
        hrefIn.style.padding = "4px";
        hrefIn.style.minWidth = "180px";
        wrapper.appendChild(textIn);
        wrapper.appendChild(hrefIn);
        target.replaceWith(wrapper);
        textIn.focus();
        const save = async () => {
          const a = document.createElement("a");
          a.href = hrefIn.value || "#";
          a.innerText = textIn.value || hrefIn.value || "Lien";
          a.className = target.className || "";
          a.setAttribute("data-editable", target.getAttribute("data-editable") || "");
          wrapper.replaceWith(a);
          await saveContent();
        };
        // blur on both inputs -> save (use small timeout to allow switching between inputs)
        textIn.addEventListener("blur", () => setTimeout(save, 150));
        hrefIn.addEventListener("blur", () => setTimeout(save, 150));
        return;
      }

      // For images, do nothing here; image-edits handled separately
      if (target.tagName === "IMG") return;

      // Text element: swap to input/textarea
      const input = makeInputForTextElement(target);
      if (!input) return;
      const original = target;
      original.replaceWith(input);
      input.focus();

      // Save on blur or Enter (for single-line input)
      const doSave = async () => {
        const newEl = document.createElement(original.tagName);
        newEl.innerHTML = input.value;
        // keep original attributes (data-editable etc)
        if (original.getAttribute("data-editable")) newEl.setAttribute("data-editable", original.getAttribute("data-editable"));
        if (original.className) newEl.className = original.className;
        newEl.setAttribute("data-editable", original.getAttribute("data-editable") || "");
        input.replaceWith(newEl);
        await saveContent();
      };
      input.addEventListener("blur", doSave, { once: true });
      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && input.tagName === "INPUT") {
          ev.preventDefault();
          input.blur();
        }
      });
    });
  });
}

/* -------------------- Image upload handling -------------------- */
function attachImageEditButtons() {
  document.querySelectorAll(".image-edit").forEach(btn => {
    if (btn.dataset.attachedImg) return;
    btn.dataset.attachedImg = "1";

    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      // find target image: try siblings then parent .nav-item-wrapper or .content-image
      let img = null;
      // sibling img
      if (btn.nextElementSibling && btn.nextElementSibling.tagName === "IMG") img = btn.nextElementSibling;
      if (!img && btn.previousElementSibling && btn.previousElementSibling.tagName === "IMG") img = btn.previousElementSibling;
      if (!img) {
        // search parent
        const p = btn.parentElement;
        if (p) img = p.querySelector("img[data-editable], img");
      }
      if (!img) {
        console.warn("No image found for image-edit button", btn);
        return;
      }

      // create temporary input
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      fileInput.click();

      fileInput.addEventListener("change", async (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) {
          fileInput.remove();
          return;
        }
        // upload to server
        const fd = new FormData();
        fd.append("file", file);
        const key = generateKey(img);
        const page = pageId();
        try {
          const res = await fetch(`/php/upload.php?page=${encodeURIComponent(page)}&key=${encodeURIComponent(key)}`, {
            method: "POST",
            body: fd,
            credentials: "include"
          });
          const json = await res.json();
          if (json.url) {
            img.src = json.url;
            await saveContent();
          } else {
            // if no json.url, try to use returned path/text
            console.warn("Upload returned:", json);
            if (typeof json === "string" && json.startsWith("http")) {
              img.src = json;
              await saveContent();
            } else {
              alert("Upload failed (no url returned). Check server response in console.");
              console.log("upload response:", json);
            }
          }
        } catch (err) {
          console.error("Upload error", err);
          alert("Erreur upload image. Voir console.");
        } finally {
          fileInput.remove();
        }
      }, { once: true });
    });
  });
}

/* -------------------- Dropdown behavior (click toggles) -------------------- */
function initDropdowns() {
  // Toggle top-level menu for mobile already handled by menu-toggle button
  // For each relative.group that contains a dropdown (we assume it contains a div absolute)
  document.querySelectorAll(".relative.group").forEach(group => {
    if (group.dataset.dropdownAttached) return;
    group.dataset.dropdownAttached = "1";

    const toggleBtn = group.querySelector("button"); // first button as toggle
    // find dropdown container inside this group
    const dropdown = group.querySelector(".absolute, #dropdownMenuPortefeuille, .group > div") || group.querySelector("[role='menu']") || group.querySelector(".dropdown");
    // some markup has nested absolute inside absolute; find the deepest absolute descendant
    const dd = group.querySelectorAll(".absolute");
    const dropdownEl = dd.length ? dd[dd.length-1] : dropdown;

    if (!toggleBtn || !dropdownEl) {
      // fallback: ensure submenu-edit area still works
      return;
    }

    // ensure dropdown is absolutely positioned and visible when opened
    dropdownEl.style.transition = "opacity 150ms ease, transform 150ms ease";
    dropdownEl.style.willChange = "opacity, transform";
    dropdownEl.style.opacity = "0";
    dropdownEl.style.pointerEvents = "none";
    dropdownEl.style.transform = "translateY(6px)";
    dropdownEl.style.display = "block"; // keep in DOM flow but invisible; this avoids layout jumps
    dropdownEl.classList.add("admin-dropdown"); // marker for CSS if needed
    // place element outside clipping issues (increase z-index)
    dropdownEl.style.zIndex = "9999";

    // initially hide via data-open
    dropdownEl.dataset.open = "false";
    dropdownEl.style.visibility = "hidden";
    dropdownEl.style.opacity = "0";
    dropdownEl.style.pointerEvents = "none";

    const openDropdown = () => {
      dropdownEl.dataset.open = "true";
      dropdownEl.style.visibility = "visible";
      dropdownEl.style.opacity = "1";
      dropdownEl.style.pointerEvents = "auto";
      dropdownEl.style.transform = "translateY(0)";
      group.classList.add("open");
    };
    const closeDropdown = () => {
      dropdownEl.dataset.open = "false";
      dropdownEl.style.opacity = "0";
      dropdownEl.style.pointerEvents = "none";
      dropdownEl.style.transform = "translateY(6px)";
      // hide after animation
      setTimeout(() => { if (dropdownEl.dataset.open === "false") dropdownEl.style.visibility = "hidden"; }, 160);
      group.classList.remove("open");
    };

    toggleBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const isOpen = dropdownEl.dataset.open === "true";
      // close other open dropdowns
      document.querySelectorAll(".relative.group .admin-dropdown").forEach(d=>{
        if (d !== dropdownEl) {
          d.dataset.open = "false";
          d.style.opacity = "0";
          d.style.pointerEvents = "none";
          d.style.transform = "translateY(6px)";
          d.style.visibility = "hidden";
          d.closest(".relative.group")?.classList?.remove("open");
        }
      });
      if (isOpen) closeDropdown(); else openDropdown();
    });

    // Make sure clicking inside dropdown doesn't close it
    dropdownEl.addEventListener("click", (e)=> e.stopPropagation());

    // Clicking outside closes all
    document.addEventListener("click", () => {
      closeDropdown();
    });

    // Also close on Escape
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDropdown(); } });
  });

  // Make sure top-level menu (id=menu) is visible below navbar and not clipped
  const menu = document.getElementById("menu");
  if (menu) {
    menu.style.zIndex = "9998";
    menu.style.overflow = "visible";
  }
}

/* -------------------- Submenu Add button (admin-only) -------------------- */
function attachAddSubmenuButtons() {
  if (!isAdmin) return;
  // for each dropdown (admin-dropdown), ensure there is a small add button at the bottom
  document.querySelectorAll(".admin-dropdown").forEach(drop => {
    if (drop.dataset.addSubAttached) return;
    drop.dataset.addSubAttached = "1";
    const add = document.createElement("div");
    add.style.padding = "8px";
    add.style.borderTop = "1px solid rgba(0,0,0,0.05)";
    add.style.display = "flex";
    add.style.justifyContent = "center";
    const btn = document.createElement("button");
    btn.textContent = "+ Ajouter un sous-menu";
    btn.className = "px-3 py-1 rounded text-sm";
    btn.style.background = "#eef";
    btn.style.border = "1px solid rgba(0,0,0,0.06)";
    btn.style.cursor = "pointer";
    add.appendChild(btn);
    drop.appendChild(add);

    btn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      const a = document.createElement("a");
      a.href = "#";
      a.innerText = "Nouvel élément";
      a.className = "block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue";
      a.setAttribute("data-editable", "");
      // create a small submenu-edit button next to it
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.gap = "6px";
      wrapper.appendChild(a);
      const subBtn = document.createElement("button");
      subBtn.className = "submenu-edit edit-btn";
      subBtn.textContent = "✎";
      wrapper.appendChild(subBtn);
      drop.insertBefore(wrapper, add); // insert before add control
      // wire the new submenu edit button
      subBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // reuse existing edit workflow: replace link with inputs
        const textIn = document.createElement("input");
        textIn.value = a.innerText;
        textIn.style.font = "inherit";
        textIn.style.padding = "4px";
        const hrefIn = document.createElement("input");
        hrefIn.value = a.href;
        hrefIn.style.font = "inherit";
        hrefIn.style.padding = "4px";
        const editWrap = document.createElement("span");
        editWrap.style.display = "inline-flex";
        editWrap.style.gap = "6px";
        editWrap.appendChild(textIn);
        editWrap.appendChild(hrefIn);
        wrapper.replaceWith(editWrap);
        textIn.focus();
        const finish = async () => {
          const newA = document.createElement("a");
          newA.href = hrefIn.value || "#";
          newA.innerText = textIn.value || "Lien";
          newA.className = "block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue";
          newA.setAttribute("data-editable", "");
          const newWrapper = document.createElement("div");
          newWrapper.style.display = "flex";
          newWrapper.style.alignItems = "center";
          newWrapper.style.justifyContent = "center";
          newWrapper.style.gap = "6px";
          const newSubBtn = document.createElement("button");
          newSubBtn.className = "submenu-edit edit-btn";
          newSubBtn.textContent = "✎";
          newWrapper.appendChild(newA);
          newWrapper.appendChild(newSubBtn);
          editWrap.replaceWith(newWrapper);
          // attach behavior to newSubBtn
          newSubBtn.addEventListener("click", (e)=> {
            e.stopPropagation();
            // delegate to edit-btn behavior by triggering a click on an .edit-btn if present
            newSubBtn.click();
          });
          await saveContent();
        };
        textIn.addEventListener("blur", () => setTimeout(finish, 120));
        hrefIn.addEventListener("blur", () => setTimeout(finish, 120));
      });
    });
  });
}

/* -------------------- Bootstrapping -------------------- */
async function initAdminMain() {
  if (!isAdmin) return;
  // first load saved content
  await loadSiteContent();

  // attach handlers to existing elements/buttons (no new UI creation)
  attachEditButtons();
  attachImageEditButtons();

  // initialize dropdown toggles and add-submenu buttons
  initDropdowns();

  // re-run attachAddSubmenuButtons after dropdown init so they can find .admin-dropdown
  attachAddSubmenuButtons();

  // Also attach submenu-edit and menu-edit existing buttons (wire them to nearest target)
  document.querySelectorAll(".menu-edit, .submenu-edit").forEach(b => {
    if (b.dataset.attachedMenu) return;
    b.dataset.attachedMenu = "1";
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const target = findEditableTarget(b);
      if (!target) return;
      // reuse same behavior as .edit-btn click
      b.classList.add("active");
      b.click(); // if there is an edit-btn behavior this will trigger it; otherwise call manual flow
    });
  });

  // Save & logout buttons already in DOM
  document.getElementById("save-btn")?.addEventListener("click", async () => {
    await saveContent();
    // small visual feedback
    const s = document.getElementById("save-btn");
    if (s) { s.textContent = "Publié ✓"; setTimeout(()=> s.textContent = "Publier", 1200); }
  });
  document.getElementById("logout-btn")?.addEventListener("click", () => window.location.href = "/php/logout.php");

  // Re-attach on DOM mutations for cases where admin adds new submenu elements or boxes
  const mo = new MutationObserver(() => {
    attachEditButtons();
    attachImageEditButtons();
    initDropdowns();
    attachAddSubmenuButtons();
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

// Start
document.addEventListener("DOMContentLoaded", initAdminMain);
