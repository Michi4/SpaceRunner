<?php
/**
 * Scoreboard API – fetches scores securely with prepared statements
 */
header('Content-Type: application/json');
require_once '../php/config.php';
require_once '../php/db.php';

try {
    $conn = db_connect();

    // Check query params
    $order_by = $_GET['order_by'] ?? 's_score';
    $sort_order = $_GET['sort_order'] ?? 'DESC';
    $search = $_GET['search'] ?? '';
    $scoretype = $_GET['scoretype'] ?? '';

    // Allowlist for ordering to prevent SQL injection
    $allowed_columns = [
        's_rank' => 's_score',
        'u_username' => 'u.u_username',
        's_score' => 's.s_score',
        's_level_reached' => 's.s_level_reached',
        'st_scoretype' => 'st.st_scoretype',
        's_date_achieved' => 's.s_date_achieved'
    ];

    $order_column = $allowed_columns[$order_by] ?? 's.s_score';
    $sort_dir = (strtoupper($sort_order) === 'ASC') ? 'ASC' : 'DESC';

    // Construct select statement with ranking subquery
    // Rank is dynamic based on s_score (lower rank number = higher score)
    $sql = "SELECT u.u_username, s.s_score, s.s_level_reached, st.st_scoretype, s.s_date_achieved,
            (SELECT COUNT(*)+1 FROM sr_score s2 WHERE s2.s_score > s.s_score) AS s_rank
            FROM sr_score s
            INNER JOIN sr_user u ON s.s_user_id = u.u_id
            INNER JOIN sr_scoretype st ON s.s_scoretype_id = st.st_id
            WHERE 1=1";

    $params = [];
    $types = '';

    if ($search !== '') {
        $sql .= " AND u.u_username LIKE ?";
        $params[] = '%' . $search . '%';
        $types .= 's';
    }

    if ($scoretype !== '') {
        $sql .= " AND st.st_scoretype = ?";
        $params[] = $scoretype;
        $types .= 's';
    }

    $sql .= " ORDER BY $order_column $sort_dir LIMIT 100";

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
            'username' => htmlspecialchars($row['u_username']),
            'score' => (int)$row['s_score'],
            'level' => (int)$row['s_level_reached'],
            'scoretype' => $row['st_scoretype'],
            'date' => $row['s_date_achieved']
        ];
    }

    // Get all distinct score types for filter dropdown
    $types_res = $conn->query("SELECT DISTINCT st_scoretype FROM sr_scoretype");
    $types_list = [];
    while ($row = $types_res->fetch_assoc()) {
        $types_list[] = $row['st_scoretype'];
    }

    echo json_encode([
        'success' => true,
        'scores' => $scores,
        'types' => $types_list
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
