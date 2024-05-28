<?php
require 'db_config.php';

// 데이터베이스 연결 생성
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// POST 요청에서 북마크 ID 가져오기
$bookmarkId = $_POST['id'];

// 북마크 삭제 쿼리 실행
$stmt = $conn->prepare("DELETE FROM bookmark WHERE id=?");
$stmt->bind_param("i", $bookmarkId);

if ($stmt->execute()) {
    // 삭제 성공 메시지를 JSON 형식으로 반환
    echo json_encode(array('message' => '북마크가 성공적으로 삭제되었습니다.'));
} else {
    // 삭제 실패 메시지를 JSON 형식으로 반환
    echo json_encode(array('error' => '북마크 삭제 중 오류가 발생했습니다.'));
}

// 데이터베이스 연결 종료
$conn->close();
?>