<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>FAQ DB 입력 폼</title>
    
</head>
<body>
    <h1>FAQ DB 입력</h1>
    <form action="submit_faq.php" method="post">
        <label for="chapter">챕터 (Chapter)</label>
        <input type="text" id="chapter" name="chapter"><br><br>

        <label for="sub_chapter">서브 챕터 (Sub Chapter)</label>
        <input type="text" id="sub_chapter" name="sub_chapter"><br><br>

        <label for="section">섹션 (Section)</label>
        <input type="text" id="section" name="section"><br><br>

        <label for="sub_section">서브 섹션 (Sub Section)</label>
        <input type="text" id="sub_section" name="sub_section"><br><br>

        <label for="sub_section_content">서브 섹션 내용 (Sub Section Content)</label>
        <textarea id="sub_section_content" name="sub_section_content"></textarea><br><br>

        <label for="section_description">섹션 설명 (Section Description)</label>
        <textarea id="section_description" name="section_description"></textarea><br><br>

        <input type="submit" value="등록">
    </form>
</body>
</html>
