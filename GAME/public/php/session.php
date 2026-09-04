<?php
declare(strict_types=1);

/**
 * Hardened session bootstrap. Include instead of calling session_start()
 * directly in every endpoint.
 */
function sr_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    // Detect HTTPS (Traefik terminates TLS and forwards X-Forwarded-Proto)
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_name('sr_session');
    session_set_cookie_params([
        'lifetime' => 0,          // browser-session cookie
        'path'     => '/',
        'secure'   => $https,     // only sent over HTTPS
        'httponly' => true,       // never readable via document.cookie
        'samesite' => 'Lax',      // CSRF-safe default, keeps top-level login flow working
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    if ($https) {
        ini_set('session.cookie_secure', '1');
    }

    session_start();

    // Idle timeout: 7 days for the game session
    $maxIdle = 7 * 24 * 60 * 60;
    if (isset($_SESSION['last_activity']) && (time() - (int) $_SESSION['last_activity']) > $maxIdle) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['last_activity'] = time();
}

/**
 * Set an application cookie with safe defaults.
 */
function sr_set_cookie(string $name, string $value, int $expires): void
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    setcookie($name, $value, [
        'expires'  => $expires,
        'path'     => '/',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

/**
 * Clear an application cookie (flags must match sr_set_cookie).
 */
function sr_clear_cookie(string $name): void
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    setcookie($name, '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}
