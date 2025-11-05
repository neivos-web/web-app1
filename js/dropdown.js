document.addEventListener("DOMContentLoaded", () => {
  const dropdownGroups = document.querySelectorAll(".relative.group");

  dropdownGroups.forEach(group => {
    const button = group.querySelector("button"); // 
    const menu = group.querySelector("div.absolute");

    if (button && menu) {
      menu.classList.add("hidden");

      button.addEventListener("click", e => {
        e.stopPropagation();

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

  document.addEventListener("click", e => {
    dropdownGroups.forEach(group => {
      const menu = group.querySelector("div.absolute");
      if (menu && !group.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      dropdownGroups.forEach(group => {
        const menu = group.querySelector("div.absolute");
        if (menu) menu.classList.add("hidden");
      });
    }
  });
});
