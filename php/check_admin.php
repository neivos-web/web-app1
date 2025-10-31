<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://outsdrs.com");
header("Access-Control-Allow-Credentials: true");

echo json_encode([
    'logged_in' => isset($_SESSION['admin']) && $_SESSION['admin'] !== ''
]);
