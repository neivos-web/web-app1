<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: https://outsdrs.com");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db_connect.php"; 
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$input = json_decode(file_get_contents("php://input"), true);

$page    = $input['page'] ?? '';
$content = $input['content'] ?? null;
$html    = $input['html'] ?? null;
$date    = date("Y-m-d H:i:s");

if (!$page || (!$content && !$html)) {
    echo json_encode(["success" => false, "error" => "Missing or invalid data"]);
    exit;
}

try {
    // --- Ensure table exists ---
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pages_content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            page VARCHAR(255) NOT NULL UNIQUE,
            content LONGTEXT NULL,
            html LONGTEXT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // --- Sanitize HTML while preserving CMS markers ---
    if ($html) {
        $allowed_attrs = [
            'class', 'data-editable', 'data-type', 'data-block-id',
            'data-order', 'draggable', 'contenteditable', 'id', 'style'
        ];

        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $xpath = new DOMXPath($dom);

        foreach ($xpath->query('//*') as $node) {
            if ($node->hasAttributes()) {
                foreach (iterator_to_array($node->attributes) as $attr) {
                    if (!in_array($attr->nodeName, $allowed_attrs)) {
                        $node->removeAttribute($attr->nodeName);
                    }
                }
            }
        }

        $html = $dom->saveHTML();
    }

    // --- Prepare JSON version of structured content ---
    $jsonContent = $content ? json_encode($content, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) : null;

    // --- Insert or update ---
    $stmt = $pdo->prepare("
        INSERT INTO pages_content (page, content, html, last_modified)
        VALUES (:page, :content, :html, :last_modified)
        ON DUPLICATE KEY UPDATE 
            content = VALUES(content),
            html = VALUES(html),
            last_modified = VALUES(last_modified)
    ");

    $stmt->execute([
        ':page' => $page,
        ':content' => $jsonContent,
        ':html' => $html,
        ':last_modified' => $date
    ]);

    echo json_encode(["success" => true, "updated" => $date]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
