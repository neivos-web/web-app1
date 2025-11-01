// ======================= ADMIN MAIN =======================
let isAdmin = true; // session check is done in PHP

// ======================= HELPER FUNCTIONS =======================
function generateKey(el) {
    if (el.dataset.key) return el.dataset.key;
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

async function saveContent() {
    const elements = Array.from(document.querySelectorAll("[data-editable]"));
    const data = [];
    const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";

    elements.forEach(el => {
        let value;
        if (el.tagName === "IMG") value = el.src;
        else if (el.tagName === "A") value = JSON.stringify({ text: el.innerText, href: el.href });
        else value = el.innerText;

        data.push({
            page,
            key: generateKey(el),
            type: el.tagName.toLowerCase(),
            value
        });
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
            const el = document.querySelector(`[data-key="${item.key}"]`) || document.querySelector(`[data-editable]`);
            if (!el) return;

            if (item.type === "img") el.src = item.value;
            else if (item.type === "a") {
                const linkData = JSON.parse(item.value);
                el.innerText = linkData.text;
                el.href = linkData.href;
            } else el.innerText = item.value;
        });

        console.log("Content loaded for page:", page);
    } catch (err) { console.error(err); }
}

// ======================= BUTTONS HANDLING =======================
function addEditButton(el) {
    if (!isAdmin || el.dataset.hasEditBtn) return;
    el.dataset.hasEditBtn = "true";

    if (el.tagName === "IMG") return; // image handled separately

    const btn = document.createElement("button");
    btn.textContent = "✎";
    btn.className = "edit-btn";
    btn.style.marginLeft = "4px";
    el.insertAdjacentElement("afterend", btn);

    btn.addEventListener("click", () => {
        const input = document.createElement(el.tagName === "A" ? "input" : "textarea");
        input.value = el.innerText;
        input.style.minWidth = "50px";
        input.style.font = "inherit";
        input.style.display = "inline-block";

        el.replaceWith(input);
        input.focus();

        input.addEventListener("blur", async () => {
            el.innerText = input.value;
            input.replaceWith(el);
            await saveContent();
        });
    });
}

function addImageEditButton(el) {
    if (!isAdmin) return;
    if (el.dataset.hasImageEditBtn) return;
    el.dataset.hasImageEditBtn = "true";

    const btns = el.parentNode.querySelectorAll(".image-edit");
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.className = "hidden";
            document.body.appendChild(fileInput);
            fileInput.click();

            fileInput.addEventListener("change", async (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                const key = generateKey(el);
                const page = window.location.pathname.replace(/\//g, "_").replace(".html", "") || "general";
                const res = await fetch(`/php/upload.php?page=${page}&key=${key}`, { method: "POST", body: fd, credentials: "include" });
                const json = await res.json();
                if (json.url) el.src = json.url;
                await saveContent();
                fileInput.remove();
            });
        });
    });
}

// ======================= CONTENT BOX / ADD BLOCK =======================
function addAddBlockButton(box) {
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

function createNewContentBox() {
    const box = document.createElement("div");
    box.className = "content-box bg-white rounded shadow-md p-6 mt-6";
    box.innerHTML = `
        <div class="content-image">
            <button class="image-edit">📷</button>
            <img src="https://via.placeholder.com/400x200" data-editable alt="Nouvelle image">
        </div>
        <div class="content">
            <h2 data-editable>Nouveau titre</h2>
            <p data-editable>Nouveau paragraphe...</p>
        </div>
    `;
    return box;
}

function attachContentBoxBehaviors(box) {
    box.querySelectorAll("[data-editable]").forEach(addEditButton);
    box.querySelectorAll("img").forEach(addImageEditButton);
    addAddBlockButton(box);
}

// ======================= INITIALIZATION =======================
document.addEventListener("DOMContentLoaded", async () => {
    if (!isAdmin) return;

    await loadSiteContent();

    document.querySelectorAll("[data-editable]").forEach(addEditButton);
    document.querySelectorAll("img").forEach(addImageEditButton);
    document.querySelectorAll(".content-box").forEach(attachContentBoxBehaviors);

    // Save & Logout
    document.getElementById("save-btn")?.addEventListener("click", saveContent);
    document.getElementById("logout-btn")?.addEventListener("click", () => window.location.href = "/php/logout.php");
});
