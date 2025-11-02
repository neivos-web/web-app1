document.addEventListener("DOMContentLoaded", () => {
  // Select all dropdown groups
  const dropdownGroups = document.querySelectorAll(".relative.group");

  dropdownGroups.forEach(group => {
    const button = group.querySelector("button:not(.edit-btn)"); // skip edit buttons
    const menu = group.querySelector("div.absolute");

    if (button && menu) {
      // Hide dropdown by default
      menu.classList.add("hidden");

      // Toggle menu on click
      button.addEventListener("click", e => {
        e.stopPropagation();

        // Close other open dropdowns first
        dropdownGroups.forEach(otherGroup => {
          const otherMenu = otherGroup.querySelector("div.absolute");
          if (otherMenu && otherMenu !== menu) {
            otherMenu.classList.add("hidden");
          }
        });

        // Toggle the current one
        menu.classList.toggle("hidden");
      });
    }
  });

  // Close all dropdowns on click outside
  document.addEventListener("click", e => {
    dropdownGroups.forEach(group => {
      const menu = group.querySelector("div.absolute");
      if (menu && !group.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  });

  // Close all on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      dropdownGroups.forEach(group => {
        const menu = group.querySelector("div.absolute");
        if (menu) menu.classList.add("hidden");
      });
    }
  });
});
