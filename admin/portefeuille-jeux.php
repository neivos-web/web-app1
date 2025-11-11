<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outsiders - Jeux vidéos</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
    <!-- Lien vers la feuille de style externe -->
    <link rel="stylesheet" href="styles/style.css">
    <link rel="stylesheet" href="styles/submenu.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"/>

    <script>
        tailwind.config = {
            theme: { extend: { colors: { 'brand-blue': '#08B3E5', 'brand-green': '#2AF598' } } }
        }
    </script>
    <style>
        .edit-btn {
            font-size: 0.8rem;
            background: #1bd7bb;
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
        .edit-btn:hover { background: #22e4ac; }
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
    <section class="relative bg-white">
        <div class="absolute inset-0">
            <button class="edit-btn">✎</button>
            <img src="images/jeux_banner.jpg" alt="Image de fond VR" class="w-full h-full object-cover" data-key="games_banner_img">
            <div class="absolute inset-0 bg-black opacity-40"></div>
        </div>
        <div class="relative container mx-auto px-6 py-24 md:py-32 text-center text-white">
            <button class="edit-btn">✎</button>
            <h1 class="text-3xl md:text-5xl font-extrabold mb-4" data-editable data-key="games_hero_title">
                Explorez l'univers de nos projets et laissez-vous surprendre par la diversité de nos créations.
            </h1>

            <button class="edit-btn">✎</button>
            <p class="text-lg max-w-3xl mx-auto" data-editable data-key="games_hero_text">
                Parcourrir nos traveaux ! Peut-être y trouverez-vous l'étincelle pour votre prochain projet ? Nous l'espérons sincèrement !
            </p>
        </div>
    </section>

    <!-- ===== Section Jeux ===== -->
    <section class="vr-section">
        <div class="vr-container">
        
            <!-- Image gauche -->
            <div class="vr-image">
                <button class="edit-btn">✎</button>
                <img src="images/jeux.jpg" alt="jeux vidéo" data-editable data-key="games_image">
            </div>

            <!-- Texte droite -->
            <div class="vr-content">
                <button class="edit-btn">✎</button>
                <h2 data-editable data-key="games_title">Jeux et éducation</h2>

                <button class="edit-btn">✎</button>
                <p data-editable data-key="games_intro">
                    Le jeu vidéo est un formidable vecteur d'apprentissage. Nous développons des expériences gaming adaptées 
                    à vos besoins : serious games pour la formation professionnelle, jeux éducatifs pour les jeunes publics, 
                    ou encore advergames pour dynamiser votre communication. Chaque création allie gameplay captivant et 
                    objectifs pédagogiques concrets, pour que vos utilisateurs apprennent... sans même y penser !
                </p>

                <button class="edit-btn">✎</button>
                <p class="vr-subtitle" data-editable data-key="games_subtitle">
                    <strong>Ce que nous créons pour vous</strong>
                </p>

                <ul class="vr-list">
                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="games_story_title">Narration et univers :</strong>
                            <button class="edit-btn">✎</button>
                            <p data-editable data-key="games_story_text">
                                Nous écrivons des histoires captivantes et bâtissons des mondes 3D cohérents où vos joueurs auront envie de se perdre.
                            </p>
                        </div>
                    </li>

                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="games_gameplay_title">Gameplay et progression :</strong>
                            <button class="edit-btn">✎</button>
                            <p data-editable data-key="games_gameplay_text">
                                Conception de mécaniques de jeu fluides, création de systèmes de récompenses stimulants et intégration d'éléments de gamification pertinents.
                            </p>
                        </div>
                    </li>

                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="games_level_title">Design de niveaux :</strong>
                            <button class="edit-btn">✎</button>
                            <p data-editable data-key="games_level_text">
                                Architecture minutieuse de chaque niveau pour offrir une courbe de difficulté équilibrée et une expérience rythmée.
                            </p>
                        </div>
                    </li>

                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="games_creative_title">Direction créative :</strong>
                            <p data-editable data-key="games_creative_text">
                                Vision artistique globale qui donne une identité unique à votre jeu.
                            </p>
                        </div>
                    </li>

                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="games_ui_title">Expérience utilisateur :</strong>
                            <p data-editable data-key="games_ui_text">
                                Analyse approfondie des interfaces et optimisation de l'ergonomie pour une navigation intuitive.
                            </p>
                        </div>
                    </li>

                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="games_multi_title">Développement multiplateforme :</strong>
                            <button class="edit-btn">✎</button>
                            <p data-editable data-key="games_multi_text">
                                Des solutions techniques adaptables qui fonctionnent aussi bien sur mobile, console que PC.
                            </p>
                        </div>
                    </li>
                </ul>

                <button class="edit-btn">✎</button>
                <a href="#" class="btn-vr" data-editable data-key="games_button">En savoir plus</a>
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
            <a href="#" target="_blank" aria-label="LinkedIn"></a>
            <a href="#" target="_blank" aria-label="Instagram"></a>
            <a href="#" target="_blank" aria-label="Facebook"></a>
            <div class="footer-logo">
                <a href="index.html">
                <img src="images/logo_blanc.png" alt="Logo du site" />
                </a>
            </div>
            </div>

            <!-- Mentions légales -->
            <div class="footer-bottom">
            <a href="#" class="editable" data-key="footer_legal">Mentions légales</a>
            <a href="#" class="editable" data-key="footer_privacy">Déclaration de confidentialité</a>
            </div>
        </div>
    </footer>

    <!-- Lien vers le script JavaScript externe -->
    <!--<script src="js/load_page_content.js"></script> -->
   <!---- <script src="scripts/admin_main.js"></script>  -->

    
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
            }, 1200);
        });
        });
    </script>
</body>
</html>
