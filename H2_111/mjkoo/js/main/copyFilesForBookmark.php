<?php
// copyFileForBookmark.php

header('Content-Type: application/json');

$no = $_GET['no'];
$color = $_GET['color'] ?? 'defaultColor';
$destinationDir = $_GET['destinationDir'];

require 'db_config.php';

$stmt = $pdo->prepare("SELECT NAME FROM search WHERE NO = :no");
$stmt->execute([':no' => $no]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    $fileName = $row['NAME'];
    $sourcePath = '/path/to/source/' . $fileName;
    $destinationPath = $destinationDir . '/' . $fileName;

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
        file_put_contents($destinationDir . '/color.conf', "color=$color");
        echo json_encode(['message' => '파일 복사 성공', 'fileName' => $fileName]);
    }
} else {
    echo json_encode(['message' => '해당 번호의 파일을 찾을 수 없습니다.']);
    exit;
}
?>