<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db_connect.php"; // your PDO connection


$input = json_decode(file_get_contents("php://input"), true);
$page = $input['page'] ?? '';
$content = $input['content'] ?? null;
$date = date("Y-m-d H:i:s");

if (!$page || !$content) {
    echo json_encode(["success" => false, "error" => "Missing page or content"]);
    exit;
}

try {
    // create table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pages_content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            page VARCHAR(255) NOT NULL UNIQUE,
            content LONGTEXT NOT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $jsonContent = json_encode($content, JSON_UNESCAPED_UNICODE);

    $stmt = $pdo->prepare("
        INSERT INTO pages_content (page, content, last_modified)
        VALUES (:page, :content, :last_modified)
        ON DUPLICATE KEY UPDATE content = :content, last_modified = :last_modified
    ");

    $stmt->execute([
        ':page' => $page,
        ':content' => $jsonContent,
        ':last_modified' => $date
    ]);

    echo json_encode(["success" => true, "updated" => $date]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
