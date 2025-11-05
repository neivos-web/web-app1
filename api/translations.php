<?php
// api/translations.php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Vérif auth = admin 
if (!isset($_SESSION['admin'])) {
    header("Location: admin.html");
    exit;
}

$pdo = new PDO('mysql:host=localhost;dbname=outsdrsc_cms_site;charset=utf8mb4', 'db_user', 'db_pass', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

// Configuration de la base de données
$host = "localhost";
$dbname = "outsdsrc_cms_site";
$user = "outsdrsc_outsiders"; 
$pass = "AQW8759mlouK123vgyhn";     

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? 'get';

// Récupérer les textes d’une langue donnée
if ($action === 'get') {
    $lang = $_GET['lang'] ?? 'fr';
    $stmt = $pdo->prepare("SELECT `key`, `text`, `type`, `value` FROM site_content WHERE lang = :lang");
    $stmt->execute([':lang' => $lang]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($data as $row) {
        if ($row['type'] === 'image') {
            $result[$row['key']] = $row['value']; // pour images, on stocke l'URL
        } else {
            $result[$row['key']] = $row['text']; // pour texte
        }
    }
    echo json_encode($result);
    exit;
}

// Mettre à jour une traduction
if ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!isset($payload['key'], $payload['lang'], $payload['text'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Requête invalide']);
        exit;
    }

    $key = trim($payload['key']);
    $lang = trim($payload['lang']);
    $text = trim($payload['text']);
    $page = $payload['page'] ?? 'global';

    $stmt = $pdo->prepare("
        INSERT INTO site_content (`page`, `key`, `lang`, `text`, `type`, `value`, `updated_at`)
        VALUES (:page, :key, :lang, :text, 'text', NULL, NOW())
        ON DUPLICATE KEY UPDATE `text` = :text, `updated_at` = NOW()
    ");
    $stmt->execute([
        ':page' => $page,
        ':key' => $key,
        ':lang' => $lang,
        ':text' => $text
    ]);

    echo json_encode(['status' => 'ok', 'message' => 'Traduction mise à jour']);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Action inconnue']);