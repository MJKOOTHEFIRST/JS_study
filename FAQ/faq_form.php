<?php
// faq_submit.php

require_once "faq_db.php"; // 데이터베이스 연결 설정 불러오기

// 에러확인
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DB input form</title>
    <link rel="stylesheet" href="faq.css">

</head>

<body>
    <div class="input-form">
        <h1>FAQ DB 입력</h1>
        <form action="faq_submit.php" method="post">

            <!-- Chapter -->
            <?php
            // CHAPTERS 테이블에서 모든 챕터 불러오기
            $query = "SELECT CHAP_ID, CHAP_NAME FROM CHAPTERS";
            $result = mysqli_query($dbconnect, $query);
            ?>

            <label for="chapter">챕터<span>Chapter</span></label>
            <select id="chapter" name="chapter" onchange="handleChapterChange()">
                <option value="">챕터 선택...</option>
                <?php
                // 데이터베이스에서 가져온 챕터 목록을 옵션으로 추가
                while ($row = mysqli_fetch_assoc($result)) {
                    // 사용자에게는 챕터 이름만 보여줌
                    echo '<option value="' . $row['CHAP_ID'] . '">' . htmlspecialchars($row['CHAP_NAME']) . '</option>';
                }
                ?>
                <option value="new-chapter" class="add-new">새 챕터 추가</option>
            </select>
            <input type="text" id="new_chapter" name="new_chapter"  class="add-field" style="display:none;" placeholder="새 챕터 이름">



            <!-- Sub Chapter 드롭다운 -->
            <?php
            // fetch_subchapters.php

            if (isset($_POST['chap_id'])) {
                $chap_id = $_POST['chap_id'];

                // 선택된 CHAP_ID에 해당하는 SUBCHAPTERS 불러오기
                $query = "SELECT SUB_CHAP_ID, SUB_CHAP_NAME FROM SUBCHAPTERS WHERE CHAP_ID = $chap_id";
                $result = mysqli_query($dbconnect, $query);

                // 옵션 태그 출력
                $selectHtml = '<option value="">서브 챕터 선택...</option>';
                while ($row = mysqli_fetch_assoc($result)) {
                    $selectHtml .= '<option value="' . $row['SUB_CHAP_ID'] . '">' . $row['SUB_CHAP_NAME'] . '</option>';
                }
                echo $selectHtml;
            }
            ?>
            <label for="sub_chapter">서브 챕터<span>Sub Chapter</span></label>
            <select id="sub_chapter" name="sub_chapter" onchange="handleSubChapterChange()">
                <option value="">서브 챕터 선택...</option>
                <!-- 선택된 챕터에 따른 서브 챕터 목록을 여기에 추가 -->
                <option value="new-subChapter" class="add-new">새 서브 챕터 추가</option>
            </select>
            <input type="text" id="new_sub_chapter" name="new_sub_chapter"  class="add-field" style="display:none;" placeholder="새 서브 챕터 이름">



            <!-- Section 드롭다운 -->
            <label for="section">섹션<span>Section</span></label>
            <select id="section" name="section" onchange="handleSectionChange()">
                <option value="">섹션 선택...</option>
                <!-- 선택된 서브 챕터에 따른 섹션 목록을 여기에 추가 -->
                <option value="new-section" class="add-new">새 섹션 추가</option>
            </select>
            <input type="text" id="new_section" name="new_section"  class="add-field" style="display:none;" placeholder="새 섹션 이름">




            <!-- Subsection 드롭다운 -->
            <label for="sub_section">서브섹션<span>Sub Section</span></label>
            <select id="sub_section" name="sub_section" onchange="handleSubSectionChange()">
                <option value="">서브섹션 선택...</option>
                <!-- 선택된 섹션에 따른 서브섹션 목록을 여기에 추가 -->
                <option value="new-subSection" class="add-new">새 서브섹션 추가</option>
            </select>
            <input type="text" id="new_sub_section" name="new_sub_section"  class="add-field" style="display:none;" placeholder="새 서브섹션 이름">

            <label for="sub_section_content">서브 섹션 내용 <span>Sub Section Content</span></label>
            <textarea id="sub_section_content" name="sub_section_content"></textarea><br><br>

            <label for="section_description">섹션 설명 <span>Section Description</span></label>
            <textarea id="section_description" name="section_description"></textarea><br><br>

            <input type="submit" value="등록">
        </form>
    </div>

    <script src="faq.js"></script>
</body>

</html>