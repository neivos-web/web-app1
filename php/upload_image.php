<?php
// ======================= CORS HEADERS =======================
header("Access-Control-Allow-Origin: *"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require 'db_connect.php';

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['file'])) {
  echo json_encode(["success" => false, "error" => "No file uploaded"]);
  exit;
}

$file = $_FILES['file'];
$fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

if (!in_array($fileExt, $allowed)) {
  echo json_encode(["success" => false, "error" => "Invalid file type"]);
  exit;
}

$filename = uniqid('img_', true) . '.' . $fileExt;
$filePath = $uploadDir . $filename;
$fileUrl = '/uploads/' . $filename;

if (move_uploaded_file($file['tmp_name'], $filePath)) {
  echo json_encode(["success" => true, "url" => $fileUrl]);
} else {
  echo json_encode(["success" => false, "error" => "Upload failed"]);
}
?>
