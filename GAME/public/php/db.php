<?php
/**
 * Creates and returns a MySQLi connection from environment variables.
 * Env vars (set by Docker or .env via config.php):
 *   DB_HOST, DB_DATABASE (or DB_NAME), DB_USERNAME (or DB_USER), DB_PASSWORD
 *
 * On first launch the schema is initialized from GAME/db/create_tables.sql,
 * afterwards lightweight migrations bring older databases up to date.
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
        $conn = mysqli_init();
        // Fail fast instead of hanging the request when the DB is gone
        $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
        $conn->real_connect($host, $username, $password, $database);
        $conn->set_charset('utf8mb4');

        // Check if sr_user table exists; if not, initialize database from SQL file
        $res = $conn->query("SHOW TABLES LIKE 'sr_user'");
        if ($res && $res->num_rows === 0) {
            // Schema lives outside the web root (GAME/db), fallback to legacy path
            $candidates = [
                dirname(__DIR__, 2) . '/db/create_tables.sql',
                dirname(__DIR__) . '/db/create_tables.sql',
            ];
            foreach ($candidates as $sqlFile) {
                if (is_file($sqlFile)) {
                    $queries = file_get_contents($sqlFile);
                    if ($conn->multi_query($queries)) {
                        do {
                            if ($result = $conn->store_result()) {
                                $result->free();
                            }
                        } while ($conn->more_results() && $conn->next_result());
                    }
                    break;
                }
            }
        }

        run_migrations($conn);

        return $conn;
    } catch (mysqli_sql_exception $e) {
        error_log('[SpaceRunner] DB connection failed: ' . $e->getMessage());
        throw new RuntimeException('Database unavailable. Please try again later.');
    }
}

/**
 * Bring databases created by older schema versions up to date.
 * Every step is guarded so it is safe to run on each connection.
 */
function run_migrations(mysqli $conn): void
{
    // s_seed column (added after initial release)
    $resSeed = $conn->query("SHOW COLUMNS FROM sr_score LIKE 's_seed'");
    if ($resSeed && $resSeed->num_rows === 0) {
        $conn->query('ALTER TABLE sr_score ADD COLUMN s_seed VARCHAR(50) DEFAULT NULL');
    }

    // Longer email column (RFC 5321 allows up to 254 chars)
    $resEmail = $conn->query("SHOW COLUMNS FROM sr_user LIKE 'u_email'");
    if ($resEmail && ($col = $resEmail->fetch_assoc())) {
        if (stripos((string) ($col['Type'] ?? ''), 'varchar(50)') !== false) {
            $conn->query('ALTER TABLE sr_user MODIFY COLUMN u_email VARCHAR(254) NOT NULL');
        }
    }

    // Registration timestamp
    $resCreated = $conn->query("SHOW COLUMNS FROM sr_user LIKE 'u_created_at'");
    if ($resCreated && $resCreated->num_rows === 0) {
        $conn->query('ALTER TABLE sr_user ADD COLUMN u_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
    }

    // Leaderboard indexes (missing on databases created before v2 schema)
    $resIdx = $conn->query("SHOW INDEX FROM sr_score WHERE Key_name = 'idx_score_type_score'");
    if ($resIdx && $resIdx->num_rows === 0) {
        $conn->query('CREATE INDEX idx_score_type_score ON sr_score (s_scoretype_id, s_score DESC)');
    }
    $resIdx2 = $conn->query("SHOW INDEX FROM sr_score WHERE Key_name = 'idx_score_user'");
    if ($resIdx2 && $resIdx2->num_rows === 0) {
        $conn->query('CREATE INDEX idx_score_user ON sr_score (s_user_id)');
    }

    // Per-account settings table (added with cloud-settings feature)
    $resSettings = $conn->query("SHOW TABLES LIKE 'sr_settings'");
    if ($resSettings && $resSettings->num_rows === 0) {
        $conn->query(
            'CREATE TABLE IF NOT EXISTS sr_settings (
                st_user_id INT(11) UNSIGNED NOT NULL PRIMARY KEY,
                st_data LONGTEXT NOT NULL,
                st_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (st_user_id) REFERENCES sr_user(u_id)
            )'
        );
    }
}
