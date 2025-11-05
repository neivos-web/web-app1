// ======================= DROPDOWN MENU (CLICK-TO-OPEN) =======================

// Select only dropdown parents (those with a <button> inside)
const dropdownParents = document.querySelectorAll('#main-menu .relative.group');

dropdownParents.forEach(parent => {
    const button = parent.querySelector('button');
    const menu = parent.querySelector('div:not(button)');

    if (!button || !menu) return; // safety check

    // Toggle dropdown on button click
    button.addEventListener('click', (e) => {
        e.stopPropagation(); // prevents closing immediately
        closeAllDropdowns(parent);
        menu.classList.toggle('hidden');
    });
});

// Close dropdowns when clicking elsewhere
document.addEventListener('click', () => closeAllDropdowns());

// Close dropdowns when pressing Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
});

// Helper to close all except current
function closeAllDropdowns(except = null) {
    dropdownParents.forEach(parent => {
        if (parent !== except) {
            const menu = parent.querySelector('div:not(button)');
            if (menu) menu.classList.add('hidden');
        }
    });
}
