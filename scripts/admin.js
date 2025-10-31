// ================== Firebase Imports ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// ================== Firebase Config ==================
const firebaseConfig = {
  apiKey: "AIzaSyA_ISeo6xAyEYGN2QK5NNap8jd4NqBk4hU",
  authDomain: "web-karim.firebaseapp.com",
  projectId: "web-karim",
  storageBucket: "web-karim.appspot.com",
  messagingSenderId: "1069191146645",
  appId: "1:1069191146645:web:61affcf6fbdf99c93f3f9c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ================== Page Detection ==================
const path = window.location.pathname;

// Helper: normalize path (handles both with/without .html)
function isPage(name) {
  return path === `/${name}` || path === `/${name}.html`;
}

// ================== Auth State Observer ==================
onAuthStateChanged(auth, user => {
  if (isPage("admin")) {
    // On login page
    if (user) {
      window.location.replace("/admin_index.html");
    } else {
      showPage();
    }
  } else if (isPage("admin_index")) {
    // On dashboard page
    if (!user) {
      window.location.replace("/admin.html");
    } else {
      showPage();
    }
  } else {
    showPage();
  }
});

// ================== Login ==================
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect will happen automatically by onAuthStateChanged
    } catch (err) {
      console.error(err);
      document.getElementById("login-error").textContent =
        "Email ou mot de passe incorrect.";
    }
  });
}

// ================== Logout ==================
const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.replace("/admin.html");
    } catch (err) {
      console.error("Erreur de déconnexion :", err);
    }
  });
}

// ================== Helper ==================
function showPage() {
  document.body.style.display = "block";
}
