<?php


session_start();

header("Access-Control-Allow-Origin: *"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// DB connection
$mysqli = new mysqli("localhost", "outsdrsc_outsiders", "AQW8759mlouK123vgyhn", "outsdrsc_cms_site");

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données']);
    exit;
}

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $mysqli->prepare("SELECT password_hash FROM admin_users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
    $stmt->bind_result($hash);
    $stmt->fetch();
    if (password_verify($password, $hash)) {
        $_SESSION['admin'] = $username;
        echo json_encode(['success' => true]);
        exit;
    }
}

http_response_code(401);
echo json_encode(['success' => false, 'message' => 'Nom d’utilisateur ou mot de passe incorrect']);
?>
