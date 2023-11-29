<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the database connection file
require_once "sales_db.php";

// UTF-8 인코딩 설정
mysqli_set_charset($dbconnect, "utf8");

$today = date("Y-m-d");
$message = "전체 : ";


// 총 건수 구하기
$totalSalesQuery = "SELECT COUNT(*) as total FROM SALES";
$totalSalesResult = mysqli_query($dbconnect, $totalSalesQuery);  // $conn을 $dbconnect로 수정

if ($totalSalesResult && $totalSalesResult->num_rows > 0) {
    $totalSalesRow = $totalSalesResult->fetch_assoc();
} else {
    echo "0 results";
}

$action = $_GET['action'] ?? "";  // PHP 7 이후의 null coalescing operator를 사용

function selectSales() {
    $sql =  "SELECT DISTINCT s.SALE_ID as SALE_ID, ";
    $sql .= "v.NAME as V_ID, ";
    $sql .= "c.NAME as C_ID, ";
    $sql .= "b1.NAME as CBIZ_ID, ";
    $sql .= "b2.NAME as BIZ_ID, ";
    $sql .= "s.TOT_PRICE as TOT_PRICE, ";
    $sql .= "s.D_DATE as D_DATE, ";
    $sql .= "s.S_DATE as S_DATE, ";
    $sql .= "s.WARRANTY as WARRANTY, ";
    $sql .= "s.ORDER_NO as ORDER_NO, ";
    $sql .= "s.REF as REF ";
    $sql .= "FROM SALES as s ";
  
    $sql .= "LEFT JOIN VENDOR AS v ON s.V_ID = v.V_ID ";
    $sql .= "LEFT JOIN CUSTOMER AS c ON s.C_ID = c.C_ID ";
    $sql .= "LEFT JOIN BUSINESS AS b1 ON s.CBIZ_ID = b1.BIZ_ID ";      // CBIZ_ID와 BUSINESS 테이블을 연결
    $sql .= "LEFT JOIN BUSINESS AS b2 ON s.BIZ_ID = b2.BIZ_ID ";      // BIZ_ID와  BUSINESS 테이블을 연결
  
    $sql .= "ORDER BY s.SALE_ID DESC";
    return $sql;
}

