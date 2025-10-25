// ======= Firebase Imports =======
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ======= Firebase Configuration =======
const firebaseConfig = {
    apiKey: "AIzaSyA_ISeo6xAyEYGN2QK5NNap8jd4NqBk4hU",
    authDomain: "web-karim.firebaseapp.com",
    projectId: "web-karim",
    storageBucket: "web-karim.appspot.com",
    messagingSenderId: "1069191146645",
    appId: "1:1069191146645:web:61affcf6fbdf99c93f3f9c",
    measurementId: "G-52F19RZSNM"
};

// ======= Initialize Firebase =======
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const articlesCollection = collection(db, "articles");

// ======= DOM Elements =======
const loginView = document.getElementById('login-view');
const adminView = document.getElementById('admin-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById("logout-btn");
const articlesContainer = document.getElementById('articles-container');
const tooltip = document.getElementById("tooltip");

// ======= Auth State Management =======
onAuthStateChanged(auth, user => {
    const currentPage = window.location.pathname.split("/").pop();

    if (user) {
        console.log("Utilisateur connecté :", user.email);

        // Si on est sur la page admin.html, rediriger vers admin_index.html
        if (currentPage === "admin.html") {
            window.location.href = "admin_index.html";
        }
    } else {
        console.log("Utilisateur non connecté.");

        // Si on est sur une page protégée (admin_index.html), rediriger vers admin.html
        if (currentPage === "admin_index.html") {
            alert("Accès refusé. Veuillez vous connecter pour accéder à cette page.");
            window.location.href = "admin.html";
        } else if (loginView && adminView) {
            adminView.classList.remove('active');
            loginView.classList.add('active');
        }
    }
});

// ======= Login Form =======
if (loginForm) {
    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        loginError.textContent = "";

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirection gérée par onAuthStateChanged
        } catch (error) {
            loginError.textContent = "Email ou mot de passe incorrect.";
        }
    });
}

// ======= Logout =======
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "admin.html";
    });
}

// ======= Tooltip function =======
function showTooltip(message = "Sauvegardé avec succès") {
    if (!tooltip) return;
    tooltip.textContent = message;
    tooltip.classList.add("show");
    setTimeout(() => tooltip.classList.remove("show"), 2000);
}

// ======= Load saved editable data =======
const savedData = JSON.parse(localStorage.getItem("editableData") || "{}");

// Restore text
for (const [id, value] of Object.entries(savedData)) {
    if (id === "heroMedia") continue;
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// Restore hero media
if (savedData.heroMedia) {
    const heroContainer = document.getElementById("hero-image");
    if (heroContainer) {
        heroContainer.querySelectorAll("img, video").forEach(m => m.remove());
        const isVideo = savedData.heroMedia.startsWith("data:video");
        const media = document.createElement(isVideo ? "video" : "img");
        media.id = "hero-img";
        media.src = savedData.heroMedia;
        media.className = "w-full h-full object-cover opacity-80 transition-all duration-300";
        if (isVideo) Object.assign(media, { autoplay: true, loop: true, muted: true, playsInline: true });
        heroContainer.insertBefore(media, heroContainer.querySelector(".edit-btn"));
    }
}

// ======= Editable Text Logic =======
document.querySelectorAll("[data-editable]").forEach(el => {
    const btn = document.createElement("button");
    btn.classList.add("edit-btn", "text-blue-500", "mr-2");
    btn.innerHTML = "&#9998;";
    el.insertAdjacentElement("beforebegin", btn);

    if (el.tagName.toLowerCase() === "a") el.addEventListener("click", e => e.preventDefault());

    function activateEditing(element, button) {
        button.addEventListener("click", () => {
            const oldText = element.textContent.trim();
            const input = document.createElement("input");
            input.type = "text";
            input.value = oldText;
            input.className = "edit-input border-b border-blue-400 bg-transparent text-current";
            input.style.width = Math.min(element.offsetWidth + 30, 600) + "px";

            element.replaceWith(input);
            input.focus();

            const save = () => {
                const newText = input.value.trim() || oldText;
                const newEl = document.createElement(element.tagName.toLowerCase());
                newEl.id = element.id;
                newEl.textContent = newText;
                newEl.className = element.className;
                newEl.setAttribute("data-editable", "");

                input.replaceWith(newEl);
                newEl.insertAdjacentElement("beforebegin", button);

                savedData[element.id] = newText;
                localStorage.setItem("editableData", JSON.stringify(savedData));
                showTooltip();

                activateEditing(newEl, button);
            };

            input.addEventListener("keydown", e => e.key === "Enter" && save());
            input.addEventListener("blur", save);
        });
    }

    activateEditing(el, btn);
});

// ======= Hero Media Upload =======
const heroContainer = document.getElementById("hero-image");
if (heroContainer) {
    const heroEditBtn = heroContainer.querySelector(".edit-btn");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,video/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    if (heroEditBtn) {
        heroEditBtn.addEventListener("click", () => fileInput.click());
    }

    fileInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const url = reader.result;
            heroContainer.querySelectorAll("img, video").forEach(m => m.remove());

            const isVideo = file.type.startsWith("video/");
            const media = document.createElement(isVideo ? "video" : "img");
            media.id = "hero-img";
            media.src = url;
            media.className = "w-full h-full object-cover opacity-80 transition-all duration-300";
            if (isVideo) Object.assign(media, { autoplay: true, loop: true, muted: true, playsInline: true });
            heroContainer.insertBefore(media, heroEditBtn);

            savedData.heroMedia = url;
            localStorage.setItem("editableData", JSON.stringify(savedData));
            showTooltip("Média mis à jour !");
        };
        reader.readAsDataURL(file);
    });
}

// ======= Firestore Articles Rendering =======
function getEmbedUrl(url) {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        let videoId;
        if (urlObj.hostname.includes('youtube.com')) videoId = urlObj.searchParams.get('v');
        else if (urlObj.hostname.includes('youtu.be')) videoId = urlObj.pathname.slice(1);
        else return null;
        return `https://www.youtube.com/embed/${videoId}`;
    } catch {
        return null;
    }
}

if (articlesContainer) {
    const articlesQuery = query(articlesCollection, orderBy("createdAt", "desc"));
    onSnapshot(articlesQuery, snapshot => {
        articlesContainer.innerHTML = snapshot.empty
            ? `<p class="text-center text-gray-500">Aucun article pour le moment.</p>`
            : '';
        snapshot.forEach(doc => {
            const article = doc.data();
            const embedUrl = getEmbedUrl(article.videoUrl);
            const articleCard = document.createElement('div');
            articleCard.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row items-center gap-8';
            articleCard.innerHTML = `
                <div class="md:w-1/3 w-full">
                    <img src="${article.imageUrl}" alt="${article.title}" class="rounded-lg object-cover w-full h-48 md:h-full" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e2e8f0/333333?text=Image';">
                </div>
                <div class="md:w-2/3">
                    <h3 class="text-2xl font-bold mb-2">${article.title}</h3>
                    <p class="text-gray-600 mb-4">${article.content}</p>
                    ${embedUrl ? `<div class="aspect-w-16 aspect-h-9 my-4 rounded-lg overflow-hidden"><iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe></div>` : ''}
                    <a href="#" class="inline-block bg-brand-blue text-white px-6 py-2 rounded-md hover:opacity-90 font-semibold transition">Lire la suite</a>
                </div>
            `;
            articlesContainer.appendChild(articleCard);
        });
    });
}
