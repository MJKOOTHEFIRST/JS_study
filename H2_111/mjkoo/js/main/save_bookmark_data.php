<?php
// save_bookmark_data.php

require 'db_config.php';

// MySQL 연결
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    header('Content-Type: application/json');
    echo json_encode(['error' => "Connection failed: " . $conn->connect_error]);
    exit;
}

// JSON 입력 데이터 받기
$input = json_decode(file_get_contents('php://input'), true);

// 입력 데이터 검증
$no = isset($input['no']) ? intval($input['no']) : null;
$bookmarkId = isset($input['bookmarkId']) ? intval($input['bookmarkId']) : null;

if (is_null($no) || is_null($bookmarkId)) {
    error_log("필수 데이터가 누락되었습니다.");
    header('Content-Type: application/json');
    echo json_encode(['error' => '필수 데이터가 누락되었습니다.']);
    exit;
}

try {
    // 중복 확인 쿼리
    $checkSql = "SELECT * FROM bmk_sch WHERE bmk_id =? AND sch_id =?";
    $checkStmt = $conn ->prepare($checkSql);
    if(!$checkStmt){
        throw new Exception('SQL문을 준비하는데 실패' . $conn->error);
    }

    $checkStmt->bind_param('ii', $bookmarkId, $no);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if($checkResult->num_rows>0){
        // 중복된 데이터가 이미 존재함
        echo json_encode(['error' => '이미 등록된 데이터입니다.'] );
        $checkStmt->close();
        exit;
    }
    $checkStmt->close();

    // 데이터 삽입 쿼리 실행
    $sql = "INSERT IGNORE INTO bmk_sch (bmk_id, sch_id) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('SQL 문을 준비하는 데 실패했습니다: ' . $conn->error);
    }

    $stmt->bind_param('ii', $bookmarkId, $no);

    if ($stmt->execute()) {
        // 삽입 후 방금 삽입한 데이터를 가져오는 쿼리
        $fetchSql = "SELECT * FROM bmk_sch WHERE bmk_id = ? AND sch_id = ?";
        $fetchStmt = $conn->prepare($fetchSql);
        $fetchStmt->bind_param('ii', $bookmarkId, $no);
        $fetchStmt->execute();
        $result = $fetchStmt->get_result();

        if ($result->num_rows > 0) {
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'total' => $result->num_rows,
                'data' => $data
            ]);
        } else {
            throw new Exception('등록된 데이터를 찾을 수 없습니다.');
        }

        $fetchStmt->close();
    } else {
        throw new Exception('데이터 등록에 실패했습니다: ' . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    error_log($e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    // MySQL 연결 종료
    $conn->close();
}
?>
