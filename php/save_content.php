<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// =========================
// DB CONFIG
// =========================
$host = "localhost";
$db_user = "outsdrsc_outsiders";
$db_pass = "AQW8759mlouK123vgyhn";
$db_name = "outsdrsc_cms_site";

// =========================
// CONNECT
// =========================
$mysqli = new mysqli($host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// =========================
// READ JSON BODY
// =========================
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON (array expected)']);
    exit;
}

// =========================
// SAVE EACH ELEMENT
// =========================
foreach ($data as $item) {
    $page  = $mysqli->real_escape_string($item['page'] ?? 'general');
    $key   = $mysqli->real_escape_string($item['key'] ?? '');
    $type  = $mysqli->real_escape_string($item['type'] ?? 'text');
    $value = $item['value'] ?? '';

    // If link type, store JSON encoded
    if ($type === 'link' && is_string($value) === false) {
        $value = json_encode($value, JSON_UNESCAPED_UNICODE);
    }

    $valueEsc = $mysqli->real_escape_string($value);

    $mysqli->query("
        INSERT INTO site_content (page, element_key, type, value)
        VALUES ('$page', '$key', '$type', '$valueEsc')
        ON DUPLICATE KEY UPDATE value='$valueEsc', type='$type', updated_at=NOW()
    ");
}

echo json_encode(['status' => 'success']);
$mysqli->close();
?>
