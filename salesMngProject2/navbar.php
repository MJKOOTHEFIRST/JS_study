<?php
$current_page = basename($_SERVER['PHP_SELF']);
?>

<!--
  PHP의 다양한 기능을 사용하여 현재 페이지를 동적으로 감지하고 해당 메뉴 항목을 활성화.
  navbar.php 파일에서 각 메뉴 항목의 href 속성과 현재 URL을 비교합니다.
  일치하는 경우 해당 메뉴 항목에 active 클래스를 추가하여 현재 페이지를 표시합니다.
-->
<nav class="navbar navbar-expand-lg navbar-light" style="background-color: #5a9bd5;">
  <!-- 반응형 네비 주기 -->
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNav">
    <!--네비바 메뉴 -->
    <ul class="navbar-nav me-auto">
      <li class="nav-item">
        <!-- strpos는 해당 파일에 '키워드'가 포함되어있으면 active 클래스를 추가하고 아니면 추가하지 않는다.  -->
        <a class="nav-link <?= strpos($current_page, 'dashboard') !== false ? 'active' : '' ?>" href="dashboard.php">대시보드</a>
      </li>
      <li class="nav-item">
        <a class="nav-link <?= strpos($current_page, 'sales') !== false ? 'active' : '' ?>" href="salesMain.php">거래명세서</a>
      </li>
      <li class="nav-item">
        <a class="nav-link <?= strpos($current_page, 'license') !== false ? 'active' : '' ?>" href="licenseMain.php">라이센스</a>
      </li>
      <li class="nav-item">
        <a class="nav-link <?= strpos($current_page, 'device') !== false ? 'active' : '' ?>" href="deviceMain.php">장비</a>
      </li>
      <li class="nav-item">
        <a class="nav-link <?= strpos($current_page, 'support') !== false ? 'active' : '' ?>" href="#">지원이력</a>
      </li>
    </ul>
    <ul class="navbar-nav ms-auto">
        <li class="nav-item">
            <a href="index.php" class="nav-link">
                <img src="/img/password0901.png" alt="Login Image" style="height: 45px; width: auto; margin-right:5%;">
            </a>
        </li>
    </ul>
  </div>
</nav>
