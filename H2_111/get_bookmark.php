<?php
// get_bookmark.php

// 북마크 디렉터리 경로
$baseDir = '/home/nstek/h2_system/patch_active/ALL/data/impedance/imp_data/bookmarks/';

// 디렉터리가 존재하지 않으면 오류 메시지 반환
if (!file_exists($baseDir)) {
    echo json_encode(['error' => '북마크 디렉터리를 찾을 수 없습니다.']);
    exit;
}

// 디렉터리 내의 모든 파일과 디렉터리 목록을 가져옴
$files = scandir($baseDir);

// 반환할 북마크 목록을 담을 배열 초기화
$bookmarkList = [];

// 모든 파일 및 디렉터리에 대해 반복하며 북마크 목록을 생성
foreach ($files as $file) {
    $file = mb_convert_encoding($file, "UTF-8", "EUC-KR");
    // 파일 또는 디렉터리 이름에서 북마크 이름 추출
    $parts = explode('_', $file);
    $bookmarkName = $parts[2]; // 두 번째 요소를 북마크 이름으로 사용

    // 추출한 북마크 이름이 빈 문자열이 아니고, 배열에 존재하지 않으면 배열에 추가
    if (!empty($bookmarkName) && !in_array($bookmarkName, $bookmarkList)) {
        $bookmarkList[] = $bookmarkName;
    }
}

// JSON 형식으로 북마크 목록 반환
echo json_encode($bookmarkList);
?>
