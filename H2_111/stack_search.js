// stack_search.js 192.168.100.111
// GET 방식 - 작동 OK
console.log('stack_search.js 도달!')
import { moveFile } from './search_moveFile.js';

let currentSearchConditions = {};
let totalRowsFiltered = 0; //필터링 된 데이터의 총 수를 저장할 변수
let currentPage = 1;

const currentDate = new Date();
const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

// 페이지 로드 시 전체 데이터 불러오기
document.addEventListener('DOMContentLoaded', function () {
    searchWithData({}); // 초기 검색 조건 없이 호출하여 전체 데이터를 호출
    setupSelectAllCheckbox(); 
});

// 페이지 이동 함수
export function goToPage(pageNumber) {
    currentPage = pageNumber; //현재 페이지 번호 업데이트
    searchWithData(currentSearchConditions, pageNumber);
}

// 필터 검색 초기화 버튼
document.querySelector('#stack_reset_btn').addEventListener('click', function () {
    console.log('초기화 버튼 클릭 이벤트 발생');
    resetSearchConditions(); // 검색 조건 초기화 함수 호출
    //서버에 빈 검색 요청 전송
    searchWithData({});
    totalRowsFiltered = 0; //필터링 된 데이터의 총 수 초기화
});

// 검색 조건 초기화 함수
function resetSearchConditions() {
    // 입력 필드 초기화
    document.querySelectorAll('.search-condition').forEach(input => {
        input.value = ''; // 빈 문자열로 설정
    });

    // 라디오 버튼 초기화
    document.querySelectorAll('.search-condition[type="radio"]').forEach(radio => {
        radio.checked = false; // 선택 해제
    });

    // 라벨 입력 필드 초기화
    document.getElementById('input-label').value = '';

    // 현재 검색 조건 객체 초기화
    currentSearchConditions = {};

    // 서버에 빈 검색 요청 전송
    searchWithData({});
}


// 검색 버튼 이벤트 리스너 추가
document.querySelector('#stack_search_btn').addEventListener('click', function () {
    console.log('검색 버튼 클릭 이벤트 발생');

    // 검색 조건 수집 함수
    const getInputValue = (inputId) => {
        console.log(`입력 값 가져오기: ${inputId}`); // ID 로깅
        const inputElement = document.getElementById(inputId);
        if (!inputElement) {
            console.log(`Element not found for ID: ${inputId}`);
            return ''; // 빈 문자열 반환하거나, 적절한 기본값 설정
        }
        console.log(`Value for ${inputId}: ${inputElement.value}`); // 값 로깅
        return inputElement.value;
    };

    // 검색 조건 수집
    const searchConditions = {
        'H-M': { value: getInputValue('input-h-m'), condition: getSelectedCondition('a01') },
        'M-L': { value: getInputValue('input-m-l'), condition: getSelectedCondition('a02') },
        'X1': { value: getInputValue('input-x1'), condition: getSelectedCondition('a03') },
        'X2': { value: getInputValue('input-x2'), condition: getSelectedCondition('a04') },
        'Y1': { value: getInputValue('input-y1'), condition: getSelectedCondition('a05') },
        'Y2': { value: getInputValue('input-y2'), condition: getSelectedCondition('a06') },
        'M': { value: getInputValue('input-m'), condition: getSelectedCondition('a07') },
        'L': { value: getInputValue('input-l'), condition: getSelectedCondition('a08') },
        'SQ': { value: getInputValue('input-sq'), condition: getSelectedCondition('a09') },
        'BQ': { value: getInputValue('input-bq'), condition: getSelectedCondition('a10') },
        'LABEL': { value: getInputValue('input-label') }
    };

    // 빈 값 필터링
    Object.keys(searchConditions).forEach(key => {
        if (!searchConditions[key].value) {
            delete searchConditions[key];
        }
    });

    console.log('검색 조건:', searchConditions);

    // 서버에 검색 요청
    searchWithData(searchConditions);
});

// 선택된 조건을 반환하는 함수
function getSelectedCondition(name) {
    const over = document.getElementById(`o${name.substring(1)}`).checked;
    const under = document.getElementById(`u${name.substring(1)}`).checked;
    console.log(`조건 ${name}:`, over ? 'over' : (under ? 'under' : 'none'));
    return over ? 'over' : (under ? 'under' : '');
}

