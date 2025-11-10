document.addEventListener("DOMContentLoaded", () => {
  const dropdownPairs = [
    { buttonId: "dropdownButtonPortefeuille", menuId: "dropdownMenuPortefeuille" },
    { buttonId: "dropdownButtonFormations", menuId: "dropdownMenuFormations" },
    { buttonId: "dropdownButtonBlog", menuId: "dropdownMenuBlog" }
  ];

  dropdownPairs.forEach(({ buttonId, menuId }) => {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (button && menu) {

      // --- Empêcher la fermeture quand on scrolle ou clique dans le menu ---
      menu.addEventListener("click", (e) => e.stopPropagation());
      menu.addEventListener("wheel", (e) => e.stopPropagation());

      // --- Ouvrir/fermer au clic ---
      button.addEventListener("click", (e) => {
        e.stopPropagation();

        // Fermer les autres menus
        dropdownPairs.forEach(({ menuId: otherMenuId }) => {
          if (otherMenuId !== menuId) {
            const otherMenu = document.getElementById(otherMenuId);
            if (otherMenu) otherMenu.classList.add("hidden");
          }
        });

        // Toggle le menu actuel
        menu.classList.toggle("hidden");
      });

      // --- Ouvrir au survol (hover) ---
      button.addEventListener("mouseenter", () => {
        dropdownPairs.forEach(({ menuId: otherMenuId }) => {
          const otherMenu = document.getElementById(otherMenuId);
          if (otherMenuId !== menuId && otherMenu) {
            otherMenu.classList.add("hidden");
          }
        });
        menu.classList.remove("hidden");
      });

      // Garder le menu ouvert tant que la souris est dessus
      menu.addEventListener("mouseenter", () => {
        menu.classList.remove("hidden");
      });

      // Fermer quand la souris quitte le menu ou le bouton
      button.addEventListener("mouseleave", (e) => {
        // attendre un peu pour éviter la fermeture instantanée si on descend dans le menu
        setTimeout(() => {
          if (!menu.matches(":hover")) menu.classList.add("hidden");
        }, 150);
      });
      menu.addEventListener("mouseleave", () => {
        menu.classList.add("hidden");
      });
    }
  });

  // --- Fermer tous les menus quand on clique ailleurs ---
  document.addEventListener("click", (e) => {
    dropdownPairs.forEach(({ buttonId, menuId }) => {
      const button = document.getElementById(buttonId);
      const menu = document.getElementById(menuId);

      if (button && menu && !button.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  });

  // --- Fermer tous les menus avec la touche Échap ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdownPairs.forEach(({ menuId }) => {
        const menu = document.getElementById(menuId);
        if (menu) menu.classList.add("hidden");
      });
    }
  });
});
