<?php
/**
 * Creates and returns a MySQLi connection from environment variables.
 * Env vars (set by Docker or .env via config.php):
 *   DB_HOST, DB_DATABASE (or DB_NAME), DB_USERNAME (or DB_USER), DB_PASSWORD
 *
 * @throws RuntimeException if the connection fails.
 */
function db_connect(): mysqli
{
    $host     = getenv('DB_HOST')     ?: '127.0.0.1';
    $database = getenv('DB_DATABASE') ?: getenv('DB_NAME')     ?: '';
    $username = getenv('DB_USERNAME') ?: getenv('DB_USER')     ?: '';
    $password = getenv('DB_PASSWORD') ?: '';

    // Throw exceptions instead of triggering PHP warnings
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try {
        $conn = new mysqli($host, $username, $password, $database);
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (mysqli_sql_exception $e) {
        error_log('[SpaceRunner] DB connection failed: ' . $e->getMessage());
        throw new RuntimeException('Database unavailable. Please try again later.');
    }
}
