<?php
header('Content-Type: application/json');

$page = $_GET['page'] ?? 'index';
$page = preg_replace('/[^a-z0-9_\-]/i', '', $page);
$file = __DIR__ . "/content_{$page}.json";

if (file_exists($file)) {
  echo file_get_contents($file);
} else {
  echo json_encode([]);
}
