// --- Configuration Firebase ---
const firebaseConfig = {
  apiKey: "TA_CLE_API",
  authDomain: "ton-projet.firebaseapp.com",
  databaseURL: "https://ton-projet.firebaseio.com",
  projectId: "ton-projet",
  storageBucket: "ton-projet.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "1:XXXXXXX:web:XXXXXXX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- Initialisation i18next ---
i18next.init({
  lng: 'fr',
  resources: {}
}).then(loadTranslations);

function loadTranslations() {
  const lang = i18next.language;
  db.ref(`translations/${lang}`).once('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      i18next.addResources(lang, 'translation', data);
      updateContent();
    }
  });
}

// --- Changer de langue ---
function changeLanguage(lang) {
  i18next.changeLanguage(lang);
  db.ref(`translations/${lang}`).once('value', snapshot => {
    const data = snapshot.val();
    i18next.addResources(lang, 'translation', data);
    updateContent();
  });
}

// --- Met à jour les textes ---
function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = i18next.t(el.getAttribute('data-i18n'));
  });
}
