<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once "sales_db.php"; // 데이터베이스 연결 설정 파일

mysqli_set_charset($dbconnect, "utf8");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  var_dump($_POST["SN"]);
  $SN = trim($_POST["SN"]); // 사용자 입력에서 공백 제거
  $SN = "%" . $SN . "%"; // 와일드카드 추가

  $query = "SELECT * FROM DEVICE WHERE SN LIKE ?";
  $stmt = mysqli_prepare($dbconnect, $query);
  if (!$stmt) {
      // 쿼리 준비에 실패했을 때의 에러 메시지 출력
      die("mysqli_prepare failed: " . mysqli_error($dbconnect));
  }
  
  mysqli_stmt_bind_param($stmt, "s", $SN);
  
  if (!mysqli_stmt_execute($stmt)) {
      // 쿼리 실행에 실패했을 때의 에러 메시지 출력
      die("mysqli_stmt_execute failed: " . mysqli_stmt_error($stmt));
  }

  $result = mysqli_stmt_get_result($stmt);
  if (!$result) {
      // 결과 가져오기에 실패했을 때의 에러 메시지 출력
      die("mysqli_stmt_get_result failed: " . mysqli_error($dbconnect));
  }

  if ($row = mysqli_fetch_assoc($result)) {
      // 결과 출력 (이 부분을 원하는 대로 수정)
      echo "Found device with SN: " . $row["SN"];
  } else {
      echo "해당 시리얼번호에 대한 장비를 찾을 수 없습니다.";
  }
}

?>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>장비 검색</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <link rel="stylesheet" href="salesMain.css">
    <script src="https://unpkg.com/htmx.org@1.9.4"></script>
  </head>
  <body>
  <?php include 'navbar.php'; ?>
      <div class="main">
        <div class="header-container">
          <header>장비 검색</header>
        </div>
        <div class="content">
          <div class="inputBox mx-auto shadow p-5 mt-4">
              <div class="btn-cancel position-relative top-0">
                <button type="button" class="btn-close" aria-label="Close" onclick="goToDeviceMain(event)"></button>
              </div>
              <form id="deviceSearchForm" method="get" action="deviceMain.php">
                  <table class="inputTbl">
                  <tr> 
                      <td><label for="SN">시리얼번호</label></td>
                      <td>
                        <input type="text"  class="input" name="SN" id="SN">
                        <span class="error-message">&nbsp;</span>
                        <input type="hidden" name="search" value="1"> <!-- hidden input 추가 -->
                    </td>
                  </tr>
                  </table>
                  <div class="btn-class">
                      <button type="submit" class="btn btn-primary search wide-btn">검색</button>
                  </div>
              </form>         
          </div>
      </div>  
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
    <script src="salesMain.js"></script>
    <script src="/.__/auto_complete.js"></script>
    <script>
    function goToDeviceMain(event){
        event.preventDefault();
        window.location.href = "deviceMain.php";
    }
</script>
</body>
</html>