// ======================= ADMIN EDITING =======================
let isAdmin = false;

// Check admin session from backend
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

// Add edit button to an element
function addEditButton(el) {
    if (!isAdmin || el.dataset.hasEditBtn) return;
    el.dataset.hasEditBtn = "true";

    const btn = document.createElement("button");
    btn.className = "edit-btn absolute top-0 right-0 bg-blue-600 text-white rounded px-2 py-1 text-xs z-50";
    btn.textContent = "✏️";
    btn.style.cursor = "pointer";

    // Ensure parent is relative
    const parent = el.parentElement;
    if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
    parent.appendChild(btn);

    btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (el.tagName === "IMG") {
            // Image upload
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
        } else if (el.tagName === "A") {
            const text = prompt("Modifier le texte du lien:", el.innerText) || el.innerText;
            const href = prompt("Modifier l'URL du lien:", el.href) || el.href;
            el.innerText = text;
            el.href = href;
            await saveContent();
        } else {
            // Text / paragraph editing
            el.contentEditable = "true";
            el.focus();
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            el.addEventListener("blur", async () => {
                el.contentEditable = "false";
                await saveContent();
            }, { once: true });
        }
    });
}

// ======================= CREATE NEW CONTENT BOX =======================
function createNewContentBox() {
    const div = document.createElement("div");
    div.className = "content-box p-4 border rounded-md mt-4 relative";
    div.dataset.key = generateKey(div);
    div.innerHTML = "<p>Nouvelle section…</p>";
    return div;
}

function attachContentBoxBehaviors(box) {
    addEditButton(box); // Make box itself editable
    box.querySelectorAll("*").forEach(addEditButton); // Make all children editable
}

// ======================= ADD BLOCK BUTTON =======================
function addAddBlockButtonToBox(box) {
    if (!isAdmin) return;
    if (box.querySelector(".add-block-btn")) return;

    const btn = document.createElement("button");
    btn.className = "add-block-btn bg-blue-600 text-white px-3 py-1 rounded-md mt-4 hover:bg-green-600 shadow-md";
    btn.textContent = "➕ Ajouter un bloc";
    box.appendChild(btn);

    btn.addEventListener("click", () => {
        const newBox = createNewContentBox();
        box.parentNode.insertBefore(newBox, box.nextSibling);
        attachContentBoxBehaviors(newBox);
        addAddBlockButtonToBox(newBox); // add button for new box too
    });
}

function attachAddBlockButtons() {
    document.querySelectorAll(".content-box").forEach(addAddBlockButtonToBox);
}

// ======================= SAVE CONTENT =======================
async function saveContent() {
    const elements = document.querySelectorAll("[data-editable]");
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

// ======================= INIT ON DOM CONTENT LOADED =======================
document.addEventListener("DOMContentLoaded", async () => {
    await checkAdminSession();
    if (!isAdmin) return;

    await loadSiteContent();
    enableEditingForStaticElements();

    // Attach behaviors & add-blocks to existing content boxes
    document.querySelectorAll(".content-box").forEach(box => {
        attachContentBoxBehaviors(box);
        addAddBlockButtonToBox(box);
    });

    // Main page-level Add Block button
    if (addBlockBtn) {
        addBlockBtn.style.display = "inline-block";
        addBlockBtn.addEventListener("click", () => {
            const box = createNewContentBox();
            pageContainer.appendChild(box);
            attachContentBoxBehaviors(box);
            addAddBlockButtonToBox(box);
        });
    }
});
