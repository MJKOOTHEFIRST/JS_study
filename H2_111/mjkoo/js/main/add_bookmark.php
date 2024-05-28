<?php
// add_bookmark.php

require 'db_config.php';
require 'color_map.php'; 

header('Content-Type: application/json');

// MySQL 연결
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit;
}

// 사용자가 입력한 북마크 이름
$bookmarkName = isset($_POST['bookmark']) ? $_POST['bookmark'] : '';

// 사용자가 입력한 색상 식별자, 없을 경우 'color03'을 기본값으로 사용
$selectedColorId = isset($_POST['color']) && array_key_exists($_POST['color'], $colorMap) ? $_POST['color'] : 'color03';

// 실제 색상 코드로 변환
$colorCode = $colorMap[$selectedColorId] ?? '#6699CC'; // 기본값 설정

// 만약 북마크 이름이 빈 문자열이라면 에러 메시지 반환
if (empty($bookmarkName) || empty($colorCode)) {
    echo json_encode(['error' => '북마크 이름과 색상을 모두 입력해주세요.']);
    exit;
}

// 기존에 있는 북마크인지 확인하는 쿼리
$sql = "SELECT * FROM bookmark WHERE bookmark_name = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $bookmarkName);
$stmt->execute();
$result = $stmt->get_result();

// 만약 이미 존재하는 북마크라면 에러 메시지 반환
if ($result->num_rows > 0) {
    echo json_encode(['error' => '이미 동일한 이름의 북마크가 있습니다.']);
    exit;
}

// 새로운 북마크 추가 쿼리 (북마크 이름, 색상 식별자, 색상 코드를 함께 저장)
$sql = "INSERT INTO bookmark (bookmark_name, color_id, color_code) VALUES (?,?,?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('sss', $bookmarkName, $selectedColorId, $colorCode);

if ($stmt->execute() === FALSE) {
    echo json_encode(['error' => '북마크를 추가할 수 없습니다.']);
    exit;
}

// 성공 메시지 반환
echo json_encode(['message' => '북마크가 성공적으로 추가되었습니다.']);

// MySQL 연결 종료
$conn->close();
?>
