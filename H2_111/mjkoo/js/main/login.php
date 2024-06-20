<?php
session_start();
require 'db_config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // 입력값이 비어 있는지 확인
    if (empty($username) || empty($password)) {
        echo "아이디와 비밀번호를 입력해주세요.";
        exit;
    }

    // 사용자 확인
    $query = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        header("Location: dashboard.php"); // 로그인 후 대시보드로 리디렉션
        exit;
    } else {
        echo "아이디 또는 비밀번호가 올바르지 않습니다.";
    }
}
?>
