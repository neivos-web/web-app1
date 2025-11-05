-- ==============================================
-- SEED FILE
-- Base : outsdrsc_cms_site
-- Table : site_content
-- ==============================================

INSERT INTO site_content (page, `key`, lang, text, type, value, updated_at) VALUES
-- ===== MENU =====
('global', 'nav_mission', 'fr', 'Mission et Vision', 'text', 'Mission et Vision', NOW()),
('global', 'nav_mission', 'en', 'Mission & Vision', 'text', 'Mission & Vision', NOW()),

('global', 'nav_portfolio', 'fr', 'Portefeuille', 'text', 'Portefeuille', NOW()),
('global', 'nav_portfolio', 'en', 'Portfolio', 'text', 'Portfolio', NOW()),

('global', 'portfolio_games', 'fr', 'Jeux Vidéo', 'text', 'Jeux Vidéo', NOW()),
('global', 'portfolio_games', 'en', 'Video Games', 'text', 'Video Games', NOW()),

('global', 'portfolio_ar', 'fr', 'AR/MR', 'text', 'AR/MR', NOW()),
('global', 'portfolio_ar', 'en', 'AR/MR', 'text', 'AR/MR', NOW()),

('global', 'portfolio_vr', 'fr', 'VR', 'text', 'VR', NOW()),
('global', 'portfolio_vr', 'en', 'VR', 'text', 'VR', NOW()),

('global', 'portfolio_cad', 'fr', 'CAD', 'text', 'CAD', NOW()),
('global', 'portfolio_cad', 'en', 'CAD', 'text', 'CAD', NOW()),

('global', 'nav_training', 'fr', 'Formations & conseils', 'text', 'Formations & conseils', NOW()),
('global', 'nav_training', 'en', 'Training & Consulting', 'text', 'Training & Consulting', NOW()),

('global', 'training_vr', 'fr', 'VR', 'text', 'VR', NOW()),
('global', 'training_vr', 'en', 'VR', 'text', 'VR', NOW()),

('global', 'training_games', 'fr', 'Jeux Vidéo', 'text', 'Jeux Vidéo', NOW()),
('global', 'training_games', 'en', 'Video Games', 'text', 'Video Games', NOW()),

('global', 'training_iot', 'fr', 'Systèmes Embarqués & IOT', 'text', 'Systèmes Embarqués & IOT', NOW()),
('global', 'training_iot', 'en', 'Embedded Systems & IoT', 'text', 'Embedded Systems & IoT', NOW()),

('global', 'training_consulting', 'fr', 'Consulting & Accompagnement IT', 'text', 'Consulting & Accompagnement IT', NOW()),
('global', 'training_consulting', 'en', 'IT Consulting & Support', 'text', 'IT Consulting & Support', NOW()),

('global', 'nav_research', 'fr', 'Recherche', 'text', 'Recherche', NOW()),
('global', 'nav_research', 'en', 'Research', 'text', 'Research', NOW()),

('global', 'nav_news', 'fr', 'Actualités / Blog', 'text', 'Actualités / Blog', NOW()),
('global', 'nav_news', 'en', 'News / Blog', 'text', 'News / Blog', NOW()),

('global', 'news_articles', 'fr', 'Actualités', 'text', 'Actualités', NOW()),
('global', 'news_articles', 'en', 'News', 'text', 'News', NOW()),

('global', 'nav_contact', 'fr', 'Contact', 'text', 'Contact', NOW()),
('global', 'nav_contact', 'en', 'Contact', 'text', 'Contact', NOW()),

-- ===== PAGE INDEX =====
('index', 'welcome_title', 'fr', 'Bienvenue dans notre section actualités et blogs', 'text', 'Bienvenue dans notre section actualités et blogs', NOW()),
('index', 'welcome_title', 'en', 'Welcome to our news and blog section', 'text', 'Welcome to our news and blog section', NOW()),

('index', 'welcome_subtitle', 'fr', 'Découvrez les dernières nouvelles...', 'text', 'Découvrez les dernières nouvelles...', NOW()),
('index', 'welcome_subtitle', 'en', 'Discover the latest news...', 'text', 'Discover the latest news...', NOW()),

('index', 'welcome_section_title', 'fr', 'Bienvenue chez OUTSIDERS', 'text', 'Bienvenue chez OUTSIDERS', NOW()),
('index', 'welcome_section_title', 'en', 'Welcome to OUTSIDERS', 'text', 'Welcome to OUTSIDERS', NOW()),

('index', 'innovation_title', 'fr', 'Innovation et Avenir', 'text', 'Innovation et Avenir', NOW()),
('index', 'innovation_title', 'en', 'Innovation & Future', 'text', 'Innovation & Future', NOW()),

('index', 'inclusion_title', 'fr', 'Inclusion & Recherche', 'text', 'Inclusion & Recherche', NOW()),
('index', 'inclusion_title', 'en', 'Inclusion & Research', 'text', 'Inclusion & Research', NOW()),

('index', 'services_title', 'fr', 'Notre gamme de services', 'text', 'Notre gamme de services', NOW()),
('index', 'services_title', 'en', 'Our range of services', 'text', 'Our range of services', NOW()),

-- ===== PAGE MISSION =====
('mission', 'hero_title', 'fr', 'Bienvenue dans notre section mission et vision', 'text', 'Bienvenue dans notre section mission et vision', NOW()),
('mission', 'hero_title', 'en', 'Welcome to our Mission and Vision section', 'text', 'Welcome to our Mission and Vision section', NOW()),

('mission', 'hero_text', 'fr', 'Découvrez les dernières nouvelles...', 'text', 'Découvrez les dernières nouvelles...', NOW()),
('mission', 'hero_text', 'en', 'Discover the latest news...', 'text', 'Discover the latest news...', NOW()),

('mission', 'innovation_text1', 'fr', 'Chez Outsiders, nous croyons fermement...', 'text', 'Chez Outsiders, nous croyons fermement...', NOW()),
('mission', 'innovation_text1', 'en', 'At Outsiders, we firmly believe...', 'text', 'At Outsiders, we firmly believe...', NOW()),

('mission', 'innovation_text2', 'fr', 'Notre palette de services...', 'text', 'Notre palette de services...', NOW()),
('mission', 'innovation_text2', 'en', 'Our range of services reflects...', 'text', 'Our range of services reflects...', NOW()),

('mission', 'innovation_text3', 'fr', 'Le numérique transforme...', 'text', 'Le numérique transforme...', NOW()),
('mission', 'innovation_text3', 'en', 'Digital technology is profoundly...', 'text', 'Digital technology is profoundly...', NOW()),

('mission', 'innovation_text4', 'fr', 'Notre engagement va au-delà...', 'text', 'Notre engagement va au-delà...', NOW()),
('mission', 'innovation_text4', 'en', 'Our commitment goes beyond...', 'text', 'Our commitment goes beyond...', NOW());
