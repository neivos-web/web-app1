<?php
session_start();

// Headers CORS + JSON
header("Access-Control-Allow-Origin: https://outsdrs.com");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Vérifie si l’admin est connecté
$logged_in = isset($_SESSION['admin']) && $_SESSION['admin'] !== '';

echo json_encode([
    'logged_in' => $logged_in
]);
exit;
?>