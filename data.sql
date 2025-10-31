CREATE TABLE site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(255) NOT NULL,          -- e.g. 'home', 'mission', 'portfolio', etc.
    element_key VARCHAR(512) NOT NULL,   -- unique identifier in DOM (e.g., 'section1.paragraph1')
    type ENUM('text','image','video','link','json') NOT NULL,
    value TEXT,                          -- text, URL, or JSON string (depending on type)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
