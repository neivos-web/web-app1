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

// ----- Configuration Firebase -----
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

// ----- Sélecteurs DOM -----
const loginView = document.getElementById('login-view');
const adminView = document.getElementById('admin-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// ----- État d’authentification -----
onAuthStateChanged(auth, user => {
    if (user) {
        // ✅ Si l’utilisateur est connecté, redirection vers admin_index.html
        window.location.href = "admin_index.html";
    } else {
        // Si non connecté, afficher la vue de connexion
        adminView.classList.remove('active');
        loginView.classList.add('active');
    }
});

// ----- Connexion -----
loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginError.textContent = '';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // La redirection est déjà gérée par onAuthStateChanged
    } catch (error) {
        loginError.textContent = "Email ou mot de passe incorrect.";
    }
});

// ----- Déconnexion (optionnelle si tu ajoutes un bouton dans admin_index.html) -----
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => signOut(auth));
}

// ----- Exemple : Accès à Firestore (si besoin) -----
const articlesCollection = collection(db, "articles");
const articlesQuery = query(articlesCollection, orderBy("createdAt", "desc"));
onSnapshot(articlesQuery, snapshot => {
    console.log("Articles Firestore :", snapshot.docs.map(d => d.data()));
});
