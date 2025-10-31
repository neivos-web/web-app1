<?php
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
// GET PAGE PARAMETER
// =========================
$page = $_GET['page'] ?? 'home';
$page = $mysqli->real_escape_string($page);

// =========================
// QUERY CONTENT
// =========================
$sql = "SELECT * FROM site_content WHERE page='$page' ORDER BY id ASC";
$result = $mysqli->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => $mysqli->error]);
    exit;
}

// =========================
// FORMAT DATA
// =========================
$data = [
    'contentBoxes' => [],
    'other' => []
];

while ($row = $result->fetch_assoc()) {
    $key = $row['element_key'];
    $type = $row['type'];
    $value = $row['value'];

    // Detect content boxes by key pattern: page_index_key
    if (preg_match('/^' . preg_quote($page, '/') . '_(\d+)_(.+)$/', $key, $matches)) {
        $index = intval($matches[1]);
        $subKey = $matches[2];

        if (!isset($data['contentBoxes'][$index])) {
            $data['contentBoxes'][$index] = ['title' => '', 'paragraphs' => [], 'image' => null];
        }

        if ($subKey === 'title') {
            $data['contentBoxes'][$index]['title'] = $value;
        } elseif (strpos($subKey, 'paragraph_') === 0) {
            $data['contentBoxes'][$index]['paragraphs'][] = $value;
        } elseif ($subKey === 'image') {
            $data['contentBoxes'][$index]['image'] = $value;
        }
    } else {
        // Static elements
        if ($type === 'link') {
            $data['other'][$key] = ['type' => $type, 'value' => json_decode($value, true)];
        } else {
            $data['other'][$key] = ['type' => $type, 'value' => $value];
        }
    }
}

// =========================
// RETURN JSON
// =========================
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Close connection
$mysqli->close();
?>
