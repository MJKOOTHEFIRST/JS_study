<?php
header('Content-Type: application/json'); // JSON 형식으로 응답을 반환하도록 헤더 설정

require 'db_config.php';
require 'color_map.php';

$bookmarkId = $_POST['id'] ?? null;
$bookmarkName = $_POST['bookmark'] ?? null;
$colorId = $_POST['color'] ?? null;
$colorCode = $colorMap[$colorId] ?? '#6699CC'; // 기본 색상 코드

error_log("ID: " . $bookmarkId . ", Name: " . $bookmarkName . ", Color ID: " . $colorId);

if (!$bookmarkId) {
    error_log("Invalid or missing bookmark ID.");
    echo json_encode(['error' => 'Invalid or missing bookmark ID.']);
    exit;
}

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    echo json_encode(['error' => 'Database connection failed.']);
    exit;
}

// 북마크 이름과 색상 코드 업데이트
$sql = "UPDATE bookmark SET bookmark_name = ?, color_id = ?, color_code = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssi", $bookmarkName, $colorId, $colorCode, $bookmarkId);

if ($stmt->execute()) {
    error_log("Update Success: " . $stmt->affected_rows . " rows updated.");
    echo json_encode(['message' => '북마크가 성공적으로 업데이트되었습니다.']);
} else {
    error_log("Update Error: " . $stmt->error);
    echo json_encode(['error' => '북마크 업데이트에 실패했습니다.']);
}

$stmt->close();
$conn->close();
?>