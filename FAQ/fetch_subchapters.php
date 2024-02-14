<?php
// fetch_subchapters.php
require_once "faq_db.php"; // 데이터베이스 연결 설정 불러오기

if (isset($_POST['chap_id'])) {
    $chap_id = $_POST['chap_id'];
    // 준비된 문장을 사용하여 SQL 쿼리 실행
    $stmt = $dbconnect->prepare("SELECT SUB_CHAP_ID, SUB_CHAP_NAME FROM SUBCHAPTERS WHERE CHAP_ID = ?");
    $stmt->bind_param("i", $chap_id); 
    $stmt->execute();
    $result = $stmt->get_result();

    $options = "<option value=''>서브 챕터 선택...</option>";
    while ($row = $result->fetch_assoc()) {
        $options .= "<option value='{$row['SUB_CHAP_ID']}'>{$row['SUB_CHAP_NAME']}</option>";
    }
    // 반복문 완료 후 "새로운 서브챕터 입력" 옵션 추가
    $options .= "<option value='new-subChapter' class='new-option'>새로운 서브챕터 입력</option>";
    echo $options;
}
?>