document.addEventListener("DOMContentLoaded", () => {

  const dropdownPairs = [
    { buttonId: "dropdownButtonPortefeuille", menuId: "dropdownMenuPortefeuille" },
    { buttonId: "dropdownButtonFormations", menuId: "dropdownMenuFormations" },
    { buttonId: "dropdownButtonBlog", menuId: "dropdownMenuBlog" }, 
  ];

  dropdownPairs.forEach(({ buttonId, menuId }) => {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (button && menu) {
      // Toggle menu visibility on button click
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        // Hide all other menus before showing the current one
        dropdownPairs.forEach(({ menuId: otherMenuId }) => {
          if (otherMenuId !== menuId) {
            const otherMenu = document.getElementById(otherMenuId);
            if (otherMenu) otherMenu.classList.add("hidden");
          }
        });
        menu.classList.toggle("hidden");
      });
    }
  });

  // Close all menus when clicking outside
  document.addEventListener("click", (e) => {
    dropdownPairs.forEach(({ buttonId, menuId }) => {
      const button = document.getElementById(buttonId);
      const menu = document.getElementById(menuId);
      if (button && menu && !button.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  });

  // Close all menus when pressing Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdownPairs.forEach(({ menuId }) => {
        const menu = document.getElementById(menuId);
        if (menu) menu.classList.add("hidden");
      });
    }
  });
});
