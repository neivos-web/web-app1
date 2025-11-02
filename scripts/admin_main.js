// ======================= CONFIG / STATE =======================
let isAdmin = false;
const pendingChanges = {}; // { element_key: { type, value } }

// ======================= SESSION CHECK =======================
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    if (!res.ok) throw new Error("Session check failed");
    const data = await res.json();
    isAdmin = data.logged_in === true;

    if (!isAdmin) {
      window.location.href = "/admin/admin.html"; // redirect if not admin
      return;
    }

    initAdminEditor(); // start editor if admin
  } catch (err) {
    console.error(err);
    window.location.href = "/admin/admin.html";
  }
}

// ======================= ADMIN EDITOR =======================
function initAdminEditor() {
  // 1️⃣ Show main menu & all dropdowns for admin
  const menu = document.getElementById("menu");
  if (menu) menu.classList.remove("hidden");

  document.querySelectorAll(".group-hover\\:block").forEach(el => {
    el.classList.remove("hidden");
    el.style.display = "block";
  });

  // Make edit buttons above everything
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.zIndex = 50;
    btn.style.position = "relative";
  });

  // 2️⃣ Attach inline editing
  document.querySelectorAll("[data-editable]").forEach(el => {
    const key = el.dataset.key || el.textContent.slice(0,20);
    const editBtn = el.parentElement.querySelector(".edit-btn") || createEditButton(el);

    editBtn.addEventListener("click", () => openInlineEditor(el, key));
  });

  // 3️⃣ Attach save button
  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) saveBtn.addEventListener("click", publishChanges);
}

// ======================= INLINE EDITOR =======================
function createEditButton(el) {
  const btn = document.createElement("button");
  btn.textContent = "✎";
  btn.className = "edit-btn";
  el.parentElement.insertBefore(btn, el);
  return btn;
}

function openInlineEditor(el, key) {
  if (el.dataset.editing === "true") return; // already editing
  el.dataset.editing = "true";

  let inputEl;

  if (el.tagName === "IMG") {
    // image upload
    inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.accept = "image/*";
  } else if (el.tagName === "A") {
    // link editing
    inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.value = el.textContent;
  } else {
    // text editing
    const longText = el.textContent.length > 50 || el.tagName === "P" || el.tagName === "DIV";
    inputEl = longText ? document.createElement("textarea") : document.createElement("input");
    inputEl.value = el.textContent;
    inputEl.style.width = "100%";
  }

  inputEl.classList.add("border", "border-blue-400", "rounded", "p-1");
  el.style.display = "none";
  el.parentElement.insertBefore(inputEl, el);

  inputEl.focus();

  inputEl.addEventListener("blur", () => saveInlineEdit(el, inputEl, key));
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && inputEl.tagName !== "TEXTAREA") inputEl.blur();
  });
}

function saveInlineEdit(el, inputEl, key) {
  let newValue = "";

  if (el.tagName === "IMG") {
    const file = inputEl.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        el.src = e.target.result;
        pendingChanges[key] = { type: "image", value: e.target.result };
      };
      reader.readAsDataURL(file);
    }
  } else if (el.tagName === "A") {
    newValue = inputEl.value;
    el.textContent = newValue;
    pendingChanges[key] = { type: "link", value: newValue };
  } else {
    newValue = inputEl.value;
    el.textContent = newValue;
    pendingChanges[key] = { type: "text", value: newValue };
  }

  el.style.display = "";
  inputEl.remove();
  delete el.dataset.editing;
}

// ======================= PUBLISH CHANGES =======================
function publishChanges() {
  if (Object.keys(pendingChanges).length === 0) {
    alert("Aucune modification à publier.");
    return;
  }

  fetch("/php/save_changes.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pendingChanges),
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Modifications publiées avec succès !");
      Object.keys(pendingChanges).forEach(k => delete pendingChanges[k]);
    } else {
      alert("Erreur lors de la publication.");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Erreur lors de la publication.");
  });
}

// ======================= LOGOUT =======================
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", async () => {
  await fetch("/php/logout.php", { credentials: "include" });
  window.location.href = "/admin/admin.html";
});

// ======================= INIT =======================
checkAdminSession();
