<?php
// save_tag.php
header('Content-Type: application/json');

// 에러 로깅 활성화
ini_set('display_errors', 1);
error_reporting(E_ALL);

$logPath = '/home/nstek/h2_system/patch_active/FDC/work/mjkoo/my_error_log.log';
// cat /home/nstek/h2_system/patch_active/FDC/work/mjkoo/my_error_log.log

// 입력값 확인
$tag = isset($_POST['tag']) ? $_POST['tag'] : null;
$color = isset($_POST['color']) ? $_POST['color'] : '';

$response = [];

if ($tag === null) {
    $response['error'] = "태그 데이터가 전송되지 않았습니다.";
    error_log($response['error'] . "\n", 3, $logPath);
    echo json_encode($response);
    exit;
}

// 파일 경로 설정
$filePath = '/home/nstek/h2_system/patch_active/fuelcell_data/tags.conf';

// 로깅을 추가하여 파일 상태 확인
error_log("파일 존재 여부 확인 전" .$filePath. "\n", 3, $logPath);
if (!file_exists($filePath)) {
    $response['error'] = "파일이 존재하지 않습니다: " . $filePath;
    error_log($response['error'] . "\n", 3, $logPath);
    echo json_encode($response);
    exit;
} else if (!is_writable($filePath)) {
    $response['error'] = "파일에 쓸 수 없습니다: " . $filePath;
    error_log($response['error'] . "\n", 3, $logPath);
    echo json_encode($response);
    exit;
} else {
    // 태그와 색상 정보를 파일에 추가
    $dataToSave = "tag: " . $tag;
    if (!empty($color)) {
        $dataToSave .= ", color: " . $color;
    }
    $dataToSave .= PHP_EOL;

    if (file_put_contents($filePath, $dataToSave, FILE_APPEND) === false) {
        $response['error'] = "파일 쓰기 실패: " . $filePath;
        error_log($response['error'] . "\n", 3, $logPath);
        echo json_encode($response);
        exit;
    } else {
        // 성공적인 응답 전송
        $response['message'] = '태그가 성공적으로 저장되었습니다.';
        // 로그 파일에 성공 메시지 기록
        error_log("태그 저장 성공: " . $dataToSave, 3, $logPath);
    }
}

echo json_encode($response);
?>