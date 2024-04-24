<?php
// add_bookmark.php

require 'db_config.php';

// MySQL 연결
$conn = new mysqli($servername, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 사용자가 입력한 북마크 이름
$bookmarkName = isset($_POST['bookmark']) ? $_POST['bookmark'] : '';

// 만약 북마크 이름이 빈 문자열이라면 에러 메시지 반환
if (empty($bookmarkName)) {
    echo json_encode(['error' => '입력 후 추가해주세요']);
    exit;
}

// 기존에 있는 북마크인지 확인하는 쿼리
$sql = "SELECT * FROM bookmark WHERE name = '$bookmarkName'";
$result = $conn->query($sql);

// 만약 이미 존재하는 북마크라면 에러 메시지 반환
if ($result->num_rows > 0) {
    echo json_encode(['error' => '이미 동일한 이름의 북마크가 있습니다.']);
    exit;
}

// 새로운 북마크 추가 쿼리
$sql = "INSERT INTO bookmark (name) VALUES ('$bookmarkName')";
if ($conn->query($sql) === FALSE) {
    echo json_encode(['error' => '북마크를 추가할 수 없습니다.']);
    exit;
}

// 새로 추가된 북마크의 ID 가져오기
$newBookmarkId = $conn->insert_id;

// 새로운 북마크 디렉터리 생성을 위한 기본 경로
$baseDir = '/home/nstek/h2_system/patch_active/ALL/data/impedance/imp_data/bookmarks/';

// 새로운 북마크 디렉터리 이름
$newDirName = "bmk_{$newBookmarkId}_{$bookmarkName}";

// 새로운 북마크 디렉터리 생성
$newDirPath = $baseDir . $newDirName;
if (!mkdir($newDirPath)) {
    // 디렉터리 생성 실패 시 취소된 북마크 데이터 삭제
    $sql = "DELETE FROM bookmark WHERE id = $newBookmarkId";
    $conn->query($sql);
    
    echo json_encode(['error' => '북마크를 생성할 수 없습니다.']);
    exit;
}

// 성공 메시지 반환
echo json_encode(['message' => '북마크가 성공적으로 추가되었습니다.', 'dirName' => $newDirName]);

// MySQL 연결 종료
$conn->close();
?>
