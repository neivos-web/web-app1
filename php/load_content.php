<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db_connect.php";

$page = $_GET['page'] ?? '';

if (!$page) {
    echo json_encode(["success" => false, "error" => "Missing page parameter"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT content FROM pages_content WHERE page = :page LIMIT 1");
    $stmt->execute([':page' => $page]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        echo json_encode(["success" => true, "content" => []]); // empty array instead of null
        exit;
    }

    echo json_encode([
        "success" => true,
        "content" => json_decode($result['content'], true) ?? []
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
