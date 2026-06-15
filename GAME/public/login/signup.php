<?php
declare(strict_types=1);

require_once __DIR__ . '/../php/config.php';
require_once __DIR__ . '/../php/db.php';

header('Content-Type: application/json; charset=utf-8');

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
function send_success(string $message, array $extra = []): never
{
    http_response_code(200);
    echo json_encode(array_merge(['success' => true, 'message' => $message], $extra));
    exit();
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method not allowed.', 405);
}

// --- Input & validation ---
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!preg_match('/^[a-zA-Z0-9_-]{3,16}$/', $username)) {
    send_error('Invalid username. Use 3-16 characters: letters, numbers, _ or -.');
}

if (strncasecmp($username, 'sr_', 10) === 0) {
    send_error('Username cannot start with "sr_".');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_error('Invalid email address.');
}

if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password)) {
    send_error('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
}

// --- Database ---
try {
    $conn = db_connect();

    // Check for duplicate username or email
    $stmt = $conn->prepare(
        'SELECT u_id FROM sr_user WHERE u_username = ? OR u_email = ? LIMIT 1'
    );
    $stmt->bind_param('ss', $username, $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->close();
        $conn->close();
        send_error('Username or email is already taken.', 409);
    }
    $stmt->close();

    // Insert new user
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare(
        'INSERT INTO sr_user (u_username, u_email, u_password, u_data_id, u_user_deleted, u_last_login)
         VALUES (?, ?, ?, NULL, 0, NOW())'
    );
    $stmt->bind_param('sss', $username, $email, $hash);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    send_success('Account created successfully. You can now log in.');

} catch (RuntimeException $e) {
    send_error($e->getMessage(), 503);
} catch (mysqli_sql_exception $e) {
    error_log('[SpaceRunner] signup error: ' . $e->getMessage());
    send_error('An internal error occurred. Please try again.', 500);
}
