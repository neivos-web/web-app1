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
    $stmt = $pdo->prepare("SELECT content, html, last_modified FROM pages_content WHERE page = :page");
    $stmt->execute([':page' => $page]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["success" => false, "error" => "No content found"]);
        exit;
    }

    $data = [
        "success" => true,
        "content" => $row["content"] ? json_decode($row["content"], true) : null,
        "html" => $row["html"],
        "last_modified" => $row["last_modified"]
    ];

    echo json_encode($data, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
