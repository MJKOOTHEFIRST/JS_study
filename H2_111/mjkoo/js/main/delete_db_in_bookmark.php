<?php
// delete_db_in_bookmark.php

header('Content-Type: application/json');

require 'db_config.php';
$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$bookmarkId = $data['bookmarkId'];
$dataNos = $data['dataNos'];

if (is_null($bookmarkId) || !is_array($dataNos) || count($dataNos) === 0) {
    echo json_encode(['error' => 'Invalid input data']);
    exit;
}

// bmk_sch 테이블에서 항목 삭제
$stmt = $conn->prepare("DELETE FROM bmk_sch WHERE bmk_id = ? AND sch_id = ?");
$stmt->bind_param('ii', $bookmarkId, $schId);

foreach ($dataNos as $no) {
    $schId = intval($no);
    if (!$stmt->execute()) {
        echo json_encode(['error' => 'Failed to delete some items: ' . $stmt->error]);
        $stmt->close();
        $conn->close();
        exit;
    }
}

$stmt->close();
$conn->close();
echo json_encode(['success' => true]);
?>
