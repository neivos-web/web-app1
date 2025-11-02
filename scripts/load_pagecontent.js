// js/load_page_content.js

document.addEventListener("DOMContentLoaded", async () => {
  const pageKey = window.location.pathname.split("/").pop() || "admin_index.php";

  try {
    const res = await fetch(`/php/load_content.php?page=${encodeURIComponent(pageKey)}`, {
      credentials: "include"
    });
    const data = await res.json();

    if (data.success && data.content) {
      // Loop through all content items
      Object.entries(data.content).forEach(([key, value]) => {
        const el = document.querySelector(`[data-key="${key}"]`);
        if (el) {
          // Skip admin buttons
          if (el.classList.contains("delete-btn") || el.classList.contains("add-block-btn")) return;

          // Update content
          if (el.tagName === "IMG") el.src = value;
          else el.innerHTML = value;
        }
      });
    } else {
      console.warn("Aucun contenu trouvé pour la page :", pageKey);
    }
  } catch (err) {
    console.error("Erreur lors du chargement du contenu :", err);
  }
});
