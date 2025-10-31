<?php
// login.php (example)
session_start();
if ($username === 'admin' && $password === 'secret') {
    $_SESSION['admin_logged_in'] = true;
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}

header("Access-Control-Allow-Origin: https://outsdrs.com");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Connexion DB
$mysqli = new mysqli("localhost", "outsdrsc_outsiders", "AQW8759mlouK123vgyhn", "outsdrsc_cms_site");
if ($mysqli->connect_error) {
    echo json_encode(['success'=>false,'message'=>'Erreur DB: '.$mysqli->connect_error]);
    exit;
}

// Lire POST
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if(!$username || !$password){
    echo json_encode(['success'=>false,'message'=>'Champs manquants']);
    exit;
}

$stmt = $mysqli->prepare("SELECT password_hash FROM admin_users WHERE username=?");
$stmt->bind_param("s",$username);
$stmt->execute();
$stmt->store_result();

if($stmt->num_rows===1){
    $stmt->bind_result($hash);
    $stmt->fetch();

    if(password_verify($password,$hash) || $password===$hash){
        $_SESSION['admin']=$username;
        echo json_encode(['success'=>true]);
        exit;
    }
}

echo json_encode(['success'=>false,'message'=>'Nom d’utilisateur ou mot de passe incorrect']);
