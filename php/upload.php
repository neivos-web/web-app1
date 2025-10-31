<?php
// Allowed origins
$allowed_origins = [
    'http://127.0.0.1:5500',        
    'https://client-web1.netlify.app', 
    'https://outsdrs.com'           
];

// Detect origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// Base upload directory
$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

// Page folder from query param
$pageFolder = isset($_GET['page']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['page']) : 'general';

// Check file
if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["error" => "No file uploaded"]);
    exit;
}

$file = $_FILES['file'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$typeDir = in_array($ext, ['mp4', 'mov', 'avi', 'webm']) ? 'videos' : 'images';

// Create folder
$targetDir = $uploadDir . $pageFolder . '/' . $typeDir . '/';
if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);

// Unique filename
$filename = uniqid('upload_') . '.' . $ext;
$targetPath = $targetDir . $filename;

// Move file
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $url = "{$protocol}://{$host}/uploads/{$pageFolder}/{$typeDir}/{$filename}";

    echo json_encode(["url" => $url]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save file"]);
}

// Always exit after sending JSON
exit();
