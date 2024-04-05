<?php
// stack_label_update.php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$logFile = '/var/www/html/error/error.log';

// 데이터베이스 설정
$host = 'localhost';
$dbname = 'fuelcell';
$username = 'root';
$password = 'password';
$dsn = "mysql:host=$host;dbname=$dbname";

$dateString = isset($_GET['date']) ? $_GET['date'] : '';
$date = date('Y-m-d H:i:s', strtotime($dateString));

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // GET 요청으로부터 id와 label 값을 받음
    $id = isset($_GET['date']) ? $_GET['date'] : '';
    $label = isset($_GET['label']) ? $_GET['label'] : '';

    // 데이터베이스 업데이트 쿼리
    $sql = "UPDATE search SET LABEL = :label WHERE `DATE` = :date";
    error_log("쿼리: $sql" . PHP_EOL, 3, $logFile);
    error_log("date: $id, label: $label" . PHP_EOL, 3, $logFile);
    

    $stmt = $pdo->prepare($sql);
    
    // 쿼리 파라미터 바인딩
    $stmt->bindParam(':date', $id, PDO::PARAM_STR);
    $stmt->bindParam(':label', $label, PDO::PARAM_STR);

    // 쿼리 실행
    $stmt->execute();
    if($stmt->errorCode() !='00000'){
      $error = $stmt -> errorInfo();
      echo "SQL 에러: ". $error[2];
    }

    // 성공 응답
    echo json_encode(['success' => true, 'message' => '라벨 업데이트 성공']);

} catch (PDOException $e) {
    // 에러 처리
    error_log("데이터베이스 오류: " . $e->getMessage() . PHP_EOL, 3, $logFile);
    echo json_encode(['success' => false, 'message' => '라벨 업데이트 실패: ' . $e->getMessage()]);
}
?>
