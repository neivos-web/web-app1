// ======================= IMPORTS =======================
import { auth, db, storage, onAuthStateChanged, signOut } from "./firebase_connect.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ======================= SELECTORS & STATE =======================
const saveBtn = document.getElementById("save-btn");
const logoutBtn = document.getElementById("logout-btn");
const pageContainer = document.querySelector("main") || document.body;

let addBlockBtn = null;

// ======================= UTILITY =======================
function allEditableElements() {
  return document.querySelectorAll("[data-editable]");
}

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

function escapeHtml(str = "") {
  return ("" + str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ======================= SAVE & LOAD =======================
async function saveSiteContent() {
  const elements = document.querySelectorAll('[contenteditable], img, video, a');
  const data = [];

  elements.forEach(el => {
    const key = generateKey(el);
    const page = window.location.pathname
      .replace(/\//g, "_")
      .replace(".html", "")
      .replace(/^_+|_+$/g, "") || "general";

    let type, value;

    if (el.tagName === 'IMG') type = 'image', value = el.src;
    else if (el.tagName === 'VIDEO') type = 'video', value = el.src;
    else if (el.tagName === 'A') type = 'link', value = JSON.stringify({ text: el.innerText, href: el.href });
    else type = 'text', value = el.innerText.trim();

    data.push({ page, key, type, value });
  });

  await fetch('/php/save_content.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function loadSiteContent() {
  try {
    const response = await fetch("/php/load_content.php");
    if (!response.ok) throw new Error("Erreur lors du chargement");
    const data = await response.json();
    if (!data) return;

    const other = data.other || {};
    Object.keys(other).forEach(key => {
      const editableEls = Array.from(allEditableElements()).filter(el => !el.closest(".content-box"));
      for (const el of editableEls) {
        if (generateKey(el) === key) {
          const value = other[key] ?? "";
          switch (el.tagName) {
            case "IMG": el.src = value; break;
            case "VIDEO": const source = el.querySelector("source"); if(source){ source.src = value; el.load(); } break;
            case "A": if(typeof value==="object"){ el.textContent=value.text||""; el.href=value.href||""; } else el.textContent=value; break;
            default: el.innerText = value; break;
          }
          break;
        }
      }
    });

    const savedBoxes = data.contentBoxes || [];
    const target = pageContainer;

    if(savedBoxes.length){
      document.querySelectorAll(".content-box").forEach(b => b.remove());
    }

    savedBoxes.forEach(boxData => {
      const box = buildContentBoxFromData(boxData);
      target.appendChild(box);
    });

    document.querySelectorAll(".content-box").forEach(box => attachContentBoxBehaviors(box));
    enableEditingForStaticElements();
    setupMenuLinkEditing();
    enableDragAndDrop();

    console.log("Contenu chargé depuis le serveur");
  } catch (e) { console.error("Erreur serveur:", e); }
}

// ======================= CONTENT BOX HELPERS =======================
function buildContentBoxFromData(boxData) {
  const newBox = document.createElement("div");
  newBox.className = "content-box bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 relative";

  const imageHtml = `
    <div class="content-image flex-1">
      <input type="file" accept="image/*" class="hidden file-input">
      <button class="edit-btn image-edit absolute top-2 left-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md" title="Edit image">📷</button>
      <img src="${boxData.image || 'https://placehold.co/600x400'}" alt="Image" data-editable>
    </div>
  `;

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

function createNewContentBox() {
  const box = document.createElement("div");
  box.className = "content-box bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 relative";
  box.innerHTML = `
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
  attachContentBoxBehaviors(box);
  return box;
}

// ======================= ATTACH BEHAVIORS =======================
  function attachContentBoxBehaviors(box){
  if(box.dataset.behaviorsAttached) return;
  box.dataset.behaviorsAttached = "true";

  // SHOW DELETE BUTTON FOR ADMINS
  if(auth.currentUser){
    const delBtn = box.querySelector(".delete-btn");
    if(delBtn) delBtn.style.display = "inline-block";
  }

  // existing delete event
  const del = box.querySelector(".delete-btn");
  if(del) del.addEventListener("click", e => {
    e.stopPropagation();
    if(confirm("Supprimer ce bloc ?")){
      const parent = box.parentNode;
      const nextSibling = box.nextSibling;
      box.remove();
      showUndoNotification(parent, box, nextSibling);
    }
  });
 

  // ================= IMAGE & VIDEO UPLOAD =================
  const editBtn = box.querySelector(".image-edit");
  const fileInput = box.querySelector(".file-input");
  const img = box.querySelector("img[data-editable]");
  const video = box.querySelector("video[data-editable]");

  if(editBtn && fileInput){
    editBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async e => {
      const file = e.target.files[0]; 
      if(!file) return;

      if(img) await handleFileUpload(file, img);
      else if(video) await handleFileUpload(file, video);
    });
  }

  // ================= TEXT EDITING =================
  box.querySelectorAll("[data-editable]").forEach(el => {
    if(el.tagName==="IMG"||el.tagName==="VIDEO"||el.tagName==="A") return;

    el.addEventListener("click", ()=>{
      const orig = el.innerText;
      const input = document.createElement(el.tagName==="H2"?"input":"textarea");
      input.value = orig; 
      input.className="border border-blue-400 rounded p-1 w-full";
      el.replaceWith(input); 
      input.focus();

      const save = ()=>{ 
        el.innerText = input.value || orig; 
        input.replaceWith(el); 
      };

      input.addEventListener("blur", save);
      input.addEventListener("keydown", ev=>{
        if(ev.key==="Enter" && el.tagName==="H2"){ 
          ev.preventDefault(); 
          save(); 
        }
      });
    });
  });
}

// ======================= STATIC ELEMENTS EDITING =======================
function enableEditingForStaticElements(){
  document.querySelectorAll(".edit-btn:not(.image-edit)").forEach(btn=>{
    if(btn.dataset.behaviorsAttached) return;
    btn.dataset.behaviorsAttached="true";
    btn.addEventListener("click", async e=>{
      e.stopPropagation();
      const target = btn.nextElementSibling; if(!target || !target.hasAttribute("data-editable")) return;
      target.contentEditable="true"; target.focus();
      const r= document.createRange(); r.selectNodeContents(target);
      const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
      target.addEventListener("blur", async ()=>{ target.contentEditable="false"; await saveSiteContent(); showTooltip("Contenu mis à jour !");},{once:true});
    });
  });
}

// ======================= MENU EDIT =======================
function setupMenuLinkEditing(){
  document.querySelectorAll("a[data-editable]").forEach(a=>{
    a.addEventListener("click", e=>{
      if(!auth.currentUser) return;
      if(!e.altKey) return;
      e.preventDefault();
      const orig=a.textContent;
      const input=document.createElement("input");
      input.type="text"; input.value=orig; input.className="border border-blue-400 rounded p-1 text-sm";
      a.replaceWith(input); input.focus();
      const save=()=>{ a.textContent=input.value||orig; input.replaceWith(a); saveSiteContent(); };
      input.addEventListener("blur", save);
      input.addEventListener("keydown", ev=>{ if(ev.key==="Enter"){ ev.preventDefault(); save(); }});
    });
  });
}

// ======================= TOOLTIP =======================
function showTooltip(msg="Sauvegardé"){
  let tooltip=document.querySelector(".tooltip");
  if(!tooltip){ tooltip=document.createElement("div"); tooltip.className="tooltip"; document.body.appendChild(tooltip);}
  tooltip.textContent=msg; tooltip.classList.add("show"); setTimeout(()=>tooltip.classList.remove("show"),1800);
}

// ======================= UNDO =======================
function showUndoNotification(parent, deletedBox, nextSibling){
  const old = document.querySelector(".undo-notif"); if(old) old.remove();
  const notif=document.createElement("div");
  notif.className="undo-notif fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50";
  notif.innerHTML=`<span>Bloc supprimé</span><button class="undo-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">Annuler</button>`;
  document.body.appendChild(notif);
  notif.querySelector(".undo-btn").addEventListener("click", ()=>{
    if(nextSibling) parent.insertBefore(deletedBox,nextSibling); else parent.appendChild(deletedBox);
    attachContentBoxBehaviors(deletedBox); notif.remove(); showTooltip("Bloc restauré !");
  });
  setTimeout(()=>notif.remove(),6000);
}

// ======================= ADD BLOCK =======================
function showAddBlockButton(){
  if(addBlockBtn) return;
  addBlockBtn=document.createElement("button");
  addBlockBtn.id="add-block-admin-btn"; addBlockBtn.textContent="+ Ajouter un bloc";
  addBlockBtn.className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md shadow-md block mx-auto mt-6";
  pageContainer.appendChild(addBlockBtn);
  addBlockBtn.addEventListener("click", ()=>{
    const newBox=createNewContentBox();
    addBlockBtn.before(newBox);
    newBox.scrollIntoView({behavior:"smooth",block:"center"});
    showTooltip("Nouveau bloc ajouté !");
    enableDragAndDrop();
  });
}

function hideAddBlockButton(){ if(!addBlockBtn) return; addBlockBtn.remove(); addBlockBtn=null; }



function disableEditingForVisitors(){
  document.querySelectorAll('.edit-btn, .delete-btn, #save-btn, #logout-btn').forEach(b=>b.style.display='none');
  document.querySelectorAll('[contenteditable="true"]').forEach(el=>el.setAttribute('contenteditable','false'));
  hideAddBlockButton();
}

// ======================= DRAG & DROP =======================
function enableDragAndDrop(){
  const container=pageContainer;
  container.querySelectorAll(".content-box").forEach(box=>{
    box.setAttribute("draggable",true);
    box.addEventListener("dragstart",e=>{ e.dataTransfer.effectAllowed="move"; box.classList.add("dragging"); box.dataset.index=Array.from(container.children).indexOf(box); });
    box.addEventListener("dragover",e=>{ e.preventDefault(); });
    box.addEventListener("drop",e=>{ e.preventDefault(); const dragEl=document.querySelector(".dragging"); if(dragEl && dragEl!==box){ container.insertBefore(dragEl, box.nextSibling); } box.classList.remove("dragging"); });
    box.addEventListener("dragend",()=>box.classList.remove("dragging"));
  });
}

// ======================= FILE UPLOAD =======================

async function handleFileUpload(file, targetEl){
  const fd = new FormData();
  fd.append("file", file);
  // Page folder
  const pageFolder = window.location.pathname
    .replace(/\//g, "_")
    .replace(".html", "")
    .replace(/^_+|_+$/g, "") || "general";
  // Element key
  const key = generateKey(targetEl);
  // Determine upload URL
  let baseUrl;
  if (window.location.hostname === "127.0.0.1") baseUrl = "http://127.0.0.1:5500/php/upload.php";
  else if (window.location.hostname.endsWith("netlify.app") || window.location.hostname === "outsdrs.com") baseUrl = "https://outsdrs.com/php/upload.php";
  else baseUrl = "/php/upload.php";
  // Append both page and key
  baseUrl += `?page=${encodeURIComponent(pageFolder)}&key=${encodeURIComponent(key)}`;
  // Upload file
  const res = await fetch(baseUrl, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  // Update element
  if (targetEl.tagName === "IMG") targetEl.src = data.url;
  if (targetEl.tagName === "VIDEO") {
    const s = targetEl.querySelector("source");
    if (s) { s.src = data.url; targetEl.load(); }
  }
  showTooltip("Fichier importé !");
  await saveSiteContent();
}


// ======================= EVENT LISTENERS =======================
if(saveBtn) saveBtn.addEventListener("click",async e=>{ e.preventDefault(); await saveSiteContent(); enableEditingForStaticElements(); setupMenuLinkEditing(); });

// ================== LOGOUT (robust) ==================
async function handleLogoutClick(e) {
  e.preventDefault();
  try {
    await signOut(auth);
    console.log("User signed out");
    window.location.href = "/admin.html"; // Redirect to login
  } catch (err) {
    console.error("Erreur lors de la déconnexion:", err);
    alert("Erreur lors de la déconnexion");
  }
}

// Attach logout handler (both possible IDs)
function attachLogoutHandlerOnce() {
  const selectors = ["#logout-btn", "#logout-button"];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && !el.dataset.logoutAttached) {
      el.addEventListener("click", handleLogoutClick);
      el.dataset.logoutAttached = "true";
    }
  }
}
attachLogoutHandlerOnce();

// Fallback for dynamic buttons (appearing later)
document.addEventListener("click", (e) => {
  const target = e.target;
  if (!target) return;
  if (target.matches("#logout-btn, #logout-button") || target.closest("#logout-btn, #logout-button")) {
    handleLogoutClick(e);
  }
});

// Make sure admin mode re-attaches handler if button appears
function enableEditingForAdmin(){
  document.querySelectorAll('.edit-btn, .delete-btn, #save-btn, #logout-btn, #logout-button')
    .forEach(b=>b.style.display='inline-block');
  document.querySelectorAll('[data-editable]').forEach(el=>el.setAttribute('contenteditable','true'));
  enableEditingForStaticElements();
  setupMenuLinkEditing();
  showAddBlockButton();
  enableDragAndDrop();
  attachLogoutHandlerOnce(); // ensure logout handler bound
}

// ======================= MUTATION OBSERVER =======================
new MutationObserver(mutations=>{
  mutations.forEach(m=>{
    Array.from(m.addedNodes).forEach(node=>{
      if(!(node instanceof HTMLElement)) return;
      if(node.classList.contains("content-box")) attachContentBoxBehaviors(node);
      else node.querySelectorAll(".content-box").forEach(b=>attachContentBoxBehaviors(b));
    });
  });
}).observe(document.body,{childList:true,subtree:true});

// ======================= AUTH STATE =======================
onAuthStateChanged(auth, async user=>{
  await loadSiteContent();
  if(user) enableEditingForAdmin();
  else disableEditingForVisitors();
});
