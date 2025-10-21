import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// code managing admin panel for articles
// Votre configuration Firebase personnelle
const firebaseConfig = {
    apiKey: "AIzaSyA_ISeo6xAyEYGN2QK5NNap8jd4NqBk4hU",
    authDomain: "web-karim.firebaseapp.com",
    projectId: "web-karim",
    storageBucket: "web-karim.appspot.com",
    messagingSenderId: "1069191146645",
    appId: "1:1069191146645:web:61affcf6fbdf99c93f3f9c",
    measurementId: "G-52F19RZSNM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginView = document.getElementById('login-view');
const adminView = document.getElementById('admin-view');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const loginError = document.getElementById('login-error');
const articleForm = document.getElementById('article-form');
const adminArticlesList = document.getElementById('admin-articles-list');
const formTitle = document.getElementById('form-title');
const cancelEditButton = document.getElementById('cancel-edit-button');

// Form Inputs
const articleIdInput = document.getElementById('article-id');
const articleTitleInput = document.getElementById('article-title');
const articleImageInput = document.getElementById('article-image');
const articleContentInput = document.getElementById('article-content');
const articleVideoInput = document.getElementById('article-video');

// Auth State
onAuthStateChanged(auth, user => {
    if (user) {
        loginView.classList.remove('active');
        adminView.classList.add('active');
    } else {
        adminView.classList.remove('active');
        loginView.classList.add('active');
    }
});

// Login
loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginError.textContent = '';
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        loginError.textContent = "Email ou mot de passe incorrect.";
    }
});

// Logout
logoutButton.addEventListener('click', () => signOut(auth));

// Firestore Logic
const articlesCollection = collection(db, "articles");

// Render articles in admin panel
const q = query(articlesCollection, orderBy("createdAt", "desc"));
onSnapshot(q, snapshot => {
    adminArticlesList.innerHTML = snapshot.empty ? `<p class="text-center text-gray-500">Aucun article à gérer.</p>` : '';
    snapshot.forEach(docSnap => {
        const article = docSnap.data();
        const adminArticleItem = document.createElement('div');
        adminArticleItem.className = 'bg-gray-50 p-4 rounded-lg flex justify-between items-center';
        adminArticleItem.innerHTML = `
            <div>
                <p class="font-semibold">${article.title}</p>
            </div>
            <div class="flex space-x-2">
                <button data-id="${docSnap.id}" class="edit-btn p-2 text-blue-600 hover:bg-blue-100 rounded-full"><i data-lucide="edit"></i></button>
                <button data-id="${docSnap.id}" class="delete-btn p-2 text-red-600 hover:bg-red-100 rounded-full"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        adminArticlesList.appendChild(adminArticleItem);
    });
    lucide.createIcons();
});

// Save/Update Article
articleForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = articleIdInput.value;
    const articleData = {
        title: articleTitleInput.value,
        content: articleContentInput.value,
        imageUrl: articleImageInput.value,
        videoUrl: articleVideoInput.value,
    };

    if (id) {
        await updateDoc(doc(db, "articles", id), articleData);
    } else {
        articleData.createdAt = serverTimestamp();
        await addDoc(articlesCollection, articleData);
    }
    resetForm();
});

function resetForm() {
    articleForm.reset();
    articleIdInput.value = '';
    formTitle.textContent = 'Ajouter un nouvel article';
    cancelEditButton.classList.add('hidden');
}

cancelEditButton.addEventListener('click', resetForm);

// Edit/Delete handlers
adminArticlesList.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    const id = button.dataset.id;
    
    if (button.classList.contains('edit-btn')) {
        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const article = docSnap.data();
            articleIdInput.value = docSnap.id;
            articleTitleInput.value = article.title;
            articleContentInput.value = article.content;
            articleImageInput.value = article.imageUrl;
            articleVideoInput.value = article.videoUrl;
            
            formTitle.textContent = 'Modifier l\'article';
            cancelEditButton.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            articleTitleInput.focus();
        }
    } else if (button.classList.contains('delete-btn')) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            await deleteDoc(doc(db, "articles", id));
        }
    }
});

lucide.createIcons();
