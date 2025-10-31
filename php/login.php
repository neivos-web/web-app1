<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Get JSON POST data
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Veuillez remplir tous les champs.']);
    exit;
}

// Load users
$users = include 'admin_users.php';

if (isset($users[$email]) && password_verify($password, $users[$email])) {
    // Login success
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_email'] = $email;
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect.']);
}
?>
