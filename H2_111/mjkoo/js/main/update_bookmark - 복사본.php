<?php
// update_bookmark.php

require 'db_config.php';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$bookmarkId = $_POST['id'];
$bookmarkName = $_POST['bookmark'];
$colorId = $_POST['color'];
$colorCode = $colorMap[$colorId] ?? '#6699CC'; // 기본 색상 코드

// 북마크 이름과 색상 코드 업데이트
$sql = "UPDATE bookmark SET bookmark_name = ?, color_id = ?, color_code = ? WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssi", $bookmarkName, $colorId, $colorCode, $bookmarkId);

if ($stmt->execute()) {
    echo json_encode(['message' => '북마크가 성공적으로 업데이트되었습니다.']);
} else {
    echo json_encode(['error' => '북마크 업데이트에 실패했습니다.']);
}

$stmt->close();
$conn->close();
?>