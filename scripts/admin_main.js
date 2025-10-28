// ======================= IMPORTS =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// ======================= FIREBASE CONFIG =======================
// <-- using the config you provided
const firebaseConfig = {
  apiKey: "AIzaSyA_ISeo6xAyEYGN2QK5NNap8jd4NqBk4hU",
  authDomain: "web-karim.firebaseapp.com",
  projectId: "web-karim",
  storageBucket: "web-karim.appspot.com",
  messagingSenderId: "1069191146645",
  appId: "1:1069191146645:web:61affcf6fbdf99c93f3f9c",
  measurementId: "G-52F19RZSNM"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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

    // collect content-boxes (preserve order)
    const boxes = Array.from(document.querySelectorAll(".content-box"));
    boxes.forEach(box => {
      const imageEl = box.querySelector("img");
      const titleEl = box.querySelector("h2");
      const pEls = Array.from(box.querySelectorAll("p"));
      content.contentBoxes.push({
        image: imageEl ? imageEl.src : "",
        title: titleEl ? titleEl.innerText : "",
        paragraphs: pEls.map(p => p.innerText)
      });
    });

    // collect other editable elements not inside a content-box
    const editableEls = Array.from(allEditableElements()).filter(el => !el.closest(".content-box"));
    editableEls.forEach(el => {
      const key = generateKey(el);
      if (el.tagName === "IMG") content.other[key] = el.src;
      else if (el.tagName === "VIDEO") {
        const source = el.querySelector("source");
        content.other[key] = source ? source.src : "";
      } else if (el.tagName === "A") content.other[key] = { text: el.textContent, href: el.getAttribute("href") || "" };
      else content.other[key] = el.innerText;
    });

    await setDoc(CONTENT_DOC, content);
    showTooltip("✅ Contenu publié avec succès !");
  } catch (e) {
    console.error("❌ Erreur sauvegarde :", e);
    alert("Erreur lors de la sauvegarde !");
  }
}

// ======================= LOAD CONTENT =======================
async function loadSiteContent() {
  try {
    const snap = await getDoc(CONTENT_DOC);
    if (!snap.exists()) {
      console.log("ℹ️ Aucun contenu Firestore existant (document vide).");
      return;
    }

    const data = snap.data();

    // 1) restore other elements
    const other = data.other || {};
    Object.keys(other).forEach(key => {
      // find element by matching generateKey -> brute force: iterate all editable els not in content-boxes
      const editableEls = Array.from(allEditableElements()).filter(el => !el.closest(".content-box"));
      for (const el of editableEls) {
        if (generateKey(el) === key) {
          const value = other[key];
          if (el.tagName === "IMG") el.src = value;
          else if (el.tagName === "VIDEO") {
            const source = el.querySelector("source");
            if (source) {
              source.src = value;
              el.load();
            }
          } else if (el.tagName === "A") {
            if (value && typeof value === "object") {
              el.textContent = value.text || el.textContent;
              if (value.href) el.setAttribute("href", value.href);
            } else el.textContent = value;
          } else {
            el.innerText = value;
          }
          break;
        }
      }
    });

    // 2) restore contentBoxes array (rebuild all .content-box nodes)
    const savedBoxes = data.contentBoxes || [];
    if (savedBoxes.length) {
      // Remove all existing .content-box elements inside content-section(s)
      // We'll find top-level containers (sections with class content-section) and replace their .content-box children
      // Simpler: remove all .content-box in the document, then append saved ones under the first .content-section
      const existingBoxes = Array.from(document.querySelectorAll(".content-box"));
      existingBoxes.forEach(b => b.remove());

      const firstContentSection = document.querySelector(".content-section");
      if (!firstContentSection) {
        console.warn("Aucune .content-section trouvée pour restaurer les content-boxes.");
      }

      // Append saved boxes to the first .content-section
      const target = firstContentSection || mainEl;

      savedBoxes.forEach(boxData => {
        const box = buildContentBoxFromData(boxData);
        target.appendChild(box);
      });
    }

    console.log("✅ Contenu chargé depuis Firestore");
  } catch (e) {
    console.error("❌ Erreur Firestore:", e);
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
      <img src="${escapeAttr(boxData.image || "https://placehold.co/600x400")}" alt="Image" data-editable>
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
      if (confirm("Supprimer ce bloc ?")) box.remove();
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
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("https://yourdomain.com/upload.php", {
          method: "POST",
          body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");

        const url = data.url; // uploaded file URL from cPanel

        img.src = url;
        showTooltip("Image importée");
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
  const editButtons = Array.from(document.querySelectorAll(".edit-btn")).filter(btn => !btn.classList.contains("image-edit"));

  editButtons.forEach(btn => {
    const nextEditable = btn.nextElementSibling?.hasAttribute("data-editable")
      ? btn.nextElementSibling
      : btn.parentElement?.querySelector("[data-editable]");
    if (!nextEditable) return;

    btn.style.display = "inline-flex";
    if (nextEditable.tagName === "IMG" || nextEditable.tagName === "VIDEO") {
      btn.addEventListener("click", async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = nextEditable.tagName === "IMG" ? "image/*" : "video/*";
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            // === Upload to cPanel ===
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("https://outsdrs.com/upload.php", {
              method: "POST",
              body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Upload failed");

            const url = data.url;
            if (nextEditable.tagName === "IMG") {
              nextEditable.src = url;
            } else {
              const source = nextEditable.querySelector("source");
              if (source) {
                source.src = url;
                nextEditable.load();
              }
            }
            showTooltip("✅ Fichier importé !");
          } catch (err) {
            console.error("❌ Upload error:", err);
            alert("Erreur lors de l'importation du fichier");
          }
        };
        input.click();
      });
    }else {
      // remove permanent contenteditable
      btn.addEventListener("click", () => {
        const originalText = nextEditable.innerText;
        const input = document.createElement(nextEditable.tagName === "H2" ? "input" : "textarea");
        input.value = originalText;
        input.className = "border border-blue-400 rounded p-1 w-full";
        nextEditable.replaceWith(input);
        input.focus();

        const saveEdit = () => {
          nextEditable.innerText = input.value || originalText;
          input.replaceWith(nextEditable);
        };

        input.addEventListener("blur", saveEdit);
        input.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" && nextEditable.tagName === "H2") {
            ev.preventDefault();
            saveEdit();
          }
        });
      });
    }
  });

  // show save & logout
  saveBtn.style.display = "inline-block";
  logoutBtn.style.display = "inline-block";
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

  ensureDeleteButtonsExist();
  // show/hook static elements
  enableEditingForStaticElements();

  // show add block button
  showAddBlockButton();

  // attach behaviors for existing content-boxes
  document.querySelectorAll(".content-box").forEach(box => {
    attachContentBoxBehaviors(box);
  });
}

function disableEditingForVisitors() {
  // hide edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => btn.style.display = "none");
  // remove contenteditable attributes
  allEditableElements().forEach(el => el.removeAttribute("contenteditable"));
  // hide add button
  hideAddBlockButton();
  // hide save/logout
  if (saveBtn) saveBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "none";
}

// ======================= EVENT LISTENERS =======================

if (saveBtn) {
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveSiteContent();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      alert("Déconnexion réussie !");
      window.location.reload();
    } catch (err) {
      console.error("Erreur déconnexion", err);
    }
  });
}

// ======================= AUTH STATE =======================
onAuthStateChanged(auth, async user => {
  // always load content first
  await loadSiteContent();

  if (user) {
    // allow editing
    enableEditingForAdmin();
  } else {
    // visitor mode
    disableEditingForVisitors();
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
