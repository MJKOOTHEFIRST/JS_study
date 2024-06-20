<?php
// delete_bookmark.php

require 'db_config.php';

// POST 요청에서 북마크 ID 가져오기
$bookmarkId = $_POST['id'];

// 데이터베이스 연결 생성
$conn = new mysqli($servername, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 북마크 삭제 쿼리 실행
$stmt = $conn->prepare("DELETE FROM bookmark WHERE id=?");
$stmt->bind_param("i", $bookmarkId);

if ($stmt->execute()) {
    // 삭제 성공 메시지를 JSON 형식으로 반환
    echo json_encode(array('message' => '북마크가 성공적으로 삭제되었습니다.'));

    // 파일 시스템 동기화: 해당 디렉터리 삭제
    $baseDir = '/home/nstek/h2_system/patch_active/ALL/data/impedance/imp_data/bookmarks/';
    $sql_select_dir = "SELECT dir_name FROM bookmark WHERE id = $bookmarkId";
    $result = $conn->query($sql_select_dir);
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $dirName = $row['dir_name'];
        $dirPath = $baseDir . $dirName;
        if (is_dir($dirPath)) {
            // 디렉터리가 존재하면 삭제
            deleteDirectory($dirPath);
        }
    }
} else {
    // 삭제 실패 메시지를 JSON 형식으로 반환
    echo json_encode(array('error' => '북마크 삭제 중 오류가 발생했습니다.'));
}

// 데이터베이스 연결 종료
$conn->close();

// 디렉터리 삭제 함수 정의
function deleteDirectory($dirPath) {
    if (!is_dir($dirPath)) {
        throw new InvalidArgumentException("$dirPath must be a directory");
    }
    if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
        $dirPath .= '/';
    }
    $files = glob($dirPath . '*', GLOB_MARK);
    foreach ($files as $file) {
        if (is_dir($file)) {
            deleteDirectory($file);
        } else {
            unlink($file);
        }
    }
    rmdir($dirPath);
}
?>