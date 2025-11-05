// admin_menu.js
// Admin inline editor + autosave for menu (saves ONLY <nav id="main-menu"> as page "menu.php")

const pageKey = "menu.php";
let isAdmin = false;
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 900;

// ---------------------- Helpers: Toast + Saved Badge -----------------------
function toast(msg, timeout = 2400) {
  let t = document.getElementById("cms-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "cms-toast";
    Object.assign(t.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: "8px",
      zIndex: 99999,
      fontFamily: "Inter, system-ui, Arial",
      transition: "opacity .18s",
      opacity: 0
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
    position: "fixed",
    right: "20px",
    bottom: "72px",
    background: "#16a34a",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    zIndex: 99999,
    opacity: 0,
    transition: "opacity .18s"
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => (el.style.opacity = "1"));
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 240);
  }, 1400);
}

// ---------------------- Session check & init ------------------------------
async function checkAdminSession() {
  try {
    const r = await fetch("/php/check_session.php", { credentials: "include" });
    const j = await r.json();
    isAdmin = j.logged_in === true;
  } catch (e) {
    console.warn("Session check failed", e);
    isAdmin = false;
  } finally {
    // always try to load the saved menu even if session check fails
    await loadMenuContent();
    if (isAdmin) initAdminMenuEditor();
  }
}
document.addEventListener("DOMContentLoaded", checkAdminSession);

