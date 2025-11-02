<?php
header("Access-Control-Allow-Origin: *"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require 'db_connect.php';
header('Content-Type: application/json');

$page = $_GET['page'] ?? '';

if (!$page) {
  echo json_encode(["success" => false, "message" => "Page parameter missing"]);
  exit;
}

try {
  $stmt = $pdo->prepare("SELECT content, last_modified FROM pages_content WHERE page = :page");
  $stmt->execute([':page' => $page]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($row) {
    echo json_encode([
      "success" => true,
      "content" => json_decode($row['content'], true),
      "last_modified" => $row['last_modified']
    ]);
  } else {
    echo json_encode(["success" => false, "message" => "No content found for this page"]);
  }
} catch (Exception $e) {
  echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
