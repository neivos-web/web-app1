// admin_menu.js
// Admin inline editor + autosave for <nav id="main-menu"> only
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

// ---------------------- Check admin session -------------------------------
async function checkAdminSession() {
  try {
    const r = await fetch("/php/check_session.php", { credentials: "include" });
    const j = await r.json();
    isAdmin = j.logged_in === true;
  } catch (e) {
    console.warn("Session check failed", e);
    isAdmin = false;
  } finally {
    await loadMenuContent();
    if (isAdmin) initAdminMenuEditor();
  }
}
document.addEventListener("DOMContentLoaded", checkAdminSession);

// ---------------------- Load saved menu -----------------------------------
async function loadMenuContent() {
  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(pageKey)}`, { credentials: "include" });
    const data = await res.json();
    if (!data.success || !data.html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.html, "text/html");
    const savedNav = doc.querySelector("nav#main-menu") || doc.querySelector("#main-menu");
    if (savedNav) {
      const currentNav = document.querySelector("nav#main-menu") || document.querySelector("#main-menu");
      if (currentNav) currentNav.replaceWith(savedNav);
      else document.body.prepend(savedNav);
      console.log("Menu loaded from saved HTML");
    }
  } catch (err) {
    console.error("loadMenuContent error", err);
  }
}

// ---------------------- Admin editor init ---------------------------------
function initAdminMenuEditor() {
  const nav = document.querySelector("nav#main-menu");
  if (!nav) return;

  // Add small absolute-position edit buttons
  nav.querySelectorAll("[data-editable]").forEach(el => {
    const btn = document.createElement("button");
    btn.className = "edit-btn";
    btn.innerText = "✎";
    Object.assign(btn.style, {
      position: "absolute",
      top: "0",
      right: "0",
      zIndex: 9999,
      fontSize: "14px",
      padding: "2px 6px",
      cursor: "pointer",
      pointerEvents: "auto" // only the button is clickable
    });
    el.style.position = "relative"; // parent for absolute button
    el.appendChild(btn);

    btn.addEventListener("click", ev => {
      ev.stopPropagation();
      openInlineEditor(el);
    });

    // allow clicking the element itself
    el.addEventListener("click", ev => {
      ev.stopPropagation();
      openInlineEditor(el);
    });
  });
}

// ---------------------- Inline editing ------------------------------------
function openInlineEditor(el) {
  if (!isAdmin || el.dataset.editing === "true") return;
  el.dataset.editing = "true";

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
    if (ev.key === "Escape") { input.value = el.textContent; input.blur(); }
  });
}

// ---------------------- Debounce + save -----------------------------------
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  toast("Changements détectés — sauvegarde bientôt...");
  saveTimer = setTimeout(() => saveMenuHTML(), ms);
}

async function saveMenuHTML() {
  const navEl = document.querySelector("nav#main-menu");
  if (!navEl) return toast("Erreur : menu introuvable");

  // clone and strip admin buttons
  const clone = navEl.cloneNode(true);
  clone.querySelectorAll(".edit-btn, input, textarea").forEach(e => e.remove());

  const styledHTML = clone.outerHTML;

  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pageKey, html: styledHTML, content: null })
    });
    const j = await res.json();
    if (!j.success) throw new Error(j.error || "Erreur inconnue");
    showSavedBadge();
    toast("Menu sauvegardé !");
  } catch (err) {
    console.error("saveMenuHTML error", err);
    toast("Erreur réseau lors de la sauvegarde");
  }
}

// ---------------------- Expose manual save -------------------------------
window.cms = window.cms || {};
window.cms.saveMenuNow = saveMenuHTML;
