<?php
// =========================
// CONFIGURATION
// =========================
$host = "localhost";          // usually 'localhost'
$db_user = "outsdrsc";    // replace with your DB username
$db_pass = "";    // replace with your DB password
$db_name = "cms_site";        // your database name

header('Content-Type: application/json; charset=utf-8');

// =========================
// CONNECT TO DATABASE
// =========================
$mysqli = new mysqli($host, $db_user, $db_pass, $db_name);

// Check connection
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
$content = [];
while ($row = $result->fetch_assoc()) {
    $content[$row['element_key']] = [
        'type' => $row['type'],
        'value' => $row['value'],
        'updated_at' => $row['updated_at']
    ];
}

// =========================
// RETURN JSON
// =========================
echo json_encode($content, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// Close connection
$mysqli->close();
?>
