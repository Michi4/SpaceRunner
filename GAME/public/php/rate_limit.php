<?php
declare(strict_types=1);

/**
 * Tiny file-based rate limiter (no extra PHP extensions required).
 * State lives in the system temp dir, keyed by name + client IP.
 */
function sr_rate_limit(string $name, int $maxAttempts, int $windowSeconds): bool
{
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ip = trim(explode(',', (string) $ip)[0]);
    $key = preg_replace('/[^a-z0-9_-]/i', '', $name) . '_' . preg_replace('/[^a-zA-Z0-9.:_-]/', '', $ip);
    $file = sys_get_temp_dir() . '/sr_ratelimit_' . $key . '.json';

    $now = time();
    $attempts = [];
    if (is_file($file)) {
        $decoded = json_decode((string) @file_get_contents($file), true);
        if (is_array($decoded)) {
            $attempts = array_values(array_filter($decoded, static fn($t) => is_int($t) && $t > $now - $windowSeconds));
        }
    }

    if (count($attempts) >= $maxAttempts) {
        return false; // rate limited
    }

    $attempts[] = $now;
    @file_put_contents($file, json_encode($attempts), LOCK_EX);
    return true;
}

/**
 * Session-based action throttle (e.g. min gap between score submissions).
 * Returns true when the action may proceed.
 */
function sr_throttle(string $name, int $minGapSeconds): bool
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return true;
    }
    $key = 'throttle_' . preg_replace('/[^a-z0-9_-]/i', '', $name);
    $last = (int) ($_SESSION[$key] ?? 0);
    if ($last > 0 && (time() - $last) < $minGapSeconds) {
        return false;
    }
    $_SESSION[$key] = time();
    return true;
}
