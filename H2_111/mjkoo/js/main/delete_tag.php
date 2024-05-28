<?php
// delete_tag.php

header('Content-Type: application/json');

// 에러 로깅 활성화, 에러 출력 비활성화
ini_set('display_errors', 0);
error_reporting(E_ALL);

// 입력값 확인
$tag = isset($_GET['tag']) ? $_GET['tag'] : null;

$response = [];

if ($tag === null) {
    $response['error'] = "태그 데이터가 전송되지 않았습니다.";
    if (is_writable('/path/to/error/log')) {
        error_log($response['error']);  // 기본 에러 로그에 기록
    }
    echo json_encode($response);
    exit;
}

// 파일 경로 설정
$filePath = '/home/nstek/h2_system/patch_active/fuelcell_data/tags.conf';

// 로깅을 추가하여 파일 상태 확인
if (is_writable('/path/to/error/log')) {
    error_log("파일 존재 여부 확인 전: " . $filePath);  // 기본 에러 로그에 기록
}
if (!file_exists($filePath)) {
    $response['error'] = "파일이 존재하지 않습니다: " . $filePath;
    if (is_writable('/path/to/error/log')) {
        error_log($response['error']);  // 기본 에러 로그에 기록
    }
    echo json_encode($response);
    exit;
} else if (!is_writable($filePath)) {
    $response['error'] = "파일에 쓸 수 없습니다: " . $filePath;
    if (is_writable('/path/to/error/log')) {
        error_log($response['error']);  // 기본 에러 로그에 기록
    }
    echo json_encode($response);
    exit;
} else {
    // 파일에서 태그 삭제
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $newLines = array_filter($lines, function($line) use ($tag) {
        return strpos($line, $tag . ',') !== 0; // 태그와 일치하는 줄을 삭제
    });

    // 파일 다시 쓰기
    if (file_put_contents($filePath, implode(PHP_EOL, $newLines)) === false) {
        $response['error'] = "파일 쓰기 실패: " . $filePath;
        if (is_writable('/path/to/error/log')) {
            error_log($response['error']);  // 기본 에러 로그에 기록
        }
        echo json_encode($response);
        exit;
    } else {
        // 성공적인 응답 전송
        $response['message'] = '태그가 성공적으로 삭제되었습니다.';
        if (is_writable('/path/to/error/log')) {
            error_log("태그 삭제 성공: " . $tag);  // 기본 에러 로그에 기록
        }
        echo json_encode($response);
    }
}

echo json_encode($response);
?>