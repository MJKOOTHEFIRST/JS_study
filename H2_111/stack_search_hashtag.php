<!-- stack_search_hashtag.php -->
<?php

// stack_search_hashtag.php
// POST 요청으로부터 해시태그 데이터를 받습니다.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['hashtags'])) {
    $hashtagsJson = $_POST['hashtags'];
    $hashtags = json_decode($hashtagsJson, true);

    // 파일에 해시태그를 저장합니다.
    $filePath = '/home/nstek/h2_system/patch_active/fuelcell_data/stack_search_hashtag.conf';
    $file = fopen($filePath, 'w'); // 파일을 쓰기 모드로 엽니다.

    if ($file === false) {
        echo "파일을 열 수 없습니다.";
        exit;
    }

    foreach ($hashtags as $hashtag) {
        // 각 해시태그를 새 줄에 쓰기
        fwrite($file, $hashtag . PHP_EOL);
    }

    fclose($file); // 파일을 닫습니다.

    echo "해시태그가 성공적으로 저장되었습니다.";
} else {
    // POST 데이터가 없거나 hashtags 필드가 비어 있는 경우 에러 메시지를 반환
    echo "올바른 데이터가 전송되지 않았습니다.";
}

?>
