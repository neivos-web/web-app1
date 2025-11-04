<?php
ini_set('display_errors',1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: https://outsdrs.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

$uploadDir = __DIR__ . "/../uploads/";
$publicBase = "/uploads/"; // adjust if uploads folder is public path different

if (!file_exists($uploadDir)) mkdir($uploadDir, 0755, true);

try {
    if (!empty($_FILES['file'])) {
        $f = $_FILES['file'];
        if ($f['error']) throw new Exception("Upload error " . $f['error']);
        $ext = pathinfo($f['name'], PATHINFO_EXTENSION) ?: "bin";
        $name = uniqid("media_", true) . "." . $ext;
        $dest = $uploadDir . $name;
        if (!move_uploaded_file($f['tmp_name'], $dest)) throw new Exception("Failed move_uploaded_file");
        echo json_encode(["success"=>true, "url"=>$publicBase . $name]);
        exit;
    }

    // handle JSON body with base64
    $body = file_get_contents("php://input");
    $json = json_decode($body, true);
    if ($json && !empty($json['data'])) {
        // data: data:image/png;base64,...
        $data = $json['data'];
        $matches = [];
        if (!preg_match('/^data:(.*);base64,(.*)$/', $data, $matches)) {
            throw new Exception("Invalid data URL");
        }
        $mime = $matches[1];
        $b64 = $matches[2];
        $ext = explode("/", $mime)[1] ?? "png";
        $name = uniqid("media_", true) . "." . $ext;
        $filePath = $uploadDir . $name;
        $decoded = base64_decode($b64);
        if ($decoded === false) throw new Exception("Base64 decode failed");
        file_put_contents($filePath, $decoded);
        echo json_encode(["success"=>true, "url"=>$publicBase . $name]);
        exit;
    }

    echo json_encode(["success"=>false, "error"=>"No file or data provided"]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["success"=>false, "error"=>$e->getMessage()]);
}
