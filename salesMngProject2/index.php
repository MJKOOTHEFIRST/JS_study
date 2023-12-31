<?php
// 에러확인
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start the session
session_start();

$html_values = array();

require_once "sales_db.php";

mysqli_set_charset($dbconnect, "utf8");


?> 


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인</title>
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
  <div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-lg-6">
            <h2 class="text-center mb-4"></h2><br>
            <div class="card p-4 border-top border-bottom mx-auto shadow p-5 mt-4">
                <div class="card-body">
                    <form action="index.php" method="post" id="login-frm">
                        <div class="form-group">
                            <input type="text" class="form-control mb-3" id="loginId" name="id" placeholder="아이디" style="max-width: 300px; margin: 0 auto;">
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control mb-3" id="loginPw" name="pw" placeholder="비밀번호" style="max-width: 300px; margin: 0 auto;">
                        </div>
                        <div class="form-group text-center">
                            <input type="submit" class="btn btn-primary" value="로그인" style="margin-top:30px;width: 100px; font-size: 17px; font-weight: 900; border-radius: 10px;">
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
    <script src="salesMain.js"></script>
    <script src="/.__/auto_complete.js">
</body>
</html>