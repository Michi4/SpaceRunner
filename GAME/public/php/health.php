<?php
declare(strict_types=1);

// Liveness/readiness probe for infrastructure (load balancer, monitoring).
// Read-only: single SELECT, no writes, safe to poll.

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$host     = getenv('DB_HOST')     ?: '127.0.0.1';
$database = getenv('DB_DATABASE') ?: getenv('DB_NAME')     ?: '';
$username = getenv('DB_USERNAME') ?: getenv('DB_USER')     ?: '';
$password = getenv('DB_PASSWORD') ?: '';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = mysqli_init();
    $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 3);
    $conn->real_connect($host, $username, $password, $database);
    $conn->query('SELECT 1');
    $conn->close();
    http_response_code(200);
    echo json_encode(['success' => true, 'status' => 'ok']);
} catch (Throwable $e) {
    http_response_code(503);
    echo json_encode(['success' => false, 'status' => 'unhealthy']);
}
