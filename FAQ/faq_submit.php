<?php
// faq_submit.php

// POST 요청으로 데이터가 전송되었는지 확인
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 폼 필드에서 데이터 추출
    $chapter = $_POST['chapter'] ?? '';
    $sub_chapter = $_POST['sub_chapter'] ?? '';
    $section = $_POST['section'] ?? '';
    $sub_section = $_POST['sub_section'] ?? '';
    $sub_section_content = $_POST['sub_section_content'] ?? '';
    $section_description = $_POST['section_description'] ?? '';

    // 여기서 데이터베이스에 데이터를 저장하는 로직을 추가할 수 있습니다.
    // 예: 데이터베이스 연결 및 INSERT 쿼리 실행

    // 성공 메시지 표시 또는 다른 페이지로 리다이렉트
    echo "FAQ 데이터가 성공적으로 입력되었습니다.";
} else {
    // POST로 데이터가 전송되지 않았을 경우
    echo "잘못된 접근입니다.";
}
?>
