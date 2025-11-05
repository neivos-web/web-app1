<?php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$key = $data['key'];
$value = $data['value'];
$lang = $data['lang'];

// Insert ou update
$stmt = $pdo->prepare("INSERT INTO translations (lang_code, key_name, value)
    VALUES (:lang, :key, :value)
    ON DUPLICATE KEY UPDATE value = :value");
$stmt->execute([
  ':lang' => $lang,
  ':key' => $key,
  ':value' => $value
]);

echo json_encode(['status'=>'success']);
