// js/dropdown.js
document.addEventListener("DOMContentLoaded", () => {
  const dropdownGroups = document.querySelectorAll(".relative.group");

  dropdownGroups.forEach(group => {
    const button = group.querySelector("button");
    const menu = group.querySelector("div.absolute");

    if (button && menu) {
      // Cache le menu au chargement
      menu.classList.add("hidden");

      // Toggle on click
      button.addEventListener("click", e => {
        e.stopPropagation();

        // Ferme les autres menus avant d'ouvrir celui-ci
        dropdownGroups.forEach(otherGroup => {
          const otherMenu = otherGroup.querySelector("div.absolute");
          if (otherMenu && otherMenu !== menu) {
            otherMenu.classList.add("hidden");
          }
        });

        menu.classList.toggle("hidden");
      });
    }
  });

  // Ferme tout si on clique ailleurs
  document.addEventListener("click", () => {
    dropdownGroups.forEach(group => {
      const menu = group.querySelector("div.absolute");
      if (menu) menu.classList.add("hidden");
    });
  });

  // Ferme tout avec ESC
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      dropdownGroups.forEach(group => {
        const menu = group.querySelector("div.absolute");
        if (menu) menu.classList.add("hidden");
      });
    }
  });
});
