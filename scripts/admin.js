import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- Firebase Config ---
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

// --- Fast path detection ---
const path = window.location.pathname;

if (path === "/admin" || path === "/admin.html") {
  // Visiting login page
  if (auth.currentUser) window.location.replace("/admin_index");
}

if (path === "/admin_index" || path === "/admin_index.html") {
  // Visiting admin dashboard
  if (!auth.currentUser) window.location.replace("/admin");
}

// --- Firebase auth observer ---
onAuthStateChanged(auth, user => {
  const path = window.location.pathname;

  if (user) {
    if (path === "/admin" || path === "/admin.html") {
      window.location.replace("/admin_index");
    }
  } else {
    if (path === "/admin_index" || path === "/admin_index.html") {
      window.location.replace("/admin");
    }
  }

  // Once done, show the page
  window.showPage();
});

// --- Login ---
const loginForm = document.getElementById("login-form");
loginForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect handled automatically
  } catch (err) {
    document.getElementById("login-error").textContent =
      "Email ou mot de passe incorrect.";
  }
});

// --- Logout ---
document.getElementById("logout-button")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("/admin"); // clean redirect to login
});
