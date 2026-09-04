<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/rate_limit.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function send_error(string $message, int $status): never
{
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message]);
    exit();
}

// Only accept POST
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    send_error('Method not allowed.', 405);
}

sr_session_start();

if (!isset($_SESSION['user_id'])) {
    send_error('Not authenticated.', 401);
}

// CSRF check (token issued by /php/csrf.php, stored in session)
if (!sr_csrf_validate($_POST['csrf_token'] ?? null)) {
    send_error('Invalid request. Please reload the game and try again.', 403);
}

// Sync-spam protection
if (!sr_throttle('save_settings', 2)) {
    send_error('Please wait a moment before saving again.', 429);
}

$raw = $_POST['settings'] ?? '';
if (!is_string($raw) || $raw === '' || strlen($raw) > 16384) {
    send_error('Invalid settings payload.', 400);
}

$decoded = json_decode($raw, true);
if (!is_array($decoded)) {
    send_error('Invalid settings payload.', 400);
}

// Allowlist: opaque client settings only, each a short string.
// (Values are re-validated on use; the game only reads known keys.)
$allowed = ['reassign', 'charface', 'players', 'playerrainbow', 'platrainbow', 'platcolor', 'platshadow', 'playercolor'];
$clean = [];
foreach ($decoded as $key => $value) {
    if (!is_string($key) || !in_array($key, $allowed, true)) {
        continue;
    }
    if (!is_string($value) || strlen($value) > 4096) {
        send_error('Invalid settings payload.', 400);
    }
    $clean[$key] = $value;
}

try {
    $conn   = db_connect();
    $userId = (int) $_SESSION['user_id'];
    $json   = json_encode($clean, JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        send_error('Invalid settings payload.', 400);
    }

    $stmt = $conn->prepare(
        'INSERT INTO sr_settings (st_user_id, st_data, st_updated_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE st_data = VALUES(st_data), st_updated_at = NOW()'
    );
    $stmt->bind_param('is', $userId, $json);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Settings saved.']);

} catch (RuntimeException $e) {
    send_error($e->getMessage(), 503);
} catch (mysqli_sql_exception $e) {
    error_log('[SpaceRunner] save_settings error: ' . $e->getMessage());
    send_error('An internal error occurred.', 500);
}
