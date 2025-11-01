<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

$host = "localhost";
$db_user = "outsdrsc_outsiders";
$db_pass = "AQW8759mlouK123vgyhn";
$db_name = "outsdrsc_cms_site";

$mysqli = new mysqli($host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get JSON array
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Save each element
foreach ($data as $item) {
    $page = $mysqli->real_escape_string($item['page'] ?? 'home');
    $key  = $mysqli->real_escape_string($item['key'] ?? '');
    $type = $mysqli->real_escape_string($item['type'] ?? 'text');
    $value = $mysqli->real_escape_string(
        ($type === 'link') ? json_encode($item['value'], JSON_UNESCAPED_UNICODE) : $item['value']
    );

    if ($key) {
        $mysqli->query("
            INSERT INTO site_content (page, element_key, type, value)
            VALUES ('$page', '$key', '$type', '$value')
            ON DUPLICATE KEY UPDATE value='$value', type='$type', updated_at=NOW()
        ");
    }
}

echo json_encode(['status' => 'success']);
$mysqli->close();
?>