// ---------------------- Load saved menu HTML ------------------------------
async function loadMenuContent() {
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(pageKey)}`, {
      credentials: "include"
    });
    const data = await res.json();
    if (!data.success) return; // nothing saved

    if (data.html) {
      // parse only the <nav> from saved html and replace existing nav#main-menu
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.html, "text/html");
      const savedNav = doc.querySelector("nav#main-menu") || doc.querySelector("#main-menu");
      if (savedNav) {
        const currentNav = document.querySelector("nav#main-menu") || document.querySelector("#main-menu");
        if (currentNav) {
          currentNav.replaceWith(savedNav);
          console.log("Menu reloaded from saved HTML");
        } else {
          // no existing nav — append to body top
          document.body.prepend(savedNav);
          console.log("Menu inserted from saved HTML");
        }
      }
    }
  } catch (err) {
    console.error("loadMenuContent error", err);
  }
}

// ---------------------- Admin UI init ------------------------------------
function initAdminMenuEditor() {
  // make sure edit buttons are visible and attached
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.zIndex = 9999;
    // ensure click doesn't bubble to nav links
    btn.addEventListener("click", ev => ev.stopPropagation());
  });

  enableInlineEditing();
}

// ---------------------- Inline editing -----------------------------------
function enableInlineEditing() {
  // connect edit buttons to nearby editable element
  document.querySelectorAll(".edit-btn").forEach(btn => {
    // If button has data-target, use it; else try sibling/next/previous element
    const tgtSel = btn.dataset.target;
    let target = tgtSel ? document.querySelector(tgtSel) : (btn.nextElementSibling || btn.previousElementSibling);
    // if the target is an anchor that contains an img, prefer the img
    if (target && target.tagName === "A" && target.querySelector("img[data-editable]")) {
      target = target.querySelector("img[data-editable]");
    }
    if (!target) return;
    // only wire if target declares data-editable
    if (target.dataset.editable === undefined) return;
    btn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); openInlineEditor(target); });
  });

  // clicking editable elements also opens editor
  document.querySelectorAll("[data-editable]").forEach(el => {
    el.addEventListener("click", ev => {
      if (!isAdmin) return;
      ev.stopPropagation();
      openInlineEditor(el);
    });
  });
}

function openInlineEditor(el) {
  if (!isAdmin) return;
  if (el.dataset.editing === "true") return;
  el.dataset.editing = "true";

  // Image editing -> upload flow
  if (el.tagName === "IMG") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.addEventListener("change", async () => {
      const f = input.files[0];
      if (!f) { delete el.dataset.editing; input.remove(); return; }
      try {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("page", pageKey);
        const res = await fetch("/php/upload_image.php", {
          method: "POST",
          body: fd,
          credentials: "include"
        });
        const j = await res.json();
        if (j.success && j.url) {
          el.src = j.url;
          scheduleSave();
          toast("Image uploadée — sauvegarde en cours...");
        } else {
          toast("Erreur upload image");
          console.error("upload_image error", j);
        }
      } catch (err) {
        toast("Erreur réseau upload");
        console.error("upload_image exception", err);
      } finally {
        delete el.dataset.editing;
        input.remove();
      }
    });
    document.body.appendChild(input);
    input.click();
    return;
  }

  // Text editing: choose textarea for longer content
  const tag = el.tagName;
  const isLong = (el.textContent || "").length > 60 || ["P", "DIV"].includes(tag);
  const input = isLong ? document.createElement("textarea") : document.createElement("input");
  input.value = (el.textContent || "").trim();
  input.className = "border border-blue-300 rounded p-1 w-full";
  input.style.minWidth = "220px";
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
    if (ev.key === "Escape") { input.value = el.textContent; input.blur(); }
  });
}

// ---------------------- Build menu snapshot & styling ----------------------
// Helper: copy computed styles into cloned nodes to produce "styled" HTML
function getStyledOuterHTML(el) {
  const clone = el.cloneNode(true);
  const origNodes = el.querySelectorAll("*");
  const cloneNodes = clone.querySelectorAll("*");
  // copy computed styles for each element
  cloneNodes.forEach((node, i) => {
    const orig = origNodes[i];
    if (!orig) return;
    try {
      const style = window.getComputedStyle(orig);
      let cssText = "";
      for (let prop of style) {
        // don't over-inflate: skip some expensive properties
        cssText += `${prop}:${style.getPropertyValue(prop)};`;
      }
      node.setAttribute("style", cssText);
    } catch (e) {
      // ignore and continue
    }
  });
  // set style on root clone
  try {
    const mainStyle = window.getComputedStyle(el);
    let mainCss = "";
    for (let prop of mainStyle) mainCss += `${prop}:${mainStyle.getPropertyValue(prop)};`;
    clone.setAttribute("style", mainCss);
  } catch (e) { /* ignore */ }

  return clone.outerHTML;
}

// ---------------------- Debounce + schedule save -----------------------------
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  toast("Changements détectés — sauvegarde bientôt...");
  saveTimer = setTimeout(() => saveMenuHTML(pageKey), ms);
}

// ---------------------- Save menu HTML -------------------------------------
async function saveMenuHTML(page = pageKey) {
  const navEl = document.querySelector("nav#main-menu") || document.querySelector("#main-menu");
  if (!navEl) {
    toast("Erreur : menu introuvable");
    console.error("No #main-menu found");
    return;
  }

  // Clone and strip admin controls for a clean save
  const clone = navEl.cloneNode(true);

  // remove admin controls (edit buttons, temporary inputs/textarea)
  clone.querySelectorAll(".edit-btn, .delete-btn, #add-global-block-btn, input, textarea").forEach(e => e.remove());

  // remove inline styles that may hide things (but keep structure)
  clone.querySelectorAll("*").forEach(el => {
    const s = window.getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") el.remove();
  });

  // Build styled html for nav only
  const styledHTML = getStyledOuterHTML(clone);

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        html: styledHTML,
        content: null
      })
    });

    const j = await res.json();
    if (!j.success) throw new Error(j.error || "Erreur inconnue lors de la sauvegarde");

    showSavedBadge();
    toast("Menu sauvegardé !");
    console.log("Saved menu:", j);
  } catch (err) {
    console.error("Erreur de sauvegarde", err);
    toast("Erreur réseau lors de la sauvegarde");
  }
}

// ---------------------- Expose manual save & reinit ------------------------
window.cms = window.cms || {};
window.cms.saveMenuNow = () => saveMenuHTML(pageKey);
window.addEventListener("cms:reinit", () => {
  if (isAdmin) initAdminMenuEditor();
});

// ---------------------- Optional: Save on unmount (page unload) -------------
window.addEventListener("beforeunload", () => {
  // flush any pending save synchronously if possible (best-effort)
  if (saveTimer) {
    clearTimeout(saveTimer);
    // attempt a synchronous send (navigator.sendBeacon fallback)
    try {
      const navEl = document.querySelector("nav#main-menu") || document.querySelector("#main-menu");
      if (navEl) {
        const clone = navEl.cloneNode(true);
       // clone.querySelectorAll(".edit-btn, .delete-btn, input, textarea").forEach(e => e.remove());
        const html = getStyledOuterHTML(clone);
        const payload = JSON.stringify({ page: pageKey, html, content: null });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json;charset=UTF-8" });
          navigator.sendBeacon("/php/save_content.php", blob);
        } else {
          // last resort: synchronous XHR (may be blocked by browser)
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/php/save_content.php", false);
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          try { xhr.send(payload); } catch (e) { /* ignore */ }
        }
      }
    } catch (e) { /* ignore */ }
  }
});
