<?php
//search_pagination.php
function calculatePagination($totalRows, $currentPage = 1, $perPage = 100) {
    $totalPages = ceil($totalRows / $perPage);
    $offset = ($currentPage - 1) * $perPage;
    return [
        'offset' => $offset,
        'perPage' => $perPage,
        'totalPages' => $totalPages
    ];
}