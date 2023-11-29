<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once "sales_db.php";

// UTF-8 인코딩 설정
mysqli_set_charset($dbconnect, "utf8");

$today = date("Y-m-d");
$message = "전체 : ";

// 대시보드랑 연결
// Check connection
if ($dbconnect->connect_error) {
    die("Connection failed: " . $dbconnect->connect_error);
}

function get_sql_queried_from_dashboard($cmd) {
    global $dbconnect, $today, $message;
    $sql = "";
    // Fetching the 'dDateTo' value from the URL and ensuring it's safe to use in a query
    $dDateOfLicense = isset($_GET['dDateOfLicense']) ? $dbconnect->real_escape_string($_GET['dDateOfLicense']) : '';
    switch($cmd) {
        case "001": // 유상 보증기간 종료 예정
            if ($dDateOfLicense && strtotime($dDateOfLicense)) {
                $message = "유상 보증기간 종료 예정(D-30) : "; 
                $sql = "SELECT L.SALE_ID, L.SN, 
                               L.TYPE, L.PRICE, L.S_DATE, L.D_DATE, L.REF, L.WARRANTY, L.INSPECTION, L.SUPPORT
                        FROM LICENSE AS L
                        WHERE L.TYPE = '유상' AND (L.D_DATE >= '$today' AND L.D_DATE <= '$dDateOfLicense')
                        ORDER BY L.D_DATE DESC";
            }
        break;
        case "002": // 무상 보증기간 종료 예정
            if ($dDateOfLicense && strtotime($dDateOfLicense)) {
                $message = "무상 보증기간 종료 예정(D-30) : "; 
                $sql = "SELECT L.SALE_ID, L.SN, 
                               L.TYPE, L.PRICE, L.S_DATE, L.D_DATE, L.REF, L.WARRANTY, L.INSPECTION, L.SUPPORT
                        FROM LICENSE AS L
                        WHERE L.TYPE = '무상' AND L.D_DATE >= '$today' AND L.D_DATE <= '$dDateOfLicense'
                        ORDER BY L.D_DATE DESC";
            }
        break;
        case "003": // 유상 보증기간 만료
            $message = "유상 보증기간 만료 : "; 
            $sql = "SELECT L.SALE_ID, L.SN, 
                           L.TYPE, L.PRICE, L.S_DATE, L.D_DATE, L.REF, L.WARRANTY, L.INSPECTION, L.SUPPORT
                    FROM LICENSE AS L
                    WHERE L.TYPE = '유상' AND L.D_DATE <= '$today'";
        break;
        case "004": // 무상 보증기간 만료
            $message = "무상 보증기간 만료 : ";
            $sql = "SELECT L.SALE_ID, L.SN, 
                           L.TYPE, L.PRICE, L.S_DATE, L.D_DATE, L.REF, L.WARRANTY, L.INSPECTION, L.SUPPORT
                    FROM LICENSE AS L
                    WHERE L.TYPE = '무상' AND L.D_DATE <= '$today'";
        break;
    }
    return ['sql' => $sql, 'message' => $message];
}

//name 값들을 DB 컬럼값으로 고쳐줘야하므로 매핑을 하고
$fieldToDbColumnMapping = [
    'saleId'    => 'SALE_ID',
    'SN'        => 'SN',
    'type'      => 'TYPE',
    'sDateFrom' => 'S_DATE',
    'sDateTo'   => 'S_DATE',
    'dDateFrom' => 'D_DATE',
    'dDateTo'   => 'D_DATE',
    'ref'=> 'REF',
    'warranty'  => 'WARRANTY'
];

$conditions = [];
//기간->날짜 검색은 아래와 같이 처리해준다. 
foreach ($fieldToDbColumnMapping as $field => $dbColumn) {
    if (isset($_REQUEST[$field]) && !empty($_REQUEST[$field])) {
        switch ($field) {
            case 'sDateFrom':
                // 유지보수 시작일 시작 날짜 범위 처리 (S_DATE의 시작 범위)
                $conditions[] = $dbColumn . " >= '" . mysqli_real_escape_string($dbconnect, $_REQUEST[$field]) . "'";
                break;
            case 'sDateTo':
                // 유지보수 시작일 종료 날짜 범위 처리 (S_DATE의 종료 범위)
                $conditions[] = $dbColumn . " <= '" . mysqli_real_escape_string($dbconnect, $_REQUEST[$field]) . "'";
                break;
            case 'dDateFrom':
                // 유지보수 종료일 시작 날짜 범위 처리 (D_DATE의 시작 범위)
                $conditions[] = $dbColumn . " >= '" . mysqli_real_escape_string($dbconnect, $_REQUEST[$field]) . "'";
                break;
            case 'dDateTo':
                // 유지보수 종료일 종료 날짜 범위 처리 (D_DATE의 종료 범위)
                $conditions[] = $dbColumn . " <= '" . mysqli_real_escape_string($dbconnect, $_REQUEST[$field]) . "'";
                break;
            default:
                // 일반 조건 처리
                $conditions[] = $dbColumn . " = '%" . mysqli_real_escape_string($dbconnect, trim($_REQUEST[$field])) . "%'"; // 230920 trim으로 공백을 제거해줘야 SQL이 유효함
                break;
        }
    }
}

