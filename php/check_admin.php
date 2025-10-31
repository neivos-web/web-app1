<?php
// check_admin.php
header('Content-Type: application/json');
session_start();

// Default response
$response = ['logged_in' => false];

// Example: if your login sets $_SESSION['admin_logged_in'] = true
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    $response['logged_in'] = true;
}

// Return JSON
echo json_encode($response);
exit;
