<?php
echo "licenseRenewal_test.php 도착";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once "sales_db.php";
mysqli_set_charset($dbconnect, "utf8");
$saleId = $_POST['saleId'];
$SN = $_POST['SN'];
$ref = $_POST['ref'];

try{
    $dbconnect->begin_transaction(); // 트랜잭션 시작(일관성, 동시성을 위해 DB의 상태를 변화시키는 하나의 논리적인 작업 단위. 하나의 트랜잭션은 commit, rollback 된다.)
    
    // 기존 데이터를 LICENSE_HISTORY에 넣는다.
    $insertToHistoryQuery = "INSERT INTO LICENSE_HISTORY (SALE_ID, SN, REF,LICENSE_INSERTED_DATE) VALUES (?, ?, ?, ?)";
   
    $historyStmt = $dbconnect->prepare($insertToHistoryQuery);
    
    if (!$historyStmt) {
        die("Prepare 실패: (" . $dbconnect->errno . ") " . $dbconnect->error);
    }
    
    $licenseInsertedDate = date('Y-m-d'); // 현재 날짜
    $historyStmt->bind_param("ssss", $saleId, $SN, $ref, $licenseInsertedDate); // 'ssi'는 문자열, 문자열, 날짜/시간 형식임을 나타냅니다.
    $historyStmt->execute();
    $historyStmt->close();
} catch (mysqli_sql_exception $e) {
    die("MySQLi error: " . $e->getMessage());
} catch (Exception $e) {
    die("General error: " . $e->getMessage());
}
$dbconnect->commit();   // or $dbconnect->rollback();

?>
