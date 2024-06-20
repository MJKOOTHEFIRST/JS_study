<?php
// color_map.php
// color ID = color code
$colorMap = [
    'color-null' => null,
    'color00' => '#00FF00',
    'color01' => '#FFCC00',
    'color02' => '#FF6B6B',
    'color03' => '#6699CC',
    'color04' => '#B0C4DE',
    'color05' => '#4B9579',
    'color06' => '#996699',
    'color07' => '#D9BC78',
    'color08' => '#474E20',
    'color09' => '#BD9EB3',
    'color10' => '#5B471F',
    'color11' => '#66CCCC',
    'color12' => '#8AC1A3',
    'color13' => '#89CFEB',
    'color14' => '#9BCF53',
    'color15' => '#FFD5C2',
    'color16' => '#D98981',
    'color17' => '#C6E9F1',
    'color18' => '#4A509B',
    'color19' => '#8C684C',
    'color20' => '#50607F',
];

header('Content-Type: application/json');
// 컬러 맵을 json으로 반환하는 API 엔드포인트를 만듦.
echo json_encode($colorMap);
?>
