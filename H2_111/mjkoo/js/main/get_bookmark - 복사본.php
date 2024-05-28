<?php
// get_bookmark.php

require 'db_config.php';

// MySQL 연결
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 북마크 목록을 데이터베이스에서 가져오는 쿼리
$sql = "SELECT bookmark_name, color_id, color_code FROM bookmark"; // color_id와 color_code를 모두 가져옴
$result = $conn->query($sql);

$bookmarkList = [];

if ($result->num_rows > 0) {
    // 결과를 배열에 저장
    while($row = $result->fetch_assoc()) {
        $bookmarkList[] = [
            // 배열에 북마크 정보를 저장할 때 사용된 키값은 JS에서 해당 객체의 속성명으로 사용된다.
            //예 : bookmark.name, bookmark.colorId, bookmark.colorCode
            'name' => $row['bookmark_name'], 
            'colorId' => $row['color_id'], 
            'colorCode' => $row['color_code']
        ];
    }
} else {
    echo json_encode(['error' => '북마크가 없습니다.']);
    exit;
}

// JSON 형식으로 북마크 목록 반환
echo json_encode($bookmarkList);

// MySQL 연결 종료
$conn->close();
?>