<?php
include 'db.php'; // Connexion PDO

$lang = $_GET['lang'] ?? 'fr';
$stmt = $pdo->prepare("SELECT key_name, value FROM translations WHERE lang_code = ?");
$stmt->execute([$lang]);
$translations = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

header('Content-Type: application/json');
echo json_encode($translations);
