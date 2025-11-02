// ======================= ADMIN EDITING =======================
let isAdmin = false;

// Check admin session
async function checkAdminSession() {
    try {
        const res = await fetch("/php/check_session.php", { credentials: "include" });
        if (!res.ok) throw new Error("Session check failed");
        const data = await res.json();
        isAdmin = data.logged_in === true || data.logged_in === "true";
        if (isAdmin) document.body.classList.add("admin-mode");
    } catch (err) {
        console.error(err);
        isAdmin = false;
    }
}

// Generate unique key for element
function generateKey(el) {
    const path = [];
    let curr = el;
    while (curr && curr.tagName !== "BODY") {
        const siblings = Array.from(curr.parentNode.children);
        const index = siblings.indexOf(curr);
        path.unshift(`${curr.tagName.toLowerCase()}[${index}]`);
        curr = curr.parentNode;
    }
    return path.join("/");
}

// ======================= SAVE CONTENT =======================
async function saveContent() {
    const elements = Array.from(document.body.querySelectorAll("*")).filter(el =>
        !["SCRIPT", "STYLE"].includes(el.tagName) &&
        !el.classList.contains("add-block-btn") &&
        !el.classList.contains("edit-btn")
    );

    const data = [];
    const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";

    elements.forEach(el => {
        const key = generateKey(el);
        let type = "text";
        let value = el.innerText || "";
        if (el.tagName === "IMG") { type = "image"; value = el.src; }
        else if (el.tagName === "A") { type = "link"; value = JSON.stringify({ text: el.innerText, href: el.href }); }
        data.push({ page, key, type, value });
    });

    const res = await fetch("/php/save_content.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
    });

    if (!res.ok) console.error(await res.text());
    else console.log(" Content saved");
}

