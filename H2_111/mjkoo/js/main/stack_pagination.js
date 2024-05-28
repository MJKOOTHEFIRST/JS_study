//search_pagination.js
export function displayPagination(totalRows, currentPage) {
    const perPage = 100; // 페이지 당 표시할 데이터 수
    const totalPages = Math.ceil(totalRows / perPage);
    const paginationContainer = document.getElementById('stack-search-pagination');
    paginationContainer.innerHTML = ''; // 기존 페이지네이션 초기화

    const maxPageVisible = 10; // 한 번에 표시할 최대 페이지 수
    let startPage = Math.max(currentPage - Math.floor(maxPageVisible / 2), 1);
    let endPage = Math.min(startPage + maxPageVisible - 1, totalPages);

    if (endPage - startPage + 1 < maxPageVisible) {
        startPage = Math.max(endPage - maxPageVisible + 1, 1);
    }

    // 항상 '<<' 버튼을 표시하되, 첫 페이지인 경우 비활성화합니다.
    paginationContainer.appendChild(createPageItem(1, '<<', currentPage > 1));

    // 항상 '<' 버튼을 표시하되, 첫 페이지인 경우 비활성화합니다.
    paginationContainer.appendChild(createPageItem(Math.max(1, currentPage - maxPageVisible), '<', currentPage > 1));


    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPageItem(i, i.toString(), currentPage !== i));
    }

    // 항상 '>' 버튼을 표시하되, 마지막 페이지인 경우 비활성화합니다.
    paginationContainer.appendChild(createPageItem(Math.min(totalPages, currentPage + maxPageVisible), '>', currentPage < totalPages));

    // 항상 '>>' 버튼을 표시하되, 마지막 페이지인 경우 비활성화합니다.
    paginationContainer.appendChild(createPageItem(totalPages, '>>', currentPage < totalPages));
}

function createPageItem(pageNumber, text, clickable) {
    const pageItem = document.createElement('li');
    pageItem.classList.add('page-item'); // 모든 페이지 아이템에 'page-item' 클래스 추가

    const pageLink = document.createElement('a');
    pageLink.classList.add('page-link'); // 모든 페이지 링크에 'page-link' 클래스 추가
    pageLink.textContent = text;
    pageLink.href = '#'; // 클릭 이벤트를 처리하고 기본 동작을 방지하기 위해 링크 해시 설정

    if (clickable) {
        pageLink.addEventListener('click', function (event) {
            event.preventDefault();
            goToPage(pageNumber); // 페이지 이동 함수 호출
        });
    } else {
        pageItem.classList.add('disabled'); // 클릭할 수 없는 페이지 아이템에 'disabled' 클래스 추가
    }

    if (typeof pageNumber === 'number' && pageNumber === currentPage) {
        pageItem.classList.add('pagination-active'); // 현재 페이지에 대한 스타일 적용
    }

    pageItem.appendChild(pageLink);
    return pageItem;
}
