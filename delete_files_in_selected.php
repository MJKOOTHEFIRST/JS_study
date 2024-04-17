<?php
// delete_files_in_selected.php

$directory = '/home/nstek/h2_system/patch_active/FDC/work/bjy/impedance/selected/';

foreach(glob("{$directory}*") as $file) {
    if(is_file($file)) {
        // 파일 삭제
        unlink($file);
    }
}

echo json_encode(['message' => 'Selected directory cleared']);
?>