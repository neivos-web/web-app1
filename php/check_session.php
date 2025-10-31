<?php

header("Access-Control-Allow-Origin: *"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

session_start();
header('Content-Type: application/json');

if(!empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true){
    echo json_encode(['loggedIn' => true]);
} else {
    echo json_encode(['loggedIn' => false]);
}
