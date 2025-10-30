<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
if (!$input || !isset($input['page']) || !isset($input['content'])) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid data"]);
  exit;
}

$page = preg_replace('/[^a-z0-9_\-]/i', '', $input['page']);
$file = __DIR__ . "/content_{$page}.json";

file_put_contents($file, json_encode($input['content'], JSON_PRETTY_PRINT));

echo json_encode(["status" => "ok", "page" => $page]);