// <<< 230907 hjkim - REFERER별 처리
// referer : 현재 페이지에 접근하기 직전에 사용자가 머물렀던 웹 페이지의 URL을 가져올 때 리퍼러라 부름.
$from_url_path = "";  // 기본값 설정

if (isset($_SERVER['HTTP_REFERER'])) { //referer 값이 설정되어있는지 먼저 확인.
    $from_url = parse_url($_SERVER['HTTP_REFERER']);
    if (isset($from_url['path'])) {
        $from_url_path = $from_url["path"];
    }
}

switch($from_url_path) {
    case "/dashboard.html": // 생성된 대시보드 페이지,
        case "/dashboard.php": // 혹은 대시보드 페이지에서 유입될 경우,
            if(!isset($_GET["cmd"])) { goto DEFAULT_PAGE; }
            $result = get_sql_queried_from_dashboard($_GET["cmd"]); //cmd 값에 따른 쿼리 가져옴
            $query = $result['sql'];
            $message = $result['message'];  // <-- 함수에서 반환된 $message 값을 업데이트
            break;
        default: // 그외의 페이지에서 유입될 경우,
        DEFAULT_PAGE:
            // 검색 조건에 따른 SQL 쿼리 작성
            // 기본적으로는 전체 목록을 보여주지만, 검색 조건이 salesSearch로 부터 전달될 경우 
            // 해당 조건에 맞는 데이터만 필터링하여 보여줌.
            $query = "SELECT 
                L.SALE_ID, L.SN, L.TYPE, L.PRICE, L.S_DATE, L.D_DATE, L.WARRANTY, L.INSPECTION, L.SUPPORT, L.REF
            FROM LICENSE AS L";
    
            if (!empty($conditions)) {
            $where_clause = " WHERE " . implode(" AND ", $conditions);
                $query .= str_replace('=', 'LIKE', $where_clause);
            }
    
        $query .= " ORDER BY L.SALE_ID DESC"; // 명세서번호로 정렬
        break;
}
// <<< 230907 hjkim - REFERER별 처리

// 데이터베이스에서 데이터 가져오기
$result = mysqli_query($dbconnect, $query);

// var_dump($result);

if (!$result) {
    die("Query failed: (" . mysqli_errno($dbconnect) . ") " . mysqli_error($dbconnect));
}

// .detail-table 안에 들어갈 데이터 불러오기
$details = [];  // 빈 배열로 초기화
$sale_ids = [];  // SALE_ID 값을 저장하기 위한 배열

while ($row = mysqli_fetch_assoc($result)) {
    $saleIdKey = $row['SALE_ID'];
    $details[$saleIdKey] = $row;
}

if ($sale_ids) {
    $ids_list = implode(',', $sale_ids);
    $query = "
        SELECT 
            L.SALE_ID,
            L.SN,
            B.NAME as BUSINESS_NAME, 
            B.CONTACT as BUSINESS_CONTACT, 
            B.EMAIL as BUSINESS_EMAIL, 
            C.NAME as CUSTOMER_NAME
        FROM LICENSE L
        JOIN SALES S ON L.SALE_ID = S.SALE_ID
        JOIN BUSINESS B ON S.CBIZ_ID = B.BIZ_ID
        JOIN CUSTOMER C ON S.C_ID = C.C_ID
        WHERE L.SALE_ID IN ($ids_list)";

    if ($result = $dbconnect->query($query)) {
        while ($row = $result->fetch_assoc()) {
            $details[$row['SALE_ID']] = $row;
        }
    } else {
        die("Query failed: (" . $dbconnect->errno . ") " . $dbconnect->error);
    }
}


// 결과 재설정 (원래대로 돌아가서 다시 사용 가능하게 함)
mysqli_data_seek($result, 0);

