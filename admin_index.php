<?php

session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: admin.html");
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
    <style>
        .edit-btn {
            font-size: 0.8rem;
            background: #08B3E5;
            color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin-right: 4px;
        }
        .edit-btn:hover { background: #06a0c5; }
        /* Ensure dropdowns are hidden by default */
            [id^="dropdownMenu"] {
            display: none;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
            }

            /* When not hidden, show dropdown smoothly */
            [id^="dropdownMenu"]:not(.hidden) {
            display: block;
            opacity: 1;
            visibility: visible;
            }

            /* Fix position and overflow for scrolling */
            header, nav, .relative, .group {
            overflow: visible !important;
            }

            body {
            overflow-y: auto !important;
            }

    </style>



</head>
<body class="bg-gray-100 text-brand-dark">
    
    <header class="bg-white shadow-sm sticky top-0 z-50">

       <!-- =========== En-tête du site =========== -->
            <?php
            require './components/admin_menu.php';
            ?>
    </header>
    <main>
        <!-- Section Héros -->
        <section class="relative bg-white" id="hero-content">
            <div class="absolute inset-0">
                <button class="edit-btn absolute top-4 left-4 z-50">✎</button>
                <img id="hero-image"
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                    class="w-full h-full object-cover opacity-80" alt="Workspace" data-editable>
            </div>

            <div class="relative container mx-auto px-6 py-24 md:py-32 text-center text-white">
                <button class="edit-btn">✎</button>
                <h1 id="hero-title" class="text-3xl md:text-5xl font-extrabold mb-4" data-editable data-key="welcome_title">
                    OUTSIDERS – L’Innovation au Service du Changement
                </h1>
                <button class="edit-btn">✎</button>
                <p id="hero-desc" class="text-lg max-w-3xl mx-auto" data-editable data-key="welcome_subtitle">
                    Apprenez les technologies les plus demandées du moment grâce à nos formations interactives et pratiques.
                    OUTSIDERS vous accompagne pour développer vos compétences, booster votre carrière et devenir acteur de
                    l’innovation numérique.
                </p>
            </div>
        </section>

        <!-- Section de bienvenue -->
        <section id="welcome-container" class="welcome-section">
            <div class="welcome-box">
                <button class="edit-btn">✎</button>
                <h1 id="welcome-id" data-editable data-key="welcome_section_title">
                    <strong>Bienvenue chez OUTSIDERS</strong>
                </h1>
                <button class="edit-btn">✎</button>
                <p id="welcome-desc" data-editable data-key="welcome_section_text">
                    <strong>Mission & Vision :</strong> Outsiders allie inclusion et innovation technologique.
                    Notre équipe diversifiée et interdisciplinaire réunit des talents issus de domaines variés,
                    qui travaillent ensemble et aspirent au <em>“Perfect Flow”</em> — des solutions efficaces et
                    innovantes, animées par une véritable inclusion et motivation.
                </p>
            </div>
        </section>

        <!-- Section Innovation et Avenir -->
        <section id="editable-container" class="content-section">
            <div class="content-box">
                <div class="content-image">
                    <button class="edit-btn">✎</button>
                    <img id="innovation-img" src="images/innovation.gif" alt="Innovation et Avenir" data-editable>
                </div>
                <div class="content">
                    <button class="edit-btn">✎</button>
                    <h2 id="innovation-heading" data-editable data-key="innovation_title">Innovation et Avenir</h2>
                    <button class="edit-btn">✎</button>
                    <p id="innovation-text-1" data-editable data-key="innovation_paragraph_1">
                        Chez <strong>Outsiders</strong>, nous restons toujours à la pointe de l’actualité et de la
                        technologie.
                        Grâce à nos vastes connaissances et à notre savoir-faire, nous soutenons tous ceux qui souhaitent
                        maîtriser ou utiliser efficacement les nouvelles technologies. Nos solutions comprennent des
                        applications de réalité virtuelle, des hologrammes, le développement sur mesure d’applications,
                        la création de jeux, ainsi que des formations et des conseils, en particulier en
                        <strong>intelligence artificielle (IA)</strong>.
                    </p>
                    <button class="edit-btn">✎</button>
                    <p id="innovation-text-2" data-editable data-key="innovation_paragraph_2">
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

            <!-- Section Inclusion et recherche -->
            <div class="content-box">
                <div class="content-image">
                    <button class="edit-btn">✎</button>
                    <img id="inclusion-img" src="images/inclusion.gif" alt="Illustration Inclusion et Recherche" data-editable>
                </div>
                <div class="content">
                    <button class="edit-btn">✎</button>
                    <h2 id="inclusion-title" data-editable data-key="inclusion_title">Inclusion & Recherche</h2>
                    <button class="edit-btn">✎</button>
                    <p id="inclusion-text-1" data-editable data-key="inclusion_paragraph_1">
                        Pour nous, l'inclusion est bien plus qu'une simple idée. Elle est synonyme d'intégration
                        sans faille de toutes les personnes dans la société. Chez Outsiders, nous vivons l'inclusion
                        – non seulement par la loi, mais aussi parce qu'elle correspond à notre conviction la plus
                        profonde. Nous reconnaissons et apprécions le caractère unique de chaque individu, ce qui
                        se traduit par la qualité de notre travail et nos solutions innovantes.
                    </p>
                    <button class="edit-btn">✎</button>
                    <p id="inclusion-text-2" data-editable data-key="inclusion_paragraph_2">
                        Grâce à la collaboration et à la force de notre équipe interdisciplinaire, comprenant
                        également des personnes ayant des besoins particuliers, nous sommes en mesure de créer des
                        solutions qui sont à la fois économiquement viables et bénéfiques pour la société. Outsiders
                        s'efforce de construire un avenir où chacun peut atteindre son plein potentiel. Le "Perfect
                        Flow" n'est pas seulement une vision, mais une mission que nous partageons avec nos
                        collaborateurs et partenaires.
                    </p>
                </div>
            </div>

            <!-- Section Gamme de services -->
            <div class="content-box">
                <div class="content-image">
                    <button class="edit-btn">✎</button>
                    <img id="service-img" src="images/service.gif" alt="Illustration Services" data-editable>
                </div>
                <div class="content">
                    <button class="edit-btn">✎</button>
                    <h2 id="service-title" data-editable data-key="services_title">Notre site Gamme de services</h2>
                    <button class="edit-btn">✎</button>
                    <p id="service-text-1" data-editable data-key="services_paragraph_1">
                        Nos services s'étendent sur diverses technologies virtuelles et sont personnalisés adaptés à vos besoins. 
                        Que ce soit pour une nouvelle application ou pour l'optimisation de processus existants - 
                        nous se concentre sur toujours sur l'innovation et la valeur ajoutée. Notre passion est le 
                        développement de des réalités virtuelles et leur utilisation créative intégration dans votre 
                        vie quotidienne. Notre enthousiasme pour les technologies innovations fait de nous le partenaire
                        idéal sur votre chemin vers la la transformation numérique. Et le plus le meilleur ? Nous aimons les défis !
                    </p>
                    <button class="edit-btn">✎</button>
                    <p id="service-text-2" data-editable data-key="services_paragraph_2">
                        Outsiders s'engage intensivement dans la recherche et le développement de des technologies clés, en mettant 
                        particulièrement l'accent sur les simulateurs basés sur la technologie technologie XR. Notre objectif est, 
                        grâce à ces technologies innovantes, y compris les créer des opportunités d'emploi créer et faciliter 
                        le choix d'une profession et formation pour les personnes atteintes de d'améliorer le spectre de l'autisme. 
                        Nous soutenons leur intégration active sur le marché du travail et contribue ainsi une contribution à une société plus inclusive.
                    </p>
                </div>
            </div>
        </section>
    </main>

    <footer class="site-footer">
       <!-- =========== En-tête du site =========== -->
            <?php
            include './components/admin_footer.php'; // or require 'main_admin.php';
            ?>
   </footer>
    <!-- =========== Pied de page du site =========== -->
        <script type="module" src="scripts/admin_main.js"></script> 
        <script src="js/lang.js"></script>



</body>
</html>
