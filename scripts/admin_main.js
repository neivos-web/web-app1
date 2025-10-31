// ======================= IMPORTS =======================
import { auth, db, storage, onAuthStateChanged, signOut } from "./firebase_connect.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";



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

// ======================= SAVE FUNCTION =======================
// Saves contentBoxes array + other editable elements map in one document
async function saveSiteContent() {
  try {
    const content = {
      other: {},
      contentBoxes: []
    };

    // 1) collect content-boxes (preserve order)
    const boxes = Array.from(document.querySelectorAll(".content-box"));
    boxes.forEach(box => {
      const imageEl = box.querySelector("img");
      const titleEl = box.querySelector("h2");
      const pEls = Array.from(box.querySelectorAll("p"));
      content.contentBoxes.push({
        image: imageEl?.src || "",
        title: titleEl?.innerText || "",
        paragraphs: pEls.map(p => p.innerText || "")
      });
    });

    // 2) collect other editable elements not inside a content-box
    const editableEls = Array.from(allEditableElements()).filter(el => !el.closest(".content-box"));
    editableEls.forEach(el => {
      const key = generateKey(el);
      let value;

      switch (el.tagName) {
        case "IMG":
          value = el.src || "";
          break;
        case "VIDEO":
          const source = el.querySelector("source");
          value = source?.src || "";
          break;
        case "A":
          value = {
            text: el.textContent || "",
            href: el.getAttribute("href") || ""
          };
          break;
        default:
          // fallback: for any other element including SVG, DIV, SPAN
          value = el.innerText ?? el.textContent ?? "";
          break;
      }

      // ensure we never store undefined
      if (value === undefined) value = null;
      content.other[key] = value;
    });

    await setDoc(CONTENT_DOC, content);
    showTooltip("Contenu publié avec succès !");
  } catch (e) {
    console.error("Erreur sauvegarde :", e);
    alert("Erreur lors de la sauvegarde !");
  }
}


// ======================= LOAD CONTENT =======================
async function loadSiteContent() {
  try {
    const snap = await getDoc(CONTENT_DOC);
    if (!snap.exists()) {
      console.log("Aucun contenu Firestore existant (document vide).");
      return;
    }

    const data = snap.data();

    // 1) restore "other" elements
    const other = data.other || {};
    Object.keys(other).forEach(key => {
      const editableEls = Array.from(allEditableElements()).filter(el => !el.closest(".content-box"));
      for (const el of editableEls) {
        if (generateKey(el) === key) {
          const value = other[key] ?? "";

          switch (el.tagName) {
            case "IMG":
              el.src = value;
              break;
            case "VIDEO":
              const source = el.querySelector("source");
              if (source) {
                source.src = value;
                el.load();
              }
              break;
            case "A":
              if (value && typeof value === "object") {
                el.textContent = value.text || "";
                el.setAttribute("href", value.href || "");
              } else {
                el.textContent = value;
              }
              break;
            default:
              el.innerText = value;
              break;
          }
          break;
        }
      }
    });

    // 2) restore contentBoxes array (rebuild all .content-box nodes)
    const savedBoxes = data.contentBoxes || [];
    if (savedBoxes.length) {
      const existingBoxes = Array.from(document.querySelectorAll(".content-box"));
      existingBoxes.forEach(b => b.remove());

      const firstContentSection = document.querySelector(".content-section");
      const target = firstContentSection || mainEl;

      savedBoxes.forEach(boxData => {
        const box = buildContentBoxFromData(boxData);
        target.appendChild(box);
        attachContentBoxBehaviors(box); 
      });
      enableEditingForStaticElements(); // reattach static elements like logo
      setupMenuLinkEditing();
    }

    console.log("Contenu chargé depuis Firestore");
  } catch (e) {
    console.error("Erreur Firestore:", e);
  }
}


// Helper to build DOM content-box from saved data
function buildContentBoxFromData(boxData) {
  const newBox = document.createElement("div");
  newBox.className = "content-box bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 relative";

  // image area
  const imageHtml = `
    <div class="content-image flex-1">
      <input type="file" accept="image/*" class="hidden file-input">
      <button class="edit-btn image-edit absolute top-2 left-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md" title="Edit image">📷</button>
      <img src="${boxData.image ? boxData.image : 'https://placehold.co/600x400'}" alt="Image" data-editable>
    </div>
  `;

  // text paragraphs
  const paragraphsHtml = (boxData.paragraphs || []).map(p => `<p data-editable>${escapeHtml(p)}</p>`).join("\n") || `<p data-editable>Nouvelle description...</p>`;

  const titleText = escapeHtml(boxData.title || "Titre");

  newBox.innerHTML = `
    ${imageHtml}
    <div class="content flex-1">
      <div class="flex justify-between items-center mb-2">
        <h2 data-editable contenteditable="true" class="text-2xl font-bold">${titleText}</h2>
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center">×</button>
      </div>
      ${paragraphsHtml}
    </div>
  `;

  attachContentBoxBehaviors(newBox);
  return newBox;
}

