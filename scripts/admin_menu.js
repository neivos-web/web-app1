let isAdmin = false;
let saveTimer = null;
const SAVE_DEBOUNCE_MS = 900;

// Toast helper function for feedback
function toast(msg, timeout = 2600) {
  let t = document.getElementById("cms-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "cms-toast";
    Object.assign(t.style, {
      position: "fixed", right: "20px", top: "20px",
      background: "rgba(0,0,0,0.8)", color: "#fff",
      padding: "10px 14px", borderRadius: "8px",
      zIndex: 9999, fontFamily: "Inter,system-ui,Segoe UI",
      transition: "opacity .25s", opacity: 0
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._hide);
  t._hide = setTimeout(() => (t.style.opacity = "0"), timeout);
}

// Check session and initialize editor
async function checkAdminSession() {
  try {
    const r = await fetch("/php/check_session.php", { credentials: "include" });
    const j = await r.json();
    isAdmin = j.logged_in === true;
    if (isAdmin) initAdminEditor();
  } catch (e) {
    console.warn("session check failed", e);
  }
}

// Initialize admin editor (makes elements editable)
function initAdminEditor() {
  document.querySelectorAll("[data-editable]").forEach(el => {
    el.addEventListener("click", (e) => {
      if (!isAdmin) return;
      openInlineEditor(el);
    });
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.style.display = "inline-flex";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = e.target.closest('[data-editable]');
      if (target) openInlineEditor(target);
    });
  });
}

// Open inline editor (text editing)
function openInlineEditor(el) {
  if (!isAdmin) return;
  if (el.dataset.editing === "true") return;

  el.dataset.editing = "true";

  if (el.tagName === "IMG") {
    // Handle image upload for the logo
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) { delete el.dataset.editing; return; }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("page", "logo"); // You may want to send specific page info to handle on the server side

      try {
        const res = await fetch("/php/upload_image.php", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        const json = await res.json();
        if (json.success && json.url) {
          el.src = json.url; // Update the logo's source dynamically
          toast("Logo uploaded successfully — saving...");
          scheduleSave(); // Save after image upload
        } else {
          toast("Error uploading image.");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast("Network error while uploading image.");
      } finally {
        delete el.dataset.editing;
        input.remove();
      }
    });
    input.click();
    return;
  }

  // For text editing
  const input = document.createElement("input");
  input.value = el.textContent.trim();
  input.className = "border border-blue-300 rounded p-1 w-full";
  el.style.display = "none";
  el.parentElement.insertBefore(input, el);
  input.focus();

  input.addEventListener("blur", () => {
    el.textContent = input.value;
    input.remove();
    el.style.display = "";
    delete el.dataset.editing;
    scheduleSave(); // Save after text change
  });

  input.addEventListener("keydown", ev => {
    if (ev.key === "Enter" && input.tagName !== "TEXTAREA") input.blur();
  });
}

// Save content with debounce
function scheduleSave(ms = SAVE_DEBOUNCE_MS) {
  clearTimeout(saveTimer);
  toast("Changes detected — saving soon...");
  saveTimer = setTimeout(() => saveContent(), ms);
}

// Save the edited content (including images and text)
async function saveContent() {
  const page = window.location.pathname.split("/").pop();  // Get current page name like "admin_index.php" or others
  const editableElements = document.querySelectorAll("[data-editable]");
  const content = [];
  editableElements.forEach(el => {
    if (el.dataset.editable) {
      content.push({
        key: el.dataset.key,
        value: el.tagName === "IMG" ? el.src : el.textContent.trim()
      });
    }
  });

  const htmlSnapshot = document.documentElement.outerHTML; // Full page HTML to save
  
  try {
    const res = await fetch("/php/save_content.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        page, 
        content, 
        html: htmlSnapshot 
      })
    });
    const j = await res.json();
    if (j.success) {
      toast("Content saved successfully!");
    } else {
      toast("Error saving content.");
    }
  } catch (err) {
    console.error("save error", err);
    toast("Network error while saving.");
  }
}

// Check session when the page loads
document.addEventListener("DOMContentLoaded", checkAdminSession);
