// ======================= IMPORTS =======================
import { auth, db, storage, onAuthStateChanged, signOut } from "./firebase_connect.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ======================= SELECTORS & STATE =======================
const saveBtn = document.getElementById("save-btn");
const logoutBtn = document.getElementById("logout-btn");
const mainEl = document.querySelector("main");
const CONTENT_DOC = doc(db, "siteContent", "main");

// Utility: returns NodeList of all elements with data-editable (live)
function allEditableElements() {
  return document.querySelectorAll("[data-editable]");
}

// ======================= GENERATE UNIQUE KEY =======================
function generateKey(el) {
  const path = [];
  let current = el;
  while (current && current.tagName !== "BODY") {
    const siblings = Array.from(current.parentNode.children);
    const index = siblings.indexOf(current);
    path.unshift(`${current.tagName.toLowerCase()}[${index}]`);
    current = current.parentNode;
  }
  return path.join("/");
}

// (--- your save/load/content-box functions are unchanged ---)
// I assume you already have saveSiteContent, loadSiteContent,
// buildContentBoxFromData, attachContentBoxBehaviors, showTooltip,
// showUndoNotification, ensureDeleteButtonsExist, showAddBlockButton, hideAddBlockButton, createNewContentBox, enableDragAndDrop, etc.
// Keep them as they were. Only the static/edit handling logic below is replaced.

// ======================= DELEGATED EDIT-BUTTON HANDLER =======================
// This single handler replaces the previous per-button approach and works for dynamically added buttons too.
document.addEventListener("click", async (e) => {
  // only proceed if the click came from an .edit-btn (or a child inside it)
  const btn = e.target.closest(".edit-btn");
  if (!btn) return;

  // If user not authenticated (visitor), ignore edits
  if (!auth?.currentUser) {
    // allow normal behavior for links if not admin
    return;
  }

  // Prevent other handlers from interfering with editing UI
  e.stopPropagation();
  e.preventDefault?.();

  // Find the *closest* editable target. We try multiple strategies so it works in many HTML layouts:
  // 1) If button has data-target attribute (explicit wiring) -> use that selector
  // 2) Look for an editable element inside the same container (btn.parentElement or nearest positioned ancestor)
  // 3) Walk nextElementSibling chain to find a node with [data-editable]
  // 4) fallback: search within nearest section/header/container for first [data-editable]
  let target = null;

  // (1) explicit data-target on button (optional)
  const explicit = btn.getAttribute("data-target");
  if (explicit) {
    target = document.querySelector(explicit);
  }

  // helper to find nearby container
  const container = btn.closest("section, header, footer, nav, div") || btn.parentElement || document.body;

  // (2) prefer common image area:
  if (!target) {
    // if there is an image in same container
    const imgNearby = container.querySelector("img[data-editable]");
    if (imgNearby) target = imgNearby;
  }

  // (3) search siblings forward for [data-editable]
  if (!target) {
    let s = btn.nextElementSibling;
    while (s) {
      if (s.hasAttribute && s.hasAttribute("data-editable")) { target = s; break; }
      // also consider nested editable inside sibling
      const nested = s.querySelector && s.querySelector("[data-editable]");
      if (nested) { target = nested; break; }
      s = s.nextElementSibling;
    }
  }

  // (4) fallback: search within same container for first [data-editable]
  if (!target) {
    const found = container.querySelector && container.querySelector("[data-editable]");
    if (found) target = found;
  }

  if (!target) {
    console.warn("Edit button clicked but no [data-editable] target found for", btn);
    return;
  }

  // --- If target is an image or video: open file picker & upload (image-edit behavior) ---
  if (target.tagName === "IMG" || target.tagName === "VIDEO") {
    // Create hidden file input
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = target.tagName === "IMG" ? "image/*" : "video/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    // When file picked, upload like your other upload code
    fileInput.addEventListener("change", async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) {
        fileInput.remove();
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        const baseUrl = window.location.hostname === "localhost"
          ? "http://localhost:8000/php/upload.php"
          : "/php/upload.php";

        const resp = await fetch(baseUrl, { method: "POST", body: formData });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Upload failed");

        // update DOM
        if (target.tagName === "IMG") {
          target.src = data.url;
        } else {
          // video: update source and load
          const src = target.querySelector("source");
          if (src) { src.src = data.url; target.load(); }
        }

        showTooltip("Fichier importé !");
      } catch (err) {
        console.error("Upload error:", err);
        alert("Erreur lors de l'upload du fichier.");
      } finally {
        fileInput.remove();
      }
    });

    // trigger picker
    fileInput.click();
    return;
  }

  // --- If target is a link (<a>) ---
  if (target.tagName === "A") {
    // If admin wants normal navigation, just follow the link
    // We follow normal navigation unless the admin holds ALT while clicking the ✎ button
    if (!e.altKey) {
      const href = target.getAttribute("href");
      if (href) window.location.href = href;
      return;
    }

    // ALT pressed => inline edit link text + href (keep original anchor node)
    const anchor = target;
    const wrapper = document.createElement("div");
    wrapper.className = "inline-edit-wrapper flex flex-col gap-1";

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = anchor.textContent.trim();
    textInput.placeholder = "Texte du lien";
    textInput.className = "border border-blue-400 rounded p-1 w-full";

    const hrefInput = document.createElement("input");
    hrefInput.type = "text";
    hrefInput.value = anchor.getAttribute("href") || "";
    hrefInput.placeholder = "URL du lien";
    hrefInput.className = "border border-green-400 rounded p-1 w-full";

    anchor.replaceWith(wrapper);
    wrapper.append(textInput, hrefInput);
    textInput.focus();

    const saveLink = () => {
      anchor.textContent = textInput.value.trim();
      anchor.setAttribute("href", hrefInput.value.trim());
      wrapper.replaceWith(anchor);
      showTooltip("Lien mis à jour !");
    };

    hrefInput.addEventListener("blur", saveLink);
    hrefInput.addEventListener("keydown", (ke) => { if (ke.key === "Enter") saveLink(); });
    return;
  }

  // --- Otherwise: treat as text editing (replace target with input/textarea)
  // Note: we do NOT enable contenteditable globally on nav/menu items to preserve interactivity.

  // choose input type
  const isHeading = /^h[1-6]$/i.test(target.tagName);
  const inputEl = document.createElement(isHeading ? "input" : "textarea");
  inputEl.className = "inline-edit-input border border-blue-300 rounded p-1 w-full";
  inputEl.value = target.innerText.trim();

  // preserve some inline styles/width by copying computed width (optional)
  // inputEl.style.minWidth = target.offsetWidth + "px";

  // replace node with input
  const original = target;
  original.replaceWith(inputEl);
  inputEl.focus();

  // select all for convenience
  inputEl.setSelectionRange && inputEl.setSelectionRange(0, inputEl.value.length);

  // save function (restores original element text and updates Firestore)
  const saveText = async () => {
    const newText = inputEl.value;
    original.innerText = newText || original.innerText;
    inputEl.replaceWith(original);

    // update Firestore: we update the 'other' map at the content document
    try {
      const path = generateKey(original);
      const docRef = doc(db, "siteContent", "main");
      // Use updateDoc to set nested field `other.<path>`
      const payload = {};
      payload[`other.${path}`] = newText;
      await updateDoc(docRef, payload);
      showTooltip("Contenu mis à jour !");
    } catch (err) {
      console.error("Erreur sauvegarde champ:", err);
    }
  };

  // Save on blur or Enter (for inputs)
  inputEl.addEventListener("blur", saveText, { once: true });
  inputEl.addEventListener("keydown", (ke) => {
    if (ke.key === "Enter" && isHeading) {
      ke.preventDefault();
      inputEl.blur();
    }
  });
});

