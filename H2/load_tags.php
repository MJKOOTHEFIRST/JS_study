<!-- load_tags.php -->
<?php
$filePath = '/home/nstek/h2_system/patch_active/fuelcell_data/tags.conf';
// FILE_IGNORE_NEW_LINES  : 각 줄 끝의 줄바꿈 문자 제거 
// FILE_SKIP_EMPTY_)LINES : 빈 줄 무시
$tags = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
echo json_encode($tags);
?>