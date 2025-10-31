<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

// Autorisation CORS
header("Access-Control-Allow-Origin: https://outsdrs.com");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Connexion à la DB
$mysqli = new mysqli("localhost", "outsdrsc_outsiders", "AQW8759mlouK123vgyhn", "outsdrsc_cms_site");
if ($mysqli->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion DB: ' . $mysqli->connect_error]);
    exit;
}

// Récupérer les données POST envoyées en fetch
parse_str(file_get_contents("php://input"), $postData);
$username = $postData['username'] ?? '';
$password = $postData['password'] ?? '';

// Vérification des champs
if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Champs manquants']);
    exit;
}

// Préparer et exécuter la requête
$stmt = $mysqli->prepare("SELECT password_hash FROM admin_users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
    $stmt->bind_result($hash);
    $stmt->fetch();

    // Vérifier le mot de passe
    if (password_verify($password, $hash) || $password === $hash) {
        $_SESSION['admin'] = $username;
        echo json_encode(['success' => true]);
        exit;
    }
}

// Si échec
echo json_encode(['success' => false, 'message' => 'Nom d’utilisateur ou mot de passe incorrect']);
exit;
?>
