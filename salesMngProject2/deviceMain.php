<?php
// deviceMain.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once "sales_db.php";
require 'deviceLFSF.php';
mysqli_set_charset($dbconnect, "utf8");

$message = "전체 : ";

// 총 건수 구하기
$totalLicenseQuery = "SELECT COUNT(*) as total FROM DEVICE";
$totalDeviceResult = mysqli_query($dbconnect, $totalLicenseQuery);  

if ($totalDeviceResult && $totalDeviceResult->num_rows > 0) {
    $totalDeviceRow = $totalDeviceResult->fetch_assoc();
} else {
    echo "0 results";
}

// URL 매개변수로부터 SN 값을 가져오기
$SN = isset($_GET["SN"]) ? $_GET["SN"] : "";
$saleId = isset($_GET["SALE_ID"]) ? $_GET["SALE_ID"] : "";

/* 
에러 : 젤 윗줄에 빈 데이터가 있고 라이센스 정보에 데이터들이 들어있다. 처음 조회할때 페이지에서는 라이센스 정보 내용은 뜨지 않아야하는데.
$SN 변수는 URL 매개변수로부터 가져오고 $SN이 비어있지 않은 경우에만 특정 SN 값을 가진 DEVICE 테이블의 레코드를 검색한다. 
만약 $SN이 비어 있다면 DEVICE 테이블의 모든 레코드를 검색한다.
라이센스 정보를 표시하는 부분에서는 LICENSE 테이블에서 특정 SN 값을 가진 레코드를 검색하는데, 이 SN 값이 URL 매개변수에서 가져온 값이기 때문에, 
처음 페이지가 로드될 때는 $SN이 설정되지 않았을 것이고 따라서 빈 문자열로 처리되는 것이다.
이 문제를 해결하기 위해서는 라이센스 정보 섹션에서 SN 값이 비어있는 경우 해당 쿼리를 실행하지 않도록 해야한다.
*/

// SN 값에 따라 SQL 쿼리 작성(쿼리 맞는거 확인함)
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 1. 사용자가 웹 폼을 통해 시리얼번호를 입력하고 검색 버튼을 클릭하여 들어올 때
    $SN = trim($_POST["SN"]); // 사용자 입력에서 공백 제거
    $SN = "%" . $SN . "%"; // 와일드카드 추가

    $query = "SELECT * FROM DEVICE WHERE SN LIKE ?";
    $stmt = mysqli_prepare($dbconnect, $query);
    if (!$stmt) {
        die("mysqli_prepare failed: " . mysqli_error($dbconnect));
    }

    mysqli_stmt_bind_param($stmt, "s", $SN);

    if (!mysqli_stmt_execute($stmt)) {
        die("mysqli_stmt_execute failed: " . mysqli_stmt_error($stmt));
    }

    $result = mysqli_stmt_get_result($stmt);
    if (!$result) {
        die("mysqli_stmt_get_result failed: " . mysqli_error($dbconnect));
    }

    if ($row = mysqli_fetch_assoc($result)) {
        echo "Found device with SN: " . $row["SN"];
    } else {
        echo "해당 시리얼번호에 대한 장비를 찾을 수 없습니다.";
    }
     // 결과의 총 건수 업데이트
     $totalCount = mysqli_num_rows($result);

} elseif (isset($_GET["SN"]) && !empty(trim($_GET["SN"]))) {
    // 2. 사용자가 시리얼번호를 특정해서 직접 검색할 경우
    $SN = trim($_GET["SN"]);
    
    $query = "SELECT D.*, S.SALE_ID FROM DEVICE D
              LEFT JOIN SALES S ON D.ORDER_NO = S.ORDER_NO
              WHERE D.SN = ?";
    $stmt = mysqli_prepare($dbconnect, $query);
    if (!$stmt) {
        die("mysqli_prepare failed: " . mysqli_error($dbconnect));
    }

    mysqli_stmt_bind_param($stmt, "s", $SN);

    if (!mysqli_stmt_execute($stmt)) {
        die("mysqli_stmt_execute failed: " . mysqli_stmt_error($stmt));
    }

    $result = mysqli_stmt_get_result($stmt);
    if (!$result) {
        die("mysqli_stmt_get_result failed: " . mysqli_error($dbconnect));
    }

     // 결과의 총 건수 업데이트
     $totalCount = mysqli_num_rows($result);
    
} else {
    // 3. 사용자가 특정 조건 없이 전체 장비를 보고자 할 경우 (페이지 로딩 시나 특정 조건 없이 접근할 때)
    $query = "SELECT D.*, S.SALE_ID FROM DEVICE D
              LEFT JOIN SALES S ON D.ORDER_NO = S.ORDER_NO
              ORDER BY D.WDATE DESC"; 
    $result = mysqli_query($dbconnect, $query);
    if (!$result) {
        die("Query Failed: " . mysqli_error($dbconnect));
    }
     // 결과의 총 건수 업데이트
     $totalCount = mysqli_num_rows($result);
}