// ======================= EDITING HELPERS =======================

// Attach behaviors (image upload button, file input, delete, mark title/paragraphs editable)
// ======================= ATTACH CONTENT BOX BEHAVIORS =======================
function attachContentBoxBehaviors(box) {
  if (box.dataset.behaviorsAttached) return;
  box.dataset.behaviorsAttached = "true";

  // DELETE BUTTON
  const del = box.querySelector(".delete-btn");
  if (del) {
    del.addEventListener("click", (e) => {
      e.stopPropagation();

      if (confirm("Supprimer ce bloc ?")) {
        // Step 1: remove from DOM, but keep a backup
        const deletedBox = box;
        const parent = box.parentNode;
        const nextSibling = box.nextSibling;
        deletedBox.remove();

        showUndoNotification(parent, deletedBox, nextSibling);
      }
    });
  }


  // IMAGE UPLOAD
  const editBtn = box.querySelector(".image-edit");
  const fileInput = box.querySelector(".file-input");
  const img = box.querySelector("img[data-editable]");
  if (editBtn && fileInput && img) {
    editBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        // === Upload to cPanel ===
        const isLocal = window.location.hostname === "localhost";
        const baseUrl = isLocal 
            ? "http://localhost:8000/php/upload.php"
            : "https://" + window.location.hostname + "/php/upload.php";

          
        const response = await fetch(baseUrl, {

            method: "POST",
            body: formData
          });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");

        const url = data.url; // uploaded file URL from cPanel

        img.src = url;
        showTooltip("Image importée");
        await saveSiteContent();
        enableEditingForStaticElements();
        setupMenuLinkEditing();

      } catch (err) {
        console.error("Erreur upload image:", err);
        alert("Erreur lors de l'importation de l'image");
      }
    });
  }

  // TEXT EDIT
  box.querySelectorAll("[data-editable]").forEach((el) => {
    if (["IMG", "VIDEO", "A"].includes(el.tagName)) return;

    el.addEventListener("click", () => {
      const originalText = el.innerText;
      const input = document.createElement(el.tagName === "H2" ? "input" : "textarea");
      input.value = originalText;
      input.className = "border border-blue-400 rounded p-1 w-full";
      el.replaceWith(input);
      input.focus();

      const saveEdit = () => {
        el.innerText = input.value || originalText;
        input.replaceWith(el);
      };

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && el.tagName === "H2") {
          ev.preventDefault();
          saveEdit();
        }
      });
    });
  });








  
}


// make existing page edit buttons behave (for static elements outside content-box)
function enableEditingForStaticElements() {
  const editButtons = document.querySelectorAll(".edit-btn:not(.image-edit)");

  editButtons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const target = btn.nextElementSibling;

      // Handle image editing differently
      if (target && target.tagName === "IMG" && target.hasAttribute("data-editable")) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";
        document.body.appendChild(input);
        input.click();

        input.addEventListener("change", async (event) => {
          const file = event.target.files[0];
          if (!file) return;

          try {
            const formData = new FormData();
            formData.append("file", file);
            const baseUrl = window.location.hostname === "localhost"
              ? "http://localhost:8000/php/upload.php"
              : "/php/upload.php";

            const response = await fetch(baseUrl, { method: "POST", body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Upload failed");

            target.src = data.url;
            showTooltip("Image mise à jour !");
          } catch (err) {
            console.error("Erreur d’upload:", err);
            alert("Impossible de mettre à jour l’image.");
          } finally {
            input.remove();
          }
        });

        return; // stop here for images
      }

      // Handle normal text elements
      if (!target || !target.hasAttribute("data-editable")) return;

      target.contentEditable = "true";
      target.focus();

      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      target.addEventListener(
        "blur",
        async () => {
          target.contentEditable = "false";
          const path = generateKey(target);
          const newValue = target.innerText.trim();
          const docRef = doc(db, "content", path);
          await updateDoc(docRef, { value: newValue });
          console.log("Updated:", path, "→", newValue);
        },
        { once: true }
      );
    });
  });
}




