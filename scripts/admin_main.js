// scripts/admin_main.js
// Admin editing script — attach to your admin HTML
let isAdmin = false;

/* --------------------- session check --------------------- */
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    if (!res.ok) throw new Error("Session check failed");
    const data = await res.json();
    isAdmin = data.logged_in === true || data.logged_in === "true";
    if (isAdmin) document.body.classList.add("admin-mode");
  } catch (err) {
    console.error("checkAdminSession:", err);
    isAdmin = false;
  }
}

/* --------------------- key generator --------------------- */
function generateKey(el) {
  if (!el) return "";
  if (el.dataset && el.dataset.key) return el.dataset.key;
  const path = [];
  let curr = el;
  while (curr && curr.tagName !== "BODY") {
    const siblings = Array.from(curr.parentNode ? curr.parentNode.children : []);
    const index = siblings.indexOf(curr);
    path.unshift(`${curr.tagName.toLowerCase()}[${index}]`);
    curr = curr.parentNode;
  }
  const key = path.join("/");
  // set it so future calls reuse it
  try { el.dataset.key = key; } catch(e) {}
  return key;
}

/* --------------------- save / load --------------------- */
async function saveContent() {
  if (!isAdmin) return;
  // collect only elements we care about (data-editable set)
  const elements = Array.from(document.querySelectorAll("[data-editable]"));
  const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
  const data = elements.map(el => {
    const key = el.dataset.key;
    let type = "text";
    let value = "";
    if (el.tagName === "IMG") { type = "image"; value = el.src || ""; }
    else if (el.tagName === "A") { type = "link"; value = JSON.stringify({ text: el.innerText, href: el.href }); }
    else { value = el.innerText || ""; }
    return { page, key, type, value };
  });

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("saveContent failed:", txt);
      return;
    }
    console.log("✅ Content saved");
  } catch (err) {
    console.error("saveContent error:", err);
  }
}

