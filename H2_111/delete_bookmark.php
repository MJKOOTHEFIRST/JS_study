<?php
// delete_bookmark.php

require 'db_config.php';

// POST 요청에서 북마크 이름 가져오기
$bookmarkName = $_POST['bookmark'];

// 데이터베이스 연결 생성
$conn = new mysqli($servername, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 북마크 삭제 쿼리 실행
$sql = "DELETE FROM bookmark WHERE name='$bookmarkName'";

if ($conn->query($sql) === TRUE) {
    // 삭제 성공 메시지를 JSON 형식으로 반환
    echo json_encode(array('message' => '북마크가 성공적으로 삭제되었습니다.'));

    // 해당 디렉터리도 삭제
    $baseDir = '/home/nstek/h2_system/patch_active/ALL/data/impedance/imp_data/bookmarks/';
    $dirName = "bmk_{$bookmarkName}";
    $dirPath = $baseDir . $dirName;
    if (is_dir($dirPath)) {
        // 디렉터리가 존재하면 삭제
        rmdir($dirPath);
    }
} else {
    // 삭제 실패 메시지를 JSON 형식으로 반환
    echo json_encode(array('error' => '북마크 삭제 중 오류가 발생했습니다.'));
}

// 데이터베이스 연결 종료
$conn->close();
?>
