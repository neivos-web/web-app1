<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: /admin.html');
    exit;
}
header('Content-Type: text/html; charset=UTF-8');

?>


<!DOCTYPE html>
<html lang="fr">
    
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outsiders - Accueil</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles/style.css">
    <script>
        tailwind.config = {
            theme: { extend: { colors: { 'brand-blue': '#08B3E5', 'brand-green': '#22e4ac' } } }
        }
    </script>




</head>
<body class="bg-gray-100 text-brand-dark">
    

    <!-- =========== En-tête du site =========== -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
            
            <!-- Logo -->
            <div class="flex items-center space-x-3">
                <a href="index.html" class="flex items-center space-x-2">
                    <img src="images/logo_noir.png" alt="Outsiders Logo" class="h-10 w-auto object-contain">
                    <span class="text-2xl font-bold text-gray-900 hover:text-brand-blue" data-key="logo_text"></span>
                </a>
            </div>

            <!-- Bouton hamburger (mobile) -->
            <button id="menu-toggle" class="md:hidden flex items-center text-gray-700 hover:text-brand-blue focus:outline-none">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            </button>

            <!-- Menu principal -->
            <div id="menu" class="hidden md:flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 font-medium text-gray-700 absolute md:relative top-full left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none p-4 md:p-0">
            
                <a href="mission.html" class="hover:text-brand-blue" data-key="nav_mission">Mission et Vision</a>

                <div class="relative group">
                    <button class="flex items-center hover:text-brand-blue focus:outline-none" data-key="nav_portfolio">
                        Portefeuille
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-40 text-center z-20">
                        <a href="portefeuille-jeux.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="portfolio_games">Jeux Vidéo</a>
                        <a href="portefeuille-ar.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="portfolio_ar">AR/MR</a>
                        <a href="portefeuille-vr.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="portfolio_vr">VR</a>
                        <a href="portefeuille-cao.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="portfolio_cad">CAD</a>
                    </div>
                </div>

                <div class="relative group">
                    <button class="flex items-center hover:text-brand-blue focus:outline-none" data-key="nav_training">Formations & conseils
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-52 text-center z-20">
                        <a href="formations-vr.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="training_vr">VR</a>
                        <a href="formations-jeux.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="training_games">Jeux Vidéo</a>
                        <a href="formations-iot.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="training_iot">Systèmes Embarqués & IOT</a>
                        <a href="formations-consulting.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="training_consulting">Consulting & Accompagnement IT</a>
                    </div>
                </div>

                <a href="recherche.html" class="hover:text-brand-blue" data-key="nav_research">Recherche</a>

                <div class="relative group">
                    <button class="flex items-center text-brand-blue font-semibold focus:outline-none" data-key="nav_news">Actualités / Blog
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-44 text-center z-20">
                        <a href="actualites.html" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-key="news_articles">Actualités</a>
                    </div>
                </div>

                <a href="contact.html" class="hover:text-brand-blue" data-key="nav_contact">Contact</a>

                <div class="flex items-center space-x-2">
                    <select id="language-selector" class="border border-gray-300 rounded-md p-1 text-sm">
                        <option value="fr">🇫🇷 Français</option>
                        <option value="en">🇬🇧 English</option>
                    </select>
                </div>
            </div>
        </nav>
    </header>


    <main>
        <!-- Section Héros -->
        <section class="relative bg-white">
            <div class="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" class="w-full h-full object-cover opacity-80" alt="Workspace">
                <div class="absolute inset-0 bg-black opacity-40"></div>
            </div>
            <div class="relative container mx-auto px-6 py-24 md:py-32 text-center text-white">
                <h1 class="text-3xl md:text-5xl font-extrabold mb-4" data-key="welcome_title">Bienvenue dans notre section actualités et blogs</h1>
                <p class="text-lg max-w-3xl mx-auto" data-key="welcome_subtitle">Découvrez les dernières nouvelles et des articles de blog qui illustrent notre vision et nos derniers progrès réalisés.</p>
            </div>
        </section>
        
        <!-- Section des articles -->
        <section id="articles-section" class="py-16 bg-gray-50">
            <div class="container mx-auto px-6">
                <h2 class="text-3xl font-bold text-center mb-12" data-key="articles_title">Actualités et blogs chez Outsiders</h2>
                <div id="articles-container" class="space-y-12">
                    <p id="loading-public" class="text-center text-gray-500" data-key="articles_loading">Chargement des actualités...</p>
                </div>
            </div>
        </section>

        <!-- Section de bienvenue -->
        <section class="welcome-section">
            <div class="welcome-box">
                <h1 data-key="welcome_section_title"><strong>Bienvenue chez OUTSIDERS</strong></h1>
                <p data-key="welcome_section_text">
                    Chez Outsiders Studio, nous sommes enthousiastes à l’idée de vous accompagner dans <strong>la découverte des opportunités offertes par 
                    la transformation numérique</strong>. Posons ensemble les bases de <em>l’innovation de demain</em>, en alliant <strong>créativité et performance</strong> 
                    pour atteindre de nouveaux sommets.
                </p>
            </div>
        </section>

        <!-- Section Innovation et Avenir -->
        <section class="content-section">
            <div class="content-box">
                <div class="content-image">
                    <img src="images/innovation.gif" alt="Innovation et Avenir">
                </div>

                <div class="content">
                    <h2 data-key="innovation_title">Innovation et Avenir</h2>
                    <p data-key="innovation_paragraph_1">
                        Chez <strong>Outsiders</strong>, nous restons toujours à la pointe de l’actualité et de la technologie.
                        Grâce à nos vastes connaissances et à notre savoir-faire, nous soutenons tous ceux qui souhaitent
                        maîtriser ou utiliser efficacement les nouvelles technologies. Nos solutions comprennent des
                        applications de réalité virtuelle, des hologrammes, le développement sur mesure d’applications,
                        la création de jeux, ainsi que des formations et des conseils, en particulier en
                        <strong>intelligence artificielle (IA)</strong>.
                    </p>
                    <p data-key="innovation_paragraph_2">
                        La numérisation a entraîné de profonds changements dans notre société. Chez Outsiders, nous
                        voyons ces évolutions comme une opportunité de croissance, d’innovation et d’inclusion.
                        Nous utilisons des technologies comme la <strong>réalité augmentée (AR)</strong>, la
                        <strong>réalité virtuelle (VR)</strong> et l’<strong>intelligence artificielle (IA)</strong>
                        pour créer de nouvelles possibilités pour les personnes les plus diverses. Notre mission est de
                        développer des technologies innovantes de manière inclusive afin de favoriser un développement
                        durable, économique et social, au service du progrès.
                    </p>
                </div>
            </div>
        </section>

        <!-- Section Inclusion et recherche -->
        <section class="content-section">
            <div class="content-box">
                <div class="content-image">
                    <img src="images/inclusion.gif" alt="Illustration Inclusion et Recherche">
                </div>

                <div class="content">
                    <h2 data-key="inclusion_title">Inclusion & Recherche</h2>
                    <p data-key="inclusion_paragraph_1">
                        Pour nous, l'inclusion est bien plus qu'une simple idée. Elle est synonyme d'intégration
                        sans faille de toutes les personnes dans la société. Chez Outsiders, nous vivons l'inclusion
                        – non seulement par la loi, mais aussi parce qu'elle correspond à notre conviction la plus
                        profonde. Nous reconnaissons et apprécions le caractère unique de chaque individu, ce qui
                        se traduit par la qualité de notre travail et nos solutions innovantes.
                    </p>
                    <p data-key="inclusion_paragraph_2">
                        Grâce à la collaboration et à la force de notre équipe interdisciplinaire, comprenant
                        également des personnes ayant des besoins particuliers, nous sommes en mesure de créer des
                        solutions qui sont à la fois économiquement viables et bénéfiques pour la société. Outsiders
                        s'efforce de construire un avenir où chacun peut atteindre son plein potentiel. Le "Perfect
                        Flow" n'est pas seulement une vision, mais une mission que nous partageons avec nos
                        collaborateurs et partenaires.
                    </p>
                </div>
            </div>
        </section>

        <!-- Section Gamme de services -->
        <section class="content-section">
            <div class="content-box">
                <div class="content-image">
                    <img src="images/service.gif" alt="Illustration Gamme de services">
                </div>

                <div class="content">
                    <h2 data-key="services_title">Notre gamme de services</h2>
                    <p data-key="services_paragraph_1">
                        Nos services s'étendent sur diverses technologies virtuelles et sont personnalisés adaptés à vos besoins. 
                        Que ce soit pour une nouvelle application ou pour l'optimisation de processus existants, 
                        nous nous concentrons toujours sur l'innovation et la valeur ajoutée.
                    </p>
                    <p data-key="services_paragraph_2">
                        Outsiders s'engage intensivement dans la recherche et le développement de technologies clés, en mettant 
                        particulièrement l'accent sur les simulateurs basés sur la technologie XR. Notre objectif est de créer 
                        des opportunités d'emploi et de faciliter le choix d'une profession et la formation pour les personnes 
                        atteintes du spectre de l'autisme.
                    </p>
                </div>
            </div>
        </section>
    </main>

      <!-- =========== Pied de page du site =========== -->
    <footer class="site-footer">
        <div class="footer-container">

            <p class="footer-text editable" data-key="footer_contact_text">
                Vous avez des questions ? <span>Contactez-nous</span> — nous sommes à votre disposition.
            </p>

            <!--contact -->
            <a href="contact.html" class="footer-btn editable" data-key="footer_contact_btn">Contactez-nous !</a>

           <!-- Réseaux sociaux-->
            <div class="footer-social">
            <button class="edit-btn">✎</button>
            <a href="#" target="_blank" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="white" viewBox="0 0 24 24" data-editable>
                <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.4c-.9 0-1.6-.8-1.6-1.6 0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6c0 .8-.7 1.6-1.6 1.6zm13.5 11.4h-3v-5.5c0-1.3-.5-2.2-1.7-2.2-1 0-1.6.7-1.8 1.4-.1.2-.1.5-.1.8v5.5h-3s.1-8.9 0-9.8h3v1.4c.4-.7 1.1-1.7 2.8-1.7 2 0 3.8 1.3 3.8 4.3v5.8z" />
                </svg>
            </a>
            <button class="edit-btn">✎</button>
            <a href="#" target="_blank" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="white" viewBox="0 0 24 24" data-editable>
                <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.3.5.6.3 1.1.7 1.6 1.2.5.5.9 1 1.2 1.6.2.4.4 1.1.5 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.9-.5 2.3-.3.6-.7 1.1-1.2 1.6-.5.5-1 .9-1.6 1.2-.4.2-1.1.4-2.3.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.3-2.3-.5-.6-.3-1.1-.7-1.6-1.2-.5-.5-.9-1-1.2-1.6-.2-.4-.4-1.1-.5-2.3-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.3-1.9.5-2.3.3-.6.7-1.1 1.2-1.6.5-.5 1-.9 1.6-1.2.4-.2 1.1-.4 2.3-.5 1.3-.1 1.7-.1 4.9-.1zm0 1.8c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-2 .4-.5.2-.9.5-1.3.9-.4.4-.7.8-.9 1.3-.2.4-.3 1-.4 2-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.4 2 .2.5.5.9.9 1.3.4.4.8.7 1.3.9.4.2 1 .3 2 .4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 2-.4.5-.2.9-.5 1.3-.9.4-.4.7-.8.9-1.3.2-.4.3-1 .4-2 .1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.4-2-.2-.5-.5-.9-.9-1.3-.4-.4-.8-.7-1.3-.9-.4-.2-1-.3-2-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.3a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 10.8a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6zm5.5-11.8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                </svg>
            </a>
            <button class="edit-btn">✎</button>
            <a href="#" target="_blank" aria-label="Facebook" data-editable>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="white" viewBox="0 0 24 24" data-editable>
                <path d="M22.7 0h-21.4c-.7 0-1.3.6-1.3 1.3v21.4c0 .7.6 1.3 1.3 1.3h11.5v-9.3h-3.1v-3.6h3.1v-2.6c0-3.1 1.9-4.8 4.7-4.8 1.3 0 2.3.1 2.6.1v3h-1.8c-1.4 0-1.7.7-1.7 1.6v2.7h3.4l-.4 3.6h-3v9.3h5.8c.7 0 1.3-.6 1.3-1.3v-21.4c.1-.7-.5-1.3-1.2-1.3z" data-editable/>
                </svg>
            </a>
            <div class="footer-logo">
                <button class="edit-btn">✎</button>
                <img src="images/logo_blanc.png" alt="Logo du site" data-editable/>
            </div>
            </div>

            <!-- Mentions légales -->
            <div class="footer-bottom">
            <a href="#" class="editable" data-key="footer_legal">Mentions légales</a>
            <a href="#" class="editable" data-key="footer_privacy">Déclaration de confidentialité</a>
            </div>
        </div>
    </footer>

    <script src="js/dropdown.js"></script>
    <script type="module" src="scripts/admin_main.js"></script>


</body>
</html>
