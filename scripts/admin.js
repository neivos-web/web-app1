// script.js (type="module" in HTML)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// ---- Utility for robust detection of "/admin" even if hosted in subfolder ----
const normalizedPath = window.location.pathname.replace(/\/+$/, ""); // remove trailing slash
const pathSegments = normalizedPath.split("/").filter(Boolean);
const lastSegment = pathSegments.length ? pathSegments[pathSegments.length - 1] : "";
const isAdminShortUrl = lastSegment === "admin"; // true for "/admin" or "/some/subpath/admin"

// Debugging logs (remove when stable)
console.log("[script] path:", window.location.pathname, "-> lastSegment:", lastSegment);

// ---- If user visits /admin (no .html) redirect depending on auth ----
if (isAdminShortUrl) {
  console.log("[script] user visited /admin — waiting for auth state...");
  // Wait for Firebase to tell us current auth state
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log("[script] user logged in -> redirect to /admin_index.html");
      // use replace so back button doesn't loop
      window.location.replace("/admin_index.html");
    } else {
      console.log("[script] user NOT logged in -> redirect to /admin.html");
      window.location.replace("/admin.html");
    }
  });
}

// ---- For direct visits to admin.html or admin_index.html enforce access ----
onAuthStateChanged(auth, user => {
  const cur = window.location.pathname;
  console.log("[auth] current page:", cur, "user:", !!user);
  // if logged in and on login page -> go to admin_index
  if (user && cur.endsWith("/admin.html")) {
    console.log("[auth] logged in but on admin.html -> to admin_index.html");
    window.location.replace("/admin_index.html");
  }
  // if not logged in and on admin_index -> back to login
  if (!user && cur.endsWith("/admin_index.html")) {
    console.log("[auth] not logged in but on admin_index.html -> to admin.html");
    window.location.replace("/admin.html");
  }
});

// ----- Minimal login handling (only if form exists on page) ----
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const loginError = document.getElementById("login-error");
      loginError.textContent = "";
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will redirect
      } catch (err) {
        console.error("[login] error", err);
        loginError.textContent = "Email ou mot de passe incorrect.";
      }
    });
  }

  // logout button (if exists)
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.replace("/admin.html");
    });
  }
});