function searchFunction($saleId, $vId = "", $cId = "", $cbizId = "", $bizId = "", $dDateFrom = "", $dDateTo = "", $sDateFrom = "",
                        $sDateTo = "", $warranty = "", $orderNo ="", $ref=""){
    $sql =  "SELECT DISTINCT s.SALE_ID as SALE_ID, ";
    $sql .= "v.NAME  as V_ID, ";
    $sql .= "c.NAME  as C_ID, ";
    $sql .= "b1.NAME as CBIZ_ID, ";
    $sql .= "b2.NAME as BIZ_ID, ";
    $sql .= "s.TOT_PRICE as TOT_PRICE, ";
    $sql .= "s.D_DATE as D_DATE, ";
    $sql .= "s.S_DATE as S_DATE, ";
    $sql .= "s.WARRANTY as WARRANTY, ";
    $sql .= "s.ORDER_NO as ORDER_NO, ";
    $sql .= "s.REF as REF ";
    $sql .= "FROM SALES as s ";
  
    $sql .= "LEFT JOIN VENDOR AS v ON s.V_ID = v.V_ID ";
    $sql .= "LEFT JOIN CUSTOMER AS c ON s.C_ID = c.C_ID ";
    $sql .= "LEFT JOIN BUSINESS AS b1 ON s.CBIZ_ID = b1.BIZ_ID ";      // CBIZ_ID와 BUSINESS 테이블을 연결
    $sql .= "LEFT JOIN BUSINESS AS b2 ON s.BIZ_ID = b2.BIZ_ID ";      // BIZ_ID와  BUSINESS 테이블을 연결
  
    $conditions = []; // 초기화하여 다시 사용
    
    if (!empty($saleId))    { $conditions[] = "s.SALE_ID  LIKE '%".$saleId."%'"; }
    if (!empty($vId))       { $conditions[] = "v.NAME     LIKE '%".$vId."%'";    }
    if (!empty($cId))       { $conditions[] = "c.NAME     LIKE '%".$cId."%'";    }
    if (!empty($cbizId))    { $conditions[] = "b1.NAME    LIKE '%".$cbizId."%'"; }
    if (!empty($bizId))     { $conditions[] = "b2.NAME    LIKE '%".$bizId."%'";  }
    if (!empty($dDateFrom)) { $conditions[] = "s.D_DATE >= '".$dDateFrom."'";    }
    if (!empty($dDateTo))   { $conditions[] = "s.D_DATE <= '".$dDateTo."'";      }
    if (!empty($sDateFrom)) { $conditions[] = "s.D_DATE >= '".$dDateFrom."'";    }
    if (!empty($sDateTo))   { $conditions[] = "s.D_DATE <= '".$dDateTo."'";      }
    if (!empty($warranty))  { $conditions[] = "s.WARRANTY       LIKE '%".$warranty."%'"; }
    if (!empty($orderNo))        { $conditions[] = "s.ORDER_NO       LIKE '%".$orderNo."%'";     }
    if (!empty($ref))        { $conditions[] = "s.REF       LIKE '%".$ref."%'";     }
    // $sql .= implode(" AND ", $conditions);

    if (!empty($conditions)) {
        $sql .= "WHERE " . implode(" AND ", $conditions);
    }
    $sql .= " ORDER BY s.SALE_ID DESC";
    return $sql;
}
$dDateOfEos = isset($_GET['dDateOfEos']) ? $dbconnect->real_escape_string($_GET['dDateOfEos']) : '';
if (isset($_GET['condition']) && $_GET['condition'] == 'eos') {
    $message = "EOS : "; // Step 2: EOS 유입경로에 따른 메시지 설정
    $sql = "SELECT * FROM SALES 
            WHERE '$today' <=D_DATE AND D_DATE <= '$dDateOfEos'
            ORDER BY SALE_ID DESC"; 
    $result = mysqli_query($dbconnect, $sql);
    $totalCount = mysqli_num_rows($result); // 결과의 총 건수 업데이트
    if (!$result) {
        die('Query Error: ' . mysqli_error($dbconnect));
    }
} else {
    if ($action == "search") {
        $message = "조건 검색: ";
        $saleId     = $_POST["saleId"] ?? "";
        $vId        = $_POST["vId"] ?? "";
        $cId        = $_POST["cId"] ?? "";
        $cbizId     = $_POST["cbizId"] ?? "";
        $bizId      = $_POST["bizId"] ?? "";
        $dDateFrom  = $_POST["dDateFrom"] ?? "";
        $dDateTo    = $_POST["dDateTo"] ?? "";
        $sDateFrom  = $_POST["sDateFrom"] ?? "";
        $sDateTo  = $_POST["sDateTo"] ?? "";
        $warranty   = $_POST["WARRANTY"] ?? "";
        $orderNo   = $_POST["ORDER_NO"] ?? "";
        $ref   = $_POST["REF"] ?? "";

        $sql = searchFunction($saleId, $vId, $cId, $cbizId, $bizId, $dDateFrom, $dDateTo, $sDateFrom, $sDateTo, $warranty, $orderNo, $ref);
        $result = mysqli_query($dbconnect, $sql);
        $totalCount = mysqli_num_rows($result); // 결과의 총 건수 업데이트
        if (!$result) {
            die('Query Error: ' . mysqli_error($dbconnect));
        }
    } else {
        $sql = selectSales();
        $result = mysqli_query($dbconnect, $sql);
        $totalCount = mysqli_num_rows($result); // 결과의 총 건수 업데이트
    }
}

