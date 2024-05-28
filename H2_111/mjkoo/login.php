<?php

// 오토 클래스 로딩
include_once(__DIR__."/include/setup.php");

// ------------- SERVER SIDE ----------------------------------------
// [X] (1) 접속한 클라이언트 IP을 비밀키로 서명	=> sign(IP) => SIGNED_IP
// [X] (2) 공개키(SESS_ID)와 SIGNED_IP를 전달 => SESS_ID;SIGNED_IP
// ------------- CLIENT SIDE ----------------------------------------
// [X] (3) 공개키(SESS_ID)와 SIGNED_IP를 쿠키로 굽기 => SESS_ID;SIGNED_IP
// [X] (4) 입력한 PWD를 비밀키로 서명   => sign(pwd) => LOGIN_PASS
// [X] (5) 공개키와 함께 LOGIN_ID, VERI_MSG를 auth.php로 전달 => CPUB_ID;LOGIN_ID;LOGIN_PASS
// ------------- SERVER SIDE ----------------------------------------
// [X] (6) auth.php에서 (ID/PASS 검증) 
// [X] (6a) passwd 파일에서 LOGIN_ID를 찾아 LOGIN_PASS 검사
// [X] (6a1) passwd 파일에 있으면, CPUB_ID로 LOGIN_PASS를 passwd 파일의 비번내용과 비교해서 검증
// [X] (6a1a) 검증 성공이면, /session 폴더에 파일명이 SESS_ID이고 내용이 SIGNED_IP인 파일 생성
// [X] (6a1b) 검증 실패이면, 로그인 실패
// [X] (6a2) passwd 파일에 없으면, 로그인 실패
// ------------- SERVER SIDE ----------------------------------------
// [X] (7) auth.php에서 (세션 ID 검증) : SESS_ID가 /session 폴더에 있는지 검사 후,
// [X] (7a) SESS_ID가 /session 폴더에 있으면,
// [X] (7a1) 해당 세션파일의 내용과 SIGNED_IP를 비교 검증
// [X] (7a1a) 검증 실패이면, 인증 FAIL
// [X] (7b) SESS_ID가 /session 폴더에 없으면, 인증 FAIL
// ------------- LOGOUT --------------------------------------------
// [X] /session 폴더에서 SESS_ID 파일 삭제

$_XFF = $argv[6];

// (1) 접속한 IP를 비밀키로 서명
$ecdh 		= new Elliptic\EC("secp256k1");
$secret_key = $ecdh->genKeyPair();
$hex_str 	= bin2hex($_XFF);
$signed_ip 	= $secret_key->sign($hex_str);
$_SIGNED_IP = $signed_ip->toDER("hex");
$_SESS_ID 	= $secret_key->getPublic('hex');

function get_linux_random($num_bytes = 16) {
	return file_get_contents('/dev/random', false, null, 0, $num_bytes);
}
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Login Page</title>
		<script src="./js/bn.js"></script>
		<script src="./js/elliptic.js"></script>
	</head>
	<body>
		<form name="login_frm" action="auth.php" method="get" onsubmit="submit_login(event)">
			<input type="hidden" name="CPUB_ID"/>
			<table>
				<tr>
					<td>ID:</td>
					<td><input type="text" name="LOGIN_ID" id="site" required></td>
				</tr>
				<tr>
					<td>Pass:</td>
					<td><input type="password" name="LOGIN_PASS" id="pass" required></td>
				</tr>
				<tr>
					<td colspan="2"><button type="submit" style="width:100%">로그인</button></td>
				</tr>
			</table>
		</form>
	<hr>
</body>
<script>
/* -------------------------------------------------------------------------- */
/*                               ONLOAD HANDLER                               */
/* -------------------------------------------------------------------------- */
window.addEventListener("load", function() {
    var _SESS_ID    = "<?=$_SESS_ID?>";
    var _SIGNED_IP  = "<?=$_SIGNED_IP?>";

    // (3) 공개키(SESS_ID)와 SIGNED_IP를 쿠키로 굽기 => SESS_ID;SIGNED_IP
    set_cookie("SESS_ID",   `${_SESS_ID}`, 1);
    set_cookie("SIGNED_IP", `${_SIGNED_IP}`, 1);
});

/* -------------------------------------------------------------------------- */
/*                                FUNCTION SET                                */
/* -------------------------------------------------------------------------- */
function set_cookie(name, value, days_to_expire) {
	var expiration_date = new Date();
	expiration_date.setDate(expiration_date.getDate() + days_to_expire);
	var cookie_str = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expiration_date.toUTCString()}; path=/`;
	document.cookie = cookie_str;
}

function get_hexstring(plaintext) {
	var text = plaintext;
	var encoder = new TextEncoder();
	var uint8_arr = encoder.encode(text);
	var hex_arr = Array.from(uint8_arr).map(byte => byte.toString(16));
	hex_str = hex_arr.join("");
	return hex_str;
}

// [ ] (4) 입력한 PWD를 비밀키로 서명   => sign(pwd) => LOGIN_PASS
function submit_login(event) {
	// (4a) 비밀/공개키 생성
	var ec_sign = new elliptic.ec('secp256k1');
	var cli_pri_key = ec_sign.genKeyPair();
	var cli_pub_key = cli_pri_key.getPublic('hex');
	
	// (4b)패스워드를 비밀키로 서명
    var hex_str = get_hexstring(login_frm.pass.value);

    // (5) 공개키와 함께 LOGIN_ID, VERI_MSG를 auth.php로 전달 => CPUB_ID;LOGIN_ID;LOGIN_PASS
	login_frm.CPUB_ID.value = cli_pub_key;
	login_frm.LOGIN_ID.value = login_frm.LOGIN_ID.value;
	login_frm.LOGIN_PASS.value = cli_pri_key.sign(hex_str).toDER("hex");
}
</script>
</html>
