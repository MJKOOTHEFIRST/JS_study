<?php
// load_tags.php
$filePath = '/var/www/html/fuelcell_data/tags.conf';
// FILE_IGNORE_NEW_LINES  : 각 줄 끝의 줄바꿈 문자 제거
// FILE_SKIP_EMPTY_LINES : 빈 줄 무시
$lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

$tags = array();
foreach ($lines as $line) {
    // 각 줄에서 "color: " 문자열을 기준으로 태그 이름과 색상 코드 분리
    $parts = explode(", color: ", $line, 2);
    if (count($parts) == 2) {
        $tagName = trim($parts[0]);
        $colorCode = trim($parts[1]);
        $tags[] = array(
            'name' => $tagName,
            'color' => $colorCode
        );
    }
}

// 태그 목록을 JSON 형식으로 출력
header('Content-Type: application/json');
echo json_encode($tags);
?>