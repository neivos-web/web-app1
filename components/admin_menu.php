  <!-- =========== En-tête du site =========== -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
            <!-- Logo -->
            <div class="flex items-center space-x-3">
                <div class="nav-item-wrapper">
                             
                        <a href="admin_index.php" data-editable data-key="logo_text" class="flex items-center space-x-2">
                        
                            <img src="images/logo_noir.png" alt="Outsiders Logo" class="h-10 w-auto object-contain">
                        </a>
                    </div>
            </div>
            <!-- Bouton hamburger (mobile) -->
            <button id="menu-toggle" class="md:hidden flex items-center text-gray-700 hover:text-brand-blue focus:outline-none">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            </button>

            <!-- Menu principal -->
            <div id="menu" class="hidden md:flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 font-medium text-gray-700 absolute md:relative top-full left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none p-4 md:p-0">
            
                <div data-editable data-key="nav_mission" class="flex items-center space-x-1">
                    <a href="mission.html" class="hover:text-brand-blue">Mission et Vision</a>
                    
                </div>

                <div class="relative group" data-editable data-key="nav_portfolio">
                    <button class="flex items-center hover:text-brand-blue focus:outline-none">
                        Portefeuille
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-40 text-center z-20">
                        <a href="portefeuille-jeux.html" data-editable data-key="portfolio_games" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">Jeux Vidéo</a>
                        <a href="portefeuille-ar.html" data-editable data-key="portfolio_ar" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">AR/MR</a>
                        <a href="portefeuille-vr.html" data-editable data-key="portfolio_vr" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">VR</a>
                        <a href="portefeuille-cao.html" data-editable data-key="portfolio_cad" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">CAD</a>
                    </div>
                </div>

                <div class="relative group" data-editable data-key="nav_training">
                    <button class="flex items-center hover:text-brand-blue focus:outline-none">
                        Formations & conseils
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-52 text-center z-20">
                        <a href="formations-vr.html" data-editable data-key="training_vr" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">VR</a>
                        <a href="formations-jeux.html" data-editable data-key="training_games" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">Jeux Vidéo</a>
                        <a href="formations-iot.html" data-editable data-key="training_iot" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">Systèmes Embarqués & IOT</a>
                        <a href="formations-consulting.html" data-editable data-key="training_consulting" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">Consulting & Accompagnement IT</a>
                    </div>
                </div>

                <div data-editable data-key="nav_research" class="flex items-center space-x-1">
                    <a href="recherche.html" class="hover:text-brand-blue">Recherche</a>
                    
                </div>

                <div class="relative group" data-editable data-key="nav_news">
                    <button class="flex items-center text-brand-blue font-semibold focus:outline-none">
                        Actualités / Blog
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-44 text-center z-20">
                        <a href="actualites.html" data-editable data-key="news_articles" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">Actualités</a>
                    </div>
                </div>

                <div data-editable data-key="nav_contact" class="flex items-center space-x-1">
                    <a href="contact.html" class="hover:text-brand-blue">Contact</a>
                    
                </div>

                <div class="flex items-center space-x-2">
                    <select id="language-selector" class="border border-gray-300 rounded-md p-1 text-sm">
                        <option value="fr">🇫🇷 Français</option>
                        <option value="en">🇬🇧 English</option>
                    </select>
                </div>
            </div>
        </nav>
    </header>    