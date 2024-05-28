<?php

$LANG = trim(file_get_contents(__DIR__."/i18n/lang.conf"));
if($LANG == null) { $LANG = "kr"; }
else if($LANG != "kr") { include("i18n/{$LANG}.php"); }

function TXT($msg) {
    global $LANG, $i18n;
    if($LANG == "kr") return $msg;
    return $i18n[$msg];
}
?>