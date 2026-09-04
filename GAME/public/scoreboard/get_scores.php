<?php
/**
 * Scoreboard API – fetches scores securely with prepared statements.
 * Paginated (page/per_page) + ISO-8601 UTC timestamps so clients can
 * render correct locale-aware relative times.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=15');
require_once '../php/config.php';
require_once '../php/db.php';

const SR_PER_PAGE = 20;
const SR_MAX_PAGE = 1000;

try {
    $conn = db_connect();

    // Check query params
    $order_by = $_GET['order_by'] ?? 's_score';
    $sort_order = $_GET['sort_order'] ?? 'DESC';
    $search = mb_substr($_GET['search'] ?? '', 0, 30);
    $scoretype = mb_substr($_GET['scoretype'] ?? '', 0, 20);
    $page = (int)($_GET['page'] ?? 1);
    if ($page < 1) {
        $page = 1;
    } elseif ($page > SR_MAX_PAGE) {
        $page = SR_MAX_PAGE;
    }

    // Allowlist for ordering to prevent SQL injection
    $allowed_columns = [
        's_rank' => 's_score',
        'u_username' => 'u.u_username',
        's_score' => 's.s_score',
        's_level_reached' => 's.s_level_reached',
        'st_scoretype' => 'st.st_scoretype',
        's_seed' => 's.s_seed',
        's_date_achieved' => 's.s_date_achieved'
    ];

    $order_column = $allowed_columns[$order_by] ?? 's.s_score';
    $sort_dir = (strtoupper($sort_order) === 'ASC') ? 'ASC' : 'DESC';

    // Shared filter fragment (same WHERE for data + count queries)
    $where = ' WHERE 1=1';
    $params = [];
    $types = '';

    if ($search !== '') {
        $where .= ' AND u.u_username LIKE ?';
        $params[] = '%' . $search . '%';
        $types .= 's';
    }

    if ($scoretype !== '') {
        $where .= ' AND st.st_scoretype = ?';
        $params[] = $scoretype;
        $types .= 's';
    }

    $from = ' FROM sr_score s
              INNER JOIN sr_user u ON s.s_user_id = u.u_id
              INNER JOIN sr_scoretype st ON s.s_scoretype_id = st.st_id';

    // Total matching rows (for pagination)
    $countStmt = $conn->prepare('SELECT COUNT(*) AS total' . $from . $where);
    if (!empty($params)) {
        $countStmt->bind_param($types, ...$params);
    }
    $countStmt->execute();
    $total = (int)($countStmt->get_result()->fetch_assoc()['total'] ?? 0);
    $countStmt->close();

    $pages = (int)ceil($total / SR_PER_PAGE);
    if ($pages > 0 && $page > $pages) {
        $page = $pages; // clamp overflow to the last page
    }
    $offset = ($page - 1) * SR_PER_PAGE;

    // NOTE: LIMIT/OFFSET are interpolated, not bound: bound LIMIT placeholders
    // silently return zero rows on this mysqlnd/MariaDB combo. Both values
    // are cast to int and clamped above, so interpolation is injection-safe.
    $sql = "SELECT u.u_username, s.s_score, s.s_level_reached, st.st_scoretype, s.s_seed,
                   DATE_FORMAT(s.s_date_achieved, '%Y-%m-%dT%H:%i:%s+00:00') AS s_date_achieved,
            (SELECT COUNT(*)+1 FROM sr_score s2 WHERE s2.s_score > s.s_score) AS s_rank"
        . $from . $where
        . " ORDER BY $order_column $sort_dir LIMIT $offset, " . SR_PER_PAGE;

    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $scores = [];
    while ($row = $result->fetch_assoc()) {
        $scores[] = [
            'rank' => (int)$row['s_rank'],
            'username' => (string)$row['u_username'],
            'score' => (int)$row['s_score'],
            'level' => (int)$row['s_level_reached'],
            'scoretype' => (string)$row['st_scoretype'],
            'seed' => $row['s_seed'] !== null ? (string)$row['s_seed'] : null,
            'date' => (string)$row['s_date_achieved']
        ];
    }
    $stmt->close();

    // Get all distinct score types for filter dropdown
    $types_res = $conn->query("SELECT DISTINCT st_scoretype FROM sr_scoretype");
    $types_list = [];
    while ($row = $types_res->fetch_assoc()) {
        $types_list[] = $row['st_scoretype'];
    }
    $conn->close();

    echo json_encode([
        'success' => true,
        'scores' => $scores,
        'types' => $types_list,
        'page' => $page,
        'per_page' => SR_PER_PAGE,
        'total' => $total,
        'pages' => $pages,
    ]);

} catch (Exception $e) {
    error_log('[SpaceRunner] get_scores error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Could not load scores. Please try again.'
    ]);
}
