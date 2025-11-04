const translations = {
  fr: {
    // === Menu ===
    nav_mission: "Mission et Vision",
    nav_portfolio: "Portefeuille",
    portfolio_games: "Jeux Vidéo",
    portfolio_ar: "AR/MR",
    portfolio_vr: "VR",
    portfolio_cad: "CAD",
    nav_training: "Formations & conseils",
    training_vr: "VR",
    training_games: "Jeux Vidéo",
    training_iot: "Systèmes Embarqués & IOT",
    training_consulting: "Consulting & Accompagnement IT",
    nav_research: "Recherche",
    nav_news: "Actualités / Blog",
    news_articles: "Actualités",
    nav_contact: "Contact",

    // === Pied de page ===
    footer_contact_text: "Vous avez des questions ? <span>Contactez-nous</span> — nous sommes à votre disposition.",
    footer_contact_btn: "Contactez-nous !",
    footer_legal: "Mentions légales",
    footer_privacy: "Déclaration de confidentialité",

    // === Page d'accueil ===
    welcome_title: "OUTSIDERS – L’Innovation au Service du Changement",
    welcome_subtitle: "Apprenez les technologies les plus demandées du moment grâce à nos formations interactives et pratiques.<br>OUTSIDERS vous accompagne pour développer vos compétences, booster votre carrière et devenir acteur de l’innovation numérique.",
    articles_title: "Actualités et blogs chez Outsiders",
    articles_loading: "Chargement des actualités...",
    welcome_section_title: "Bienvenue chez OUTSIDERS",
    welcome_section_text: "Chez Outsiders Studio, nous sommes enthousiastes à l’idée de vous accompagner dans la découverte des opportunités offertes par la transformation numérique. Posons ensemble les bases de l’innovation de demain, en alliant créativité et performance pour atteindre de nouveaux sommets.",
    innovation_title: "Innovation et Avenir",
    innovation_paragraph_1: "Chez Outsiders, nous restons toujours à la pointe de l’actualité et de la technologie...",
    innovation_paragraph_2: "La numérisation a entraîné de profonds changements dans notre société...",
    inclusion_title: "Inclusion & Recherche",
    inclusion_paragraph_1: "Pour nous, l'inclusion est bien plus qu'une simple idée...",
    inclusion_paragraph_2: "Grâce à la collaboration et à la force de notre équipe interdisciplinaire...",
    services_title: "Notre gamme de services",
    services_paragraph_1: "Nos services s'étendent sur diverses technologies virtuelles...",
    services_paragraph_2: "Outsiders s'engage intensivement dans la recherche et le développement...",
    footer_text: "Vous avez des questions ?",
    contact_link: "Contactez-nous",

    // === Page mission ===
    hero_title: "Bienvenue dans notre section mission et vision",
    hero_text: "Découvrez les dernières nouvelles et des articles de blog qui illustrent notre vision et nos derniers progrès réalisés.",
    innovation_text1: "Chez Outsiders, nous croyons fermement que l'innovation doit servir l'humain...",
    innovation_text2: "Notre palette de services reflète cette ambition...",
    innovation_text3: "Le numérique transforme profondément nos façons de travailler...",
    innovation_text4: "Notre engagement va au-delà de la simple performance technique..."
  },

  en: {
    // === Menu ===
    nav_mission: "Mission & Vision",
    nav_portfolio: "Portfolio",
    portfolio_games: "Video Games",
    portfolio_ar: "AR/MR",
    portfolio_vr: "VR",
    portfolio_cad: "CAD",
    nav_training: "Training & Consulting",
    training_vr: "VR",
    training_games: "Video Games",
    training_iot: "Embedded Systems & IoT",
    training_consulting: "IT Consulting & Support",
    nav_research: "Research",
    nav_news: "News / Blog",
    news_articles: "News",
    nav_contact: "Contact",

    // === Footer ===
    footer_contact_text: "Have questions? <span>Contact us</span> — we are at your disposal.",
    footer_contact_btn: "Contact us!",
    footer_legal: "Legal Notice",
    footer_privacy: "Privacy Policy",

    // === Home Page ===
    welcome_title: "OUTSIDERS – Innovation at the Service of Change",
    welcome_subtitle: "Learn the most in-demand technologies through our interactive and practical training programs. OUTSIDERS helps you develop your skills, boost your career, and become a key player in digital innovation.",
    articles_title: "News and blogs at Outsiders",
    articles_loading: "Loading news...",
    welcome_section_title: "Welcome to OUTSIDERS",
    welcome_section_text: "At Outsiders Studio, we are excited to guide you in exploring the opportunities offered by digital transformation...",
    innovation_title: "Innovation & Future",
    innovation_paragraph_1: "At Outsiders, we always stay at the forefront of news and technology...",
    innovation_paragraph_2: "Digitization has brought profound changes to our society...",
    inclusion_title: "Inclusion & Research",
    inclusion_paragraph_1: "For us, inclusion is much more than an idea...",
    inclusion_paragraph_2: "Through collaboration and the strength of our interdisciplinary team...",
    services_title: "Our range of services",
    services_paragraph_1: "Our services span various virtual technologies...",
    services_paragraph_2: "Outsiders is deeply committed to research and development...",
    footer_text: "Do you have questions?",
    contact_link: "Contact us",

    // === Mission Page ===
    hero_title: "Welcome to our Mission and Vision section",
    hero_text: "Discover the latest news and blog articles that illustrate our vision and recent achievements.",
    innovation_text1: "At Outsiders, we firmly believe that innovation should serve humanity...",
    innovation_text2: "Our range of services reflects this ambition...",
    innovation_text3: "Digital technology is profoundly transforming the way we work...",
    innovation_text4: "Our commitment goes beyond mere technical performance..."
  },
};

// === Gestion du sélecteur de langue ===
document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("language-selector");

  if (!selector) return;

  // Fonction principale de traduction
  const translatePage = (lang) => {
    document.querySelectorAll("[data-key]").forEach((el) => {
      const key = el.getAttribute("data-key");
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });
    localStorage.setItem("lang", lang);
  };

  // Chargement initial
  const savedLang = localStorage.getItem("lang") || "fr";
  selector.value = savedLang;
  translatePage(savedLang);

  // Changement de langue
  selector.addEventListener("change", (e) => {
    translatePage(e.target.value);
  });
});
