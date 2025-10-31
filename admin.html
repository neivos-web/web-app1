<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Outsiders - Administration</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles/style.css">
  <link rel="stylesheet" href="styles/admin.css">
  <script>
      tailwind.config = {
          theme: { extend: { colors: { 'brand-blue': '#08B3E5', 'brand-green': '#1bd7bb' } } }
      }
  </script>
</head>
<body class="bg-gray-100">

<div class="relative bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-md p-10 border border-gray-200 animate-fadeIn">
    
    <div class="flex flex-col items-center mb-8">
        <img src="images/logo_noir.png" alt="Logo Outsiders" class="w-20 mb-4">
        <h3 class="text-2xl font-extrabold text-gray-800">Espace Administrateur</h3>
        <p class="text-gray-500 text-sm mt-1">Connectez-vous pour accéder au panneau d’administration</p>
    </div>

    <form id="login-form" class="space-y-5">
        <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Nom d’utilisateur</label>
            <input type="text" id="username" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-purple outline-none transition duration-200">
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" id="password" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-purple outline-none transition duration-200">
        </div>

        <button type="submit"
            class="w-full bg-brand-blue text-white py-2.5 rounded-lg hover:bg-brand-green/90 transition font-semibold shadow-md">
            Se connecter
        </button>

        <p id="login-error" class="text-red-500 text-sm text-center mt-3"></p>

        <a href="index.html" class="block text-center mt-3 text-brand-blue hover:text-brand-green font-medium transition">
            ← Retour au site principal
        </a>
    </form>
</div>

<script type="module">
const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            window.location.href = 'admin_index.php'; // Redirect to admin panel
        } else {
            errorEl.textContent = data.message || 'Nom d’utilisateur ou mot de passe incorrect';
        }
    } catch (err) {
        errorEl.textContent = 'Erreur serveur, réessayez plus tard';
        console.error(err);
    }
});
</script>

</body>
</html>
