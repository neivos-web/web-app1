<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// basic CORS if needed
// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Methods: POST");
// header("Access-Control-Allow-Headers: Content-Type");

try {
    // --- CONFIG: adjust these ---
    $uploadBase = __DIR__ . '/../uploads'; // ensure this folder is writable
    $dbHost = 'localhost';
    $dbName = 'outsdrsc_cms_site';
    $dbUser = 'outsdrsc_outsiders';
    $dbPass = 'AQW8759mlouK123vgyhn';
    // -----------------------------

    // Connect DB (PDO)
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Method not allowed");
    }

    $page = isset($_POST['page']) ? preg_replace('/[^a-zA-Z0-9_\-]/', '', $_POST['page']) : 'index';
    $entries = isset($_POST['entries']) ? json_decode($_POST['entries'], true) : null;
    if (!is_array($entries)) $entries = [];

    $saved = [];

    // Ensure upload dir exists
    $pageUploadDir = $uploadBase . '/' . $page;
    if (!is_dir($pageUploadDir)) {
        mkdir($pageUploadDir, 0755, true);
    }

    // Process each entry
    foreach ($entries as $key => $meta) {
        $type = isset($meta['type']) ? $meta['type'] : 'text';
        $value = isset($meta['value']) ? $meta['value'] : '';

        if ($type === 'image') {
            // file input expected under file_{key}
            $fileField = 'file_' . $key;
            if (!isset($_FILES[$fileField]) || $_FILES[$fileField]['error'] !== UPLOAD_ERR_OK) {
                // skip or handle missing file
                $saved[] = ['key' => $key, 'type' => 'image', 'path' => null, 'status' => 'no_file'];
                continue;
            }
            $f = $_FILES[$fileField];
            $ext = pathinfo($f['name'], PATHINFO_EXTENSION);
            $safeName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($f['name'], PATHINFO_FILENAME));
            $uniq = uniqid();
            $destName = $safeName . "_" . $uniq . "." . $ext;
            $destPath = $pageUploadDir . '/' . $destName;
            if (!move_uploaded_file($f['tmp_name'], $destPath)) {
                $saved[] = ['key' => $key, 'type' => 'image', 'path' => null, 'status' => 'error'];
                continue;
            }
            // stored path accessible by web (adjust if your uploads folder is elsewhere)
            $webPath = "/uploads/{$page}/{$destName}";

            // upsert into DB
            upsertContent($pdo, $page, $key, 'image', $webPath);

            $saved[] = ['key' => $key, 'type' => 'image', 'path' => $webPath, 'status' => 'ok'];
        } elseif ($type === 'text' || $type === 'block') {
            // Save text or block HTML
            upsertContent($pdo, $page, $key, $type, $value);
            $saved[] = ['key' => $key, 'type' => $type, 'value' => $value, 'status' => 'ok'];
        } else {
            // unknown type
            $saved[] = ['key' => $key, 'type' => $type, 'status' => 'skipped'];
        }
    }

    echo json_encode(['success' => true, 'saved' => $saved]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

/**
 * Upsert function for site_content table
 * Assumes table with unique(page + content_key)
 */
function upsertContent($pdo, $page, $key, $type, $value) {
    // ensure table exists — if not, create (lightweight)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS site_content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            page VARCHAR(255) NOT NULL,
            content_key VARCHAR(255) NOT NULL,
            content_type VARCHAR(50) NOT NULL,
            content_value MEDIUMTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_page_key (page, content_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Try update then insert if not exists
    $sql = "INSERT INTO site_content (page, content_key, content_type, content_value)
            VALUES (:page, :key, :type, :value)
            ON DUPLICATE KEY UPDATE content_type = :type2, content_value = :value2, updated_at = CURRENT_TIMESTAMP";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':page' => $page,
        ':key' => $key,
        ':type' => $type,
        ':value' => $value,
        ':type2' => $type,
        ':value2' => $value
    ]);
}
