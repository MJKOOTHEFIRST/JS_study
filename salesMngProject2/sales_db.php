<?php
$hostname = "localhost";
$username = "root";
$password = "password";
$db = "salesmng";

$dbconnect = mysqli_connect($hostname, $username, $password, $db);

if (!$dbconnect) {
    die("QnA DB 연결 실패: " . mysqli_connect_error());
}else{
    //echo "QnA DB 연결 성공";
}

mysqli_set_charset($dbconnect, "utf8");


?>
