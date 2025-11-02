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
      if (!el) el = document.querySelector(`[data-editable][data-key]`) || document.querySelector(`[data-editable]`);
      if (!el) return;

      if (!el.hasAttribute("data-editable")) el.setAttribute("data-editable", "");

      if (item.type === "image") {
        el.src = item.value;
      } else if (item.type === "link") {
        try {
          const linkData = JSON.parse(item.value);
          el.innerText = linkData.text;
          if (el.tagName === "A") el.setAttribute("href", linkData.href);
        } catch (err) { console.warn("Invalid link json:", item.value); }
      } else if (item.type === "json") {
        try { el.__json = JSON.parse(item.value); } catch (err) { el.__json = item.value; }
      } else { el.innerText = item.value; }

      if (!el.getAttribute("data-key")) el.setAttribute("data-key", key);
    });

  } catch (err) { console.error("loadSiteContent:", err); }
}

async function saveAllPendingChanges() {
  const page = pageName();
  const updates = Object.entries(pendingChanges).map(([element_key, v]) => ({
    element_key,
    type: v.type,
    value: v.value
  }));

  if (updates.length === 0) { alert("Aucune modification à publier."); return; }

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ page, updates })
    });
    if (!res.ok) throw new Error(await res.text());

    Object.keys(pendingChanges).forEach(k => {
      const el = document.querySelector(`[data-key="${k}"]`);
      if (el) el.classList.remove("admin-pending-edit");
    });
    for (const k of Object.keys(pendingChanges)) delete pendingChanges[k];

    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) {
      saveBtn.classList.add("saved");
      setTimeout(() => saveBtn.classList.remove("saved"), 600);
    }

    alert("Modifications publiées.");
  } catch (err) {
    console.error("saveAllPendingChanges:", err);
    alert("Erreur réseau lors de la sauvegarde (voir console).");
  }
}

// ======================= INLINE EDIT ATTACH =======================
function attachInlineEditButtons() {
  if (!isAdmin) return;

  // select all elements that should be editable (text, links, images, menu/submenu items)
  const editableElements = document.querySelectorAll("[data-editable]");
  editableElements.forEach(el => {
    if (el.dataset.attached === "true") return;
    el.dataset.attached = "true";

    // ensure element has data-key
    let key = el.getAttribute("data-key");
    if (!key) { key = generateKey(el); el.setAttribute("data-key", key); }

    // create small edit button
    const btn = document.createElement("button");
    btn.className = "edit-btn inline-edit px-1 py-0.5 ml-1 rounded text-white bg-yellow-500 text-xs";
    btn.textContent = "✎";
    btn.title = "Modifier";
    el.insertAdjacentElement("afterend", btn);

    // attach click behavior
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // LINK editing
      if (el.tagName === "A") {
        const currentText = el.innerText.trim();
        const currentHref = el.getAttribute("href") || "";
        const container = document.createElement("div");
        container.className = "inline-link-editor p-2 bg-white shadow rounded flex gap-2 items-center";
        const textInput = document.createElement("input"); textInput.type = "text"; textInput.value = currentText; textInput.placeholder = "Texte du lien";
        const hrefInput = document.createElement("input"); hrefInput.type = "text"; hrefInput.value = currentHref; hrefInput.placeholder = "URL (href)";
        const saveBtn = document.createElement("button"); saveBtn.textContent = "OK"; saveBtn.className = "px-2 py-1 rounded bg-brand-green text-white";
        const cancelBtn = document.createElement("button"); cancelBtn.textContent = "Annuler"; cancelBtn.className = "px-2 py-1 rounded border";
        container.append(textInput, hrefInput, saveBtn, cancelBtn);
        el.insertAdjacentElement("afterend", container);
        textInput.focus();

        saveBtn.addEventListener("click", () => {
          el.innerText = textInput.value.trim();
          el.setAttribute("href", hrefInput.value.trim());
          pendingChanges[key] = { type: "link", value: JSON.stringify({ text: el.innerText, href: hrefInput.value }) };
          setDirtyUIFor(key);
          container.remove();
        });
        cancelBtn.addEventListener("click", () => container.remove());
        return;
      }

      // IMAGE editing
      if (el.tagName === "IMG") {
        const fileInput = document.createElement("input");
        fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.style.display = "none";
        document.body.appendChild(fileInput);
        fileInput.click();
        fileInput.addEventListener("change", async (ev) => {
          const file = ev.target.files[0]; if (!file) { fileInput.remove(); return; }
          const fd = new FormData(); fd.append("file", file);
          try {
            const res = await fetch(`/php/upload.php?page=${encodeURIComponent(pageName())}&key=${encodeURIComponent(key)}`, { method: "POST", credentials: "include", body: fd });
            const json = await res.json();
            if (json?.url) { el.src = json.url; pendingChanges[key] = { type: "image", value: json.url }; setDirtyUIFor(key); }
          } catch (err) { console.error("upload error:", err); alert("Erreur d'upload"); }
          finally { fileInput.remove(); }
        }, { once: true });
        return;
      }

      // TEXT editing
      const textarea = document.createElement("textarea");
      textarea.className = "admin-inline-textarea p-2 border rounded"; textarea.value = el.innerText.trim(); textarea.style.width = "100%"; textarea.style.minHeight = "60px";
      const originalTag = el.tagName;
      const originalAttrs = {};
      Array.from(el.attributes).forEach(a => originalAttrs[a.name] = a.value);
      el.replaceWith(textarea);
      textarea.focus();

      const commit = () => {
        const newVal = textarea.value.trim();
        let restored;
        try { restored = document.createElement(originalTag); } catch { restored = document.createElement("div"); }
        restored.innerText = newVal;
        Object.keys(originalAttrs).forEach(k => restored.setAttribute(k, originalAttrs[k]));
        if (!restored.hasAttribute("data-key")) restored.setAttribute("data-key", key);
        textarea.replaceWith(restored);
        pendingChanges[key] = { type: "text", value: newVal };
        setDirtyUIFor(key);
        attachInlineEditButtons(); // reattach buttons
      };

      textarea.addEventListener("blur", commit, { once: true });
      textarea.addEventListener("keydown", (ev) => { if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") textarea.blur(); });
    });
  });
}

