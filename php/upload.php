<?php
// ======================= CORS HEADERS =======================
header("Access-Control-Allow-Origin: *"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ======================= INITIAL RESPONSE =======================
$response = [];

// ======================= CHECK FILE =======================
if (!isset($_FILES['file'])) {
    http_response_code(400);
    $response['error'] = "No file uploaded.";
    echo json_encode($response);
    exit;
}

$file = $_FILES['file'];

// ======================= DETERMINE UPLOAD FOLDER =======================
// Optional: organize by page
$page = isset($_GET['page']) ? preg_replace("/[^a-zA-Z0-9_-]/", "_", $_GET['page']) : "general";
$uploadDir = __DIR__ . "/uploads/$page/";

// Create directory if it does not exist
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        $response['error'] = "Failed to create directory.";
        echo json_encode($response);
        exit;
    }
}

// ======================= MOVE FILE =======================
$fileName = basename($file['name']);
$targetFile = $uploadDir . $fileName;

// Optional: add timestamp to avoid overwriting
$targetFile = $uploadDir . time() . "_" . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetFile)) {
    // Return accessible URL (adjust path if your PHP folder is not web-root)
    $response['url'] = "/php/uploads/$page/" . basename($targetFile);
    echo json_encode($response);
    exit;
} else {
    http_response_code(500);
    $response['error'] = "Failed to move uploaded file.";
    echo json_encode($response);
    exit;
}
