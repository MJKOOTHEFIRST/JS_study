
<?php
// 필터링 후의 페이지네이션 기능 보완 전 

try {
    // PDO 객체 생성
    $pdo = new PDO($dsn, $username, $password);
    // 에러 모드 설정: 예외가 발생했을 때 예외를 던지도록 설정
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 전체 데이터 수 조회 쿼리 준비
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM search");
    $countStmt->execute();
    // 총 행 수 가져오기
    $totalRows = $countStmt->fetchColumn();
    
    // GET 데이터 파싱
    $conditions = []; // 검색 조건을 저장할 배열
    $params = []; // 바인딩할 파라미터를 저장할 배열
    
    $keywordIndex = 0; // 키워드에 대한 고유 인덱스 초기화
    
    // GET 파라미터 반복
    foreach ($getParams as $key => $value) {
        // LABEL 파라미터 처리
        if ($key == 'LABEL' && !empty($value)) {
            // '#'을 기준으로 입력된 키워드를 분리하여 배열로 저장
            $keywords = explode('#', $value);
            // 빈 문자열 제거 및 필터링
            $keywords = array_filter($keywords, function ($value) {
                return !is_null($value) && $value !== '';
            });

            // 각 키워드에 대해 처리
            foreach ($keywords as $keyword) {
                // 각 키워드에 대해 고유한 파라미터 이름 생성
                $paramName = "label" . $keywordIndex;
                // 검색 조건 배열에 LIKE 조건 추가
                $conditions[] = "`LABEL` LIKE :$paramName";
                // 바인딩할 파라미터 추가
                $params[$paramName] = "%{$keyword}%";
                // 다음 키워드 인덱스 증가
                $keywordIndex++;
            }
        } elseif (strpos($key, 'Condition') !== false) {
            // 조건 파라미터 처리
            $actualField = str_replace('Condition', '', $key); // 실제 필드명 추출
            $conditionType = $value; // 조건 타입 추출
            $paramName = str_replace('-', '_', $actualField); // 파라미터 이름 생성
            $fieldName = "`$actualField`"; // 실제 필드 이름
            $actualValue = $getParams[$actualField]; // 실제 값

            // 조건 타입에 따라 조건 추가
            if ($conditionType == 'over') {
                $conditions[] = "$fieldName > :condition_$paramName"; // '>' 조건 추가
                $params['condition_' . $paramName] = $actualValue; // 바인딩할 파라미터 추가
            } elseif ($conditionType == 'under') {
                $conditions[] = "$fieldName < :condition_$paramName"; // '<' 조건 추가
                $params['condition_' . $paramName] = $actualValue; // 바인딩할 파라미터 추가
            }
        }
    }

    // 바인딩할 파라미터 수 계산
    $bindingCount = count($params);

    // 쿼리 구성
    $query = "SELECT DISTINCT * FROM search";
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions); // 조건이 존재하면 WHERE 절 추가
    }
    $query .= " ORDER BY DATE DESC LIMIT :offset, :perPage"; // ORDER BY 및 LIMIT 추가

    // 쿼리 준비
    $stmt = $pdo->prepare($query);

    // 페이지네이션 파라미터만 바인딩
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindParam(':perPage', $perPage, PDO::PARAM_INT);

    // 조건 파라미터 바인딩
    foreach ($params as $key => $val) {
        $paramName = ":" . str_replace('-', '_', $key); // 파라미터 이름 수정
        $stmt->bindValue($paramName, $val, is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR); // 파라미터 바인딩
    }

    // 실행할 쿼리 및 바인딩된 파라미터 로그 기록
    error_log("실행할 쿼리:" . $query, 3, $logFile);
    error_log("바인딩된 파라미터 수: $bindingCount", 3, $logFile);
    
    // 바인딩된 파라미터 목록 로깅
    $boundParamsLog = "바인딩된 파라미터 목록: \n";
    foreach($params as $key => $val){
        $boundParamsLog .= $key . " - " . $val . "\n";
    }
    // 페이지네이션 파라미터 추가
    $boundParamsLog .= "offset - " . $offset . "\n";
    $boundParamsLog .= "perPage - " . $perPage . "\n";

    error_log($boundParamsLog, 3, $logFile);

    // 쿼리 실행
    $stmt->execute();

    // 결과가 있을 경우에만 반환
    if ($stmt->rowCount() > 0) {
        // 결과를 연관 배열로 모두 가져옴
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // 결과를 JSON 형식으로 출력
        echo json_encode(['data' => $results, 'totalRows' => $totalRows]);
    } else {
        // 결과가 없을 때 처리
        echo json_encode(['data' => [], 'totalRows' => 0]);
    }
} catch (PDOException $e) {
    // 데이터베이스 오류 처리
    error_log("데이터베이스 오류: " . $e->getMessage(), 3, $logFile);
    echo json_encode(["error" => "데이터베이스 오류가 발생했습니다."]);
}

?>
