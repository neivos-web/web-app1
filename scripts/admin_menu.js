let menuChanges = {};
let isAdmin = true;

// ----------------------------------------------
// ----------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await loadMenu();
    //initMenuEditing();
});

async function loadMenu() {
    const res = await fetch("/php/load_menu.php");
    const data = await res.json();

    if (!data.success) return console.warn("Menu load failed:", data.message);

    Object.entries(data.menu).forEach(([key, value]) => {
        const el = document.querySelector(`[data-key="${key}"]`);
        if (el) el.textContent = value;
    });
}

// ----------------------------------------------
// ----------------------------------------------
// function initMenuEditing() {
//     document.querySelectorAll("[data-shared='true']").forEach(el => {
//         const wrapper = el.closest(".nav-item-wrapper") || el.parentElement;
//         const editBtn = document.createElement("button");
//         editBtn.className = "edit-btn-shared hidden md:inline-block bg-yellow-400 text-xs px-1 rounded";
//         editBtn.textContent = "✎";
//         editBtn.addEventListener("click", () => makeEditable(el));
//         wrapper.prepend(editBtn);
//     });

//     if (isAdmin) {
//         document.querySelectorAll(".edit-btn-shared").forEach(btn => btn.style.display = "inline-block");
//     }
// }

// ----------------------------------------------
// ----------------------------------------------
function makeEditable(el) {
    const key = el.dataset.key;
    const originalValue = el.textContent.trim();

    const input = document.createElement(originalValue.length > 25 ? "textarea" : "input");
    input.value = originalValue;
    input.className = "border border-blue-400 bg-white text-sm px-2 py-1 rounded w-full";
    input.style.minWidth = "130px";

    el.replaceWith(input);
    input.focus();

    input.addEventListener("blur", () => {
        el.textContent = input.value.trim();
        input.replaceWith(el);
        autoSaveChange(key, input.value.trim());
    });
}

async function autoSaveChange(key, value) {
    const res = await fetch("/php/save_menu.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key, value })
    });
    const data = await res.json();
    if (!data.success) console.error("Save error:", data.error);
}
