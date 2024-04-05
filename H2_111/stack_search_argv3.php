<?php

// 커맨드라인에서 값을 받아옴. 일반적인 GET 방식이아니라 백엔드에서 커스텀한 $argv[3]에서 받아옴.
// CLI = Command Line Interface
$argValue = $argv[3];

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$logFile = '/home/nstek/h2_system/patch_active/FDC/work/mjkoo/my_error_log.log';

// 커맨드라인 인자 로깅
$requestLog = "받은 커맨드라인 인자: " . print_r($argValue, true);
error_log($requestLog, 3, $logFile);

ini_set('log_errors', 1);
ini_set('error_log', $logFile);
ini_set('display_errors', 0);
error_reporting(E_ALL);

$host = 'localhost';
$dbname = 'fuelcell';
$username = 'root';
$password = 'Taskqos0880*';
$dsn = "mysql:host=$host;dbname=$dbname";

// 페이지네이션을 위한 변수

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 커맨드라인 인자에서 쿼리 스트링 파싱(커맨드라인에서 넘어온 인자값을 담은 변수, 파싱된 결과 저장할 배열);
    // parse_str: PHP함수, 쿼리 문자열 형태의 데이터를 파싱하여 PHP 배열로 변환하는 역할 
    parse_str($argValue, $paramsFromCLI);
    $conditions = [];
    $params = [];

    foreach ($paramsFromCLI as $key => $value) {
        if ($key == 'LABEL') {
            $conditions[] = "`LABEL` LIKE :label"; // :label은 사용자가 입력한 값, LABEL은 컬럼명, conditions 배열에 저장
            $params['label'] = "%{$value}%";
        } elseif (strpos($key, 'Condition') !== false) {
            $actualField = str_replace('Condition', '', $key); // 인자로 전달된  key에서 Condition 문자열 제거하고 그 결과를 $actualField에 저장
            $conditionType = $value;
            $paramName = str_replace('-', '_', $actualField); // 하이픈 있는 key는 paramName에 언더스코어 넣어서 저장
            $fieldName = "`$actualField`"; // 언더 스코어 넣고 백틱 넣어서 저장

            if ($conditionType == 'over') {
                $conditions[] = "$fieldName > :$paramName";
            } elseif ($conditionType == 'under') {
                $conditions[] = "$fieldName < :$paramName";
            }

            if (isset($paramsFromCLI[$actualField])) {
                $params[$paramName] = $paramsFromCLI[$actualField];
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

