const loginForm = document.getElementById("login-form");

if(loginForm){
  loginForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try{
      const res = await fetch("/php/login.php", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if(data.success){
        window.location.href = "/admin_index.html";
      } else {
        document.getElementById("login-error").textContent = "Email ou mot de passe incorrect.";
      }
    }catch(err){
      console.error(err);
      document.getElementById("login-error").textContent = "Erreur serveur.";
    }
  });
}

// ======= Check session on admin_index.html ======
async function checkAdminSession(){
  try{
    const res = await fetch("/php/check_session.php");
    const data = await res.json();
    if(!data.loggedIn){
      window.location.href = "/admin.html";
    }
  }catch(err){
    console.error(err);
    window.location.href = "/admin.html";
  }
}

// Logout button
const logoutButton = document.getElementById("logout-button");
if(logoutButton){
  logoutButton.addEventListener("click", async ()=>{
    try{
      await fetch("/php/logout.php");
      window.location.href = "/admin.html";
    }catch(err){
      console.error(err);
    }
  });
}
