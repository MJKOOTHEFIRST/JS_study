<?php
//stack_search_fileSave.php
// 체크박스 클릭하면 해당 체크박스의 NO을 통해 /home/nstek/h2_system/patch_active/FDC/work/bjy/impedance/time_series 에서 /home/nstek/h2_system/patch_active/FDC/work/bjy/impedance//selected로 파일 옮기기
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$no = $_GET['no'];

// 로그 설정
ini_set('log_errors', 1);
ini_set('display_errors', 0);
error_reporting(E_ALL);

require 'db_config.php';

// 데이터베이스 연결 및 `NO`에 해당하는 파일 정보 조회 로직 구현
$stmt = $pdo->prepare("SELECT NAME FROM search WHERE NO = :no");
$stmt->execute([':no' => $no]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    $fileName = $row['NAME'];
} else {
    echo json_encode(['message' => '해당 번호의 파일을 찾을 수 없습니다.']);
    exit;
}

// 필요한 경로 조합
$sourcePath = '/FDC/work/bjy/impedance/time_series/' . $fileName;
$destinationPath = '/FDC/work/bjy/impedance/selected/' . $fileName;

if(rename($sourcePath, $destinationPath)) {
    echo json_encode(['message' => '파일 이동 성공', 'fileName' => $fileName]);
} else {
    echo json_encode(['message' => '파일 이동 실패']);
}

?>