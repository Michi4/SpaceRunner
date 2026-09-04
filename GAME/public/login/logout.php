<?php
declare(strict_types=1);

require_once __DIR__ . '/../php/session.php';

sr_session_start();

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires'  => time() - 3600,
        'path'     => $params['path'] ?? '/',
        'secure'   => (bool) ($params['secure'] ?? false),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}
session_destroy();

// Legacy + display cookies
sr_clear_cookie('user_id');
sr_clear_cookie('username');
sr_clear_cookie('sr_display_name');

header('Location: /');
exit;
