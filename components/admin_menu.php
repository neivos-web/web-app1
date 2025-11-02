    <header class="bg-white shadow-sm sticky top-0 z-50">
        <nav class="container mx-auto max-w-full px-20 py-6 flex justify-between items-center gap-10">
            <!-- Logo -->
            <div class="flex items-center space-x-4">
                <div class="nav-item-wrapper">
                    <button class="edit-btn">✎</button>
                    <a href="admin_index.php" data-key="logo_text" class="flex items-center space-x-2">
                        <img src="images/logo_noir.png" data-editable alt="Outsiders Logo" class="h-10 w-auto object-contain">
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
            <div id="menu" class="hidden md:flex space-x-8 items-center font-medium text-gray-700">
            
                <div data-key="nav_mission" data-shared="true" class="flex items-center space-x-2">
                    <button class="edit-btn">✎</button>
                    <a href="mission.html" class="hover:text-brand-blue" data-editable>Mission et Vision</a>
                    
                </div>

                <div class="relative group space-x-3" data-key="nav_portfolio" data-shared="true">
                    <button class="edit-btn">✎</button>
                    <button class="flex items-center hover:text-brand-blue focus:outline-none" data-editable> 
                        Portefeuille 
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    
                    
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-40 text-center z-20">
                      <button class="edit-btn">✎</button> <a href="portefeuille-jeux.html" data-shared="true" data-editable data-key="portfolio_games" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">Jeux Vidéo</a>
                      <button class="edit-btn">✎</button><a href="portefeuille-ar.html" data-shared="true" data-editable data-key="portfolio_ar" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">AR/MR</a>
                      <button class="edit-btn">✎</button><a href="portefeuille-vr.html" data-shared="true" data-editable data-key="portfolio_vr" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">VR</a>
                      <button class="edit-btn">✎</button> <a href="portefeuille-cao.html" data-shared="true" data-editable data-key="portfolio_cad" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">CAD</a>
                    </div>
                </div>

                <div class="relative group space-x-3" data-key="nav_training" data-shared="true">
                    <button class="edit-btn">✎</button>
                    <button class="flex items-center hover:text-brand-blue focus:outline-none" data-editable>
                        Formations & conseils
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    
                    
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-52 text-center z-20">
                       <button class="edit-btn">✎</button> <a href="formations-vr.html" data-editable data-key="training_vr" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-shared="true">VR</a><button class="edit-btn">✎</button>
                        <a href="formations-jeux.html" data-editable data-key="training_games" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-shared="true">Jeux Vidéo</a><button class="edit-btn">✎</button>
                        <a href="formations-iot.html" data-editable data-key="training_iot" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-shared="true">Systèmes Embarqués & IOT</a><button class="edit-btn">✎</button>
                        <a href="formations-consulting.html" data-editable data-key="training_consulting" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue" data-shared="true">Consulting & Accompagnement IT</a>
                    </div>
                </div>

                <div data-key="nav_research" class="flex items-center space-x-2" data-shared="true">
                    <button class="edit-btn">✎</button>
                    <a href="recherche.html" class="hover:text-brand-blue" data-editable>Recherche</a>
                    
                </div>

                <div class="relative group space-x-3" data-key="nav_news" data-shared="true">
                    <button class="edit-btn">✎</button>
                    <button class="flex items-center text-brand-blue font-semibold focus:outline-none" data-editable>
                        Actualités / Blog
                        <svg class="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    
                    <div class="absolute left-1/2 -translate-x-1/2 hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 w-44 text-center z-20" >
                        <a href="actualites.html" data-editable data-key="news_articles" data-shared="true" class="block px-4 py-2 hover:bg-gray-100 hover:text-brand-blue">Actualités</a>
                        <button class="edit-btn">✎</button>
                    </div>
                </div>

                <div data-key="nav_contact" class="flex items-center space-x-2" data-shared="true">
                     <button class="edit-btn">✎</button>
                    <a href="contact.html" data-editable class="hover:text-brand-blue">Contact</a>
                   
                </div>

            </div>

            <div class="flex items-center space-x-3">
                <select id="language-selector" class="border border-gray-300 rounded-md p-1 text-sm">
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                </select>
            </div>

            <div class="extra-right-buttons flex items-center space-x-3">
                <button id="save-btn" class="bg-brand-green hover:bg-green-400 text-white font-semibold px-4 py-2 rounded-md shadow-md transition">
                    Publier
                </button>

                <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition">
                    ⏻
                </button>
            </div>
        </nav>
    </header>

    