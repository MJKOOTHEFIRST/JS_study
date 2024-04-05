<?php
// save_tag.php
header('Content-Type: application/json');

// 에러 로깅 활성화
ini_set('display_errors', 1);
error_reporting(E_ALL);

$tag = isset($_GET['tag']) ? $_GET['tag'] : null;
$color = isset($_GET['color']) ? $_GET['color'] : '';

$response = [];

if ($tag === null) {
    $response['error'] = "태그 데이터가 전송되지 않았습니다.";
    error_log($response['error'] . "\n");
    echo json_encode($response);
    exit;
}

// 파일 경로 설정
$filePath = '/var/www/html/fuelcell_data/tags.conf';

// 로깅을 추가하여 파일 상태 확인
error_log("파일 존재 여부 확인 전" . $filePath . "\n");
if (!file_exists($filePath)) {
    $response['error'] = "파일이 존재하지 않습니다: " . $filePath;
    error_log($response['error'] . "\n");
    echo json_encode($response);
    exit;
} else if (!is_writable($filePath)) {
    $response['error'] = "파일에 쓸 수 없습니다: " . $filePath;
    error_log($response['error'] . "\n");
    echo json_encode($response);
    exit;
} else {
    // 태그와 색상 정보를 파일에 추가
    $dataToSave = $tag; // 태그 이름을 먼저 추가
    if (!empty($color)) {
        // 색상 값이 제대로 전달되었는지 확인
        if (preg_match('/^#[a-f0-9]{6}$/i', $color)) {
            $dataToSave .= ", color: " . $color; // 유효한 색상 값이면 색상 정보 추가
        } else {
            $response['error'] = "잘못된 색상 형식입니다.";
            error_log($response['error'] . "\n");
            echo json_encode($response);
            exit;
        }
    }
    $dataToSave .= PHP_EOL; // 태그 정보 끝에 줄바꿈 문자 추가

    error_log("저장할 데이터: " . $dataToSave . "\n");
    if (file_put_contents($filePath, $dataToSave, FILE_APPEND) === false) {
        $response['error'] = "파일 쓰기 실패: " . $filePath;
        error_log($response['error'] . "\n");
        echo json_encode($response);
        exit;
    } else {
        // 성공적인 응답 전송
        $response['message'] = '태그가 성공적으로 저장되었습니다.';
        // 로그 파일에 성공 메시지 기록
        error_log("태그 저장 성공: " . $dataToSave);
    }
}

echo json_encode($response);
