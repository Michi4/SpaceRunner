<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/session.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

sr_session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated.']);
    exit();
}

try {
    $conn   = db_connect();
    $userId = (int) $_SESSION['user_id'];

    $stmt = $conn->prepare(
        'SELECT st_data, st_updated_at FROM sr_settings WHERE st_user_id = ? LIMIT 1'
    );
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows !== 1) {
        $stmt->close();
        $conn->close();
        echo json_encode(['success' => true, 'settings' => null]);
        exit();
    }

    $row = $result->fetch_assoc();
    $stmt->close();
    $conn->close();

    $settings = json_decode((string) $row['st_data'], true);
    if (!is_array($settings)) {
        $settings = null;
    }

    echo json_encode([
        'success'    => true,
        'settings'   => $settings,
        'updated_at' => $row['st_updated_at'],
    ]);

} catch (RuntimeException $e) {
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (mysqli_sql_exception $e) {
    error_log('[SpaceRunner] get_settings error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An internal error occurred.']);
}
