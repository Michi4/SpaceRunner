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

// Score-spam protection: min 3 seconds between submissions
if (!sr_throttle('save_score', 3)) {
    send_error('Please wait a moment before saving again.', 429);
}

if (!isset($_POST['difficulty'], $_POST['score'], $_POST['level'])) {
    send_error('Missing required fields: difficulty, score, level.', 400);
}

$difficulty = (string) $_POST['difficulty'];
$score      = $_POST['score'];
$level      = $_POST['level'];
$userId     = (int) $_SESSION['user_id'];

// Strict difficulty allowlist — unknown values are rejected, not remapped
$scoretypeIds = ['hard' => 1, 'impossible' => 2, 'run' => 3];
if (!isset($scoretypeIds[$difficulty])) {
    send_error('Invalid difficulty.', 400);
}
$scoreTypeId = $scoretypeIds[$difficulty];

// Numeric sanity bounds (anti-cheat: forged clients can't submit absurd values)
if (!is_numeric($score) || !is_numeric($level)) {
    send_error('Score and level must be numbers.', 400);
}
$score = (int) $score;
$level = (int) $level;
if ($score < 0 || $score > 100000000 || $level < 0 || $level > 10000) {
    send_error('Score or level out of range.', 400);
}

// Optional map seed: short alphanumeric token only
$seed = null;
if (isset($_POST['seed']) && $_POST['seed'] !== '' && $_POST['seed'] !== null) {
    $seed = (string) $_POST['seed'];
    if (strlen($seed) > 50 || !preg_match('/^[A-Za-z0-9_-]{1,50}$/', $seed)) {
        send_error('Invalid seed.', 400);
    }
}

try {
    $conn = db_connect();

    $stmt = $conn->prepare(
        'INSERT INTO sr_score (s_user_id, s_scoretype_id, s_score, s_level_reached, s_seed, s_date_achieved)
         VALUES (?, ?, ?, ?, ?, NOW())'
    );
    $stmt->bind_param('iiiis', $userId, $scoreTypeId, $score, $level, $seed);
    $stmt->execute();
    $stmt->close();

    // Check personal best (previous best before this submission)
    $pbStmt = $conn->prepare(
        'SELECT MAX(s_score) AS pb FROM sr_score
         WHERE s_user_id = ? AND s_scoretype_id = ? AND s_score < ?'
    );
    $pbStmt->bind_param('iii', $userId, $scoreTypeId, $score);
    $pbStmt->execute();
    $pbResult = $pbStmt->get_result()->fetch_assoc();
    $pbStmt->close();
    $isPersonalBest = ($pbResult['pb'] === null); // no prior better score

    // Get global rank
    $rankStmt = $conn->prepare(
        'SELECT COUNT(DISTINCT s_user_id) + 1 AS `rank`
         FROM sr_score
         WHERE s_scoretype_id = ?
           AND s_score > ?'
    );
    $rankStmt->bind_param('ii', $scoreTypeId, $score);
    $rankStmt->execute();
    $rankResult = $rankStmt->get_result()->fetch_assoc();
    $rankStmt->close();
    $globalRank = (int)($rankResult['rank'] ?? 999);

    $conn->close();

    echo json_encode([
        'success'        => true,
        'message'        => 'Score saved successfully.',
        'personalBest'   => $isPersonalBest,
        'globalRank'     => $globalRank,
    ]);

} catch (RuntimeException $e) {
    send_error($e->getMessage(), 503);
} catch (mysqli_sql_exception $e) {
    error_log('[SpaceRunner] save_score error: ' . $e->getMessage());
    send_error('An internal error occurred.', 500);
}
