<?php
// Secure session settings (must come BEFORE session_start)
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', '0'); 
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: mission.html");
    exit;
}

header('Content-Type: text/html; charset=UTF-8');
?>


<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Outsiders - Mission</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="styles/style.css">
        <script>
            tailwind.config = { theme: { extend: { colors: { 'brand-blue': '#08B3E5', 'brand-green': '#2AF598' } } } }
        </script>
    </head>
    <body class="bg-gray-100 text-brand-dark">
        <!-- =========== En-tête du site =========== -->
        <header class="bg-white shadow-sm sticky top-0 z-50">

        <!-- =========== En-tête du site =========== -->
                <?php
                require './components/admin_menu.php';
                ?>
        </header> 

    <main>
    <!-- Section Héros -->
    <section class="relative bg-white">
        <div class="absolute inset-0">
            <button class="edit-btn">✎</button>
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" class="w-full h-full object-cover opacity-80" data-editable data-key="hero_img" alt="Workspace">
            <div class="absolute inset-0 bg-black opacity-40"></div>
        </div>
        <div class="relative container mx-auto px-6 py-24 md:py-32 text-center text-white">
            <button class="edit-btn">✎</button>
            <h1 class="text-3xl md:text-5xl font-extrabold mb-4" data-editable data-key="hero_title">Bienvenue dans notre section mission et vision</h1>
            <button class="edit-btn">✎</button>
            <p class="text-lg max-w-3xl mx-auto" data-editable data-key="hero_subtitle">
                Découvrez les dernières nouvelles et des articles de blog qui illustrent notre vision et nos derniers progrès réalisés.
            </p>
        </div>
    </section>

    <!-- Section Innovation -->
    <section class="content-section">
        <div class="content-box">
            <div class="content-image">
                <button class="edit-btn">✎</button>
                <img src="images/innovation.gif" alt="Innovation et Avenir" data-editable data-key="innovation_img">
            </div>
            <div class="content">
                <button class="edit-btn">✎</button>
                <h2 data-editable data-key="innovation_title">Innovation et Avenir</h2>
                <button class="edit-btn">✎</button>
                <p data-editable data-key="innovation_text1">
                    Chez <strong>Outsiders</strong>, nous croyons fermement que l'innovation doit servir l'humain...nous croyons fermement que l'innovation 
                    doit servir l'humain. Notre équipe s'appuie sur une expertise technique solide pour accompagner les entreprises et les particuliers dans 
                    leur transformation numérique. Que vous souhaitiez explorer de nouvelles technologies ou optimiser vos processus existants, nous sommes
                    là pour vous guider.
                </p>
                <button class="edit-btn">✎</button>
                <p data-editable data-key="innovation_text2">
                    Notre palette de services reflète cette ambition : création d'expériences en réalité virtuelle immersives, développement d'hologrammes
                     interactifs pour des événements marquants, conception sur mesure d'applications mobiles et de jeux vidéo innovants. Nous proposons 
                     également des sessions de formation pratiques et des accompagnements stratégiques, notamment autour des systèmes d'information et 
                     de son intégration responsable.
                </p>
                <button class="edit-btn">✎</button>
                 <p data-editable data-key="innovation_text3">
                    Le numérique transforme profondément nos façons de travailler, d'apprendre et d'interagir. Plutôt que de subir ces mutations, nous 
                    choisissons d'y voir une formidable occasion de progresser ensemble. En combinant réalité augmentée, réalité virtuelle et intelligence
                    artificielle, nous développons des solutions qui ouvrent de nouveaux horizons professionnels et créatifs.
                </p>
                 <button class="edit-btn">✎</button>
                 <p data-editable data-key="innovation_text4">
                    Notre engagement va au-delà de la simple performance technique : nous voulons démocratiser l'accès à ces technologies émergentes.
                     Chaque projet que nous menons vise un impact durable, qui bénéficie autant à la croissance économique qu'au développement social 
                     et à l'inclusion de tous.
                </p>
            </div>
        </div>
    </section>
</main>

<!-- =========== Pied de page du site =========== -->
<footer class="site-footer">
    <div class="footer-container">

        <p class="footer-text" data-editable data-key="footer_contact_text">
            Vous avez des questions ? <span>Contactez-nous</span> — nous sommes à votre disposition.
        </p>
        <button class="edit-btn">✎</button>

        <!--contact -->
        <a href="contact.html" class="footer-btn" data-editable data-key="footer_contact_btn">Contactez-nous !</a>
        <button class="edit-btn">✎</button>

        <!-- Réseaux sociaux-->
        <div class="footer-social">
        <a href="#" target="_blank" aria-label="LinkedIn"></a>
        <a href="#" target="_blank" aria-label="Instagram"></a>
        <a href="#" target="_blank" aria-label="Facebook"></a>
        <div class="footer-logo">
            <img src="images/logo_blanc.png" alt="Logo du site" />
        </div>
        </div>

        <!-- Mentions légales -->
        <div class="footer-bottom">
        <a href="#" data-editable data-key="footer_legal">Mentions légales</a>
        <button class="edit-btn">✎</button>
        <a href="#" data-editable data-key="footer_privacy">Déclaration de confidentialité</a>
        <button class="edit-btn">✎</button>
        </div>
    </div>
</footer>


    <script src="js/dropdown.js"></script>
    <script type="module" src="scripts/admin_main.js"></script>
    <script type="module" src="js/lang.js"></script>
    <!-- Script pour le menu mobile -->
    <script>
    document.getElementById('menu-toggle').addEventListener('click', function () {
        document.getElementById('menu').classList.toggle('hidden');
    });
    </script>
    <script>
        document.querySelectorAll('.group').forEach((dropdown) => {
        let timeout;

        const menu = dropdown.querySelector('.absolute');

        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
            menu.classList.remove('hidden');
        });

        dropdown.addEventListener('mouseleave', () => {
            // Wait 500ms before hiding (you can adjust this delay)
            timeout = setTimeout(() => {
            menu.classList.add('hidden');
            }, 800);
        });
        });
    </script>
    </body>
</html>

