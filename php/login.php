<?php
// login.php
header('Content-Type: application/json');
session_start();

// Get JSON POST data
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['email'] ?? '';
$password = $input['password'] ?? '';

// ======= Replace with your real admin credentials =======
$admins = [
    'admin@outsiders.com' => 'admin123',  // email => password
    'karim@outsiders.com' => 'karimpass'
];

// Check credentials
if(isset($admins[$username]) && $admins[$username] === $password){
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_email'] = $username;
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
