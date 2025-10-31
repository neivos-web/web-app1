<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

header("Access-Control-Allow-Origin: https://outsdrs.com");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$mysqli = new mysqli("localhost", "outsdrsc_outsiders", "AQW8759mlouK123vgyhn", "outsdrsc_cms_site");

if ($mysqli->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion DB: ' . $mysqli->connect_error]);
    exit;
}
$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';


if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Champs manquants']);
    exit;
}

$stmt = $mysqli->prepare("SELECT password_hash FROM admin_users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
    $stmt->bind_result($hash);
    $stmt->fetch();

    if (password_verify($password, $hash) || $password === $hash) {
        $_SESSION['admin'] = $username;
        echo json_encode(['success' => true]);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Nom d’utilisateur ou mot de passe incorrect']);
exit;


?>
