<?php
header("Access-Control-Allow-Origin: *"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// =========================
// CONFIGURATION
// =========================
$host = "localhost";
$db_user = "outsdrsc_outsiders";
$db_pass = "AQW8759mlouK123vgyhn";
$db_name = "outsdrsc_cms_site";

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
// FLATTEN DATA TO ARRAY OF OBJECTS
// =========================
$data = [];

while ($row = $result->fetch_assoc()) {
    $key = $row['element_key'];
    $type = $row['type'];
    $value = $row['value'];

    // Decode links if necessary
    if ($type === 'link') {
        $decoded = json_decode($value, true);
        if ($decoded !== null) $value = $decoded;
    }

    $data[] = [
        'page' => $page,
        'key'  => $key,
        'type' => $type,
        'value'=> $value
    ];
}

// =========================
// RETURN JSON
// =========================
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Close connection
$mysqli->close();
?>
