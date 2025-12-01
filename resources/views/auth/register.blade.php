<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Outsiders - Administration</title>

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { colors: { 'brand-blue': '#08B3E5', 'brand-green': '#1bd7bb' } } }
    }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #08B3E5 0%, #2AF598 100%);
      min-height: 100vh;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>

<body class="flex items-center justify-center">

  <div class="relative bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-md p-10 border border-gray-200">
    
    <!-- Header -->
    <div class="flex flex-col items-center mb-8">
      <img src="/uploads/logo_noir.png" alt="Logo Outsiders" class="w-20 mb-4">
      <h3 class="text-2xl font-extrabold text-gray-800">Créer un compte administrateur</h3>
      <p class="text-gray-500 text-sm mt-1">Veuillez remplir les informations ci-dessous</p>
    </div>

    <!-- REGISTER FORM -->
    <form method="POST" action="{{ route('register') }}" class="space-y-5">
      @csrf

      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
        <input type="text" name="name" id="name" required value="{{ old('name') }}"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none transition">
        @error('name')
          <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
        @enderror
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" name="email" id="email" required value="{{ old('email') }}"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none transition">
        @error('email')
          <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
        @enderror
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input type="password" name="password" id="password" required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none transition">
        @error('password')
          <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
        @enderror
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
        <input type="password" name="password_confirmation" id="password_confirmation" required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none transition">
        @error('password_confirmation')
          <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
        @enderror
      </div>

      <!-- Submit -->
      <button type="submit"
        class="w-full bg-brand-blue text-white py-2.5 rounded-lg hover:bg-brand-green/90 transition font-semibold shadow-md">
        S’inscrire
      </button>

      <a href="{{ route('login') }}" class="block text-center mt-3 text-brand-blue hover:text-brand-green font-medium transition">
        ← Déjà inscrit ? Se connecter
      </a>
    </form>

  </div>

</body>
</html>
