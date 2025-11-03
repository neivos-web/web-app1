<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");
require_once "db_connect.php";

session_start();

if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['key']) || !isset($input['value'])) {
    echo json_encode(["success" => false, "error" => "Invalid params"]);
    exit;
}

$key = $input['key'];
$value = $input['value'];


try {
    $stmt = $pdo->prepare("
        INSERT INTO menu_items (`key`, `value`)
        VALUES (:key, :value)
        ON DUPLICATE KEY UPDATE value = :value
    ");
    $stmt->execute([
        ":key" => $key,
        ":value" => $value
    ]);

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
