<?php
declare(strict_types=1);

require_once __DIR__ . '/session.php';

/**
 * Session-based CSRF protection.
 * The frontend fetches a token from /php/csrf.php and sends it back as
 * the `csrf_token` POST field on every state-changing request.
 */
function sr_csrf_token(): string
{
    sr_session_start();
    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function sr_csrf_validate(?string $token): bool
{
    sr_session_start();
    $expected = $_SESSION['csrf_token'] ?? '';
    if (!is_string($expected) || $expected === '' || !is_string($token) || $token === '') {
        return false;
    }
    return hash_equals($expected, $token);
}

// Direct GET access returns the current token as JSON (used by the SPA).
if (PHP_SAPI !== 'cli' && ($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['success' => true, 'csrf_token' => sr_csrf_token()]);
    exit();
}
