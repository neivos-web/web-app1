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

      // Empêcher la fermeture du menu quand on clique ou qu'on scrolle à l'intérieur
      menu.addEventListener("click", (e) => e.stopPropagation());
      menu.addEventListener("wheel", (e) => e.stopPropagation());

      // Ouvrir/fermer le menu correspondant
      button.addEventListener("click", (e) => {
        e.stopPropagation();

        // Fermer les autres menus
        dropdownPairs.forEach(({ menuId: otherMenuId }) => {
          if (otherMenuId !== menuId) {
            const otherMenu = document.getElementById(otherMenuId);
            if (otherMenu) otherMenu.classList.add("hidden");
          }
        });

        // Basculer l'affichage du menu actuel
        menu.classList.toggle("hidden");
      });
    }
  });

  // Fermer tous les menus si clic à l’extérieur
  document.addEventListener("click", (e) => {
    dropdownPairs.forEach(({ buttonId, menuId }) => {
      const button = document.getElementById(buttonId);
      const menu = document.getElementById(menuId);

      if (button && menu && !button.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  });

  // Fermer les menus avec la touche Échap
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdownPairs.forEach(({ menuId }) => {
        const menu = document.getElementById(menuId);
        if (menu) menu.classList.add("hidden");
      });
    }
  });
});
