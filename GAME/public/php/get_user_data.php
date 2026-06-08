<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated.']);
    exit();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

try {
    $conn   = db_connect();
    $userId = (int) $_SESSION['user_id'];

    $stmt = $conn->prepare(
        'SELECT u_id, u_username, u_email
         FROM sr_user
         WHERE u_id = ? AND u_user_deleted = 0
         LIMIT 1'
    );
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows !== 1) {
        $stmt->close();
        $conn->close();
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found.']);
        exit();
    }

    $user = $result->fetch_assoc();
    $stmt->close();
    $conn->close();

    echo json_encode([
        'success'  => true,
        'user_id'  => $user['u_id'],
        'username' => $user['u_username'],
        'email'    => $user['u_email'],
    ]);

} catch (RuntimeException $e) {
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (mysqli_sql_exception $e) {
    error_log('[SpaceRunner] get_user_data error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An internal error occurred.']);
}