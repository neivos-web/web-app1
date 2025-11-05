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
      button.addEventListener("click", (e) => {
        e.stopPropagation();

        // Hide all other menus
        dropdownPairs.forEach(({ menuId: otherMenuId }) => {
          if (otherMenuId !== menuId) {
            const otherMenu = document.getElementById(otherMenuId);
            if (otherMenu) otherMenu.classList.add("hidden");
          }
        });

        // Toggle current menu
        menu.classList.toggle("hidden");
      });
    }
  });

  document.addEventListener("click", (e) => {
    dropdownPairs.forEach(({ buttonId, menuId }) => {
      const button = document.getElementById(buttonId);
      const menu = document.getElementById(menuId);
      if (button && menu && !button.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdownPairs.forEach(({ menuId }) => {
        const menu = document.getElementById(menuId);
        if (menu) menu.classList.add("hidden");
      });
    }
  });
});
