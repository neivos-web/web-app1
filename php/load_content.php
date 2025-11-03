<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db_connect.php";

$page = $_GET['page'] ?? '';
if (!$page) {
    echo json_encode(["success" => false, "error" => "Page not specified"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM pages_content WHERE page = :page LIMIT 1");
    $stmt->execute([':page' => $page]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["success" => false, "error" => "Page not found"]);
        exit;
    }

    $content = json_decode($row['content'], true); // decode JSON

    echo json_encode([
        "success" => true,
        "content" => $content,
        "last_modified" => $row['last_modified']
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
