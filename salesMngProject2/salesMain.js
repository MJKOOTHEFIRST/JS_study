var el = document.createElement("script");el.src="/.__/auto_complete.js";document.body.appendChild(el);

/* -------------------------------------------------------------------------- */
/*                                salesMain 페이지                             */
/* -------------------------------------------------------------------------- */
//네비게이션
document.addEventListener('DOMContentLoaded', function() {
    var navItems = document.querySelectorAll('.nav-item a');
    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            navItems.forEach(function(innerItem) {
                innerItem.classList.remove('active');
            });
            item.classList.add('active');
        });
    });
});

//'신규'버튼
function goToSalesInsert(){
    window.location.href="salesInsert.php";
}
//'검색'버튼
function goToSalesSearch(){
    window.location.href="salesSearch.php";
}
//salesInsert에서 취소버튼 눌렀을때 
function redirectToSalesMain() {
    window.location.href = 'salesMain.php';
}

/* -------------------------------------------------------------------------- */
/*                salesMain   pagination & sorting                            */
/* -------------------------------------------------------------------------- */
 // 정렬 방향을 추적하는 변수
let sortDirection = 'asc';

// 페이지네이션 및 정렬을 초기화하는 함수
function initializeTable() {
    // 열의 클릭 이벤트에 정렬 기능 연결
    const sortableColumns = document.querySelectorAll('[data-sortable="true"]');
    sortableColumns.forEach(column => {
        column.addEventListener('click', () => sortTable(column));
    });


    // Pagination 컨트롤을 초기화하고 첫 번째 페이지 표시
    const pagination = document.querySelector('.pagination');
    const prevButton = pagination.querySelector('.prev');
    const nextButton = pagination.querySelector('.next');
    prevButton.addEventListener('click', () => goToPage(currentPage - 1));
    nextButton.addEventListener('click', () => goToPage(currentPage + 1));

    // 페이지네이션에서 페이지 번호를 클릭할 때 페이지 이동
    const pageButtons = pagination.querySelectorAll('.page');
    pageButtons.forEach(pageButton => {
        pageButton.addEventListener('click', () => {
            const pageNumber = parseInt(pageButton.textContent);
            goToPage(pageNumber);
        });
    });

    // 초기 페이지를 1로 설정하고 테이블 초기화
    currentPage = 1;
    updateTable();
}

// 열 제목을 클릭하여 표를 정렬하는 함수
function sortTable(column) {
    // 클릭된 열의 인덱스를 가져옴
    const columnIndex = Array.from(column.parentElement.children).indexOf(column);

    // 정렬 방향을 업데이트 (asc 또는 desc)
    sortDirection = (sortDirection === 'asc') ? 'desc' : 'asc';

    // 정렬 함수를 호출하여 테이블을 정렬 (가상의 정렬 함수 예시)
    const sortedData = sortData(columnIndex, sortDirection);

    // 정렬된 데이터를 사용하여 테이블 업데이트 (가상의 테이블 업데이트 함수 예시)
    renderTable(sortedData);
}
0
// 페이지를 변경하는 함수
function goToPage(pageNumber) { 
    // 페이지 번호 유효성 검사
    if (pageNumber < 1 || pageNumber > totalPages) {
        return;
    }

    // 현재 페이지 업데이트 및 테이블 업데이트
    currentPage = pageNumber;
    updateTable();
}

// 테이블 업데이트 함수
function updateTable() {
    // 가져온 데이터로 테이블 업데이트
    // 예: renderTable(data);

    // 페이지 번호 업데이트
    updatePagination();
}

