<?php
// GET 방식 - 작동 OK
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// 에러 로그 파일 경로 지정
$logFile = '/home/nstek/h2_system/patch_active/FDC/work/mjkoo/my_error_log.log';

// GET 요청 정보 로깅
$requestLog = "/////받은 GET 요청: " . print_r($argv[3], true);
// $requestLog = "/////받은 GET 요청: " . print_r($_GET, true);
error_log($requestLog, 3, $logFile);

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

try {
    // PDO 객체를 사용하여 데이터베이스에 연결
    $pdo = new PDO($dsn, $username, $password);
    // 에러 모드를 예외 발생 모드로 설정
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 조건과 파라미터를 저장할 배열 초기화
    $conditions = [];
    $params = [];

    // $field = 배열의 각 요소에서 key, $value = 해당 요소의 값
    foreach ($_GET as $field => $value) {
        if (!empty($value)) {
            if ($field == 'LABEL') {
                // LABEL 값이 포함되어 있는지 확인하기 위해 LIKE와 와일드카드 사용
                $conditions[] = "`LABEL` LIKE :label";
                $params['label'] = "%" . $value . "%"; // 와일드카드를 값 양쪽에 추가
            } elseif (isset($_GET[$field . 'Condition'])) {
                $conditionType = $_GET[$field . 'Condition']; //조건 type: over / under
                $paramName = str_replace('-', '_', $field); // 하이픈을 언더스코어로 변환(php의 파라미터명)
    
                // 필드 이름에 하이픈이 있으면 백틱을 조건적으로 추가(DB의 컬럼명)
                $fieldName = strpos($field, '-') !== false ? "`$field`" : $field;
    
                if ($conditionType == 'over') {
                    $conditions[] = "$fieldName > :$paramName";
                } elseif ($conditionType == 'under') {
                    $conditions[] = "$fieldName < :$paramName";
                }
    
                $params[$paramName] = $value;
            }
        }
    }

    $conditionsLog = "조건 배열: " . print_r($conditions, true);
    $paramsLog = "파라미터 배열: " . print_r($params, true);
    error_log($conditionsLog, 3, $logFile);
    error_log($paramsLog, 3, $logFile);

    $query = "SELECT * FROM search";
    if (!empty($conditions)) {
        // echo 'step1'; // $ conditions 배열이 비어있음. GET 요청에서 조건을 제대로 파싱하지 못했거나, 조건이 전송되지 않았을 수 있음.
        $query .= " WHERE " . implode(' AND ', $conditions);
    }
    // echo $query;
    // 쿼리문 로깅
    $queryLog = "실행 쿼리: " . $query;
    error_log($queryLog, 3, $logFile);

    // 쿼리 실행 준비
    $stmt = $pdo->prepare($query);

    // 파라미터 바인딩
    foreach ($params as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
