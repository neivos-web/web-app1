<?php

header("Access-Control-Allow-Origin: *"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
// =========================
// CONFIGURATION
// =========================
$host = "localhost";
$db_user = "outsdrsc";
$db_pass = "";
$db_name = "cms_site";

header('Content-Type: application/json; charset=utf-8');

// =========================
// CONNECT TO DATABASE
// =========================
$mysqli = new mysqli($host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// =========================
// GET JSON DATA
// =========================
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$page = $mysqli->real_escape_string($data['page'] ?? 'home');

// =========================
// SAVE STATIC ELEMENTS
// =========================
if (!empty($data['other']) && is_array($data['other'])) {
    foreach ($data['other'] as $key => $item) {
        $keyEsc = $mysqli->real_escape_string($key);
        $typeEsc = $mysqli->real_escape_string($item['type'] ?? 'text');
        $valueEsc = $mysqli->real_escape_string(
            ($typeEsc === 'link') ? json_encode($item['value'], JSON_UNESCAPED_UNICODE) : $item['value']
        );

        $mysqli->query("
            INSERT INTO site_content (page, element_key, type, value)
            VALUES ('$page', '$keyEsc', '$typeEsc', '$valueEsc')
            ON DUPLICATE KEY UPDATE value='$valueEsc', type='$typeEsc', updated_at=NOW()
        ");
    }
}

// =========================
// SAVE CONTENT BOXES
// =========================
if (!empty($data['contentBoxes']) && is_array($data['contentBoxes'])) {
    foreach ($data['contentBoxes'] as $index => $box) {
        $title = $mysqli->real_escape_string($box['title'] ?? '');
        $image = $mysqli->real_escape_string($box['image'] ?? '');

        // Save title
        $mysqli->query("
            INSERT INTO site_content (page, element_key, type, value)
            VALUES ('$page', '{$page}_{$index}_title', 'text', '$title')
            ON DUPLICATE KEY UPDATE value='$title', updated_at=NOW()
        ");

        // Save image
        if ($image) {
            $mysqli->query("
                INSERT INTO site_content (page, element_key, type, value)
                VALUES ('$page', '{$page}_{$index}_image', 'image', '$image')
                ON DUPLICATE KEY UPDATE value='$image', updated_at=NOW()
            ");
        }

        // Save paragraphs
        if (!empty($box['paragraphs']) && is_array($box['paragraphs'])) {
            foreach ($box['paragraphs'] as $pIndex => $paragraph) {
                $para = $mysqli->real_escape_string($paragraph);
                $mysqli->query("
                    INSERT INTO site_content (page, element_key, type, value)
                    VALUES ('$page', '{$page}_{$index}_paragraph_{$pIndex}', 'text', '$para')
                    ON DUPLICATE KEY UPDATE value='$para', updated_at=NOW()
                ");
            }
        }
    }
}

echo json_encode(['status' => 'success']);
$mysqli->close();
?>
