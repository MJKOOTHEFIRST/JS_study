<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DB input form</title>
    <link rel="stylesheet" href="faq.css">
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
    <!-- Summernote CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.18/summernote-bs4.min.css" rel="stylesheet">
</head>

<body>
    <div class="input-form">
        <h1>FAQ DB 입력</h1>
        <form action="faq_submit.php" method="post">

            <!-- Chapter -->
            <label for="chapter">챕터<span>Chapter</span></label>
            <select id="chapter" name="chapter" onchange="handleChapterChange()">
                <option value="">챕터 선택...</option>
                <!-- 기존 챕터 목록을 서버에서 가져와 여기에 추가 -->
                <option value="new-chapter">새 챕터 추가</option>
            </select>
            <input type="text" id="new_chapter" name="new_chapter" style="display:none;" placeholder="새 챕터 이름">

            <!-- Sub Chapter 드롭다운 -->
            <label for="sub_chapter">서브 챕터<span>Sub Chapter</span></label>
            <select id="sub_chapter" name="sub_chapter" onchange="handleSubChapterChange()">
                <option value="">서브 챕터 선택...</option>
                <!-- 선택된 챕터에 따른 서브 챕터 목록을 여기에 추가 -->
                <option value="new-subChapter">새 서브 챕터 추가</option>
            </select>
            <input type="text" id="new_sub_chapter" name="new_sub_chapter" style="display:none;" placeholder="새 서브 챕터 이름">

            <!-- Section 드롭다운 -->
            <label for="section">섹션<span>Section</span></label>
            <select id="section" name="section" onchange="handleSectionChange()">
                <option value="">섹션 선택...</option>
                <!-- 선택된 서브 챕터에 따른 섹션 목록을 여기에 추가 -->
                <option value="new-section">새 섹션 추가</option>
            </select>
            <input type="text" id="new_section" name="new_section" style="display:none;" placeholder="새 섹션 이름">

            <!-- Subsection 드롭다운 -->
            <label for="sub_section">서브섹션<span>Sub Section</span></label>
            <select id="sub_section" name="sub_section" onchange="handleSubSectionChange()">
                <option value="">서브섹션 선택...</option>
                <!-- 선택된 섹션에 따른 서브섹션 목록을 여기에 추가 -->
                <option value="new-subSection">새 서브섹션 추가</option>
            </select>
            <input type="text" id="new_sub_section" name="new_sub_section" style="display:none;" placeholder="새 서브섹션 이름">

            <label for="sub_section_content">서브 섹션 내용 <span>Sub Section Content</span></label>
            <textarea id="sub_section_content" name="sub_section_content"></textarea><br><br>

            <label for="section_description">섹션 설명 <span>Section Description</span></label>
            <textarea id="section_description" name="section_description"></textarea><br><br>

            <input type="submit" value="등록">
        </form>
    </div>

    <script src="faq.js"></script>
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js"></script>
    <!-- Summernote JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.18/summernote-bs4.min.js"></script>

    <script>
        $(document).ready(function() {
            $('#sub_section_content').summernote({
                height: 300, // 에디터의 높이
                minHeight: null, // 최소 높이
                maxHeight: null, // 최대 높이
                focus: true // 에디터 로딩 후 포커스를 맞출지 여부
                // 추가 옵션은 Summernote 공식 문서 참조
            });
        });
    </script>
</body>

</html>