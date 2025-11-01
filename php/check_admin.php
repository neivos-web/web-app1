<?php
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '1');

session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://outsdrs.com");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Vérifie si l’admin est connecté
$logged_in = isset($_SESSION['admin']) && $_SESSION['admin'] !== '';

echo json_encode([
    'logged_in' => $logged_in
]);
exit;
?>