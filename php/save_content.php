<?php
header('Content-Type: application/json');
$data = file_get_contents('php://input');
if (!$data) {
    echo json_encode(['error' => 'Aucune donnée reçue']);
    exit;
}
$page = $_GET['page'] ?? 'general';
$file = __DIR__ . "/content_$page.json";

if (file_put_contents($file, $data) === false) {
    echo json_encode(['error' => 'Impossible de sauvegarder le fichier']);
} else {
    echo json_encode(['success' => true]);
}
?>
