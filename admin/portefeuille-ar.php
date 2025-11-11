<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outsiders - AR/MR</title>
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
            <img src="images/ar_mr_banner.jpg" alt="Image de fond VR" class="w-full h-full object-cover" data-editable data-key="ar_mr_banner_img">
            <div class="absolute inset-0 bg-black opacity-40"></div>
        </div>
        <div class="relative container mx-auto px-6 py-24 md:py-32 text-center text-white">
            <button class="edit-btn">✎</button>
            <h1 class="text-3xl md:text-5xl font-extrabold mb-4" data-editable data-key="ar_mr_hero_title">
                Explorez l'univers de nos projets et laissez-vous surprendre par la diversité de nos créations.
            </h1>
            <button class="edit-btn">✎</button>
            <p class="text-lg max-w-3xl mx-auto" data-editable data-key="ar_mr_hero_text">
                Parcourrir nos traveaux ! Peut-être y trouverez-vous l'étincelle pour votre prochain projet ? Nous l'espérons sincèrement !
            </p>
        </div>
    </section>

    <!-- ===== Section VR ===== -->
    <section class="vr-section">
        <div class="vr-container">

            <!-- Image gauche -->
            <div class="vr-image">
                <button class="edit-btn">✎</button>
                <img src="images/ar_mr.jpg" alt="jeux vidéo" data-editable data-key="ar_mr_image">
            </div>

            <!-- Texte droite -->
            <div class="vr-content">
                <button class="edit-btn">✎</button>
                <h2 data-editable data-key="ar_mr_title"><span>AR/MR - </span>Réalité augmentée mixte</h2>
                <button class="edit-btn">✎</button>
                <p data-editable data-key="ar_mr_paragraph">
                    La réalité augmentée et la réalité mixte redéfinissent notre rapport au monde numérique. En fusionnant harmonieusement éléments réels et contenus virtuels, 
                    nous créons des expériences immersives qui transcendent les écrans traditionnels. Les utilisateurs ne se contentent plus d'observer : ils interagissent, 
                    explorent et s'engagent activement dans des environnements enrichis. Que ce soit pour la formation, la visualisation de projets, la collaboration à 
                    distance ou l'exploration de concepts complexes, ces technologies transforment radicalement notre manière d'interagir avec l'information.
                </p>

                <button class="edit-btn">✎</button>
                <p class="vr-subtitle" data-editable data-key="ar_mr_subtitle"><strong>Ce que nous créons pour vous</strong></p>

                <!-- Contenu à droite -->
                <ul class="vr-list">
                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="ar_mr_learning_title">Apprentissage immersif :</strong>
                            <button class="edit-btn">✎</button>
                            <p data-editable data-key="ar_mr_learning_text">
                                Nous écrivons des histoires captivantes et bâtissons des mondes 3D cohérents où vos joueurs auront envie de se perdre.
                                Des environnements de formation en réalité mixte où vos équipes peuvent s'entraîner dans des conditions réalistes, répéter les gestes techniques et apprendre de leurs erreurs sans conséquences.
                            </p>
                        </div>
                    </li>

                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="ar_mr_guidance_title">Guidage intelligent :</strong>
                            <button class="edit-btn">✎</button>
                            <p data-editable data-key="ar_mr_guidance_text">
                                Des instructions contextuelles qui s'affichent directement sur vos machines, accompagnant vos opérateurs étape par étape dans les procédures de maintenance et d'utilisation.
                            </p>
                        </div>
                    </li>

                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="ar_mr_support_title">Support expert à distance :</strong>
                            <button class="edit-btn">✎</button>
                            <p data-editable data-key="ar_mr_support_text">
                                Vos spécialistes peuvent assister les techniciens sur le terrain en temps réel, annoter leur champ de vision et les guider avec précision, peu importe la distance.
                            </p>
                        </div>
                    </li>

                    <li>
                        <i class="bi bi-check2"></i>
                        <div>
                            <button class="edit-btn">✎</button>
                            <strong data-editable data-key="ar_mr_showroom_title">Showrooms virtuels :</strong>
                            <button class="edit-btn">✎</button>
                            <p data-editable data-key="ar_mr_showroom_text">
                                Vos catalogues prennent vie : les produits apparaissent en 3D, se configurent selon les préférences, changent de couleur ou de dimension d'un simple geste.
                            </p>
                        </div>
                    </li>
                </ul>

                <button class="edit-btn">✎</button>
                <a href="#" class="btn-vr" data-editable data-key="ar_mr_button">En savoir plus</a>
            </div>
        </div>
    </section>
</main>

    
        <!-- =========== Pied de page du site =========== -->
    <footer class="site-footer">
        <div class="footer-container">
            <button class="edit-btn">✎</button>
            <p class="footer-text" data-editable>
            Vous avez des questions ? <span data-editable>Contactez-nous</span> — nous sommes à votre disposition.
            </p>

            <!--contact -->
            <a href="contact.html" class="footer-btn">Contactez-nous !</a>

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
            <a href="#" target="_blank" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="white" viewBox="0 0 24 24" data-editable>
                <path d="M22.7 0h-21.4c-.7 0-1.3.6-1.3 1.3v21.4c0 .7.6 1.3 1.3 1.3h11.5v-9.3h-3.1v-3.6h3.1v-2.6c0-3.1 1.9-4.8 4.7-4.8 1.3 0 2.3.1 2.6.1v3h-1.8c-1.4 0-1.7.7-1.7 1.6v2.7h3.4l-.4 3.6h-3v9.3h5.8c.7 0 1.3-.6 1.3-1.3v-21.4c.1-.7-.5-1.3-1.2-1.3z"/>
                </svg>
            </a>
            <div class="footer-logo">
                <button class="edit-btn">✎</button>
                <img src="images/logo_blanc.png" alt="Logo du site" data-editable/>
            </div>
            </div>

            <!-- Mentions légales -->
            <div class="footer-bottom">
            <a href="#">Mentions légales</a>
            <a href="#">Déclaration de confidentialité</a>
            </div>
        </div>
    </footer>



    <!-- Lien vers le script JavaScript externe -->
    <script type="module" src="scripts/admin_main.js"></script>
    <script tupe="module" src="js/dropdown.js"></script>
    <script src="/js/lang.js"></script>
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
            }, 100);
        });
        });
    </script>
</body>
</html>