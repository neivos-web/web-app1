CREATE DATABASE IF NOT EXISTS cms_site
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE cms_site;

CREATE TABLE IF NOT EXISTS site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(255) NOT NULL COMMENT 'e.g., home, mission, portfolio',
    element_key VARCHAR(512) NOT NULL COMMENT 'unique identifier in DOM',
    type ENUM('text','image','video','link','json') NOT NULL,
    value TEXT COMMENT 'text, URL, or JSON string depending on type',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_page_element (page, element_key)
) ENGINE=InnoDB 


CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
