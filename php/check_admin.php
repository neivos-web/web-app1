<?php
session_start();

// Must match your frontend origin exactly
header("Access-Control-Allow-Origin: https://outsdrs.com");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Check session
if (isset($_SESSION['admin']) && $_SESSION['admin']) {
    echo json_encode(["logged_in" => true, "username" => $_SESSION['admin']]);
} else {
    echo json_encode(["logged_in" => false]);
}
?>