// 서버에 검색 조건을 전송하고 결과를 받아 테이블에 표시하는 함수 (GET 요청 사용) / 퀴리 문자열 생성
// encodeURIComponent 함수 : URL에서 사용할 수 있도록 문자열 인코딩
function searchWithData(conditions, page = 1) {
    // 이전 검색 조건과 페이지 정보 저장
    currentSearchConditions = conditions;

    let query = Object.keys(conditions).map(key => {
        if (key === 'LABEL') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(conditions[key].value)}`;
        } else {
            return `${encodeURIComponent(key)}=${encodeURIComponent(conditions[key].value)}&${encodeURIComponent(key + 'Condition')}=${encodeURIComponent(conditions[key].condition)}`;
        }
    }).join('&');

    // '전체 선택' 체크박스 상태 초기화
    const selectAllCheckbox = document.getElementById('search-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        console.log('전체 선택 체크박스 초기화됨');
    }


    // 페이지 정보 추가
    query += `&page=${page}`;

    const url = `/FDC/Proj/trunk/js/main/stack_search.php?${query}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function () {
        if (this.status === 200) {
            // console.log("서버로부터의 응답:", this.responseText);
            const response = JSON.parse(this.responseText);
            if (Array.isArray(response.data)) {
                totalRowsFiltered = response.totalRows; // 필터링 된 데이터의 총 수 업데이트
                console.log("전체 데이터 수 : ", response.totalRows); //데이터 수 로깅
                displayResults(response.data);
                displayPagination(totalRowsFiltered, page);
                // displayPagination(response.totalRows, page);

            } else {
                console.error('Results is not an array', response.data);
                // 여기에 배열이 아닐 경우의 처리 로직 추가
            }
        } else {
            console.error('서버응답 실패:', this.status);
        }
    };

    xhr.onerror = function () {
        // 네트워크 오류 등의 문제가 발생했을 때의 처리 로직
        console.error('Request failed');
    };

    console.log('요청된 Query:', query); //Query: H-M=65&H-MCondition=over 문제 없음
    xhr.send(); // 실제 요청을 서버로 보냄
}

// 결과를 표시하는 함수
export function displayResults(results) {
    const tbody = document.querySelector('#stack_search_table');
    tbody.innerHTML = ''; // 기존 내용을 비움

    if (Array.isArray(results)) { // results가 배열인지 확인
        results.forEach((row) => {
            const tr = document.createElement('tr');
            // 현재 페이지 번호를 데이터 속성으로 추가
            tr.setAttribute('data-page', currentPage);

            // 체크박스 생성 및 data-no 속성 설정
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'search-checkbox';
            checkbox.setAttribute('data-no', row.NO);

            const tdCheckbox = document.createElement('td');
            tdCheckbox.appendChild(checkbox);
            tr.appendChild(tdCheckbox);

            // 나머지 셀들을 추가
            tr.innerHTML += `
                <td>${row.DATE}</td>
                <td>${row['H-M']}</td>
                <td>${row['M-L']}</td>
                <td>${row.X1}</td>
                <td>${row.X2}</td>
                <td>${row.Y1}</td>
                <td>${row.Y2}</td>
                <td>${row.M}</td>
                <td>${row.L}</td>
                <td>${row.SQ}</td>
                <td>${row.BQ}</td>
                <td><input type="text" class="label-input" value="${row.LABEL}" data-id="${row.ID}" data-date="${row.DATE}"></td>
            `;

            tbody.appendChild(tr);
        });
    }
}

// 전체 선택 체크박스의 변경 이벤트 처리. 전체 선택/해제 + 파일이동
function handleSelectAllChange() {
    // 체크박스 처리 로직
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]');
    console.log(`전체 선택 체크박스 상태: ${this.checked}`); // 전체 선택 체크박스 상태 로깅
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = this.checked; // 'this'는 selectAllCheckbox
        console.log(`체크박스 ${checkbox.getAttribute('data-no')} 상태: ${checkbox.checked}`); // 각 체크박스 상태 로깅
        const no = checkbox.getAttribute('data-no');
        if (no) {
            console.log(`현재 페이지 전체 선택으로 이동할 파일 NO : ${no}`);
            moveFile(no); // search_moveFile.js 에서  import한 함수
        }
    });
}

// 페이지 로드 또는 페이지 변경 시 호출될 함수
function setupSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('search-all-checkbox');
    if (selectAllCheckbox) {
        // 기존 이벤트 리스너 제거
        selectAllCheckbox.removeEventListener('change', handleSelectAllChange);
        // 새 이벤트 리스너 등록
        selectAllCheckbox.addEventListener('change', handleSelectAllChange);
    }
}

// 라벨 입력 필드에 대한 엔터 키 이벤트 리스너 추가(엔터 치면 수정사항 저장되도록)
document.querySelectorAll('.label-input').forEach(input => {
    input.addEventListener('keypress', function (e) { // keypress: 키 눌렀을 때, keydown: 키 누르는 동안, keyup: 키에서 손 땔 때
        // console.log(e.currentTarget.dataset.date);
        if (e.key === 'Enter') {
            e.preventDefault(); // 폼 제출 방지
            updateLabel(e.currentTarget.dataset.date, e.currentTarget.value); // 데이터 업데이트 함수 호출
            e.currentTarget.blur(); // 입력 필드 포커스 제거
        }
    });
});

// 라벨 수정
function updateLabel(date, label) {
    // console.log(`date:${date}, label:${label}`);
    // 데이터를 쿼리 문자열로 변환
    const queryString = `date=${encodeURIComponent(date)}&label=${encodeURIComponent(label)}`;

    // fetch 요청 URL에 쿼리 문자열 추가
    fetch(`/FDC/Proj/trunk/js/main/stack_label_update.php?${queryString}`, {
        method: 'GET', // GET 요청 명시
        mode: 'no-cors', //CORS 정책 우회
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            }
            return response.json(); // 응답을 JSON으로 파싱
        })
        .then(data => {
            console.log('Success:', data);
            // 성공 메세지 표시 또는 페이지 새로고침 등의 후속 조치
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function displayPagination(totalRows, currentPage) {
    const perPage = 10; // 페이지 당 표시할 데이터 수
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


