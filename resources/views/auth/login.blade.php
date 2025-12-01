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

  <script>
    tailwind.config = {
      theme: { extend: { colors: { 'brand-blue': '#08B3E5', 'brand-green': '#1bd7bb' } } }
    }
  </script>
  <style>
/* ====== Authentification administrateur  ====== */

    /* body */
    body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #08B3E5 0%, #2AF598 100%);
    min-height: 100vh;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    }

    /* Formulaire de connexion */
    .relative {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
    animation: fadeIn 0.6s ease-in-out;
    border: 1px solid #e5e7eb;
    }

    /* Logo et titre */
    .relative img {
    display: block;
    margin: 0 auto 1rem;
    width: 80px;
    }

    .relative h3 {
    text-align: center;
    font-weight: 800;
    color:#2b2929;
    margin-bottom: 0.25rem;
    }

    .relative p {
    text-align: center;
    color: #6b7280;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    }

    /* Champs du formulaire */
    form label {
    display: block;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
    }

    form input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    }

    form input:focus {
    border-color: #08B3E5;
    box-shadow: 0 0 0 3px rgba(8, 179, 229, 0.2);
    outline: none;
    }

    /* Bouton de connexion */
    form button {
    width: 100%;
    background-color: #08B3E5;
    color: #fff;
    font-weight: 600;
    border: none;
    border-radius: 0.5rem;
    padding: 0.7rem;
    margin-top: 0.5rem;
    cursor: pointer;
    transition: background 0.3s ease;
    box-shadow: 0 3px 10px rgba(8, 179, 229, 0.2);
    }

    form button:hover {
    background-color: #06a4cc;
    }

    /* Message d’erreur */
    #login-error {
    color: #ef4444;
    font-size: 0.85rem;
    text-align: center;
    margin-top: 0.5rem;
    }

    /* Lien retour */
    .relative a {
    display: block;
    text-align: center;
    margin-top: 1rem;
    color: #08B3E5;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.3s ease;
    }

    .relative a:hover {
    color: #1bd7bb;
    }

    /* Animation d’apparition */
    @keyframes fadeIn {
    from {
    opacity: 0;
    transform: translateY(15px);
    }
    to {
    opacity: 1;
    transform: translateY(0);
    }
}


#login-view,
#admin-view {
  display: none;
}

  </style>
</head>

<body class="bg-gray-100 min-h-screen flex items-center justify-center">

  <div class="relative bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-md p-10 border border-gray-200">
    <div class="flex flex-col items-center mb-8">
      <img src="uploads/logo_noir.png" alt="Logo Outsiders" class="w-20 mb-4">
      <h3 class="text-2xl font-extrabold text-gray-800">Espace Administrateur</h3>
      <p class="text-gray-500 text-sm mt-1">Connectez-vous pour accéder au panneau d’administration</p>
    </div>

    <!-- LARAVEL LOGIN FORM -->
    <form method="POST" action="{{ route('login') }}" class="space-y-5">
        @csrf

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" id="email" required value="{{ old('email') }}"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none transition duration-200">
          @error('email')
            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
          @enderror
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input type="password" name="password" id="password" required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none transition duration-200">
          @error('password')
            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
          @enderror
        </div>

        <!-- Remember Me -->
   <!--        <label class="inline-flex items-center">
            <input type="checkbox" name="remember" class="rounded border-gray-300 text-brand-blue">
          <span class="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
         </label> -->

        <!-- Submit -->
        <button type="submit"
          class="w-full bg-brand-blue text-white py-2.5 rounded-lg hover:bg-brand-green/90 transition font-semibold shadow-md">
          Se connecter
        </button>

        <a href="{{ url('/') }}" class="block text-center mt-3 text-brand-blue hover:text-brand-green font-medium transition">
          ← Retour au site principal
        </a>
    </form>
  </div>

</body>
</html>
