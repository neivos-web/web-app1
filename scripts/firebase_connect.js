// ======================= firebase_auth.js =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// ======================= FIREBASE CONFIG =======================
const firebaseConfig = {
  apiKey: "AIzaSyA_ISeo6xAyEYGN2QK5NNap8jd4NqBk4hU",
  authDomain: "web-karim.firebaseapp.com",
  projectId: "web-karim",
  storageBucket: "web-karim.appspot.com",
  messagingSenderId: "1069191146645",
  appId: "1:1069191146645:web:61affcf6fbdf99c93f3f9c",
  measurementId: "G-52F19RZSNM"
};

// ======================= INIT SERVICES =======================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ======================= EXPORTS =======================
export { app, auth, db, storage, onAuthStateChanged, signOut };
