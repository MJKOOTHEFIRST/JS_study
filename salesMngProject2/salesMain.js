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
function fetchDataForPage(pageNumber) {
    return $.ajax({
        url: 'salesMain.php', // 서버 측 스크립트 URL
        type: 'GET',
        data: {
            page: pageNumber // 요청할 페이지 번호
        }
    });
}

function goToPage(pageNumber) {
    fetchDataForPage(pageNumber).then(data => {
        // 여기에서 data를 사용하여 테이블 내용 업데이트
        // 예: updateTable(data);
        // 페이지네이션 UI 업데이트도 여기에서 수행
    }).fail(() => {
        console.error('페이지 데이터를 가져오는데 실패했습니다.');
    });
}

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


