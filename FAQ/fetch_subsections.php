<?php
// fetch_subsections.php
require_once "faq_db.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (isset($_POST['section_id'])) {
  $section_id = $_POST['section_id'];
  
  // 준비된 문장을 사용하여 SQL 쿼리 실행
  $stmt = $dbconnect->prepare("SELECT SUB_SEC_ID, SUB_SEC_NAME FROM SUBSECTIONS WHERE SEC_ID = ?");
  $stmt->bind_param("i", $section_id); 
  $stmt->execute();
  $result = $stmt->get_result();

  $options = "<option value=''>서브섹션 선택...</option>";
  while ($row = $result->fetch_assoc()) {
    $options .= "<option value='{$row['SUB_SEC_ID']}'>{$row['SUB_SEC_NAME']}</option>";
  }
  // fetch_subsections.php의 마지막 부분 수정
  $options .= "<option value='new-subsection' class='new-option'>새로운 서브섹션 입력</option>";
  echo $options;
}
?>