// ======================= UI: add block button (shown only for admin) =======================
let addBlockBtn = null;
function showAddBlockButton() {
  if (addBlockBtn) return;

  addBlockBtn = document.createElement("button");
  addBlockBtn.id = "add-block-admin-btn";
  addBlockBtn.textContent = "+ Ajouter un bloc";
  addBlockBtn.className =
    "bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md shadow-md block mx-auto mt-6";

  const referenceNode =
    mainEl.querySelector(".content-section:last-of-type") || mainEl;
  referenceNode.appendChild(addBlockBtn);

addBlockBtn.addEventListener("click", () => {
  // Create the new editable content box
  const newBox = createNewContentBox();

  // Always insert the new box right BEFORE the addBlockBtn
  const parent = addBlockBtn.parentNode;
  if (parent) {
    parent.insertBefore(newBox, addBlockBtn);
  } else {
    console.error("Parent container for Add Block button not found.");
    return;
  }

  // Reattach editing behavior for the new box
  attachContentBoxBehaviors(newBox);

  // Add a small fade-in effect (optional but nice)
  newBox.style.opacity = "0";
  newBox.style.transition = "opacity 0.3s ease-in-out";
  requestAnimationFrame(() => {
    newBox.style.opacity = "1";
  });

  // Smoothly scroll to the newly added box
  newBox.scrollIntoView({ behavior: "smooth", block: "center" });

  // Optionally show tooltip
  showTooltip("Nouveau bloc ajouté !");
});
}
function hideAddBlockButton() {
  if (!addBlockBtn) return;
  addBlockBtn.remove();
  addBlockBtn = null;
}
// Creates a new empty content box DOM node (with behaviors attached)
function createNewContentBox() {
  const newBox = document.createElement("div");
  newBox.className = "content-box bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 relative";

  newBox.innerHTML = `
    <div class="content-image flex-1">
      <input type="file" accept="image/*" class="hidden file-input">
      <button class="edit-btn image-edit absolute top-2 left-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md" title="Edit image">📷</button>
      <img src="https://placehold.co/600x400" alt="Nouvelle image" data-editable>
    </div>
    <div class="content flex-1">
      <div class="flex justify-between items-center mb-2">
        <h2 data-editable contenteditable="true" class="text-2xl font-bold">Nouveau titre</h2>
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center">×</button>
      </div>
      <p data-editable contenteditable="true" class="text-gray-700">Nouveau contenu ici. Cliquez pour modifier ce texte.</p>
    </div>
  `;

  attachContentBoxBehaviors(newBox);
  return newBox;
}

// ======================= TOOLTIP small helper =======================
function showTooltip(message = "Sauvegardé") {
  // create one if needed
  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }
  tooltip.textContent = message;
  tooltip.classList.add("show");
  setTimeout(() => tooltip.classList.remove("show"), 1800);
}

// ======================= UNDO DELETE NOTIFICATION =======================
function showUndoNotification(parent, deletedBox, nextSibling) {
  // remove old notification if it exists
  const existingNotif = document.querySelector(".undo-notif");
  if (existingNotif) existingNotif.remove();

  const notif = document.createElement("div");
  notif.className = "undo-notif fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50";
  notif.innerHTML = `
    <span>Bloc supprimé</span>
    <button class="undo-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">Annuler</button>
  `;

  document.body.appendChild(notif);

  // if user clicks undo
  notif.querySelector(".undo-btn").addEventListener("click", () => {
    // restore deleted block in same position
    if (nextSibling) parent.insertBefore(deletedBox, nextSibling);
    else parent.appendChild(deletedBox);

    attachContentBoxBehaviors(deletedBox); // reattach behaviors
    notif.remove();
    showTooltip("Bloc restauré !");
  });

  // auto-hide notification after 6 seconds
  setTimeout(() => notif.remove(), 6000);
}


function ensureDeleteButtonsExist() {
  document.querySelectorAll(".content-box").forEach(box => {
    // if box already has a delete button, skip
    if (box.querySelector(".delete-btn")) return;

    const titleRow = box.querySelector(".content h2")?.parentElement;
    if (titleRow) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "delete-btn bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center";
      deleteBtn.textContent = "×";
      deleteBtn.title = "Supprimer ce bloc";
      titleRow.appendChild(deleteBtn);
    }
  });
}

