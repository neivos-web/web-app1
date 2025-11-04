<?php
header("Access-Control-Allow-Origin: https://outsdrs.com"); // replace * with domain in prod
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require 'db_connect.php'; // contains $pdo

try {
    $stmt = $pdo->query("SELECT `key`, `value` FROM menu_items ORDER BY id ASC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($rows) {
        $menu = [];
        foreach ($rows as $row) {
            $menu[$row['key']] = $row['value'];
        }

        echo json_encode([
            "success" => true,
            "menu" => $menu,
            "count" => count($menu)
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No menu items found"
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
