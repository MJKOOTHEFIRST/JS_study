<?php
// faq_submit.php

require_once "faq_db.php"; // 데이터베이스 연결 설정 불러오기

// 에러 확인
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// POST 요청으로 데이터가 전송되었는지 확인
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 선택된 항목 또는 새 항목 입력 확인
    $chapterOption = $_POST['chapter'];
    $subChapterOption = $_POST['sub_chapter'];
    $sectionOption = $_POST['section'];
    $subSectionOption = $_POST['sub_section'];

    // 새 항목 입력 필드
    $newChapterName = $_POST['new_chapter'];
    $newSubChapterName = $_POST['new_sub_chapter'];
    $newSectionName = $_POST['new_section'];
    $newSubSectionName = $_POST['new_sub_section'];
    $subSectionContent = $_POST['sub_section_content'];
    $sectionDescription = $_POST['section_description'];

    // 챕터 처리
    if ($chapterOption == "new-chapter" && !empty($newChapterName)) {
        $stmt = $dbconnect->prepare("INSERT INTO CHAPTERS (CHAP_NAME) VALUES (?)");
        $stmt->bind_param("s", $newChapterName);
        $stmt->execute();
        $chapId = $dbconnect->insert_id;
        $stmt->close();
    } else {
        $chapId = $chapterOption;
    }

    // 서브 챕터 처리
    if ($subChapterOption == "new-subChapter" && !empty($newSubChapterName) && isset($chapId)) {
        $stmt = $dbconnect->prepare("INSERT INTO SUBCHAPTERS (CHAP_ID, SUB_CHAP_NAME) VALUES (?, ?)");
        $stmt->bind_param("is", $chapId, $newSubChapterName);
        $stmt->execute();
        $subChapId = $dbconnect->insert_id;
        $stmt->close();
    } else {
        $subChapId = $subChapterOption;
    }

    // 섹션 처리
    if ($sectionOption == "new-section" && !empty($newSectionName) && isset($subChapId)) {
        $stmt = $dbconnect->prepare("INSERT INTO SECTIONS (CHAP_ID, SUB_CHAP_ID, SEC_NAME, SEC_DESC) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiss", $chapId, $subChapId, $newSectionName, $sectionDescription);
        $stmt->execute();
        $secId = $dbconnect->insert_id; // 새로 추가된 섹션의 ID를 얻는다.
        $stmt->close();
    } else {
        // 기존 섹션을 사용하는 경우, 섹션 옵션에서 직접 ID를 가져옴
        $secId = $sectionOption;
    }

    // 서브 섹션 처리
    if (!empty($newSubSectionName) && isset($secId)) {
        // $secId가 존재하면, 새로운 또는 기존 섹션 ID를 사용하여 서브 섹션을 추가
        $stmt = $dbconnect->prepare("INSERT INTO SUBSECTIONS (SEC_ID, SUB_SEC_NAME, SUB_SEC_CONTENT) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $secId, $newSubSectionName, $subSectionContent);
        $stmt->execute();
        $stmt->close();
    }


    // 성공 메시지와 리다이렉트를 위한 JavaScript 코드 추가
    echo "<script>alert('FAQ 데이터가 성공적으로 입력되었습니다.'); window.location.href='faq_content.php';</script>";
} else {
    // POST로 데이터가 전송되지 않았을 경우
    echo "잘못된 접근입니다.";
}
