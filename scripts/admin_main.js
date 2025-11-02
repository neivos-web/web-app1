// ======================= CONFIG / STATE =======================
let isAdmin = false;
const pendingChanges = {}; // { page: { key: { type, value } } }
const pageKey = window.location.pathname.split("/").pop() || "admin_index.php";

// ======================= SESSION CHECK =======================
async function checkAdminSession() {
  try {
    const res = await fetch("/php/check_session.php", { credentials: "include" });
    const data = await res.json();
    isAdmin = data.logged_in === true;

    if (!isAdmin) {
      window.location.href = "/admin/admin.html";
      return;
    }

    initAdminEditor();
  } catch (err) {
    console.error("Session check failed", err);
    window.location.href = "/admin/admin.html";
  }
}

// ======================= ADMIN EDITOR =======================
function initAdminEditor() {
  console.log("Admin mode enabled");

  // Show all edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.position = "relative";
    btn.style.zIndex = 50;
  });

  // Attach editing actions
  document.querySelectorAll(".edit-btn").forEach(btn => {
    const targetId = btn.dataset.target;
    const target = targetId ? document.getElementById(targetId) : btn.nextElementSibling || btn.previousElementSibling;

    if (target && target.dataset.editable !== undefined) {
      const key = target.dataset.key || `${pageKey}_${Date.now()}`;
      btn.addEventListener("click", e => {
        e.stopPropagation(); // prevent dropdown closing
        openInlineEditor(target, key);
      });
    }
  });

}

// ======================= INLINE EDITOR =======================
function openInlineEditor(el, key) {
  if (el.dataset.editing === "true") return;
  el.dataset.editing = "true";

  let inputEl;

  if (el.tagName === "IMG") {
    // === Image upload ===
    inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.accept = "image/*";

    inputEl.addEventListener("change", async () => {
      const file = inputEl.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);
      formData.append("page", pageKey);

      try {
        const res = await fetch("/php/upload_image.php", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        const data = await res.json();

        if (data.success) {
          el.src = data.url;
          pendingChanges[key] = { type: "image", value: data.url };
        } else {
          alert("Erreur lors du téléchargement de l'image.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        inputEl.remove();
        delete el.dataset.editing;
      }
    });

  } else if (el.tagName === "A") {
    // === Link text edit ===
    inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.value = el.textContent.trim();

    inputEl.addEventListener("blur", () => {
      el.textContent = inputEl.value;
      pendingChanges[key] = { type: "link", value: inputEl.value };
      cleanupEdit(el, inputEl);
    });

  } else {
    // === Text edit (h1, h2, p, div, span) ===
    const isLong = el.textContent.length > 60 || el.tagName === "P" || el.tagName === "DIV";
    inputEl = isLong ? document.createElement("textarea") : document.createElement("input");
    inputEl.value = el.textContent.trim();
    inputEl.style.width = "100%";
    inputEl.classList.add("border", "border-blue-400", "rounded", "p-1");

    inputEl.addEventListener("blur", () => {
      el.textContent = inputEl.value;
      pendingChanges[key] = { type: "text", value: inputEl.value };
      cleanupEdit(el, inputEl);
    });

    inputEl.addEventListener("keydown", e => {
      if (e.key === "Enter" && inputEl.tagName !== "TEXTAREA") inputEl.blur();
    });
  }

  el.style.display = "none";
  el.parentElement.insertBefore(inputEl, el);
  inputEl.focus();
}

function cleanupEdit(el, inputEl) {
  inputEl.remove();
  el.style.display = "";
  delete el.dataset.editing;
}

// ======================= PUBLISH CHANGES =======================
async function publishChanges() {
  if (Object.keys(pendingChanges).length === 0) {
    alert("Aucune modification à publier.");
    return;
  }

  try {
    const res = await fetch("/php/save_changes.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pageKey, changes: pendingChanges }),
      credentials: "include"
    });
    const data = await res.json();

    if (data.success) {
      alert("Modifications enregistrées !");
      Object.keys(pendingChanges).forEach(k => delete pendingChanges[k]);
    } else {
      alert("Erreur lors de la sauvegarde.");
    }
  } catch (err) {
    console.error(err);
    alert("Erreur réseau lors de la sauvegarde.");
  }
}

// ======================= LOGOUT =======================
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await fetch("/php/logout.php", { credentials: "include" });
    window.location.href = "/admin/admin.html";
  });
}

// ======================= INIT =======================
checkAdminSession();
