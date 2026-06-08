<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated.']);
    exit();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

/**
 * Maps difficulty string to scoretype ID.
 */
function get_scoretype_id(string $difficulty): int
{
    return match ($difficulty) {
        'hard'       => 1,
        'impossible' => 2,
        'run'        => 3,
        default      => 1,
    };
}

if (!isset($_POST['difficulty'], $_POST['score'], $_POST['level'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields: difficulty, score, level.']);
    exit();
}

$difficulty  = (string) $_POST['difficulty'];
$score       = (int)    $_POST['score'];
$level       = (int)    $_POST['level'];
$userId      = (int)    $_SESSION['user_id'];
$scoreTypeId = get_scoretype_id($difficulty);

if ($score < 0 || $level < 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Score and level must be non-negative.']);
    exit();
}

try {
    $conn = db_connect();

    $stmt = $conn->prepare(
        'INSERT INTO sr_score (s_user_id, s_scoretype_id, s_score, s_level_reached, s_date_achieved)
         VALUES (?, ?, ?, ?, NOW())'
    );
    $stmt->bind_param('iiii', $userId, $scoreTypeId, $score, $level);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Score saved successfully.']);

} catch (RuntimeException $e) {
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (mysqli_sql_exception $e) {
    error_log('[SpaceRunner] save_score error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An internal error occurred.']);
}
