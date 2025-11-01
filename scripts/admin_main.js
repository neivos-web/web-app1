// ======================= ADMIN EDITING =======================
let isAdmin = false;

// Check session from backend
async function checkAdminSession() {
    try {
        const res = await fetch("/php/check_session.php", { credentials: "include" });
        if (!res.ok) throw new Error("Session check failed");
        const data = await res.json();
        isAdmin = data.logged_in === true || data.logged_in === "true";
    } catch (err) {
        console.error(err);
        isAdmin = false;
    }
}

// Generate a unique key based on DOM path
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
        !el.classList.contains("add-block-btn")
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

// ======================= LOAD CONTENT PER PAGE =======================
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

// ======================= ADD / EDIT BUTTONS =======================
function addEditButton(el) {
    if (!isAdmin) return;
    if (el.dataset.hasEditBtn) return;
    el.dataset.hasEditBtn = "true";

    if (el.classList.contains("add-block-btn")) return;

    const btn = document.createElement("button");
    btn.className = "edit-btn absolute top-0 right-0 bg-blue-600 text-white rounded px-2 py-1 text-xs z-50";
    btn.textContent = "✏️";
    btn.style.cursor = "pointer";

    const parent = el.parentElement;
    if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
    parent.appendChild(btn);

    btn.addEventListener("click", async (e) => {
        e.stopPropagation();

        if (el.tagName === "IMG") {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.className = "hidden";
            document.body.appendChild(fileInput);
            fileInput.click();
            fileInput.addEventListener("change", async (ev) => {
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
            input.value = el.innerText;
            input.style.width = "100%";
            input.style.minHeight = "20px";
            el.replaceWith(input);
            input.focus();

            input.addEventListener("blur", async () => {
                if (el.tagName === "A") {
                    el.innerText = input.value;
                } else {
                    el.innerText = input.value;
                }
                input.replaceWith(el);
                await saveContent();
            });
        }
    });
}

// ======================= CONTENT BOXES / ADD BLOCK =======================
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

function attachContentBoxBehaviors(box) {
    box.querySelectorAll("[data-editable], img").forEach(addEditButton);
    addAddBlockButtonToBox(box);
}

function addAddBlockButtonToBox(box) {
    if (!isAdmin) return;
    if (box.querySelector(".add-block-btn")) return;

    const btn = document.createElement("button");
    btn.className = "add-block-btn bg-brand-blue text-white px-3 py-1 rounded-md mt-4 hover:bg-brand-green shadow-md";
    btn.textContent = "Ajouter un bloc";
    box.appendChild(btn);

    btn.addEventListener("click", () => {
        const newBox = createNewContentBox();
        box.parentNode.insertBefore(newBox, box.nextSibling);
        attachContentBoxBehaviors(newBox);
    });
}

// ======================= INITIALIZATION =======================
async function initAdminEditing() {
    await checkAdminSession();
    if (!isAdmin) return;

    await loadSiteContent();

    // Add edit buttons to all elements except scripts/styles/AddBlock
    Array.from(document.body.querySelectorAll("*")).forEach(addEditButton);

    // Attach behaviors to existing content-boxes
    document.querySelectorAll(".content-box").forEach(attachContentBoxBehaviors);

    // Add edit buttons to menu/submenu links
    document.querySelectorAll("nav a").forEach(addEditButton);
}

// Run on DOM ready
document.addEventListener("DOMContentLoaded", initAdminEditing);
