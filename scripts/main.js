import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const db = getFirestore(app);

const articlesContainer = document.getElementById('articles-container');
const articlesCollection = collection(db, "articles");

function getEmbedUrl(url) {
    if (!url) return null;
    let videoId;
    try {
         const urlObj = new URL(url);
         if (urlObj.hostname.includes('youtube.com')) videoId = urlObj.searchParams.get('v');
         else if (urlObj.hostname.includes('youtu.be')) videoId = urlObj.pathname.slice(1);
         else return null;
        return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) { return null; }
}

const q = query(articlesCollection, orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
        articlesContainer.innerHTML = `<p class="text-center text-gray-500">Aucun article pour le moment.</p>`;
        return;
    }

    articlesContainer.innerHTML = '';
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
                <a href="#" class="inline-block bg-brand-purple text-white px-6 py-2 rounded-md hover:opacity-90 font-semibold transition">Lire la suite</a>
            </div>
        `;
        articlesContainer.appendChild(articleCard);
    });
});
