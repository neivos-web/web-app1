<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db_connect.php"; // your PDO connection

$data = json_decode(file_get_contents("php://input"), true);

$page = $data['page'] ?? '';
$content = $data['content'] ?? null; // should be array with 'html' key
$date = date("Y-m-d H:i:s");

if (!$page || !$content || !isset($content['html'])) {
    echo json_encode(["success" => false, "error" => "Page or content missing"]);
    exit;
}

try {
    // Create table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pages_content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            page VARCHAR(255) NOT NULL UNIQUE,
            content TEXT NOT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");

    // Store as JSON string
    $jsonContent = json_encode($content, JSON_UNESCAPED_UNICODE);

    $stmt = $pdo->prepare("
        INSERT INTO pages_content (page, content, last_modified)
        VALUES (:page, :content, :last_modified)
        ON DUPLICATE KEY UPDATE
            content = :content,
            last_modified = :last_modified
    ");

    $stmt->execute([
        ':page' => $page,
        ':content' => $jsonContent,
        ':last_modified' => $date
    ]);

    echo json_encode([
        "success" => true,
        "updated" => $date
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>

