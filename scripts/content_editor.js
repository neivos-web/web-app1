import { db, doc, getDoc, setDoc, updateDoc } from "./firebase_connect.js";

const editButtons = document.querySelectorAll(".edit-btn");
const publishBtn = document.querySelector("#publish-btn");
let editing = false;

// --- Get current page name (e.g., index, about, contact) ---
const pageName = window.location.pathname.split("/").pop().split(".")[0] || "index";
const pageRef = doc(db, "pages", pageName);

// --- Enable editing mode ---
editButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    editing = !editing;
    document.querySelectorAll("[data-editable]").forEach(el => {
      el.contentEditable = editing;
      el.classList.toggle("editable-border", editing);
    });
  });
});

// --- Handle file uploads (to PHP) ---
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/php/upload.php", {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  if (result.url) return result.url;
  else throw new Error(result.error || "Upload failed");
}

// --- Replace images/videos on upload ---
document.querySelectorAll('input[type="file"]').forEach(input => {
  input.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      const target = document.querySelector(e.target.dataset.target);
      if (target.tagName === "IMG") target.src = url;
      else if (target.tagName === "VIDEO") {
        target.src = url;
        target.load();
      }
    } catch (err) {
      alert("Erreur upload: " + err.message);
    }
  });
});

// --- Publish button: save text content to Firestore ---
publishBtn.addEventListener("click", async () => {
  const editableElements = document.querySelectorAll("[data-editable]");
  const data = {};

  editableElements.forEach(el => {
    data[el.id] = el.innerHTML;
  });

  try {
    await setDoc(pageRef, data, { merge: true });
    alert("✅ Modifications publiées !");
  } catch (err) {
    alert("Erreur Firestore: " + err.message);
  }
});

// --- Load data from Firestore when page opens ---
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const snap = await getDoc(pageRef);
    if (snap.exists()) {
      const data = snap.data();
      Object.keys(data).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = data[id];
      });
    }
  } catch (err) {
    console.error("Erreur chargement:", err.message);
  }
});
