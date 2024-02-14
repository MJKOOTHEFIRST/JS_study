<?php
// 데이터베이스 연결 설정 불러오기
require_once "faq_db.php";

// CHAPTERS 테이블에서 모든 챕터를 가져오는 쿼리
$chaptersQuery = "SELECT * FROM CHAPTERS";
$chaptersResult = $dbconnect->query($chaptersQuery);
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <title>FAQ 목록</title>
    <!-- 스타일시트 링크나 스크립트를 여기에 추가할 수 있습니다 -->
</head>

<body>
    <h1>FAQ 목록</h1>
    <?php if ($chaptersResult->num_rows > 0) : ?>
        <div id="faq-list">
            <?php while ($chapter = $chaptersResult->fetch_assoc()) : ?>
                <div class="chapter">
                    <h2><?php echo htmlspecialchars($chapter['CHAP_NAME']); ?></h2>
                    <?php
                    // 현재 챕터의 서브 챕터를 가져오는 쿼리
                    $subChaptersQuery = "SELECT * FROM SUBCHAPTERS WHERE CHAP_ID = " . $chapter['CHAP_ID'];
                    $subChaptersResult = $dbconnect->query($subChaptersQuery);
                    if ($subChaptersResult->num_rows > 0) :
                    ?>
                        <ul>
                            <?php while ($subChapter = $subChaptersResult->fetch_assoc()) : ?>
                                <li>
                                    <a href="preview.php?sub_chap_id=<?php echo htmlspecialchars($subChapter['SUB_CHAP_ID']); ?>">
                                        <?php echo htmlspecialchars($subChapter['SUB_CHAP_NAME']); ?>
                                    </a>
                                </li>
                            <?php endwhile; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            <?php endwhile; ?>
        </div>
    <?php else : ?>
        <p>FAQ 항목이 없습니다.</p>
    <?php endif; ?>
</body>

</html>