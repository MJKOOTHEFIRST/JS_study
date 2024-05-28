<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

require 'db_config.php';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$dirName = isset($_GET['dir']) ? $_GET['dir'] : null;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 10;

// 북마크 데이터 로드
$query = "SELECT id, bookmark_name, dir_name, color_id, color_code FROM bookmark";
error_log("filter_bookmark.php Executing query:" .$query);
if ($dirName) {
    $query .= " WHERE dir_name = ?";
}

// 페이지네이션을 위한 총 데이터 수 계산
$totalQuery = "SELECT COUNT(*) as total FROM ($query) as sub";
error_log("filter_bookmark.php totalQuery:" .$totalQuery);
$totalStmt = $conn->prepare($totalQuery);
if ($dirName) {
    $totalStmt->bind_param("s", $dirName);
}
$totalStmt->execute();
$totalResult = $totalStmt->get_result();
$totalRow = $totalResult->fetch_assoc();
$totalRows = $totalRow['total'];
error_log("filter_bookmark.php Total rows calculated: " . $totalRows);

// 페이지에 해당하는 데이터만 가져오기
$offset = ($page - 1) * $perPage;
$query .= " LIMIT ? OFFSET ?";
$stmt = $conn->prepare($query);
if ($dirName) {
    $stmt->bind_param("sii", $dirName, $perPage, $offset);
} else {
    $stmt->bind_param("ii", $perPage, $offset);
}
$stmt->execute();
$result = $stmt->get_result();
error_log("filter_bookmark.php  Data fetched for page " . $page);

$bookmarks = [];
while ($row = $result->fetch_assoc()) {
    $bookmarks[] = $row;
}

$searchResults = [];

foreach ($bookmarks as $bookmark) {
    $baseDir = '/home/nstek/h2_system/patch_active/ALL/data/impedance/imp_data/bookmarks/';
    $fullPath = $baseDir . $bookmark['dir_name'];

    if (!is_dir($fullPath)) {
        $searchResults[] = ['error' => '디렉터리를 찾을 수 없습니다.' . $fullPath];
        continue;
    }

    $files = glob($fullPath . '/*.txt');
    $results = [];
    foreach ($files as $file) {
        $fileName = basename($file);
        $query = "SELECT * FROM search WHERE NAME LIKE CONCAT('%', ?, '%') ORDER BY DATE DESC";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $fileName);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $row['dir_name'] = $bookmark['dir_name'];
            $results[] = $row;
        }
    }
    $searchResults[] = $results;
}

echo json_encode(['data' => $searchResults, 'totalRows' => $totalRows]);

$conn->close();
?>