// ================== STATE ==================
let isAdmin = true; // normally fetched from PHP session
const pendingChanges = {}; // { key: { type, value } }
const uploadEndpoint = "/php/upload_image.php";
const saveEndpoint = "/php/save_content.php";

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
    if (!isAdmin) return;

    const blocks = document.querySelectorAll(".editable-block");
    blocks.forEach(block => addEditButton(block));

    document.getElementById("publish-btn").addEventListener("click", saveChanges);
});

// ================== ADD EDIT BUTTONS ==================
function addEditButton(el) {
    const btn = document.createElement("button");
    btn.innerHTML = "✏️";
    btn.className = "edit-btn absolute top-2 right-2 bg-white p-1 border rounded shadow text-xs";
    btn.style.zIndex = 10;
    btn.addEventListener("click", () => enableEdit(el));
    el.style.position = "relative";
    el.appendChild(btn);
}

// ================== ENABLE EDIT ==================
function enableEdit(el) {
    const type = el.dataset.edit;
    const key = el.dataset.key;
    let editor;

    if (type === "text" || type === "link") {
        const currentText = el.innerText.trim();
        const isLong = currentText.length > 80;

        editor = isLong ? document.createElement("textarea") : document.createElement("input");
        editor.value = type === "link" ? el.innerText.trim() : currentText;
        editor.className = "w-full p-2 border rounded bg-yellow-50";
        editor.dataset.key = key;
        editor.dataset.type = type;

        el.innerHTML = "";  
        el.appendChild(editor);

        editor.addEventListener("input", () => trackChange(key, type, editor.value));

    } else if (type === "image") {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.className = "block mt-2 text-sm";
        el.appendChild(fileInput);

        fileInput.addEventListener("change", async () => {
            const file = fileInput.files[0];
            const newPath = await uploadImage(file);
            if (newPath) {
                el.src = newPath;
                trackChange(key, "image", newPath);
            }
        });
    }

    document.getElementById("publish-btn").classList.remove("hidden");
}

// ================== TRACK CHANGES ==================
function trackChange(key, type, value) {
    pendingChanges[key] = { type, value };
    console.log("Pending changes:", pendingChanges);
}

// ================== IMAGE UPLOAD ==================
async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(uploadEndpoint, { method: "POST", body: formData });
    const data = await res.json();
    return data.success ? data.fileUrl : null;
}

// ================== SAVE ALL CHANGES ==================
async function saveChanges() {
    if (Object.keys(pendingChanges).length === 0) {
        alert("Aucune modification à enregistrer.");
        return;
    }

    const res = await fetch(saveEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingChanges)
    });

    const data = await res.json();

    if (data.success) {
        alert("Modifications enregistrées !");
        location.reload();
    } else {
        alert("Erreur lors de l’enregistrement.");
    }
}
