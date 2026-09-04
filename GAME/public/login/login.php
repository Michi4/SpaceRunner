<?php
declare(strict_types=1);

require_once __DIR__ . '/../php/config.php';
require_once __DIR__ . '/../php/db.php';
require_once __DIR__ . '/../php/session.php';
require_once __DIR__ . '/../php/csrf.php';
require_once __DIR__ . '/../php/rate_limit.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/**
 * Send a JSON error response and exit.
 */
function send_error(string $message, int $status = 400): never
{
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message]);
    exit();
}

/**
 * Send a JSON success response and exit.
 */
function send_success(array $data = []): never
{
    http_response_code(200);
    echo json_encode(array_merge(['success' => true], $data));
    exit();
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method not allowed.', 405);
}

sr_session_start();

// CSRF check (token issued by /php/csrf.php, stored in session)
if (!sr_csrf_validate($_POST['csrf_token'] ?? null)) {
    send_error('Invalid request. Please reload the page and try again.', 403);
}

// Brute-force protection: max 10 attempts per 5 minutes per IP
if (!sr_rate_limit('login', 10, 300)) {
    send_error('Too many login attempts. Please wait a few minutes.', 429);
}

// --- Input ---
$identifier = trim($_POST['username-email'] ?? '');
$password   = $_POST['login-password']      ?? '';

if ($identifier === '' || $password === '') {
    send_error('Username/email and password are required.');
}
if (strlen($identifier) > 254 || strlen($password) > 256) {
    send_error('Invalid credentials.', 401);
}

// --- Database ---
try {
    $conn = db_connect();

    $stmt = $conn->prepare(
        'SELECT u_id, u_username, u_password
         FROM sr_user
         WHERE (u_username = ? OR u_email = ?) AND u_user_deleted = 0
         LIMIT 1'
    );
    $stmt->bind_param('ss', $identifier, $identifier);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows !== 1) {
        $stmt->close();
        $conn->close();
        // Generic message — don't reveal whether user exists
        send_error('Invalid credentials.', 401);
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    if (!password_verify($password, $user['u_password'])) {
        $conn->close();
        send_error('Invalid credentials.', 401);
    }

    // Update last login timestamp
    $stmt = $conn->prepare('UPDATE sr_user SET u_last_login = NOW() WHERE u_id = ?');
    $stmt->bind_param('i', $user['u_id']);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    // --- Session ---
    session_regenerate_id(true); // Prevent session fixation
    $_SESSION['user_id']  = (int) $user['u_id'];
    $_SESSION['username'] = (string) $user['u_username'];

    // --- Display cookie (NOT HttpOnly on purpose: the UI shows the name).
    // It carries no privilege — auth always uses the server-side session.
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $expires = time() + (3 * 24 * 60 * 60); // 3 days
    setcookie('sr_display_name', (string) $user['u_username'], [
        'expires'  => $expires,
        'path'     => '/',
        'secure'   => $https,
        'httponly' => false,
        'samesite' => 'Lax',
    ]);
    // Remove legacy cookies from previous versions
    sr_clear_cookie('user_id');
    sr_clear_cookie('username');

    send_success([
        'user_id'  => (int) $user['u_id'],
        'username' => (string) $user['u_username'],
    ]);

} catch (RuntimeException $e) {
    send_error($e->getMessage(), 503);
} catch (mysqli_sql_exception $e) {
    error_log('[SpaceRunner] login error: ' . $e->getMessage());
    send_error('An internal error occurred. Please try again.', 500);
}