// >>>>>> 230920 총 건수 구하기
$totalLicenseRow['total'] = mysqli_num_rows($result);
$totalCount = $totalLicenseRow['total'];
// <<<<<< 230920 총 건수 구하기
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>라이센스 메인</title>
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
  <?php include 'navbar.php'; ?>
  <div class="container-fluid mt-5  main-screen">
    <div class="row">
        <div class="col-12 text-center">
            <header>라이센스</header>
        </div>
    </div>
    <div class="row mb-3">
        <div class="col-12 d-flex justify-content-start main-top-btn">
            <button type="button" class="btn btn-primary insert mr-2" onclick="goToLicenseInsert()">신규</button>
            <button type="button" class="btn btn-primary search" onclick="goToLicenseSearch()">검색</button>
        </div>
	<!-- >>>>>> 230920 총 건수 -->
        <div class="total-number" style="text-align:left; margin-left:2%; font-size: 1.2em; font-weight:bold;">
            <!-- <?= $message ?><span> </span><?= $totalCount ?> 건 -->
            <?= $message ?><?= $totalCount ?> 건
        </div>
	<!-- <<<<<< 230920 총 건수 -->
    </div>
    <div class="row">
        <div class="col-12">
            <div class="table-wrapper table-responsive">
                <!-- The rest of the table here... -->
                <table class="table main-tbl lcs-main-tbl">
                <thead>
                    <tr>
                        <!-- tablesorter 쓰면 안되고, 나중에 pagination이랑 함께 해야하기 때문에 각 th를 클릭했을 때, 각각 select 해서 정렬하도록 한다. -->
                        <th scope="col" class="col-1">명세서번호</th>
                        <th scope="col" class="col-2">SN</th>
                        <th scope="col" class="col-1 maintenance-type">유형</th>
                        <th scope="col" class="col-1"  style="text-align:right; padding-right:2%;">가격</th>
                        <th scope="col" class="col-1">보증기간</th>
                        <th scope="col" class="col-1">시작일</th>
                        <th scope="col" class="col-1">종료일</th>
                        <th scope="col" class="col-1">점검</th>
                        <th scope="col" class="col-1">파트너지원</th>
                        <th scope="col" class="col-1">비고</th>
                        <th scope="col" class="col-1">수정</th>
                    </tr>
                </thead>
                  <tbody class="main-screen">
                    <?php 
                      $counter = 1;  // 각 데이터 행과 세부 정보 행의 ID를 생성하는 카운터 변수
                      while ($row = mysqli_fetch_assoc($result)): 
                      ?>
                        <!-- 데이터 행 -->
                      <tr data-bs-toggle="collapse" data-bs-target="#flush-collapse<?php echo $counter; ?>" aria-expanded="false" aria-controls="flush-collapse<?php echo $counter; ?>">
                          <td class="col-1">
                            <span class="custom-link" onclick="window.location.href='salesMain.php?SALE_ID=<?php echo $row['SALE_ID']; ?>'">
                                <?php echo $row['SALE_ID']; ?>
                            </span>
                          </td>
                          <td class="col-1" style="text-align: left; padding-left: 3%;">
                            <span class="custom-link" onclick="window.location.href='salesMain.php?SN=<?php echo $row['SN']; ?>'">
                                <?php echo $row['SN']; ?>
                            </span>
                          </td>
                          <td class="col-1"><?php echo $row['TYPE']; ?></td>
                          <td class="col-1" style="text-align:right; padding-right:2%;"><?php echo number_format($row['PRICE'] ?? 0); ?><span>원</span></td>
                          <td class="col-1">
                            <?php 
                            if (isset($row['WARRANTY']) && !empty($row['WARRANTY'])) {
                                echo $row['WARRANTY'] . " 개월";
                            } 
                            ?>
                           </td>
                          <td class="col-1"><?php echo $row['S_DATE']; ?></td>
                          <td class="col-1"><?php echo $row['D_DATE']; ?></td>
                          <td class="col-1"><?php echo $row['INSPECTION']; ?></td>
                          <td class="col-1"><?php echo $row['SUPPORT']; ?></td>
                          <td class="col-1"><?php echo $row['REF']; ?></td>
                          <td class="col-1"><button class="btn btn-secondary" onclick="location.href='licenseUpdate.php?saleId=<?php echo urlencode($row['SALE_ID']); ?>&SN=<?php echo urlencode($row['SN']); ?>';">수정</button></td>
                        </td>
                      </tr>
                      <?php 
                      $counter++;
                      endwhile; 
                      ?>
                  </tbody>
              </table>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
    <script src="salesMain.js"></script>
    <script src="/.__/auto_complete.js"></script>
</body>
</html>