async function loadSiteContent() {
  if (!isAdmin) return;
  const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
  try {
    const res = await fetch(`/php/load_content.php?page=${page}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load content");
    const data = await res.json();
    data.forEach(item => {
      // find element with that key
      const el = document.querySelector(`[data-editable="${item.key}"]`);
      if (!el) return;
      if (item.type === "text") el.innerText = item.value;
      else if (item.type === "image") el.src = item.value;
      else if (item.type === "link") {
        const linkData = JSON.parse(item.value);
        el.innerText = linkData.text;
        el.href = linkData.href;
      }
    });
    console.log("✅ Content loaded for page:", page);
  } catch (err) {
    console.error("loadSiteContent:", err);
  }
}

/* --------------------- editing helpers --------------------- */
function createInlineEditorFor(el) {
  if (!el) return;
  const isLink = el.tagName === "A";
  const isImg = el.tagName === "IMG";

  if (isImg) return; // images handled separately

  const input = isLink ? document.createElement("input") : document.createElement("textarea");
  input.value = el.innerText.trim();
  input.style.minWidth = "120px";
  input.style.font = "inherit";
  input.style.padding = "6px";
  input.style.borderRadius = "6px";
  input.style.border = "1px solid #ddd";
  input.style.display = "inline-block";
  // replace node
  el.replaceWith(input);
  input.focus();

  // save on blur or Enter (for input)
  input.addEventListener("blur", async () => {
    try {
      if (isLink) {
        el.innerText = input.value.trim();
      } else {
        el.innerText = input.value;
      }
      input.replaceWith(el);
      await saveContent();
    } catch (e) { console.error(e); }
  }, { once: true });

  // Enter key for inputs
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      input.blur();
    }
  });
}

/* --------------------- attach handlers to existing buttons --------------------- */
function wireEditButtons() {
  // For every data-editable element ensure it has a stable data-editable
  document.querySelectorAll("[data-editable]").forEach(el => {
    if (!el.dataset.key) generateKey(el);
  });

  // Link existing single-purpose buttons (the ones in your HTML)
  // edit-btn (general)
  document.querySelectorAll("button.edit-btn").forEach(btn => {
    // try to find the element to edit:
    // strategy: previousElementSibling OR parentNode.querySelector([data-editable]) OR nextElementSibling
    if (btn._wired) return;
    btn._wired = true;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // find target editable element near this button
      let target = null;
      // case: button placed after element
      if (btn.previousElementSibling && btn.previousElementSibling.hasAttribute("data-editable")) {
        target = btn.previousElementSibling;
      }
      // case: button placed before element
      if (!target && btn.nextElementSibling && btn.nextElementSibling.hasAttribute("data-editable")) {
        target = btn.nextElementSibling;
      }
      // case: inside a wrapper where data-editable element exists
      if (!target) {
        const wrapper = btn.closest("[data-editable], .content, .content-box, nav, header, footer");
        if (wrapper) target = wrapper.querySelector("[data-editable]");
      }
      // fallback: nearest data-editable in parent
      if (!target) target = btn.parentElement && btn.parentElement.querySelector("[data-editable]");

      if (!target) {
        console.warn("No editable target found for edit-btn", btn);
        return;
      }
      createInlineEditorFor(target);
    });
  });

  // menu-edit and submenu-edit — treat similarly but try to find the button's nearest menu item
  document.querySelectorAll("button.menu-edit, button.submenu-edit").forEach(btn => {
    if (btn._wired) return;
    btn._wired = true;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // target is usually sibling anchor or preceding anchor
      let target = null;
      if (btn.previousElementSibling && btn.previousElementSibling.matches("a,button")) target = btn.previousElementSibling;
      if (!target && btn.nextElementSibling && btn.nextElementSibling.matches("a,button")) target = btn.nextElementSibling;
      // else search inside parent
      if (!target) target = btn.parentElement && btn.parentElement.querySelector("[data-editable]") || btn.closest("div") && btn.closest("div").querySelector("[data-editable]");
      if (!target) { console.warn("menu-edit: no target", btn); return; }
      createInlineEditorFor(target);
    });
  });

  // image-edit — file import; find nearest <img> in same container
  document.querySelectorAll("button.image-edit").forEach(btn => {
    if (btn._wired) return;
    btn._wired = true;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // find <img> inside same wrapper
      const wrapper = btn.closest(".nav-item-wrapper, .content-image, .footer-logo, header, section, .footer-social") || btn.parentElement;
      const img = wrapper && wrapper.querySelector("img") || document.querySelector("img[data-editable]");

      if (!img) {
        console.warn("image-edit: no image found for", btn);
        return;
      }

      // create hidden file input
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
        const fd = new FormData();
        fd.append("file", file);
        const key = generateKey(img);
        const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";

        try {
          const res = await fetch(`/php/upload.php?page=${page}&key=${encodeURIComponent(key)}`, {
            method: "POST",
            body: fd,
            credentials: "include"
          });
          const json = await res.json();
          if (json && (json.url || json.path)) {
            // update image src
            img.src = json.url || json.path;
            // set data-editable for img if not present
            if (!img.dataset.key) generateKey(img);
            await saveContent();
          } else {
            console.warn("upload returned unexpected payload", json);
          }
        } catch (err) {
          console.error("image upload error:", err);
        } finally {
          fileInput.remove();
        }
      }, { once: true });
    });
  });
}

/* --------------------- content-box add-block --------------------- */
function addAddBlockButtonToBox(box) {
  if (!isAdmin) return;
  if (box.querySelector(".add-block-btn")) return;
  const btn = document.createElement("button");
  btn.className = "add-block-btn bg-brand-blue text-white px-3 py-1 rounded-md mt-4 hover:bg-brand-green shadow-md";
  btn.textContent = "Ajouter un bloc";
  box.appendChild(btn);

  btn.addEventListener("click", () => {
    const newBox = createNewContentBox();
    box.parentNode.insertBefore(newBox, box.nextSibling);
    attachContentBoxBehaviors(newBox);
    // wire any newly added buttons
    wireEditButtons();
  });
}

function createNewContentBox() {
  const box = document.createElement("div");
  box.className = "content-box bg-white rounded shadow-md p-6 mt-6 relative";
  box.innerHTML = `
    <div class="content-image">
      <button class="image-edit">📷</button>
      <img src="https://via.placeholder.com/400x200" alt="Nouvelle image" data-editable>
    </div>
    <div class="content">
      <h2 data-editable>Nouveau titre</h2>
      <p data-editable>Nouveau paragraphe...</p>
    </div>
  `;
  // assign keys
  box.querySelectorAll("[data-editable]").forEach(el => generateKey(el));
  return box;
}

function attachContentBoxBehaviors(box) {
  // set keys for inner editable elements
  box.querySelectorAll("[data-editable]").forEach(el => { if (!el.dataset.key) generateKey(el); });
  // append add-block
  addAddBlockButtonToBox(box);
}

/* --------------------- dropdown fixes --------------------- */
function fixDropdowns() {
  // For elements with class .relative.group (you used that pattern)
  document.querySelectorAll(".relative.group").forEach(el => {
    // show submenu on mouseenter, hide on leave
    el.addEventListener("mouseenter", () => {
      const submenu = el.querySelector("div[id^='dropdownMenu'], .absolute.left-1/2, .absolute.top-full, .group-hover\\:block");
      if (submenu) {
        submenu.style.display = "block";
        submenu.style.opacity = "1";
        submenu.style.pointerEvents = "auto";
      }
    });
    el.addEventListener("mouseleave", () => {
      const submenu = el.querySelector("div[id^='dropdownMenu'], .absolute.left-1/2, .absolute.top-full, .group-hover\\:block");
      if (submenu) {
        submenu.style.display = "none";
        submenu.style.opacity = "0";
        submenu.style.pointerEvents = "none";
      }
    });
    // Also allow clicking the main button to toggle on small screens
    const btn = el.querySelector("button");
    if (btn) {
      btn.addEventListener("click", (ev) => {
        // only toggle on md or smaller (when menu is in absolute mobile mode). Keep it simple: toggle submenu display
        const submenu = el.querySelector("div[id^='dropdownMenu'], .absolute.left-1/2, .absolute.top-full, .group-hover\\:block");
        if (!submenu) return;
        ev.preventDefault();
        if (submenu.style.display === "block") {
          submenu.style.display = "none";
        } else {
          submenu.style.display = "block";
        }
      });
    }
  });

  // also fix any nested group-hover hidden dropdown content that used hidden class
  document.querySelectorAll("nav .absolute").forEach(d => {
    // ensure it doesn't get clipped by overflow
    d.style.zIndex = "9999";
  });
}

/* --------------------- initialize --------------------- */
async function initAdminEditing() {
  await checkAdminSession();
  if (!isAdmin) return;

  // assign stable data-editable to existing editable elements
  document.querySelectorAll("[data-editable]").forEach(el => {
    if (!el.dataset.key) generateKey(el);
  });

  // wire existing edit buttons and image-edit inputs
  wireEditButtons();

  // attach content-box behaviors and add-block to existing boxes
  document.querySelectorAll(".content-box").forEach(box => attachContentBoxBehaviors(box));

  // wire save & logout UI
  document.getElementById("save-btn")?.addEventListener("click", async () => {
    await saveContent();
    // small visual confirmation
    const b = document.getElementById("save-btn");
    if (b) {
      b.classList.add("opacity-80");
      setTimeout(() => b.classList.remove("opacity-80"), 800);
    }
  });
  document.getElementById("logout-btn")?.addEventListener("click", () => window.location.href = "/php/logout.php");

  // fix dropdowns for visibility
  fixDropdowns();

  // load existing content from backend (after keys are set)
  await loadSiteContent();

  // re-wire (in case load changed the DOM)
  wireEditButtons();

  console.log("Admin editing initialized");
}

/* --------------------- run --------------------- */
document.addEventListener("DOMContentLoaded", initAdminEditing);