// ======================= ENABLE/DISABLE EDIT MODE =======================
function enableEditingForAdmin() {
  document.querySelectorAll('.edit-btn, .delete-btn, .add-block-btn, #save-btn, #logout-btn').forEach(btn => {
    btn.style.display = 'inline-block';
  });

  // enable editing only for non-menu elements
  document.querySelectorAll('[data-editable]').forEach(el => {
    if (!el.closest('nav') && !el.closest('.nav-item-wrapper')) {
      el.setAttribute('contenteditable', 'true');
    }
  });
}



function disableEditingForVisitors() {
  // Disable editing buttons
  document.querySelectorAll('.edit-btn, .delete-btn, .add-block-btn, #save-btn, #logout-btn').forEach(btn => {
    btn.style.display = 'none';
  });

  // Make sure all elements are not editable
  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.setAttribute('contenteditable', 'false');
  });
}

// ======================= EVENT LISTENERS =======================

if (saveBtn) {
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveSiteContent();
    enableEditingForStaticElements();
    setupMenuLinkEditing(); // for menu/logo links
  });
}

document.body.addEventListener("click", async (e) => {
  if (e.target.id === "logout-btn") {
    e.preventDefault();
    try {
      await signOut(auth);
      alert("Déconnexion réussie !");
      // Redirect to /admin (pretty URL)
      window.location.href = "/admin.html";
    } catch (err) {
      console.error("Erreur déconnexion", err);
      alert("Erreur lors de la déconnexion !");
    }
  }
});





// ======================= MENU EDIT HANDLER =======================
// Allow editing menu links only when ALT is pressed
function setupMenuLinkEditing() {
  document.querySelectorAll("a[data-editable]").forEach(a => {
    a.addEventListener("click", (e) => {
      if (auth.currentUser) {
        // normal click = navigate
        if (!e.altKey) return;
        // ALT + click = edit mode
        e.preventDefault();

        const originalText = a.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.value = originalText;
        input.className = "border border-blue-400 rounded p-1 text-sm";

        a.replaceWith(input);
        input.focus();

        const save = () => {
          a.textContent = input.value || originalText;
          input.replaceWith(a);
        };

        input.addEventListener("blur", save);
        input.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") {
            ev.preventDefault();
            save();
          }
        });
      }
    });
  });
}


// ======================= AUTH STATE =======================
const currentPath = window.location.pathname;

onAuthStateChanged(auth, async user => {
  await loadSiteContent();
  if (user) {
      

    // admin mode
    enableEditingForAdmin();
    enableEditingForStaticElements();
    setupMenuLinkEditing();
    showAddBlockButton();
    ensureDeleteButtonsExist();
  } else {
      if (currentPath === "/admin_index" || currentPath === "/admin_index.html") {
        window.location.href = "/admin.html";
      }


    // visitor mode
    disableEditingForVisitors();
    hideAddBlockButton(); // 
  }
});


// ensure that any dynamic .content-box created by your other scripts also get behaviors
// (covers cases where other code adds boxes after DOMContentLoaded)
const mutationObserver = new MutationObserver(mutations => {
  for (const m of mutations) {
    for (const node of Array.from(m.addedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.classList && node.classList.contains("content-box")) {
        attachContentBoxBehaviors(node);
      } else {
        // if a subtree contains content-boxes, attach their behaviors
        node.querySelectorAll && node.querySelectorAll(".content-box").forEach(box => attachContentBoxBehaviors(box));
      }
    }
  }
});
mutationObserver.observe(document.body, { childList: true, subtree: true });

// helper: escape HTML for safe injection
function escapeHtml(str = "") {
  return ("" + str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(str = "") {
  return ("" + str).replace(/"/g, "&quot;");
}
function enableDragAndDrop() {
  const container = document.querySelector("main") || document.body;
  let dragSrcEl = null;

  container.querySelectorAll(".content-box").forEach(box => {
    box.setAttribute("draggable", true);

    box.addEventListener("dragstart", (e) => {
      dragSrcEl = box;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", box.outerHTML);
      box.classList.add("dragging");
    });

    box.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    box.addEventListener("drop", (e) => {
      e.stopPropagation();
      if (dragSrcEl !== box) {
        container.insertBefore(dragSrcEl, box.nextSibling);
      }
      box.classList.remove("dragging");
    });

    box.addEventListener("dragend", () => {
      box.classList.remove("dragging");
    });
  });
}
