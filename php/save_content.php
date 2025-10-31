<?php
$mysqli = new mysqli("localhost", "user", "password", "database");
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

foreach ($data as $item) {
    $page = $mysqli->real_escape_string($item['page']);
    $key = $mysqli->real_escape_string($item['key']);
    $type = $mysqli->real_escape_string($item['type']);
    $value = $mysqli->real_escape_string($item['value']);

    $mysqli->query("
        INSERT INTO site_content (page, element_key, type, value)
        VALUES ('$page', '$key', '$type', '$value')
        ON DUPLICATE KEY UPDATE value='$value', type='$type', updated_at=NOW()
    ");
}

echo json_encode(["status" => "success"]);
?>