// 페이지 번호 업데이트 함수
function updatePagination() {
    // 현재 페이지 및 전체 페이지 수 계산 (예: currentPage, totalPages)

    // 페이지네이션 컨트롤 업데이트
    const pagination = document.querySelector('.pagination');
    const prevButton = pagination.querySelector('.prev');
    const nextButton = pagination.querySelector('.next');
    const pageButtons = pagination.querySelectorAll('.page');

    pageButtons.forEach(pageButton => {
        const pageNumber = parseInt(pageButton.textContent);
        pageButton.classList.toggle('active', pageNumber === currentPage);
    });

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// 초기화 함수 호출
initializeTable();




/* -------------------------------------------------------------------------- */
/*                                  salesSearch                               */
/* -------------------------------------------------------------------------- */
// salesMain.js
function validateForm() {
    const saleId = document.getElementById("saleId").value;
    const vId = document.getElementById("vId").value;
    const cId = document.getElementById("cId").value;
    const cbizId = document.getElementById("cbizId").value;
    const bizId = document.getElementById("bizId").value;
    const dDateFrom = document.getElementById("dDateFrom").value;
    const dDateTo = document.getElementById("dDateTo").value;
    const SN = document.getElementById("SN").value;

    if (!saleId && !vId && !cId && !cbizId && !bizId && !dDateFrom && !dDateTo && !SN) {
        alert("한 개 이상의 값을 입력하세요");
        return false;
    }

    return true;
}

/* -------------------------------------------------------------------------- */
/*                               licenseMain 페이지                           */
/* --------------------------------------------------------------------------*/
 //'신규'버튼
function goToLicenseInsert(){
    window.location.href="licenseInsert.php";
}
//'검색'버튼
function goToLicenseSearch(){
    window.location.href="licenseSearch.php";
}

/* -------------------------------------------------------------------------- */
/*                              licenseInsert                                 */
/* -------------------------------------------------------------------------- */
function redirectToLicenseMain() {
    window.location.href = "licenseMain.php";
}


/* -------------------------------------------------------------------------- */
/*                          licenseInsert 페이지       유효성검사               */
/* -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    debugger;
    console.log("licenseInsert JS 도달!");
  
    document.getElementById('lcsInsertForm').addEventListener('submit', function(event) {
        console.log("licenseInsert form 제출");
        event.preventDefault(); 

        let SN = document.getElementById('SN').value;
        console.log('SN 값 : ', SN);
        let saleId = document.getElementById('saleId').value;
        console.log('saleId 값 : ', saleId);
        let price = document.getElementById('price').value;  
        let type = document.getElementById('type').value;  
        let errors = [];

        // 에러 메시지 초기화
        document.getElementById('error-saleId').textContent = '';
        document.getElementById('error-SN').textContent = '';
        document.getElementById('error-type').textContent = '';
        document.getElementById('error-price').textContent = '';

        if(!saleId) {
            console.log('saleId가 없음!');
            errors['saleId'] = "명세서번호(SALE_ID)를 입력해주세요.";
            document.getElementById('error-saleId').textContent = errors['saleId'];
        }

        if(type !== "무상" && !SN) {
            errors['SN'] = "유상일 경우 시리얼번호(SN)를 입력해주세요.";
            document.getElementById('error-SN').textContent = errors['SN'];
        }

        if(type === "유상" && price === "") {
            errors['price'] = "유상인 경우 금액을 입력해주세요.";
            document.getElementById('error-price').textContent = errors['price'];
        }

        if(Object.keys(errors).length) {
            console.log('에러 발생!', errors);
        } else {
            console.log("에러 없음");
            this.submit();
        }
    });
                                                                                                                                                                                                                                                                                          
});

/* -------------------------------------------------------------------------- */
/*                                licenseSearch                               */
/* -------------------------------------------------------------------------- */
// addFilter 함수를 전역 스코프로 이동
function addFilter(filterValue) {
    let filterButton = document.querySelector('.btn-filter[value="' + filterValue + '"]');
    
    // 버튼의 활성화 상태를 확인하고 변경
    if (filterButton.classList.contains('filter-active')) {
        filterButton.classList.remove('filter-active');

        // 만약 활성화 상태가 아니면 hidden input을 제거
        let existingInput = document.getElementById(filterValue);
        if (existingInput) {
            existingInput.remove();
        }
    } else {
        filterButton.classList.add('filter-active');

        // hidden input이 존재하지 않는다면 생성하여 추가
        if (!document.getElementById(filterValue)) {
            let inputElem = document.createElement('input');
            inputElem.setAttribute('type', 'hidden');
            inputElem.setAttribute('name', 'filters[]');
            inputElem.setAttribute('value', filterValue);
            inputElem.setAttribute('id', filterValue);
            document.getElementById('lcsSearchForm').appendChild(inputElem); 
        }
    }
}

/* -------------------------------------------------------------------------- */
/*                            LICENSEINSERT-WARRANTY                          */
/* -------------------------------------------------------------------------- */
function fetchWarranty(saleId, SN) {
    $.ajax({
        url: 'getWarranty.php',
        method: 'POST',
        data: {
            saleId: saleId,
            SN: SN
        },
        success: function(response) {
            // WARRANTY 값을 화면에 표시
            $("#warranty_years").val(response.warranty_years);
            $("#warranty_months").val(response.warranty_months);
        }
    });
}

/* -------------------------------------------------------------------------- */
/*                               deviceMain.php                               */
/* -------------------------------------------------------------------------- */
//'신규'버튼
function goToDeviceInsert(){
    window.location.href="deviceInsert.php";
}

/* -------------------------------------------------------------------------- */
/*                              deviceUpdate.php                              */
/* -------------------------------------------------------------------------- */
function redirectToDeviceMain() {
    window.location.href = 'deviceMain.php';
}


