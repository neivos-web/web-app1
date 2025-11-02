// ======================= ADMIN EDITING =======================
let isAdmin = false;

// ---------------------- Check Admin Session ----------------------
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

// ---------------------- Generate Unique Key ----------------------
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

// ---------------------- Save & Load Content ----------------------
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
    else console.log("Content saved");
}

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

// ---------------------- Edit Buttons ----------------------
function addEditButton(el) {
    if (!isAdmin || el.dataset.hasEditBtn) return;
    el.dataset.hasEditBtn = "true";

    const btn = document.createElement("button");
    btn.className = "edit-btn absolute top-0 right-0 m-1 bg-yellow-400 text-black px-1 rounded";
    btn.title = "Modifier";
    btn.innerHTML = "✏️";
    el.style.position = "relative";

    btn.addEventListener("click", async e => {
        e.stopPropagation();
        e.preventDefault();

        if (el.tagName === "IMG") {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";
            document.body.appendChild(fileInput);
            fileInput.click();
            fileInput.addEventListener("change", async ev => {
                const file = ev.target.files[0];
                if (!file) return;
                const key = generateKey(el);
                const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch(`/php/upload.php?page=${page}&key=${key}`, { method: "POST", body: fd, credentials: "include" });
                const json = await res.json();
                if (json.url) el.src = json.url;
                await saveContent();
                fileInput.remove();
            });
        } else {
            const input = el.tagName === "A" ? document.createElement("input") : document.createElement("textarea");
            input.value = el.innerText.trim();
            input.style.width = "100%";
            input.style.minHeight = "20px";
            el.replaceWith(input);
            input.focus();

            input.addEventListener("blur", async () => {
                el.innerText = input.value.trim();
                input.replaceWith(el);
                await saveContent();
            });
        }
    });

    el.appendChild(btn);
}

// ---------------------- Content Boxes ----------------------
function createNewContentBox() {
    const box = document.createElement("div");
    box.className = "content-box bg-white rounded shadow-md p-6 mt-6 relative";
    box.innerHTML = `
        <div class="content-image relative">
            <img src="https://via.placeholder.com/400x200" alt="Nouvelle image" data-editable>
        </div>
        <div class="content">
            <h2 data-editable="new_title">Nouveau titre</h2>
            <p data-editable="new_paragraph">Nouveau paragraphe...</p>
        </div>
    `;
    return box;
}

function attachContentBoxBehaviors(box) {
    box.querySelectorAll("[data-editable], img, a").forEach(addEditButton);
    addAddBlockButtonToBox(box);
}

function addAddBlockButtonToBox(box) {
    if (!isAdmin || box.querySelector(".add-block-btn")) return;

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

// ---------------------- Dropdown Toggle ----------------------
function initDropdowns() {
    const dropdowns = document.querySelectorAll("nav ul li");
    dropdowns.forEach(li => {
        const submenu = li.querySelector("ul");
        if (!submenu) return;
        if (li.querySelector(".dropdown-toggle")) return;

        submenu.style.display = "none";

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "dropdown-toggle px-2 py-1 ml-2 text-sm";
        toggleBtn.textContent = "▼";
        toggleBtn.style.background = "transparent";
        toggleBtn.style.border = "none";
        toggleBtn.style.cursor = "pointer";

        li.insertBefore(toggleBtn, submenu);

        toggleBtn.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            submenu.style.display = submenu.style.display === "block" ? "none" : "block";
        });
    });
}

// ---------------------- Initialization ----------------------
async function initAdminEditing() {
    await checkAdminSession();
    if (!isAdmin) return;

    await loadSiteContent();

    document.querySelectorAll(".content-box").forEach(attachContentBoxBehaviors);
    document.querySelectorAll("[data-editable], img, a").forEach(addEditButton);

    initDropdowns();
}

document.addEventListener("DOMContentLoaded", initAdminEditing);