?>


<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>장비 메인</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <link rel="stylesheet" href="salesMain.css">
    <script src="https://unpkg.com/htmx.org@1.9.4"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossorigin="anonymous"></script>
  </head>
  <body>
    <?php 
      include 'navbar.php'; 
    ?>
       <div class="container-fluid mt-5 main-screen">
        <div class="row">
            <div class="col-12 text-center">
                <header>장비</header>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-12 d-flex justify-content-start main-top-btn">
                <button type="button" class="btn btn-primary insert mr-2" onclick="goToDeviceInsert()">신규</button>
                <button type="button" class="btn btn-primary search">검색</button>
            </div>
            <div class="total-number" style="text-align:left; margin-left:2%; font-size: 1.2em; font-weight:bold;">
                <?= $message ?><span> </span><?= $totalCount ?> 건
            </div>
        </div>
        <div class="row">  
            <div class="col-12">
              <div class="table-wrapper table-responsive">
                <table class="table main-tbl">
                    <thead>
                        <tr>
                          <th scope="col" class="col-1">SN</th>
                          <th scope="col" class="col-1">모델명</th>
                          <th scope="col" class="col-1">장비유형</th>
                          <th scope="col" class="col-1">I/F&유형</th>
                          <th scope="col" class="col-1">포트수</th>
                          <th scope="col" class="col-1">제조일</th>
                          <th scope="col" class="col-1">용량</th>
                          <th scope="col" class="col-1">디스크</th>
                          <th scope="col" class="col-1">메모리</th>
                          <th scope="col" class="col-1">주문번호</th>
                          <th scope="col" class="col-1">명세서번호</th>
                          <th scope="col" class="col-1">LF:SF</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        while($row = mysqli_fetch_assoc($result)) { ?>
                            <tr data-sn="<?php echo $row['SN']; ?>">
                                <td class="col-1">
                                    <a class="custom-link" href="salesMain.php?SN=<?php echo $row['SN']; ?>">
                                        <?php echo $row['SN']; ?>
                                    </a>
                                </td>
                                <td class="col-1"><?php echo $row['MODEL']; ?></td>
                                <td class="col-1"><?php echo $row['DEV_TYPE']; ?></td>
                                <td class="col-1"><?php echo $row['INTERFACE']; ?></td>
                                <td class="col-1"><?php echo $row['IKIND']; ?><?php echo $row['INTNUM']; ?></td>
                                <td class="col-1"><?php echo $row['WDATE']; ?></td>
                                <td class="col-1"><?php echo $row['CAPACITY']; ?></td>
                                <td class="col-1"><?php echo $row['HDD']; ?></td>
                                <td class="col-1"><?php echo $row['MEMORY']; ?></td>
                                <td class="col-1">
                                    <a class="custom-link" href="salesMain.php?ORDER_NO=<?php echo $row['ORDER_NO']; ?>">
                                        <?php echo $row['ORDER_NO']; ?>
                                    </a>
                                </td>
                                <td class="col-1">
                                    <a class="custom-link" href="licenseMain.php?SALE_ID=<?php echo $row['SALE_ID']; ?>">
                                        <?php echo $row['SALE_ID']; ?>
                                    </a>
                                </td>
                                <td class="col-1">
                                    <?php
                                        $lf = $row['LF'];
                                        $sf = $row['SF'];
                                        if ($lf == 0 && $sf == 1) {
                                            // 경로1: LF:SF 장비메인으로 들어갈때 ; POST로 데이터 보냄 
                                            echo "<form action='licenseInsertViaDevice.php' method='post'>";
                                            echo "<input type='hidden' name='saleId' value='{$row['SALE_ID']}'>";
                                            echo "<input type='hidden' name='SN' value='{$row['SN']}'>";
                                            echo "<button type='submit' class='btn btn-primary' style='font-size:11px;'>라이센스 생성</button>";
                                            echo "</form>";
                                        }else if($lf ==1 && $sf ==1){
                                            echo "<button type='submit' class='btn btn-primary' style='font-size:11px; background-color: lightgray; color:black;' disabled>라이센스 등록완료</button>";
                                        }
                                    ?>
                                </td>
                            </tr>
                        <?php } ?>
                    </tbody>
                </table>
                <?php
                    if (!empty($SN)) { // SN 값이 비어있지 않은 경우에만 전체 블럭을 출력
                    ?>
                    <div class="licenseInfoBox" style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">
                        <h3>라이센스 정보</h3>
                        <!-- 라이센스 정보 내용 -->
                        <div class="licenseContent">
                        <?php
                            if (!empty($SN)) { // SN 값이 비어있지 않은 경우에만 쿼리 실행
                                $licenseQuery = "SELECT * FROM LICENSE WHERE SN = '$SN'";
                                $licenseResult = mysqli_query($dbconnect, $licenseQuery);

                                if ($licenseResult && mysqli_num_rows($licenseResult) > 0) {
                                    while ($licenseRow = mysqli_fetch_assoc($licenseResult)) {
                                        echo "<div>";
                                        echo ": 명세서 번호 " . $licenseRow['SALE_ID'];
                                        echo " | SN: " . $licenseRow['SN'];
                                        echo " | 유형: " . $licenseRow['TYPE'];
                                        echo " | 가격: " . $licenseRow['PRICE'];
                                        echo " | 보증기간: " . $licenseRow['WARRANTY']. "개월";
                                        echo " | 시작일: " . $licenseRow['S_DATE'];
                                        echo " | 종료일: " . $licenseRow['D_DATE'];
                                        echo " | 파트너지원: " . $licenseRow['INSPECTION'];
                                        echo " | 점검: " . $licenseRow['SUPPORT'];
                                        echo " | 비고: " . $licenseRow['REF'];
                                        echo "</div>";
                                    }
                                } else {
                                    if (!empty($saleId)) {
                                        // 경로1: 거래명세서에서 SN 클릭해서 들어갈 때 ;GET 으로 데이터 전송
                                        echo "해당 장비에 대한 라이센스 정보가 없습니다.";
                                        echo "<a href='licenseInsertViaDevice.php?SN=$SN&saleId=$saleId' class='btn btn-primary' 
                                        style='width: 120px; font-size: 0.8em; line-height: 40px; margin-left: 10px; align-items: center; 
                                        justify-content: center;'>라이센스 생성</a>";
                                    } else {
                                        echo "해당 장비에 대한 라이센스 정보가 없습니다.";
                                    }
                                }
                            } else {
                                if (!empty($saleId)) {
                                    // 경로2: 거래명세서 SN 클릭해서 들어갈 때
                                    // JOIN 문으로 가져온 SALE_ID 값을 활용
                                    echo "<form action='licenseInsertViaDevice.php' method='post'>";
                                    echo "<input type='hidden' name='saleId' value='$saleId'>";
                                    echo "<input type='hidden' name='SN' value='{$row['SN']}'>";
                                    echo "<button type='submit' class='btn btn-primary' style='font-size:11px;'>라이센스 생성</button>";
                                    echo "</form>";
                                } else {
                                    // 어떤 처리도 하지 않음
                                }
                            }
                            ?>
                        </div>
                    </div>
                <?php
                } // if (!empty($SN)) 종료
                ?>
            </div>
          </div>  
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
    <script src="jquery-3.6.4.min.js"></script>
    <script src="salesMain.js"></script>
    <script>
    document.addEventListener("DOMContentLoaded", function() {
        var searchButton = document.querySelector('.btn.btn-primary.search');
        if (searchButton) {
            searchButton.addEventListener('click', goToDeviceSearch);
        }
    });

    function goToDeviceSearch(event){
        event.preventDefault();
        window.location.href = "deviceSearch.php";
    }


   
</script>
    
</body>
</html>