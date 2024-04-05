<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$logFile = '/home/nstek/h2_system/patch_active/FDC/work/mjkoo/my_error_log.log';

// GET 방식으로 전달된 데이터 수집
$getParams = $_GET;

// GET 데이터 로깅
$requestLog = "받은 GET 데이터: " . print_r($getParams, true);
error_log($requestLog, 3, $logFile);

// 로그 설정
ini_set('log_errors', 1);
ini_set('error_log', $logFile);
ini_set('display_errors', 0);
error_reporting(E_ALL);

$host = 'localhost';
$dbname = 'fuelcell';
$username = 'root';
$password = 'Taskqos0880*';
$dsn = "mysql:host=$host;dbname=$dbname";

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // GET 데이터 파싱
    $conditions = [];
    $params = [];

    foreach ($getParams as $key => $value) {
        if ($key == 'LABEL') {
            $conditions[] = "`LABEL` LIKE :label";
            $params['label'] = "%{$value}%";
        } elseif (strpos($key, 'Condition') !== false) {
            $actualField = str_replace('Condition', '', $key);
            $conditionType = $value;
            $paramName = str_replace('-', '_', $actualField);
            $fieldName = "`$actualField`";

            if ($conditionType == 'over') {
                $conditions[] = "$fieldName > :$paramName";
            } elseif ($conditionType == 'under') {
                $conditions[] = "$fieldName < :$paramName";
            }

            if (isset($getParams[$actualField])) {
                $params[$paramName] = $getParams[$actualField];
            }
        }
    }

    $query = "SELECT DISTINCT * FROM search";
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions);
    }
    $query .=" ORDER BY DATE DESC";

    $stmt = $pdo->prepare($query);
    foreach ($params as $key => &$val) {
        $stmt->bindParam(':'.$key, $val);
    }
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results);

} catch (PDOException $e) {
    error_log("데이터베이스 오류: " . $e->getMessage(), 3, $logFile);
    echo json_encode(["error" => "데이터베이스 오류가 발생했습니다."]);
}



?>