// ======================= LOAD CONTENT =======================
async function loadSiteContent() {
    const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
    try {
        const res = await fetch(`/php/load_content.php?page=${page}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load content");
        const data = await res.json();

        data.forEach(item => {
            const el = document.querySelector(`[data-editable="${item.key}"]`);
            if (!el) return;
            if (item.type === "text") el.innerText = item.value;
            else if (item.type === "image") el.src = item.value;
            else if (item.type === "link") {
                const linkData = JSON.parse(item.value);
                el.innerText = linkData.text;
                el.href = linkData.href;
            }
        });

        console.log("Content loaded for page:", page);
    } catch (err) {
        console.error(err);
    }
}

// ======================= EDIT BUTTON =======================
// function addEditButton(el) {
//     if (!isAdmin) return;
//     if (el.dataset.hasEditBtn) return;
//     el.dataset.hasEditBtn = "true";

//     const btn = document.createElement("button");
//     btn.className = "edit-btn";
//     btn.innerHTML = "✏️";
//     btn.title = "Modifier";

//     btn.addEventListener("click", async (e) => {
//         e.stopPropagation();
//         e.preventDefault();

//         if (el.tagName === "IMG") {
//             const fileInput = document.createElement("input");
//             fileInput.type = "file";
//             fileInput.accept = "image/*";
//             fileInput.style.display = "none";
//             document.body.appendChild(fileInput);
//             fileInput.click();
//             fileInput.addEventListener("change", async (ev) => {
//                 const file = ev.target.files[0];
//                 if (!file) return;
//                 const key = generateKey(el);
//                 const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
//                 const fd = new FormData();
//                 fd.append("file", file);
//                 const res = await fetch(`/php/upload.php?page=${page}&key=${key}`, { method: "POST", body: fd, credentials: "include" });
//                 const json = await res.json();
//                 if (json.url) el.src = json.url;
//                 await saveContent();
//                 fileInput.remove();
//             });
//         } else {
//             const input = el.tagName === "A" ? document.createElement("input") : document.createElement("textarea");
//             input.value = el.innerText.trim();
//             input.style.width = "100%";
//             input.style.minHeight = "20px";
//             input.style.zIndex = "9999";
//             el.replaceWith(input);
//             input.focus();

//             input.addEventListener("blur", async () => {
//                 el.innerText = input.value.trim();
//                 input.replaceWith(el);
//                 await saveContent();
//             });
//         }
//     });

//     // Insert button right next to the element
//     el.insertAdjacentElement("afterend", btn);
// }

// ======================= CONTENT BOXES =======================
function createNewContentBox() {
    const box = document.createElement("div");
    box.className = "content-box bg-white rounded shadow-md p-6 mt-6 relative";
    box.innerHTML = `
        <div class="content-image">
            <img src="https://via.placeholder.com/400x200" alt="Nouvelle image">
        </div>
        <div class="content">
            <h2 data-editable="new_title">Nouveau titre</h2>
            <p data-editable="new_paragraph">Nouveau paragraphe...</p>
        </div>
    `;
    return box;
}

// function attachContentBoxBehaviors(box) {
//     box.querySelectorAll("[data-editable], img, a").forEach(addEditButton);
//     addAddBlockButtonToBox(box);
// }

function addAddBlockButtonToBox(box) {
    if (!isAdmin) return;
    if (box.querySelector(".add-block-btn")) return;

    const btn = document.createElement("button");
    btn.className = "add-block-btn bg-blue-600 text-white px-3 py-1 rounded-md mt-4 hover:bg-blue-700 shadow-md";
    btn.textContent = "Ajouter un bloc";
    box.appendChild(btn);

    btn.addEventListener("click", () => {
        const newBox = createNewContentBox();
        box.parentNode.insertBefore(newBox, box.nextSibling);
        attachContentBoxBehaviors(newBox);
    });
}

// ======================= ATTACH EXISTING BUTTONS =======================
function attachExistingEditButtons() {
    if (!isAdmin) return;

    // For text / link edits
    document.querySelectorAll(".edit-btn").forEach(btn => {
        if (btn.dataset.attached) return;
        btn.dataset.attached = "true";

        const target = btn.previousElementSibling || btn.parentNode.querySelector("[data-editable]");
        if (!target) return;

        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (target.tagName === "A") {
                const input = document.createElement("input");
                input.value = target.innerText.trim();
                input.style.width = "100%";
                target.replaceWith(input);
                input.focus();
                input.addEventListener("blur", async () => {
                    target.innerText = input.value.trim();
                    input.replaceWith(target);
                    await saveContent();
                });
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = target.innerText.trim();
                textarea.style.width = "100%";
                textarea.style.minHeight = "20px";
                target.replaceWith(textarea);
                textarea.focus();
                textarea.addEventListener("blur", async () => {
                    target.innerText = textarea.value.trim();
                    textarea.replaceWith(target);
                    await saveContent();
                });
            }
        });
    });

    // For image edits
    document.querySelectorAll(".image-edit").forEach(btn => {
        if (btn.dataset.attached) return;
        btn.dataset.attached = "true";

        const target = btn.nextElementSibling || btn.parentNode.querySelector("img[data-editable]");
        if (!target) return;

        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";
            document.body.appendChild(fileInput);
            fileInput.click();

            fileInput.addEventListener("change", async (ev) => {
                const file = ev.target.files[0];
                if (!file) return;

                const key = generateKey(target);
                const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";

                const fd = new FormData();
                fd.append("file", file);

                const res = await fetch(`/php/upload.php?page=${page}&key=${key}`, { method: "POST", body: fd, credentials: "include" });
                const json = await res.json();
                if (json.url) target.src = json.url;

                await saveContent();
                fileInput.remove();
            });
        });
    });
}


// ======================= INITIALIZATION =======================
async function initAdminEditing() {
    await checkAdminSession();
    if (!isAdmin) return;

    await loadSiteContent();
    attachExistingEditButtons();

    //document.querySelectorAll("[data-editable], img, a").forEach(addEditButton);
    document.querySelectorAll(".content-box").forEach(attachContentBoxBehaviors);
   // document.querySelectorAll("nav a, nav ul li a").forEach(addEditButton);

    // Fix dropdown menu visibility
// Dropdown toggle on click
const dropdowns = document.querySelectorAll("nav ul li");
dropdowns.forEach(li => {
    const submenu = li.querySelector("ul");
    if (!submenu) return;

    // Hide initially
    submenu.style.display = "none";

    // Create a toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "dropdown-toggle px-2 py-1 ml-2 text-sm";
    toggleBtn.textContent = "▼"; // arrow icon
    toggleBtn.style.background = "transparent";
    toggleBtn.style.border = "none";
    toggleBtn.style.cursor = "pointer";

    // Add button to the menu item
    li.insertBefore(toggleBtn, li.querySelector("ul"));

    // Toggle submenu on click
    toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        submenu.style.display = submenu.style.display === "block" ? "none" : "block";
    });
});

}

document.addEventListener("DOMContentLoaded", initAdminEditing);
