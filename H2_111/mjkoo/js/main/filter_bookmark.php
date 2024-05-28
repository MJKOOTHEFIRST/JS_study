<?php
// filter_bookmark.php

require 'db_config.php';

// MySQL 연결
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die(json_encode(['error' => "Connection failed: " . $conn->connect_error]));
}

// GET 파라미터 받기
$bookmarkId = isset($_GET['bookmarkId']) ? intval($_GET['bookmarkId']) : null;
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$perPage = isset($_GET['perPage']) && $_GET['perPage'] !== 'all-data' ? intval($_GET['perPage']) : null;
$offset = ($page - 1) * $perPage;

if (is_null($bookmarkId)) {
    echo json_encode(['error' => '북마크 ID가 누락되었습니다.']);
    exit;
}

// 조건을 추가하기 위한 배열
$conditions = ["bmk_sch.bmk_id = ?"];
$params = [$bookmarkId];

// 검색 조건 처리
if (isset($_GET['start-date']) && isset($_GET['end-date'])) {
    $conditions[] = "search.`DATE` BETWEEN ? AND ?";
    $params[] = $_GET['start-date'];
    $params[] = $_GET['end-date'];
} elseif (isset($_GET['start-date'])) {
    $conditions[] = "search.`DATE` >= ?";
    $params[] = $_GET['start-date'];
} elseif (isset($_GET['end-date'])) {
    $conditions[] = "search.`DATE` <= ?";
    $params[] = $_GET['end-date'];
}

$fields = ['H-M', 'M-L', 'X1', 'X2', 'Y1', 'Y2', 'M', 'L', 'SQ', 'BQ'];
foreach ($fields as $field) {
    if (isset($_GET[$field]) && $_GET[$field] !== '') {
        $value = $_GET[$field];
        if (isset($_GET[$field . 'Condition']) && $_GET[$field . 'Condition'] === 'over') {
            $conditions[] = "search.`$field` > ?";
            $params[] = $value;
        } elseif (isset($_GET[$field . 'Condition']) && $_GET[$field . 'Condition'] === 'under') {
            $conditions[] = "search.`$field` < ?";
            $params[] = $value;
        } else {
            $conditions[] = "search.`$field` = ?";
            $params[] = $value;
        }
    }
}

// 라벨 검색 조건 처리
if (isset($_GET['LABEL']) && !empty($_GET['LABEL'])) {
    $labels = explode(' ', $_GET['LABEL']); // 공백으로 구분된 라벨들 분리
    foreach ($labels as $label) {
        $label = trim($label, '#'); // 라벨 앞뒤의 # 제거
        if (!empty($label)) {
            $conditions[] = "search.`LABEL` LIKE ?";
            $params[] = '%' . $label . '%'; // LIKE 조건에 사용할 와일드카드 추가
        }
    }
}

// 기본 쿼리
$sql = "
    SELECT bmk_sch.bmk_id, bmk_sch.sch_id, search.DATE, search.`H-M`, search.`M-L`, search.X1, search.X2, search.Y1, search.Y2, search.M, search.L, search.SQ, search.BQ, search.LABEL, search.NAME
    FROM bmk_sch
    JOIN search ON bmk_sch.sch_id = search.NO
    WHERE " . implode(' AND ', $conditions) . "
    ORDER BY search.`DATE` DESC
    LIMIT ?, ?
";

// 페이지네이션 파라미터 추가
$params_with_pagination = array_merge($params, [$offset, $perPage]);

// 전체 데이터 수 조회 쿼리
$totalCountQuery = "
    SELECT COUNT(*) AS total
    FROM bmk_sch
    JOIN search ON bmk_sch.sch_id = search.NO
    WHERE " . implode(' AND ', $conditions);

// 전체 데이터 수 조회 실행
$totalCountStmt = $conn->prepare($totalCountQuery);
$totalCountStmt->bind_param(str_repeat('s', count($params)), ...$params);
$totalCountStmt->execute();
$totalCountResult = $totalCountStmt->get_result();
$totalCountRow = $totalCountResult->fetch_assoc();
$totalRows = $totalCountRow['total'];

// 데이터 조회 쿼리 실행
$stmt = $conn->prepare($sql);
$stmt->bind_param(str_repeat('s', count($params_with_pagination)), ...$params_with_pagination);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        'total' => $totalRows,
        'data' => $data
    ]);
} else {
    echo json_encode([
        'total' => $totalRows,
        'data' => []
    ]);
}

$stmt->close();
$conn->close();
?>