// ======================= DROPDOWNS =======================
function initDropdowns() {
  const menuContainers = document.querySelectorAll("nav > div, nav .relative, nav .group");
  menuContainers.forEach(item => {
    const submenu = item.querySelector("div.absolute, .absolute, ul");
    const toggle = Array.from(item.querySelectorAll("button, a")).find(el => !el.classList.contains("edit-btn") && !el.classList.contains("inline-edit"));
    if (!submenu || !toggle) return;
    submenu.classList.add("hidden");

    toggle.addEventListener("click", (e) => {
      if (toggle.tagName === "A" && (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) return;
      if (toggle.tagName === "A") e.preventDefault();
      document.querySelectorAll("nav .absolute").forEach(d => d.classList.add("hidden"));
      submenu.classList.toggle("hidden", !submenu.classList.contains("hidden"));
    });
  });

  document.addEventListener("click", (e) => { if (!e.target.closest("nav")) document.querySelectorAll("nav .absolute").forEach(d => d.classList.add("hidden")); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll("nav .absolute").forEach(d => d.classList.add("hidden")); });
}

// ======================= UTILITIES =======================
function attachUtilityButtons() {
  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) saveBtn.addEventListener("click", async (e) => { e.preventDefault(); await saveAllPendingChanges(); });
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", async (e) => { e.preventDefault(); try { await fetch("/php/logout.php", { method: "POST", credentials: "include" }); } catch {} finally { window.location.href = "/admin.html"; } });
}

// ======================= INIT =======================
async function initAdminEditing() {
  await checkAdminSession();
  setAdminButtonsVisibility(isAdmin);
  initDropdowns();
  if (!isAdmin) return;
  await loadSiteContent();
  attachInlineEditButtons();
  attachUtilityButtons();

  // style helpers
  const style = document.createElement("style");
  style.innerHTML = `
    .admin-pending-edit { outline: 2px dashed #f59e0b !important; }
    #save-btn.pulse-save { transform: scale(1.02); transition: transform .15s; }
    #save-btn.saved { background: #10b981 !important; transform: scale(1.02); }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", initAdminEditing);
