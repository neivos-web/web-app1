const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch('/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        window.location.href = '/admin_index.html'; // Dashboard
      } else {
        document.getElementById("login-error").textContent = data.message;
      }
    } catch (err) {
      console.error(err);
      document.getElementById("login-error").textContent = 'Erreur serveur.';
    }
  });
}
