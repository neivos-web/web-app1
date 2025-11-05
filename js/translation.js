
let currentLang = localStorage.getItem('lang') || 'fr';

// Charger les traductions depuis l’API
async function loadTranslations(lang) {
  const response = await fetch(`/api/translations.php?action=get&lang=${lang}`, {
    credentials: 'same-origin'
  });
  const data = await response.json();
  applyTranslations(data);
  localStorage.setItem('lang', lang);
  currentLang = lang;
}

// Appliquer les traductions dans le DOM
function applyTranslations(translations) {
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (translations[key] !== undefined) {
      if (el.tagName.toLowerCase() === 'img') {
        el.src = translations[key];
      } else {
        el.innerHTML = translations[key];
      }
    }
  });
}

// Enregistrer une traduction modifiée
async function saveTranslation(key, lang, text, page = 'global') {
  await fetch(`/api/translations.php?action=update`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, lang, text, page })
  });
}

// Activer l’édition des éléments (admin uniquement)
function enableEditing() {
  document.querySelectorAll('[data-editable]').forEach(el => {
    const key = el.getAttribute('data-key');
    const page = document.body.dataset.page || 'global';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.classList.add('edit-btn');
    editBtn.style.marginLeft = '8px';
    editBtn.style.cursor = 'pointer';

    editBtn.addEventListener('click', async () => {
      const oldValue = el.innerHTML.trim();
      const newValue = prompt(`Modifier le texte (${currentLang.toUpperCase()}) :`, oldValue);
      if (newValue !== null && newValue !== oldValue) {
        el.innerHTML = newValue;
        await saveTranslation(key, currentLang, newValue, page);
      }
    });

    el.after(editBtn);
  });
}

// Gestion du changement de langue via <select>
document.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('language-selector');
  if (selector) {
    selector.value = currentLang;
    selector.addEventListener('change', e => loadTranslations(e.target.value));
  }

  loadTranslations(currentLang);

  // Active le mode édition si admin
  if (document.body.classList.contains('is-admin')) {
    enableEditing();
  }
});

