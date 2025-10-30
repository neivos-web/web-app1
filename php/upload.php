<?php
header('Content-Type: application/json');

// Allow local testing from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// === Upload base directory ===
$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// === Check file presence ===
if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["error" => "No file uploaded"]);
    exit;
}

// === Detect type (image/video) ===
$file = $_FILES['file'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$typeDir = in_array($ext, ['mp4', 'mov', 'avi', 'webm']) ? 'videos' : 'images';

$targetDir = $uploadDir . $typeDir . '/';
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// === Generate unique filename ===
$filename = uniqid('upload_') . '.' . $ext;
$targetPath = $targetDir . $filename;

// === Move uploaded file ===
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Detect environment (local or online)
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $url = "{$protocol}://{$host}/uploads/{$typeDir}/{$filename}";
    
    echo json_encode(["url" => $url]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save file"]);
}
