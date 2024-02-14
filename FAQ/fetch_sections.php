<?php
require_once "faq_db.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (isset($_POST['sub_chap_id'])) {
  $sub_chap_id = $_POST['sub_chap_id']; // 이 부분이 누락되었습니다.
  $stmt = $dbconnect->prepare("SELECT SEC_ID, SEC_NAME FROM SECTIONS WHERE SUB_CHAP_ID = ?");
  $stmt->bind_param("i", $sub_chap_id); 
  $stmt->execute();
  $result = $stmt->get_result();
  
  $options = "<option value=''>섹션 선택...</option>";
  while ($row = $result->fetch_assoc()) {
      $options .= "<option value='{$row['SEC_ID']}'>{$row['SEC_NAME']}</option>";
  }
  $options .= "<option value='new-section' class='new-option'>새로운 섹션 입력</option>";
  echo $options;
}
?>