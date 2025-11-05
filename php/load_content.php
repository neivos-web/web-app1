<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db_connect.php"; 

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$page = $_GET['page'] ?? '';
if (!$page) {
    echo json_encode(["success" => false, "error" => "Missing page parameter"]);
    exit;
}

try {
    // --- Ensure table exists ---
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pages_content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            page VARCHAR(255) NOT NULL UNIQUE,
            content LONGTEXT NULL,
            html LONGTEXT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // --- Fetch row ---
    $stmt = $pdo->prepare("SELECT content, html, last_modified FROM pages_content WHERE page = :page");
    $stmt->execute([':page' => $page]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["success" => false, "message" => "No content found for this page"]);
        exit;
    }

    // --- Decode structured JSON if available ---
    $contentData = null;
    if (!empty($row['content'])) {
        $decoded = json_decode($row['content'], true);
        $contentData = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }

    echo json_encode([
        "success" => true,
        "page" => $page,
        "html" => $row['html'] ?? null,
        "content" => $contentData,
        "last_modified" => $row['last_modified']
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
