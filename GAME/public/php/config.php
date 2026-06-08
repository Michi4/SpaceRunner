<?php
/**
 * Loads .env file into environment variables.
 * Variables already set (e.g. injected by Docker) take priority.
 */
$envFile = __DIR__ . '/../.env';

if (file_exists($envFile)) {
    $vars = parse_ini_file($envFile);
    if ($vars !== false) {
        foreach ($vars as $key => $value) {
            // Do NOT override values already set by the container/host environment
            if (getenv($key) === false) {
                putenv("$key=$value");
            }
        }
    }
} else {
    error_log('[SpaceRunner] .env file not found at: ' . $envFile);
}