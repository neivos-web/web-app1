<?php
header('Content-Type: application/json');
$page = $_GET['page'] ?? 'general';
$file = __DIR__ . "/content_$page.json";

if (!file_exists($file)) {
    echo json_encode(['other'=>[], 'contentBoxes'=>[]]);
    exit;
}

$data = file_get_contents($file);
echo $data;
?>
