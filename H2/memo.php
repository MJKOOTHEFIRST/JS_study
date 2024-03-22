mysql> desc search;
+-------+---------------+------+-----+---------+-------+
| Field | Type          | Null | Key | Default | Extra |
+-------+---------------+------+-----+---------+-------+
| DATE  | datetime      | NO   |     | NULL    |       |
| H-M   | decimal(10,2) | NO   |     | NULL    |       |
| M-L   | decimal(10,2) | NO   |     | NULL    |       |
| X1    | decimal(10,2) | NO   |     | NULL    |       |
| X2    | decimal(10,2) | NO   |     | NULL    |       |
| Y1    | decimal(10,2) | NO   |     | NULL    |       |
| Y2    | decimal(10,2) | NO   |     | NULL    |       |
| M     | decimal(10,2) | NO   |     | NULL    |       |
| L     | decimal(10,2) | NO   |     | NULL    |       |
| SQ    | int           | NO   |     | NULL    |       |
| BQ    | int           | NO   |     | NULL    |       |
| LABEL | varchar(1000) | YES  |     | NULL    |       |
+-------+---------------+------+-----+---------+-------+

<?php

// 코드의 시작 부분에는 필요한 설정과 변수 정의 등을 포함합니다.

// 사용자 입력 예시: #정상#수소
$userInput = isset($_GET['label']) ? $_GET['label'] : '';

// 1단계: 사용자 입력에서 키워드 분리
$keywords = explode('#', $userInput);
$keywords = array_filter($keywords); // 빈 값 제거

// 2단계: 동적으로 LIKE 조건 생성
$likeConditions = [];
$params = [];
foreach ($keywords as $index => $keyword) {
    $paramName = ":label{$index}";
    $likeConditions[] = "`LABEL` LIKE {$paramName}";
    $params[$paramName] = "%{$keyword}%";
}

// 3단계: 쿼리에 조건 추가 및 파라미터 바인딩
$query = "SELECT DISTINCT * FROM search WHERE " . implode(' AND ', $likeConditions) . " ORDER BY DATE DESC LIMIT :offset, :perPage";

// 여기서는 PDO를 사용하여 쿼리를 준비하고 파라미터를 바인딩하는 예시를 보여줍니다.
$stmt = $pdo->prepare($query);

// 각 LIKE 조건에 대한 파라미터 바인딩
foreach ($params as $paramName => $value) {
    $stmt->bindValue($paramName, $value);
}

// 페이지네이션을 위한 offset, perPage 파라미터 바인딩
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);

// 쿼리 실행
$stmt->execute();

// 결과 가져오기
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 결과 출력
echo json_encode($results);
?>
