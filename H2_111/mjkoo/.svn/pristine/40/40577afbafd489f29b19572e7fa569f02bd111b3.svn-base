<?php
// 오토 클래스 로딩
include_once(__DIR__."/include/setup.php");

// CONSTS---- ----------------------------------------
$SUCCESS_URL 	= "index.php"; // 인증 성공 후, 리다이렉트 페이지
$LOGIN_URL 		= "login.php";
$SESSION_DIR 	= "session";
$PASS_DIR 		= "etc/passwd";

// ARGUMENTS -----------------------------------------
$_FILENAME		= $argv[0];
$_IP            = $argv[1];	// 아파치 포워딩일 경우 127.0.0.1 로 찍힘
$_METHOD 		= $argv[2];
parse_str($argv[3], $_QS);
parse_str($argv[4], $_PAYLOAD);
$_COOKIE 		= Cookie::parse($argv[5]);
$_XFF 			= $argv[6]; // 아파치 포워딩을 받을 경우 클라이언트 IP가 찍힘

// LOGIN PROCESS -------------------------------------
$IS_LOGIN = ($_METHOD == "GET" && $_QS['LOGIN_ID'] != null && $_QS['CPUB_ID'] != null && $_QS['LOGIN_PASS']);
if($IS_LOGIN) { // 로그인 관련 처리
    
	// (6) auth.php에서 (ID/PASS 검증) 
	$ec_veri = new Elliptic\EC("secp256k1");
	
	// (6a) passwd 파일에서 LOGIN_ID를 찾아 LOGIN_PASS 검사
	$pass_obj = new Passwd($PASS_DIR);
	$pass = $pass_obj->get_pass($_QS['LOGIN_ID']);
	
	// (6a2) passwd 파일에 없으면, 로그인 실패
	if($pass == null) { login_fail(); }

	// (6a1) passwd 파일에 있으면, CPUB_ID로 LOGIN_PASS를 passwd 파일의 비번내용과 비교해서 검증
	$veri_key = $ec_veri->keyFromPublic($_QS['CPUB_ID'], 'hex');
	$veri_result = $veri_key->verify(bin2hex($pass), $_QS['LOGIN_PASS']);

	// (6a1a) 검증 성공이면, 세션 저장 
	if($veri_result == true) { 
		echo "Login Success.";
		
		// >>> (6a1a) /session 폴더에 파일명이 SESS_ID이고 내용이 SIGNED_IP인 파일 생성
		mkdir($SESSION_DIR, 0777, true);
		file_put_contents($SESSION_DIR."/".$_COOKIE['SESS_ID'], $_COOKIE['SIGNED_IP']);
		// <<< (6a1a) /session 폴더에 파일명이 SESS_ID이고 내용이 SIGNED_IP인 파일 생성
		
		echo "<script>";
		echo "location.href = '{$SUCCESS_URL}';";
		echo "</script>";
	} 
	// (6a1b) 검증 실패이면, 로그인 실패
	else { login_fail(); }
// AUTH PROCESS ---------------------------------------
} else {
	// (7) auth.php에서 (세션 ID 검증) : SESS_ID가 /session 폴더에 있는지 검사 후,
	// echo "auth process"; echo "<br>";

	if($_COOKIE['SESS_ID'] == null || $_COOKIE['SIGNED_IP'] == null) { auth_fail(); }

	// (7a) SESS_ID가 session 폴더에 있으면
	if(file_exists($SESSION_DIR."/".$_COOKIE['SESS_ID'])) {
		// echo "file exists"; echo "<br>";
		$signed_ip = file_get_contents($SESSION_DIR."/".$_COOKIE['SESS_ID']);
		// (7a1a) 검증 실패이면, 인증 FAIL
		if( strcmp($signed_ip, $_COOKIE['SIGNED_IP']) != 0 ) { auth_fail(); } 
	} 
	// (7b) SESS_ID가 /session 폴더에 없으면, 인증 FAIL
	else { auth_fail(); }
}

// FUNCTION SET ---------------------------------------
function auth_fail() {
	global $LOGIN_URL;
	echo "<script>";
	echo "	location.href = '{$LOGIN_URL}';";
	echo "</script>";
	exit;
}

function login_fail() {
	echo "Login Fail.";
	echo "<script>";
	echo "	history.back();";
	echo "</script>";
	exit;
}


?>