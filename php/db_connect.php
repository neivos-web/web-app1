<?php
$host = "localhost";
$username = "outsdrsc_outsiders";
$password = "AQW8759mlouK123vgyhn";
$dbname = "outsdrsc_cms_site";

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
$pdo = new PDO($dsn, $username, $password, $options);
?>
