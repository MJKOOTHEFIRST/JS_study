<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$logFile = '/var/www/html/error/error.log';

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
$password = 'password';
$dsn = "mysql:host=$host;dbname=$dbname";

// 페이지네이션을 위한 변수
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

$perPage = 10; // 한 페이지당 데이터 수
$offset = ($page - 1) * $perPage; // 예)한 페이지에 10개의 항목을 보여줄 때, 첫 번째 페이지의 offset은 0, 두 번째 페이지의 offset은 10

$totalPages= ceil($totalRows/ $perPage); // 전체 페이지 수 계산

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

    $query = "SELECT COUNT(*) FROM search";
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions);
    }

    $countStmt = $pdo->prepare($query);
    foreach ($params as $key => &$val) {
        $countStmt->bindParam(':' . $key, $val);
    }
    $countStmt->execute();
    $totalRows = $countStmt->fetchColumn();

    $query = "SELECT DISTINCT * FROM search";
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions);
    }
    $query .= " ORDER BY DATE DESC LIMIT :offset, :perPage";

    $stmt = $pdo->prepare($query);
    foreach ($params as $key => &$val) {
        $stmt->bindParam(':' . $key, $val);
    }
    // 페이지네이션을 위한 바인딩
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindParam(':perPage', $perPage, PDO::PARAM_INT);

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 결과와 함께 전체 데이터 수 반환
    echo json_encode(['data' => $results, 'totalRows' => $totalRows, 'totalPages' => $totalPages]);

} catch (PDOException $e) {
    error_log("데이터베이스 오류: " . $e->getMessage(), 3, $logFile);
    echo json_encode(["error" => "데이터베이스 오류가 발생했습니다."]);
}
?>
