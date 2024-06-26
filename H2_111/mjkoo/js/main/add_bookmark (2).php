<?php

// stack_search.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// GET 방식으로 전달된 데이터 수집
$getParams = $_GET;

// GET 데이터 로깅
$requestLog = "받은 GET 데이터: " . print_r($getParams, true);
error_log($requestLog);

// 로그 설정
ini_set('log_errors', 1);
ini_set('display_errors', 0);
error_reporting(E_ALL);

require 'db_config.php';

// 페이지네이션을 위한 변수
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = 100; // 한 페이지당 데이터 수
$offset = ($page - 1) * $perPage; // 예)한 페이지에 10개의 항목을 보여줄 때, 첫 번째 페이지의 offset은 0, 두 번째 페이지의 offset은 10

// 정수로 캐스팅하여 SQL 인젝션 방지
// $offset = (int)$offset;
// $perPage = (int)$perPage;

// $offset과 $perPage 값을 계산하거나 할당한 후
// error_log("Offset: " . $offset . ", PerPage: " . $perPage);

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    //전체 데이터 수 조회
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM search");
    $countStmt->execute();
    $totalRows = $countStmt->fetchColumn();

    // GET 데이터 파싱
    $conditions = [];
    $params = [];

    // 날짜 조건을 쿼리에 추가
    if (isset($getParams['start-date']) && isset($getParams['end-date'])) {
        $startDate = $getParams['start-date'];
        $endDate = $getParams['end-date'];

        // 날짜 형식 변환 (입력된 날짜가 'YYYY-MM-DDTHH:MM' 형식인 경우)
        $startDate = str_replace("T", " ", substr($startDate, 0, 16)) . ":00";
        $endDate = str_replace("T", " ", substr($endDate, 0, 16)) . ":00";

        // 쿼리에 날짜 조건 추가
        $conditions[] = "`DATE` BETWEEN :startDate AND :endDate";
        $params['startDate'] = $startDate;
        $params['endDate'] = $endDate;

        // 에러 로깅으로 날짜 값 확인
        error_log("처리된 startDate: " . $startDate);
        error_log("처리된 endDate: " . $endDate);
    } elseif (isset($getParams['startDate'])) {
        // start date만 있는 경우
        $startDate = $getParams['startDate'];
        $startDate = str_replace("T", " ", substr($startDate, 0, 16)) . ":00";
        $conditions[] = "`DATE` >= :startDate";
        $params['startDate'] = $startDate;
    } elseif (isset($getParams['endDate'])) {
        // end date만 있는 경우
        $endDate = $getParams['endDate'];
        $endDate = str_replace("T", " ", substr($endDate, 0, 16)) . ":00";
        $conditions[] = "`DATE` <= :endDate";
        $params['endDate'] = $endDate;
    }


    $keywordIndex = 0; // 키워드에 대한 고유 인덱스

    foreach ($getParams as $key => $value) {
        // LABEL 필드에서 입력받은 키워드의 수에 따라 동적으로 바인딩되는 파라미터의 수가 달라지기 때문에 발생. 이를 해결하기 위해서는 쿼리를 구성할 때 LABEL 필드에 대한 처리를 동적으로 조정해야함
        if ($key == 'LABEL' && !empty($value)) {
            $keywords = explode('#', $value);
            $keywords = array_filter($keywords, function ($value) {
                $trimmedValue = trim($value);
                return !is_null($trimmedValue) && $trimmedValue !== '';
            });

            foreach ($keywords as $keyword) {
                $keyword = trim($keyword);
                if (!empty($keyword)) {
                    $paramName = "label" . $keywordIndex;
                    $conditions[] = "`LABEL` LIKE :$paramName";
                    $params[$paramName] = "%" . $keyword . "%";
                    $keywordIndex++;
                }
            }
        } elseif (strpos($key, 'Condition') !== false) {
            $actualField = str_replace('Condition', '', $key);
            $conditionType = $value;
            $paramName = str_replace('-', '_', $actualField);
            $fieldName = "`$actualField`"; // 실제 필드 이름
            $actualValue = $getParams[$actualField]; // 실제 값

            if ($conditionType == 'over') {
                $conditions[] = "$fieldName > :condition_$paramName"; // 이름 기반 바인딩으로 수정
                $params['condition_' . $paramName] = $actualValue; // 실제 값 바인딩
            } elseif ($conditionType == 'under') {
                $conditions[] = "$fieldName < :condition_$paramName"; // 이름 기반 바인딩으로 수정
                $params['condition_' . $paramName] = $actualValue;
            }
        }
    }


    // 바인딩할 파라미터 수
    $bindingCount = count($params);

    // 쿼리 준비
    $query = "SELECT DISTINCT * FROM search";
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions);
    }
    $query .= " ORDER BY DATE DESC LIMIT :offset, :perPage";

    // 페이지네이션 파라미터 추가
    $stmt = $pdo->prepare($query);

    // 바인딩할 파라미터 로그 기록
    // error_log("바인딩할 파라미터 - offset: $offset, perPage: $perPage");

    // 페이지네이션 파라미터만 바인딩
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindParam(':perPage', $perPage, PDO::PARAM_INT);

    // 필터링 조건을 적용한 전체 데이터 수 조회 쿼리
    $filteredCountQuery = "SELECT COUNT(*) FROM search";
    if (!empty($conditions)) {
        $filteredCountQuery .= " WHERE " . implode(' AND ', $conditions);
    }
    $filteredCountStmt = $pdo->prepare($filteredCountQuery);


    // 조건 파라미터 바인딩
    foreach ($params as $key => $val) {
        $paramName = ":" . str_replace('-', '_', $key); // 하이픈을 언더스코어로 변경
        // error_log("바인딩된 파라미터: " . $paramName . " - " . $val);
        $stmt->bindValue($paramName, $val, is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }

    // 필터링 된 전체 데이터 수 조회 실행
    $filteredCountStmt->execute($params);
    $filteredTotalRows = $filteredCountStmt->fetchColumn(); // 할당 연산자 수정


    // error_log("실행할 쿼리:" . $query);
    // error_log("바인딩된 파라미터 수: $bindingCount");
    // error_log("필터링 된 전체 데이터 수".$filteredTotalRows);//필터링 된 전체 데이터 수 로깅

    // 바인딩된 파라미터 목록 로깅
    $boundParamsLog = "바인딩된 파라미터 목록: \n";
    foreach ($params as $key => $val) {
        $boundParamsLog .= $key . "-" . $val . "\n";
    }
    // 페이지네이션 파라미터 추가
    $boundParamsLog .= "offset -" . $offset . "\n";
    $boundParamsLog .= "perPage -" . $perPage . "\n";

    error_log($boundParamsLog);

    $stmt->execute();

    // 결과가 있을 경우에만 반환
    if ($stmt->rowCount() > 0) {
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['data' => $results, 'totalRows' => $filteredTotalRows]);
    } else {
        // 결과가 없을 때 처리
        echo json_encode(['data' => [], 'totalRows' => $filteredTotalRows]);
    }
} catch (PDOException $e) {
    error_log("데이터베이스 오류: " . $e->getMessage());
    echo json_encode(["error" => "데이터베이스 오류가 발생했습니다."]);
}
