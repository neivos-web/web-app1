<?php

header("Access-Control-Allow-Origin: https://outsdrs.com"); // Replace * with your domain in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
session_start();
session_destroy();
header('Content-Type: application/json');
echo json_encode(['success' => true]);
