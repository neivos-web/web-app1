<?php
$mysqli = new mysqli("localhost", "user", "password", "database");
header('Content-Type: application/json');

$page = $mysqli->real_escape_string($_GET['page'] ?? 'home');
$result = $mysqli->query("SELECT * FROM site_content WHERE page='$page'");

$content = [];
while ($row = $result->fetch_assoc()) {
    $content[$row['element_key']] = [
        'type' => $row['type'],
        'value' => $row['value']
    ];
}

echo json_encode($content);
?>
