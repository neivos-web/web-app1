const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('https://outsdrs.com/php/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
      credentials: 'include'
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = 'https://outsdrs.com/admin_index.html';
    } else {
      errorEl.textContent = data.message || 'Nom d’utilisateur ou mot de passe incorrect';
    }
  } catch (err) {
    errorEl.textContent = 'Erreur serveur, réessayez plus tard';
    console.error(err);
  }
});
