// scripts/admin_main.js (ES module ou normal script)
let currentLang = localStorage.getItem('lang') || 'fr';

// helper fetch
async function apiGetTranslations(lang) {
  const resp = await fetch(`/api/translations.php?action=get&lang=${encodeURIComponent(lang)}`, {
    credentials: 'same-origin'
  });
  return resp.json();
}

async function apiUpdateTranslation(key, lang, text) {
  const resp = await fetch(`/api/translations.php?action=update`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, lang, text })
  });
  return resp.json();
}

// Remplit DOM selon translations object
function applyTranslations(translations) {
  document.querySelectorAll('[data-editable][data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (!key) return;
    if (translations[key] !== undefined) {
      // on remplace innerHTML (si tu stockes HTML), sinon textContent
      el.innerHTML = translations[key];
    }
  });
}

// Chargement initial + when switching language
async function loadAndApply(lang) {
  try {
    const translations = await apiGetTranslations(lang);
    applyTranslations(translations);
    currentLang = lang;
    localStorage.setItem('lang', lang);
  } catch (err) {
    console.error('Load translations failed', err);
  }
}

// Gestion des boutons edit
function attachEditButtons() {
  // ton HTML place souvent le bouton juste avant l'élément => trouve le sibling
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async function (e) {
      // on suppose que l'élément éditable est le sibling suivant ou parent.nextElementSibling etc.
      // ici on cherche l'élément data-editable le plus proche après le bouton
      let el = btn.nextElementSibling;
      // si le bouton est positionné différemment, on recherche l'élément le plus proche dans le DOM
      if (!el || !el.hasAttribute || !el.hasAttribute('data-editable')) {
        // fallback: chercher le data-editable suivant dans le DOM
        el = btn.parentElement.querySelector('[data-editable]');
      }
      if (!el) {
        alert('Élément éditable introuvable.');
        return;
      }
      const key = el.getAttribute('data-key');
      if (!key) {
        alert('Aucune clé définie (data-key manquante).');
        return;
      }

      // Option 1 : prompt simple
      const oldValue = el.innerHTML;
      const newValue = prompt('Modifier le texte :', oldValue);
      if (newValue === null) return; // cancel

      // Met à jour DOM immédiatement
      el.innerHTML = newValue;

      // Envoie au serveur
      try {
        const res = await apiUpdateTranslation(key, currentLang, newValue);
        if (res.status !== 'ok') {
          console.warn('update error', res);
        }
      } catch (err) {
        console.error('Save failed', err);
      }
    });
  });
}

// language selector binding
document.getElementById('language-selector').addEventListener('change', (e) => {
  const lang = e.target.value;
  loadAndApply(lang);
});

// initial
document.addEventListener('DOMContentLoaded', () => {
  attachEditButtons();
  loadAndApply(currentLang);
});
