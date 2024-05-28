<?php
//search_copyFile.php

header('Content-Type: application/json'); // JSON 형식으로 변경

$no = $_GET['no'];
$color = $_GET['color'] ?? '5BBCFF'; //색상 코드를 URL 파라미터에에서 읽어옴
$color = str_replace("#", "", $color); // 색상 코드에서 '#'을 제거

// 로그 설정
ini_set('log_errors', 1);
ini_set('display_errors', 0);
error_reporting(E_ALL);

require 'db_config.php';

// 데이터베이스 연결 및 `NO`에 해당하는 파일 정보 조회 로직 구현
// 파일명은 search 테이블의 NAME과 정확히 일치한다.
$stmt = $pdo->prepare("SELECT NAME FROM search WHERE NO = :no");
$stmt->execute([':no' => $no]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    $fileName = $row['NAME'];
    // 파일 이름에서 캐리지 리턴(\r) 문자 제거 및 인코딩 변환
    $fileName = str_replace("\r", "", $fileName);
    $fileName = mb_convert_encoding($fileName, 'UTF-8', mb_detect_encoding($fileName));

    // 석택된 색상 정보 파일명에 추가
    $fileNameWithColor = $fileName . "{" . $color ."}";

    // 절대 경로 설정
    $sourcePath = '/home/nstek/h2_system/patch_active/ALL/data/impedance/imp_data/post_data/' . $fileName;
    $destinationPath = '/home/nstek/h2_system/patch_active/FDC/work/bjy/impedance/selected/' . $fileNameWithColor;

    // 파일 존재 확인
    if (!file_exists($sourcePath)) {
        echo json_encode(['message' => '복사할 파일이 존재하지 않습니다.']);
        exit;
    }

    // 대상 디렉토리에 이미 파일이 존재하는지 확인
    if (file_exists($destinationPath)) {
        echo json_encode(['message' => '이미 해당 파일이 대상 디렉토리에 존재합니다.', 'fileName' => $fileNameWithColor]);
        exit;
    }

    // 파일 이동 로직
    if (!copy($sourcePath, $destinationPath)) {
        echo json_encode(['message' => '파일 복사 실패', 'error' => error_get_last()]);
    } else {
        echo json_encode(['message' => '파일 복사 성공', 'fileName' => $fileNameWithColor]);
    }
} else {
    echo json_encode(['message' => '해당 번호의 파일을 찾을 수 없습니다.']);
    exit;
}

error_log("Source Path: " . $sourcePath);
error_log("Destination Path: " . $destinationPath);
?>