// ======================= enableEditingForAdmin (slightly restricted) =======
// keeps admin buttons visible and enables editing only for non-nav elements
function enableEditingForAdmin() {
  document.querySelectorAll('.edit-btn, .delete-btn, .add-block-btn, #save-btn, #logout-btn').forEach(btn => {
    btn.style.display = 'inline-block';
  });

  // DO NOT set contenteditable on nav/menu elements so dropdowns still work
  // Instead we let the edit-button delegation above create inputs on demand.
  document.querySelectorAll('[data-editable]').forEach(el => {
    // hide actual contentEditable setting for navigation and menu items
    if (el.closest('nav') || el.closest('.nav-item-wrapper') || el.matches('nav *')) {
      // ensure nav anchors keep normal behavior
      el.setAttribute('contenteditable', 'false');
    } else {
      // optional: leave as not contenteditable; we use inputs via the edit button
      el.setAttribute('contenteditable', 'false');
    }
  });
}

// ======================= disableEditingForVisitors =======================
function disableEditingForVisitors() {
  document.querySelectorAll('.edit-btn, .delete-btn, .add-block-btn, #save-btn, #logout-btn').forEach(btn => {
    btn.style.display = 'none';
  });

  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.setAttribute('contenteditable', 'false');
  });
}

// ======================= AUTH STATE =======================
onAuthStateChanged(auth, async user => {
  // always load content first
  await loadSiteContent();

  if (user) {
    enableEditingForAdmin();
    // Note: enableEditingForStaticElements replaced by the delegation above
    showAddBlockButton();
    ensureDeleteButtonsExist();
  } else {
    disableEditingForVisitors();
  }
});

// Ensure dynamic boxes get behaviors (keep your mutation observer)
const mutationObserver = new MutationObserver(mutations => {
  for (const m of mutations) {
    for (const node of Array.from(m.addedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.classList && node.classList.contains("content-box")) {
        attachContentBoxBehaviors(node);
      } else {
        node.querySelectorAll && node.querySelectorAll(".content-box").forEach(box => attachContentBoxBehaviors(box));
      }
    }
  }
});
mutationObserver.observe(document.body, { childList: true, subtree: true });

// (rest of your helpers unchanged: escapeHtml, escapeAttr, enableDragAndDrop, etc.)
