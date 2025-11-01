<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// =========================
// DATABASE CONFIG
// =========================
$mysqli = new mysqli("localhost", "outsdrsc_outsiders", "AQW8759mlouK123vgyhn", "outsdrsc_cms_site");
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed', 'msg' => $mysqli->connect_error]);
    exit;
}

// =========================
// GET JSON INPUT
// =========================
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// =========================
// SAVE EACH ITEM
// =========================
foreach ($data as $item) {
    $page  = $mysqli->real_escape_string($item['page'] ?? 'general');
    $key   = $mysqli->real_escape_string($item['key'] ?? '');
    $type  = $mysqli->real_escape_string($item['type'] ?? 'text');
    $value = $item['value'] ?? '';

    if ($type === 'link') $value = $mysqli->real_escape_string(json_encode($value, JSON_UNESCAPED_UNICODE));
    else $value = $mysqli->real_escape_string($value);

    if ($key) {
        $sql = "INSERT INTO site_content (page, element_key, type, value, updated_at)
                VALUES ('$page', '$key', '$type', '$value', NOW())
                ON DUPLICATE KEY UPDATE value='$value', type='$type', updated_at=NOW()";

        if (!$mysqli->query($sql)) {
            http_response_code(500);
            echo json_encode(['error' => 'DB query failed', 'sql_error' => $mysqli->error, 'item' => $item]);
            exit;
        }
    }
}

// =========================
// RETURN SUCCESS
// =========================
echo json_encode(['success' => true]);
$mysqli->close();
?>
