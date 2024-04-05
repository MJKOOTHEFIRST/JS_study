<?php
// stack_search.php
// JSON stringfy ver.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// 에러 로그 파일 경로 지정
$logFile = '/home/nstek/h2_system/patch_active/FDC/work/mjkoo/my_error_log.log';

// PHP 에러 로깅을 위한 설정
ini_set('log_errors', 1); // 에러 로깅 활성화
ini_set('error_log', $logFile); // 에러 로그 파일 지정

// 에러 레포팅 레벨 설정
ini_set('display_errors', 0); // 브라우저에 에러를 표시하지 않음
error_reporting(E_ALL); // 모든 에러와 경고를 로그 파일에 기록

// 데이터베이스 연결 설정
$host = 'localhost';
$dbname = 'fuelcell';
$username = 'root';
$password = 'Taskqos0880*';
$dsn = "mysql:host=$host;dbname=$dbname";

// POST 요청에서 JSON 데이터를 받음(클라이언트로부터 전송된 JSON 형식의 데이터를 받아서 PHP 배열로 변환하는 일방적 방식)
$data = json_decode(file_get_contents('php://input'), true);
error_log(print_r($data, true)); // 데이터확인

// 받은 POST 요청 로깅
$requestLog = "/////받은 POST 요청: " . print_r($data, true);
error_log($requestLog, 3, $logFile);

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conditions = [];
    $params = [];

    // 데이터 검증 및 조건 구성
    foreach ($data as $field => $info) {
        if (!empty($info['value'])) {
            if ($field == 'LABEL') {
                $conditions[] = "`LABEL` LIKE :label";
                $params[':label'] = "%" . $info['value'] . "%";
            } else {
                $condition = $info['condition'];
                $value = $info['value'];

                $fieldName = "`$field`";
                if ($condition === '>') {
                    $conditions[] = "$fieldName > :$field";
                } elseif ($condition === '<') {
                    $conditions[] = "$fieldName < :$field";
                }
                $params[":$field"] = $value;
            }
        }
    }

    // 조건과 파라미터 로깅
    error_log("조건 배열: " . print_r($conditions, true), 3, $logFile);
    error_log("파라미터 배열: " . print_r($params, true), 3, $logFile);

    // 쿼리 실행
    $query = "SELECT * FROM search";
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions);
    }

    // 쿼리 로깅
    error_log("실행 쿼리: " . $query, 3, $logFile);

    $stmt = $pdo->prepare($query);
    foreach ($params as $key => &$value) {
        $stmt->bindParam($key, $value);
    }
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