//결과값 몇갠지 확인 디버깅 : ok
//$num_rows = mysqli_num_rows($result);
//echo "Number of rows: " . $num_rows;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>거래명세서 메인</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <link rel="stylesheet" href="salesMain.css">
    <script src="https://unpkg.com/htmx.org@1.9.4"></script>
   
    <script>
        function openDeviceMain(DEVICE_SN, SALE_ID) {
            console.log('openDeviceMain called with SN:', DEVICE_SN, ', SALE_ID:', SALE_ID);
            // DEVICE_SN과 SALE_ID 값을 사용하여 관련 페이지로 이동하거나 필요한 작업 수행
            var url = 'deviceMain.php?SN=' + encodeURIComponent(DEVICE_SN) + '&SALE_ID=' + encodeURIComponent(SALE_ID);
            window.location.href = url;
        }

    </script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" crossorigin="anonymous"></script>
  </head>
  <body>
    <?php if($action != "search") { 
      include 'navbar.php'; 
    } ?>
       <div class="container-fluid mt-5 main-screen">
        <div class="row">
            <div class="col-12 text-center">
                <header>거래명세서</header>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-12 d-flex justify-content-start main-top-btn">
                <button type="button" class="btn btn-primary insert mr-2" onclick="goToSalesInsert()">신규</button>
                <button type="button" class="btn btn-primary search" onclick="goToSalesSearch()">검색</button>
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
                            <!-- tablesorter 쓰면 안되고, 나중에 pagination이랑 함께 해야하기 때문에 각 th를 클릭했을 때, 각각 select 해서 정렬하도록 한다. -->
                          <th scope="col" class="col-1">판매번호<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-1">납품처<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-1">거래처<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-1">거래처담당자<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-1">담당자명<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-2">공급가액합계<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-1">납품일<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-1">유지보수시작일<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-1">주문번호<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>
                          <th scope="col" class="col-1">보증기간<img src="/img/up-down-arrow.png" alt="sort" class="arrow-icon"></th>

                        </tr>
                    </thead>
                    <tbody style="width:50%;">
                      <?php 
                        $counter = 1;  // 카운터를 사용하여 각 아코디언 항목의 ID를 생성.
                        while ($row = mysqli_fetch_assoc($result)): 
                      ?>
                        <tr data-bs-toggle="collapse" data-bs-target="#flush-collapse<?php echo $counter; ?>" aria-expanded="false" aria-controls="flush-collapse<?php echo $counter; ?>">
                            <td class="col-1"><?php echo $row['SALE_ID']; ?></td>
                            <td class="col-1"><?php echo $row['V_ID']; ?></td>
                            <td class="col-1"><?php echo $row['C_ID']; ?></td>
                            <td class="col-1"><?php echo $row['CBIZ_ID']; ?></td>
                            <td class="col-1"><?php echo $row['BIZ_ID']; ?></td>
                            <td class="col-2" style="text-align: right; padding-right: 5%;">
                                <?php 
                                $price = isset($row['TOT_PRICE']) ? $row['TOT_PRICE'] : 0;
                                echo number_format($price); 
                                ?><span>원</span>
                            </td>
                            <td class="col-1"><?php echo $row['D_DATE']; ?></td>
                            <td class="col-1"><?php echo $row['S_DATE']; ?></td>
                            <td class="col-1"><?php echo $row['ORDER_NO']; ?></td>
                            <td class="col-1"><?php echo $row['WARRANTY']; ?><span>개월</span></td>
                        </tr>
                        <tr>
                            <td colspan="10">
                                <div id="flush-collapse<?php echo $counter; ?>" class="collapse accor-style">
                                  <table class="detail-table">
                                      <?php 
                                        $stmt = $dbconnect->prepare("SELECT 
                                                D.SN as DEVICE_SN,
                                                V.CONTACT as VENDOR_CONTACT, 
                                                V.EMAIL as VENDOR_EMAIL,
                                                S.REF AS SALES_REF,
                                                B.CONTACT as BUSINESS_CONTACT,
                                                B.EMAIL as BUSINESS_EMAIL
                                            FROM 
                                                SALES S
                                            LEFT JOIN 
                                                VENDOR V ON S.V_ID = V.V_ID
                                            LEFT JOIN 
                                                BUSINESS B ON S.BIZ_ID = B.BIZ_ID
                                            LEFT JOIN
                                                DEVICE D ON S.ORDER_NO = D.ORDER_NO
                                            WHERE 
                                                S.SALE_ID = ?;
                                            ");
                                      $stmt->bind_param("s", $row['SALE_ID']);
                                      $stmt->execute();
                                      $details = $stmt->get_result()->fetch_assoc();
                                      ?>
                                      <tr>
                                          <th style="font-weight: bold; ">장비 SN :</th>
                                          <td>
                                          <?php 
                                            if (!empty($details['DEVICE_SN'])) {
                                                $deviceSNs = explode(",", $details['DEVICE_SN']);

                                                $links = []; // 각 DEVICE_SN에 대한 링크를 저장할 배열

                                                foreach ($deviceSNs as $deviceSN) {
                                                    $deviceSN = trim($deviceSN); // 공백 제거
                                                    $deviceSNSaleIdLink = 'deviceMain.php?SN=' . urlencode($deviceSN) . '&SALE_ID=' . urlencode($row['SALE_ID']);
                                                    $links[] = '<a href="' . $deviceSNSaleIdLink . '">' . $deviceSN . '</a>';
                                                }

                                                // 모든 링크를 쉼표로 연결하여 출력
                                                echo implode(", ", $links);
                                            } else {
                                                echo "-";
                                            }
                                        ?>
                                        </td>
                                      </tr>
                                      <tr>
                                          <th style="margin-left:10px; font-weight: bold;">납품처 전화 :</th>
                                          <td><?php echo !empty($details['VENDOR_CONTACT']) ? $details['VENDOR_CONTACT'] : '-'; ?></td>
                                      </tr>
                                      <tr>
                                          <th style="margin-left:10px; font-weight: bold;">납품처 메일 :</th>
                                          <td><?php echo !empty($details['VENDOR_EMAIL']) ? $details['VENDOR_EMAIL'] : '-'; ?></td>
                                      </tr>
                                      <tr>
                                          <th style="margin-left:10px; font-weight: bold;">비고 :</th>
                                          <td><?php echo !empty($details['SALES_REF']) ? $details['SALES_REF'] : '-'; ?></td>
                                      </tr>
                                      <!-- <tr>
                                          <th style="padding-left: 5px; font-weight: bold;">영업 전화 :</th>
                                          <td><?php echo !empty($details['BUSINESS_CONTACT']) ? $details['BUSINESS_CONTACT'] : 'N/A'; ?></td>
                                      </tr>
                                      <tr>
                                          <th style="padding-left: 5px; font-weight: bold;">영업 메일 :</th>
                                          <td><?php echo !empty($details['BUSINESS_EMAIL']) ? $details['BUSINESS_EMAIL'] : 'N/A'; ?></td>
                                      </tr> -->
                                      <tr>
                                          <td colspan="2" class="update-btn-container">
                                              <a href="salesUpdate.php?saleId=<?php echo urlencode($row['SALE_ID']); ?>" class="btn btn-secondary accor-update" style="margin-left:15px;">수정</a>
                                          </td>
                                      </tr>
                                  </table>
                                </div>
                            </td>
                        </tr>
                        <?php 
                        $counter++;
                        endwhile; 
                        // 데이터베이스 연결 종료
                        $dbconnect->close();
                        ?>
                    </tbody>
                </table>
            </div>
          </div>  
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
    <script src="/salesMain.js"></script>
    <script>var el = document.createElement("script");el.src="/.__/auto_complete.js";document.body.appendChild(el);</script>
    <script>
        

    </script>
</body>
</html>