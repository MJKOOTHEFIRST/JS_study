<?php
// copyFileForBookmark.php

header('Content-Type: application/json');

$no = $_GET['no'] ?? null;
$destinationDir = $_GET['destinationDir'] ?? null;

if (!$no || !$destinationDir) {
    echo json_encode(['error' => '필수 파라미터가 누락되었습니다.']);
    exit;
}

require 'db_config.php';

$stmt = $pdo->prepare("SELECT NAME FROM search WHERE NO = :no");
$stmt->execute([':no' => $no]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(['message' => '해당 번호의 파일을 찾을 수 없습니다.']);
    exit;
}

$fileName = trim($row['NAME']);
$sourceDir = '/home/nstek/h2_system/patch_active/ALL/data/impedance/imp_data/post_data/';
$destinationDir = '/home/nstek/h2_system/patch_active/ALL/data/impedance/imp_data/bookmarks/' . trim(urldecode($destinationDir), "\r") . '/';
$sourcePath = trim($sourceDir . $fileName, "\r");
$destinationPath = trim($destinationDir . $fileName, "\r");

error_log("Source path: $sourcePath, Destination path: $destinationPath");

if (!file_exists($sourcePath)) {
    echo json_encode(['message' => '복사할 파일이 존재하지 않습니다.']);
    exit;
}

if (file_exists($destinationPath)) {
    echo json_encode(['message' => '이미 해당 파일이 대상 디렉터리에 존재합니다.']);
    exit;
}

if (!copy($sourcePath, $destinationPath)) {
    echo json_encode(['message' => '파일 복사 실패', 'error' => error_get_last()]);
} else {
    echo json_encode(['message' => '파일 복사 성공', 'fileName' => $fileName]);
}
?>