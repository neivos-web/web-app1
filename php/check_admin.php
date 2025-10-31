<?php

session_start();

header("Access-Control-Allow-Origin: *"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
echo json_encode(['logged_in' => isset($_SESSION['admin']) && $_SESSION['admin'] === true]);
?>
