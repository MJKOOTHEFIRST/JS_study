import { copyFilesForGraph } from './search_copyFile.js';

let itemsPerPage = 100; // 기본값
let currentSearchConditions = {};
let totalRowsFiltered = 0; //필터링 된 데이터의 총 수를 저장할 변수
export let currentPage = 1;
let currentPageContext = 'all'; // 'all', 'search', 'bookmark' (페이지 컨텍스트 추적 기능)
let currentBookmarkId = null; // 현재 활성화된 북마크 ID

const currentDate = new Date();
const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

let pickColors={};

////////////////////////////////////////////////////////////////////////////
// DOM 로딩 시 모든 이벤트 리스너를 설정하고 "항목 삭제" 버튼 상태를 초기화하는 함수 호출
document.addEventListener('DOMContentLoaded', function () {

    // 초기화 함수 호출
    loadColorMap().then(() => {
        // 기타 초기화 및 이벤트 리스너 설정
        const chkbox = document.querySelectorAll('.tab-list input[type=checkbox]');
        const dbEdit = document.querySelectorAll('.tab-list a.db-edit');
        const dbEditValue = document.querySelectorAll('.tab-list a.db-edit span');
        const dbEditActive = document.querySelectorAll('.tab-list div.db-edit');
        const dbEditInput = document.querySelectorAll('.tab-list div.db-edit input');
        const dbEditSelect = document.querySelectorAll('.tab-list div.db-edit select');

        dbEdit.forEach((e, i) => e.addEventListener('dblclick', function () {
            chkbox.forEach(e => { e.disabled = true; });
            dbEdit[i].classList.toggle('d-none');
            dbEditActive[i].classList.toggle('d-none');
            dbEditInput[i].value = dbEditValue[i].innerText;
            const colorValue = dbEditSelect[i].value;
            dbEditSelect[i].style.color = getColorCode(colorValue);
            dbEditInput[i].focus();
        }));

        dbEditInput.forEach((input, i) => input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                dbEditValue[i].innerText = dbEditInput[i].value;
                updateBookmark(
                    dbEdit[i].parentElement.getAttribute('data-bookmark-id'), // ID를 가져오는 방법 변경
                    dbEditInput[i].value,
                    dbEditSelect[i].value
                );
                dbEdit[i].classList.toggle('d-none');
                dbEditActive[i].classList.toggle('d-none');
                chkbox.forEach(e => { e.disabled = false; });
            }
        }));

        dbEditSelect.forEach((select, i) => select.addEventListener('change', function () {
            const selectedColorCode = getColorCode(select.value);
            select.style.color = selectedColorCode;
            updateBookmark(
                dbEdit[i].parentElement.getAttribute('data-bookmark-id'), // ID를 가져오는 방법 변경
                dbEditInput[i].value,
                select.value
            );
        }));
    });

    // DOM 요소 초기화
    const tbody = document.querySelector('#stack_search_table');
    const graphButton = document.getElementById('graph-btn');
    const bookmarkButton = document.getElementById('bookmark-btn');
    let checkboxes = document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]');
    const addButton = document.getElementById('add-bmk-btn');
    const stackDataMngHeadElement = document.getElementById('stack-data-mng-head');
    const bookmarkTabContainer = document.getElementById('bookmark-tab');
    const deleteButton = document.getElementById('delete-db-in-bmk');

   
    // 초기 '항목삭제' 버튼 상태 업데이트
    // updateDeleteButtonState();
    // console.log('초기 로드시 updateDeleteButtonState 호출 완료');

    // '스택 데이터 관리' 클릭 시 '항목 삭제' 버튼 상태 업데이트 이벤트 리스너
    if (stackDataMngHeadElement) {
        stackDataMngHeadElement.addEventListener('click', function () {
            console.log("스택 데이터 관리 클릭시 updateDeleteButtonState 호출");
            // updateDeleteButtonState();
        });
    }

    // 탭 클릭 시 '항목 삭제' 버튼 상태 업데이트하는 "이벤트 위임" 설정
    if (bookmarkTabContainer) {
        bookmarkTabContainer.addEventListener('click', function (event) {
            const target = event.target.closest('a');
            if (target && target.classList.contains('tab-item')) {
                console.log('탭 클릭 시 updateDeleteButtonState 호출');
                document.querySelectorAll('.tab-item a').forEach(tab => tab.classList.remove('active'));
                target.classList.add('active');
                // updateDeleteButtonState();
            }
        });
    }

    // 이벤트 리스너 설정
    if (tbody) {
        tbody.addEventListener('change', function (event) {
            if (event.target.type === 'checkbox' && event.target.name === 'search-checkbox') {
                updateSelectedCount();
                // console.log('체크박스 상태 변경됨');
            }
        });
    }

    if (graphButton) {
        graphButton.addEventListener('click', copySelectedFiles);
    }

    if (bookmarkButton) {
        bookmarkButton.addEventListener('click', function () {
            checkboxes = document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]:checked');
            const allItemsTab = document.querySelector('.all-item-tab.active');

            // 체크박스가 선택되었는지 확인
            if (checkboxes.length === 0) {
                alert('하나 이상의 데이터를 선택해주세요.');
                return;
            }

            // 전체항목 탭이 활성화되어 있는지 확인
            if (!allItemsTab) {
                alert('전체항목에서 선택해주세요.');
                return;
            }

            // 모달을 열기 전에 북마크 목록을 로드
            toggleModal('manage-tab-modal');

            // 모달의 제목을 변경
            document.querySelector('#manage-tab-modal .modal-title').textContent = '데이터 등록';

            // .add-tab-row 요소 숨기기
            document.querySelector('#manage-tab-modal .add-tab-row').style.display = 'none';

            // .db-edit 요소 숨기기
            const dbEditElements = document.querySelectorAll('#manage-tab-modal .db-edit');
            dbEditElements.forEach(element => {
                element.style.display = 'none';
            });

            //tab-list-checkbox 숨기기
            const tabListCheckboxes = document.querySelectorAll('#manage-tab-modal input[name="tab-list-checkbox"]');
            tabListCheckboxes.forEach(checkbox => {
                checkbox.style.display = 'none';
            });

            // 삭제 버튼 숨기기
            document.querySelector('#manage-tab-modal .delete-bmk').style.display = 'none';

            // a 링크 클릭 이벤트 리스너 추가
            const bookmarkLinks = document.querySelectorAll('#manage-tab-modal a');
            bookmarkLinks.forEach(link => {
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    const tr = this.closest('tr');
                    const bookmarkId = tr.getAttribute('data-bookmark-id');
                    const bookmarkName = tr.getAttribute('data-bookmark-name');
                    console.log("bookmark Id, bookmarkName:", bookmarkId, bookmarkName);

                    // 선택된 체크박스 데이터 전송
                    const selectedData = Array.from(checkboxes).map(checkbox => ({
                        no: checkbox.getAttribute('data-no'),
                        bookmarkId: bookmarkId
                    }));

                    // saveBookmarkData(selectedData, bookmarkId);
                    saveMultipleBookmarkData(selectedData);

                    // 모달 닫기
                    toggleModal('manage-tab-modal');

                    // 탭 이동 및 데이터 필터링
                    filterDataByBookmark(bookmarkId);

                    // 북마크 탭에 active 클래스 추가
                    const tabItem = document.querySelector(`.tab-item a[data-bookmark-id="${bookmarkId}"]`);
                    if (tabItem) {
                        document.querySelectorAll('.tab-item a').forEach(tab => tab.classList.remove('active'));
                        tabItem.classList.add('active');
                    }
                });
            });
        });
    }

    // all-item-tab 클릭 시 전체 데이터를 다시 로드하는 이벤트 리스너 추가
    const allItemsTab = document.querySelector('.all-item-tab');
    if (allItemsTab) {
        allItemsTab.addEventListener('click', function (event) {
            event.preventDefault();
            console.log('전체항목 탭 클릭됨');
            document.querySelectorAll('.tab-item a').forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            searchWithData({}); // 전체 데이터를 다시 로드
        });
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
        // console.log('updateSelectedCount 이벤트 리스너 추가됨');
    });

    if (addButton) {
        addButton.addEventListener('click', function () {
            const bookmarkName = document.getElementById('new-tag-name').value; // 북마크 이름을 입력 필드에서 가져옴
            if (bookmarkName) {
                addBookmark(bookmarkName);
            } else {
                alert('북마크 이름을 입력해주세요.');
            }
        });
    } else {
        console.error('북마크 추가 버튼 작동 에러');
    }
    //////////////////////////////////////////////////////////
    // 페이지 당 데이터 수 선택 콤보박스 이벤트 리스너
    const itemsPerPageSelect = document.getElementById('items-per-page');
    itemsPerPageSelect.addEventListener('change', function () {
        itemsPerPage = this.value === 'all-data' ? 'all-data' : parseInt(this.value); // 'all-data'로 설정
        goToPage(1); // 첫 페이지로 이동하여 데이터 로드
    });
    //////////////////////////////////////////////////////////

    // 데이터 로드 및 기타 초기화
    searchWithData({});
    setupSelectAllCheckbox();
    updateSelectedCount();
    // updateDeleteButtonState(); // 전체 항목에 해당될 시에는 '항목 삭제' 버튼 상태 업데이트

    // 북마크 관련 초기화
    getBookmarkTabs();
    getTabList();
});

// 컬러
//////////////////////////////////////////////////////////////////////////
// 색상 맵을 로드하는 함수
 async function loadColorMap() {
    return fetch('/FDC/Proj/mjkoo/js/main/color_map.php') // 경로 확인
        .then(response => response.json())
        .then(data => {
            pickColors = data;
            initializeColorPickers(); // 색상 맵이 로드된 후 초기화 함수 호출
        })
        .catch(error => {
            console.error('Error loading color map:', error);
        });
}

// 초기 색상 설정 스크립트
function initializeColorPickers() {
    const colorPickers = document.querySelectorAll('.color-pick');
    colorPickers.forEach(picker => {
        const selectedColorId = picker.value;
        picker.innerHTML = generateColorOptions(selectedColorId);
        picker.style.color = getColorCode(selectedColorId);

        picker.addEventListener('change', function () {
            const selectedColorCode = getColorCode(this.value);
            this.style.color = selectedColorCode;

            // hidden-color 값 설정
            const hiddenColorInput = document.getElementById('hidden-color');
            hiddenColorInput.value = this.value === 'color-null' ? 'null' : selectedColorCode;

            const closestTr = picker.closest('tr'); // tr 요소를 찾음
            if (closestTr) {
                const bookmarkId = closestTr.getAttribute('data-bookmark-id'); // data-bookmark-id 속성 가져오기
                const inputElement = closestTr.querySelector('input[type="text"]'); // input 요소 찾기

                if (inputElement) {
                    const inputValue = inputElement.value; // input 값 가져오기
                    updateBookmark(bookmarkId, inputValue, this.value); // updateBookmark 함수 호출
                } else {
                    console.error('Input element not found within tr');
                }
            } else {
                console.error('tr element not found for picker', picker);
            }
        });
        // 초기 값 설정
        const hiddenColorInput = document.getElementById('hidden-color');
        hiddenColorInput.value = selectedColorId === 'color-null' ? 'null' : getColorCode(selectedColorId);
    });
}

function getColorCode(colorId) {
    if (colorId === 'color-null') {
        return '#EEEEEE'; // 'color-null'일 때 null 반환
    }
    return pickColors[colorId] || '#6699CC'; // 기본색상 지정
}

function generateColorOptions(selectedColorId) {
    let optionsHtml = '';
    for (const [colorId, colorCode] of Object.entries(pickColors)) {
        const selectedAttribute = colorId === selectedColorId ? ' selected' : '';
        const colorStyle = colorId === 'color-null' ? 'color: #F6F5F2;' : `color: ${colorCode};`; // 'color-null'일 때 색상 설정
        optionsHtml += `<option value="${colorId}" style="${colorStyle}"${selectedAttribute}>▉ <!--${colorId}--></option>`;
    }
    return optionsHtml;
}

// 색상 식별자를 클래스 이름으로 변환하는 함수
function getColorClass(colorId) {
    const colorClassMap = {
        'color-null': 'tab-color-null',
        'color00': 'tab-color-00',
        'color01': 'tab-color-01',
        'color02': 'tab-color-02',
        'color03': 'tab-color-03',
        'color04': 'tab-color-04',
        'color05': 'tab-color-05',
        'color06': 'tab-color-06',
        'color07': 'tab-color-07',
        'color08': 'tab-color-08',
        'color09': 'tab-color-09',
        'color10': 'tab-color-10',
        'color11': 'tab-color-11',
        'color12': 'tab-color-12',
        'color13': 'tab-color-13',
        'color14': 'tab-color-14',
        'color15': 'tab-color-15',
        'color16': 'tab-color-16',
        'color17': 'tab-color-17',
        'color18': 'tab-color-18',
        'color19': 'tab-color-19',
        'color20': 'tab-color-20',
        'color21': 'tab-color-21'
    };
    return colorClassMap[colorId] || 'tab-color-null';
}
////////////////////////////////////////////////////////////////////////////
// "항목 삭제" 버튼 상태를 업데이트하는 함수
/*
function updateDeleteButtonState() {
    const activeTab = document.querySelector('.tab-item a.active');
    const stackDataMngHead = document.getElementById('stack-data-mng-head');
    const deleteButton = document.getElementById('delete-db-in-bmk');

    if (
        (activeTab && activeTab.classList.contains('all-item-tab')) ||
        (stackDataMngHead && stackDataMngHead.classList.contains('bold'))
    ) {
        deleteButton.disabled = true; // 전체 항목 탭 또는 스택 데이터 관리 활성화 시 삭제 버튼 비활성화
        console.log("삭제 버튼 비활성화됨");
    } else {
        deleteButton.disabled = false; // 그 외의 경우 버튼 활성화
        console.log("삭제 버튼 활성화됨");
    }
}
*/


////////////////////////////////////////////////////////////////////////////
document.getElementById('stack-data-mng-head').addEventListener('click', function () {
    // console.log('스택 데이터 관리 헤더 클릭');
    resetSearchConditions(); // 검색 조건 초기화 함수 호출
    searchWithData({});
    totalRowsFiltered = 0; //필터링 된 데이터의 총 수 초기화

    // 모든 탭에서 'active' 클래스 제거
    document.querySelectorAll('.tab-item a').forEach(tab => {
        tab.classList.remove('active');
    });

    // '전체항목' 탭에만 'active' 클래스 추가
    const allItemsTab = document.querySelector('.all-item-tab');
    if (allItemsTab) {
        allItemsTab.classList.add('active');
    }
});
// 필터 검색 초기화 버튼
document.querySelectorAll('.search_reset').forEach(button => {
    button.addEventListener('click', function () {
        console.log('초기화 버튼 클릭 이벤트 발생');
        resetSearchConditions(); // 검색 조건 초기화 함수 호출
        // searchWithData({});//서버에 빈 검색 요청 전송
        // totalRowsFiltered = 0; //필터링 된 데이터의 총 수 초기화
    });
});

// 검색 조건 초기화 함수
export function resetSearchConditions() {
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

    // 전체선택 체크박스 초기화
    document.getElementById('search-all-checkbox').checked = false;

    // 현재 컨텍스트에 따른 초기화 동작
    if (currentPageContext === 'all') {
        // 전체 데이터 초기화
        searchWithData({});
        document.getElementById('stack-data-mng-head').classList.add('bold');
    } else if (currentPageContext === 'bookmark') {
        // 북마크 내 데이터 초기화
        filterDataByBookmark(currentBookmarkId, 1, {});
        document.querySelector(`.tab-item a[data-bookmark-id="${currentBookmarkId}"]`).classList.add('active');
    }

    // 버튼의 active 클래스 모두 제거 후, 필요한 요소에 active 클래스 추가
    document.querySelectorAll('.tag-selector.active').forEach(button => {
        button.classList.remove('active');
    });
}

// 검색 버튼 이벤트 리스너 추가
document.querySelectorAll('.stk-sch-btn').forEach(button => {
    button.addEventListener('click', function () {
        console.log('검색 버튼 클릭 이벤트 발생');

        // 검색 조건 수집 함수
        const getInputValue = (inputId) => {
            const inputElement = document.getElementById(inputId);
            if (!inputElement) {
                console.log(`Element not found for ID: ${inputId}`);
                return ''; // 빈 문자열 반환하거나, 적절한 기본값 설정
            }

            const value = inputElement.value.trim(); // 입력값에서 앞뒤 공백 제거
            if (value) { // 값이 있는 경우에만 로깅
                console.log(`입력 값 가져오기: ${inputId}`);
                console.log(`Value for ${inputId}: ${value}`);
            }
            return value;
        };

        // 시작 날짜와 종료 날짜 수집
        const startDate = getInputValue('start-date');
        const endDate = getInputValue('end-date');

        console.log(`시작일: ${startDate}`);
        console.log(`종료일: ${endDate}`);

        // 날짜 유효성 검사
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert('시작 날짜가 종료 날짜보다 뒤에 있습니다.');
            return;
        }

        // 검색 조건 수집
        const searchConditions = {
            'start-date': startDate, // 시작 날짜 수집
            'end-date': endDate, // 종료 날짜 수집
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
            // 값이 객체인 경우 .value를 확인하고, 그렇지 않은 경우 값을 직접 확인
            if (typeof searchConditions[key] === 'object' && searchConditions[key] !== null) {
                if (!searchConditions[key].value) {
                    delete searchConditions[key];
                }
            } else {
                // 값이 단순 데이터 타입인 경우 (예: 문자열), 값 자체를 확인
                if (!searchConditions[key]) {
                    delete searchConditions[key];
                }
            }
        });

        console.log('검색 조건:', searchConditions);

        // 서버에 검색 요청
        if (currentPageContext === 'bookmark') {
            filterDataByBookmark(currentBookmarkId, 1, searchConditions);
        } else {
            searchWithData(searchConditions);
        }
    });
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
export function searchWithData(conditions, page = 1) {
    currentPageContext = 'search'; // 검색 조건 필터링 컨텍스트 설정
    currentSearchConditions = conditions;

    let query = Object.keys(conditions).map(key => {
        if (key === 'LABEL') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(conditions[key].value)}`;
        } else if (key === 'start-date' || key === 'end-date') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(conditions[key])}`;
        } else {
            return `${encodeURIComponent(key)}=${encodeURIComponent(conditions[key].value)}&${encodeURIComponent(key + 'Condition')}=${encodeURIComponent(conditions[key].condition)}`;
        }
    }).join('&');

    query += `&page=${page}&perPage=${itemsPerPage}`;
    const url = `/FDC/Proj/mjkoo/js/main/stack_search2.php?${query}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
        if (this.status === 200) {
            const response = JSON.parse(this.responseText);
            if (Array.isArray(response.data)) {
                totalRowsFiltered = response.totalRows;
                displayResults(response.data, page, totalRowsFiltered);
                displayPagination(totalRowsFiltered, page);
            } else {
                console.error('Results is not an array', response.data);
            }
        } else {
            console.error('서버응답 실패:', this.status);
        }
    };
    xhr.onerror = function () {
        console.error('Request failed');
    };
    console.log('요청된 Query:', query);
    xhr.send();
}

// 북마크 아닌 전체 데이터에서 결과를 표시하는 함수
export function displayResults(results, currentPage, totalRowsFiltered) {
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
        // 전체 데이터 수를 HTML에 업데이트 
        const countSelectedDiv = document.getElementById('count-selected');
        if (countSelectedDiv) {
            countSelectedDiv.textContent = `전체 갯수 | ${totalRowsFiltered} `;
        }
    }
}

// 전체 선택 체크박스의 변경 이벤트 처리. 전체 선택/해제 로직만 수행
function handleSelectAllChange() {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]');
    // console.log(`전체 선택 체크박스 상태: ${this.checked}`); // 전체 선택 체크박스 상태 로깅
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = this.checked; // 'this'는 selectAllCheckbox
        // console.log(`체크박스 ${checkbox.getAttribute('data-no')} 상태: ${checkbox.checked}`); // 각 체크박스 상태 로깅
    });

    // 모든 체크박스 상태 변경 후 선택된 항목의 개수 업데이트
    updateSelectedCount();
}

// 버튼 클릭 이벤트 처리. 파일 복사 로직 수행
function copySelectedFiles() {
    console.log('Starting copySelectedFiles function'); // 함수 진입 로깅

    fetch('/FDC/Proj/trunk/js/main/delete_files_in_selected.php')
        .then(response => {
            console.log('delete_files_in_selected.php response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Data from delete_files_in_selected.php:', data);
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]:checked');
            const hiddenColorInput = document.querySelector('#hidden-color').value;
            console.log('Selected color:', hiddenColorInput); // 색상 코드 로깅

            checkboxes.forEach(checkbox => {
                const no = checkbox.getAttribute('data-no');
                console.log(`Copying file for NO: ${no}`); // 복사할 파일 번호 로깅
                copyFilesForGraph(no, hiddenColorInput);
            });
        })
        .catch(error => {
            console.error('Error during delete_files_in_selected.php fetch:', error);
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

    const graphButton = document.getElementById('graph-btn');
    if (graphButton) {
        graphButton.addEventListener('click', function () {
            console.log('Graph button clicked'); // 클릭 이벤트 로깅
            copySelectedFiles();
        });
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
    fetch(`/FDC/Proj/mjkoo/js/main/stack_label_update.php?${queryString}`, {
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

//////////////////////////////////////////////////////////////////////////////
// 페이지네이션
export function displayPagination(totalRows, currentPage, bookmarkId = null) {
    const totalPages = Math.ceil(totalRows / itemsPerPage);
    const paginationContainer = document.getElementById('stack-search-pagination');
    paginationContainer.innerHTML = ''; // 기존 페이지네이션 초기화

    const maxPageVisible = 10; // 한 번에 표시할 최대 페이지 수
    let startPage = Math.max(currentPage - Math.floor(maxPageVisible / 2), 1);
    let endPage = Math.min(startPage + maxPageVisible - 1, totalPages);

    if (endPage - startPage + 1 < maxPageVisible) {
        startPage = Math.max(endPage - maxPageVisible + 1, 1);
    }

    // 항상 '<<' 버튼을 표시하되, 첫 페이지인 경우 비활성화합니다.
    paginationContainer.appendChild(createPageItem(1, '<<', currentPage > 1, bookmarkId));

    // 항상 '<' 버튼을 표시하되, 첫 페이지인 경우 비활성화합니다.
    paginationContainer.appendChild(createPageItem(Math.max(1, currentPage - 1), '<', currentPage > 1, bookmarkId));

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPageItem(i, i.toString(), currentPage !== i, bookmarkId));
    }

    // 항상 '>' 버튼을 표시하되, 마지막 페이지인 경우 비활성화합니다.
    paginationContainer.appendChild(createPageItem(Math.min(totalPages, currentPage + 1), '>', currentPage < totalPages, bookmarkId));

    // 항상 '>>' 버튼을 표시하되, 마지막 페이지인 경우 비활성화합니다.
    paginationContainer.appendChild(createPageItem(totalPages, '>>', currentPage < totalPages, bookmarkId));
}

function createPageItem(pageNumber, text, clickable, bookmarkId = null) {
    const pageItem = document.createElement('li');
    pageItem.classList.add('page-item'); // 모든 페이지 아이템에 'page-item' 클래스 추가

    const pageLink = document.createElement('a');
    pageLink.classList.add('page-link'); // 모든 페이지 링크에 'page-link' 클래스 추가
    pageLink.textContent = text;
    pageLink.href = '#'; // 클릭 이벤트를 처리하고 기본 동작을 방지하기 위해 링크 해시 설정

    if (clickable) {
        pageLink.addEventListener('click', function (event) {
            event.preventDefault();
            goToPage(pageNumber, bookmarkId); // 페이지 이동 함수 호출
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

// 페이지 이동 함수
export function goToPage(pageNumber, bookmarkId = null) {
    currentPage = pageNumber; // 현재 페이지 번호 업데이트

    const params = new URLSearchParams({
        page: currentPage,
        perPage: itemsPerPage // 여기서 itemsPerPage 값을 서버로 전송
    });

    let url = '/your-endpoint?';

    if (currentPageContext === 'all') {
        url += `context=all&${params.toString()}`;
        searchWithData(currentSearchConditions, pageNumber);
    } else if (currentPageContext === 'search') {
        url += `context=search&${params.toString()}`;
        searchWithData(currentSearchConditions, pageNumber);
    } else if (currentPageContext === 'bookmark') {
        url += `context=bookmark&bookmarkId=${bookmarkId || currentBookmarkId}&${params.toString()}`;
        filterDataByBookmark(bookmarkId || currentBookmarkId, pageNumber);
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);
            // 데이터를 UI에 반영하는 로직 추가
            if (currentPageContext === 'all' || currentPageContext === 'search') {
                displayResults(data.data, currentPage, data.totalRows);
            } else if (currentPageContext === 'bookmark') {
                displayBookmarkResults(data.data, data.totalRows);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}



////////////////////////////////////////////////////////////////////////////////////////
// 항목 관리 버튼(상단의 '+' 기호) 추가하는 함수
function addPlusButton(bookmarkList) {
    var plusListItem = document.createElement('li');
    plusListItem.innerHTML = '<a class="plus" title="항목관리" onclick="toggleModal()">+</a>';
    plusListItem.classList.add('bmk-list-mng-plus-btn');
    bookmarkList.appendChild(plusListItem);
}

// 서버에 북마크를 추가하는 함수
function addBookmark(bookmarkName) {
    const colorPicker = document.querySelector('.color-pick');
    let colorValue = colorPicker.options[colorPicker.selectedIndex].value;

    if (!colorValue) {
        colorValue = 'color03'; // 기본 색상 식별자
    }

    fetch('/FDC/Proj/mjkoo/js/main/add_bookmark.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `bookmark=${encodeURIComponent(bookmarkName)}&color=${encodeURIComponent(colorValue)}`
    })
        .then(response => response.json())  // 응답을 JSON으로 받습니다.
        .then(data => {
            // 성공적으로 처리되었을 때 페이지 새로고침
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            // 오류 발생 시에도 페이지 새로고침
            location.reload();
        });
}


// 탭관리
// 서버에서 북마크 목록을 가져와서 목록 표시(왼쪽 상단 +인 '탭 관리' 버튼)
function getTabList() {
    fetch('/FDC/Proj/mjkoo/js/main/get_bookmark.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tabList = document.querySelector('.table.tab-list tbody');
            tabList.innerHTML = '';
            data.forEach((bookmark) => {
                const colorClass = getColorClass(bookmark.colorId);
                const tr = document.createElement('tr');
                tr.setAttribute('data-bookmark-id', bookmark.id);
                tr.setAttribute('data-bookmark-name', bookmark.name);
                tr.setAttribute('data-bookmark-colorid', bookmark.colorId);
                tr.innerHTML = `
                    <td><input type="checkbox" name="tab-list-checkbox" id="checkbox-${bookmark.id}"></td>
                    <td>
                        <div class="db-edit" style="display: none;">
                            <select class="color-pick scrollmini" id="tab-color-edit-${bookmark.id}">
                                ${generateColorOptions(bookmark.colorId)}
                            </select>
                            <input type="text" value="${bookmark.name}">
                        </div>
                        <a href="#" class="${colorClass}"><span>${bookmark.name}</span></a>
                    </td>
                `;
                tabList.appendChild(tr);

                const aTag = tr.querySelector('a');
                const dbEditDiv = tr.querySelector('.db-edit');
                aTag.addEventListener('dblclick', function () {
                    aTag.style.display = 'none';
                    dbEditDiv.style.display = 'block';
                    dbEditDiv.querySelector('input').focus();
                });

                const inputField = dbEditDiv.querySelector('input');
                inputField.addEventListener('keypress', function (event) {
                    if (event.key === 'Enter') {
                        aTag.querySelector('span').textContent = inputField.value;
                        aTag.style.display = 'block';
                        dbEditDiv.style.display = 'none';
                        updateBookmark(bookmark.id, inputField.value, colorSelect.value);
                    }
                });

                const colorSelect = dbEditDiv.querySelector('.color-pick');
                colorSelect.addEventListener('change', function () {
                    const selectedColor = colorSelect.value;
                    colorSelect.style.color = getColorCode(selectedColor);
                    aTag.style.color = getColorCode(selectedColor);
                    updateBookmark(bookmark.id, inputField.value, selectedColor);
                });
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

let colorMap = {};

// 상단 북마크 탭 불러오는 함수(북마크 탭 관련 초기화)
function getBookmarkTabs() {
    fetch('/FDC/Proj/mjkoo/js/main/get_bookmark.php')
        .then(response => response.json())
        .then(data => {
            // console.log("loaded bookmark data:", data);
            var bookmarkList = document.getElementById('bookmark-tab').querySelector('ul');
            bookmarkList.innerHTML = ''; // 기존 목록 초기화

            // "추가" 버튼 추가
            addPlusButton(bookmarkList);

            // "전체항목" 탭 추가
            var allItemsTab = document.createElement('li');
            allItemsTab.classList.add('tab-item');
            allItemsTab.innerHTML = `<a class="tab-color-01 all-item-tab">전체항목</a>`;
            bookmarkList.appendChild(allItemsTab);

            // '전체항목' 탭에 active 클래스 추가
            allItemsTab.querySelector('a').classList.add('active');

            // '전체항목' 탭 클릭 이벤트 리스너 추가
            allItemsTab.querySelector('a').addEventListener('click', function () {
                console.log('전체항목 클릭 이벤트 발생');
                resetSearchConditions(); // 검색 조건 초기화 함수 호출
                searchWithData({}); // 서버에 빈 검색 요청 전송
                totalRowsFiltered = 0; //필터링 된 데이터 총 수 초기화

                // bold 스타일을 가진 클래스 추가
                document.getElementById('stack-data-mng-head').classList.add('bold');

                //다른 tab-item 요소에서 active 클래스 제거
                document.querySelectorAll('.tab-item a').forEach(tab => {
                    tab.classList.remove('active')
                });

                // 현재 클릭된 탭에 active 클래스 추가
                this.classList.add('active');

                // "항목 삭제" 버튼 상태 업데이트
                // updateDeleteButtonState();
            });

            // 불러온 데이터 추가
            data.forEach(bookmark => {
                var newTabItem = document.createElement('li');
                newTabItem.classList.add('tab-item');
                var colorClass = getColorClass(bookmark.colorId);
                newTabItem.innerHTML = `<a class="${colorClass}" data-bookmark-id="${bookmark.id}">${bookmark.name}</a>`;
                bookmarkList.appendChild(newTabItem);
            });
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

// 이벤트 위임을 사용하여 탭 클릭 이벤트 핸들러 설정(상단 탭)
document.getElementById('bookmark-tab').addEventListener('click', function (event) {
    const target = event.target.closest('a');
    if (target) {
        document.querySelectorAll('.tab-item a').forEach(tab => tab.classList.remove('active'));
        target.classList.add('active');

        // 항목관리 하는 + 버튼 클릭 확인
        if (target.parentElement.classList.contains('bmk-list-mng-plus-btn')) {
            console.log('추가 버튼 클릭');
            toggleModal();
            return; // 데이터 조회 로직 실행 안함
        }

        // 전체항목 탭을 클릭했는지 확인
        if (target.classList.contains('all-item-tab')) {
            console.log('전체항목 탭 클릭');
            resetSearchConditions(); // 검색 조건 초기화
            searchWithData({}); // 전체 데이터 검색
            return; // 이후 로직을 실행하지 않음
        }

        // 다른 북마크 탭을 클릭했을 경우
        const bookmarkId = target.dataset.bookmarkId;
        if (bookmarkId) {
            console.log("Clicked bookmark ID:", bookmarkId);
            filterDataByBookmark(bookmarkId);
        } else {
            console.error('Bookmark ID not found');
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }
});

// 북마크 데이터를 검색하고 표시하는 함수
export function filterBookmarkData(conditions, page = 1, searchConditions = {}) {
    currentPageContext = 'bookmark';  // 북마크 필터링 컨텍스트 설정 
    let query = Object.keys(conditions).map(key => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(searchConditions[key])}`;
    }).join('&');

    query += `&page=${page}`;
    const url = `/FDC/Proj/mjkoo/js/main/filter_bookmark.php?${query}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
        if (this.status === 200) {
            const response = JSON.parse(this.responseText);
            if (Array.isArray(response.data)) {
                displayBookmarkResults(response.data);
                displayPagination(response.totalRows, page);
            } else {
                console.error('Expected data to be an array, received:', response.data);
            }
        } else {
            console.error('Server response failed:', this.status);
        }
    };
    xhr.onerror = function () {
        console.error('Request failed');
    };
    console.log('Requested Query for Bookmarks:', query);
    xhr.send();
}

// 북마크 데이터를 필터링하고 표시하는 함수
function filterDataByBookmark(bookmarkId, page = 1, searchConditions = {}) {
    currentPageContext = 'bookmark'; // 북마크 필터링 컨텍스트 설정
    currentBookmarkId = bookmarkId;

    let query = Object.keys(searchConditions).map(key => {
        if (key === 'LABEL') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(searchConditions[key].value)}`;
        } else if (key === 'start-date' || key === 'end-date') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(searchConditions[key])}`;
        } else {
            return `${encodeURIComponent(key)}=${encodeURIComponent(searchConditions[key].value)}&${encodeURIComponent(key + 'Condition')}=${encodeURIComponent(searchConditions[key].condition)}`;
        }
    }).join('&');

    const perPage = itemsPerPage === 'all-data' ? totalRows : itemsPerPage;
    query += `&page=${page}&bookmarkId=${bookmarkId}&perPage=${perPage}`;
    const timestamp = new Date().getTime();
    query += `&t=${timestamp}`;

    fetch(`/FDC/Proj/mjkoo/js/main/filter_bookmark.php?${query}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data received for bookmark ID :", bookmarkId, data);
            if (data.data) {
                displayBookmarkResults(data.data, data.total);
                displayPagination(data.total, page, bookmarkId); // 페이지네이션 표시
            } else {
                console.error("Expected data to be an array, received:", data.data);
                displayBookmarkResults([], 0); // 빈 배열 전달
            }
        })
        .catch(error => {
            console.error('Error fetching filtered data:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        });
}


// 필터링된 데이터를 화면에 표시하는 함수
function displayBookmarkResults(data, totalRows) {
    console.log("displayBookmarkResults 호출됨, 데이터:", data); // 데이터 로깅 추가

    const tbody = document.querySelector('#stack_search_table');
    if (!tbody) {
        console.error('Table body not found');
        return; // tbody가 없으면 함수를 종료
    }

    tbody.innerHTML = ''; // 기존 내용을 비움

    if (Array.isArray(data) && data.length > 0) {
        data.forEach((row) => {
            // console.log("처리중인 행:", row);
            const tr = document.createElement('tr');

            // 체크박스 추가
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'search-checkbox';
            checkbox.setAttribute('data-no', row.sch_id); // 변경된 필드 이름 사용

            const tdCheckbox = document.createElement('td');
            tdCheckbox.appendChild(checkbox);
            tr.appendChild(tdCheckbox);

            // 나머지 셀들을 추가
            tr.innerHTML += `
                <td>${row.DATE || ''}</td>
                <td>${row['H-M'] || ''}</td>
                <td>${row['M-L'] || ''}</td>
                <td>${row.X1 || ''}</td>
                <td>${row.X2 || ''}</td>
                <td>${row.Y1 || ''}</td>
                <td>${row.Y2 || ''}</td>
                <td>${row.M || ''}</td>
                <td>${row.L || ''}</td>
                <td>${row.SQ || ''}</td>
                <td>${row.BQ || ''}</td>
                <td><input type="text" class="label-input" value="${row.LABEL || ''}"></td>
            `;
            tbody.appendChild(tr);
        });

        // 전체 데이터 수를 HTML에 업데이트
        const countSelectedDiv = document.getElementById('count-selected');
        if (countSelectedDiv) {
            countSelectedDiv.textContent = `전체 갯수 | ${totalRows} 개 `;
        }

    } else {
        console.error("데이터가 배열 형태가 아니거나 비어 있습니다:", data);
        // 데이터가 없을 경우 갯수를 0으로 표시
        const countSelectedDiv = document.getElementById('count-selected');
        if (countSelectedDiv) {
            countSelectedDiv.textContent = `전체 갯수 | 0 개`;
        }
    }
}


function loadBookmarkListToModal() {
    fetch('/FDC/Proj/mjkoo/js/main/get_bookmark.php')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.querySelector('#bookmark-list-modal .tab-list tbody');
            listContainer.innerHTML = '';
            data.forEach((bookmark) => {
                const row = document.createElement('tr');
                row.dataset.bookmarkId = bookmark.id;
                row.dataset.bookmarkName = bookmark.name;
                row.dataset.bookmarkColorid = bookmark.colorId;

                const cell = document.createElement('td');

                const editDiv = document.createElement('div');
                editDiv.className = 'db-edit';
                editDiv.style.display = 'none';

                const select = document.createElement('select');
                select.className = 'color-pick scrollmini';
                select.id = `tab-color-edit-${bookmark.id}`;
                select.innerHTML = generateColorOptions(bookmark.colorId); // 선택된 색상을 포함하여 옵션 생성

                editDiv.appendChild(select);

                const input = document.createElement('input');
                input.type = 'text';
                input.value = bookmark.name;
                editDiv.appendChild(input);

                const link = document.createElement('a');
                link.href = 'javascript:void(0)';
                link.textContent = bookmark.name;
                link.className = getColorClass(bookmark.colorId);

                cell.appendChild(editDiv);
                cell.appendChild(link);
                row.appendChild(cell);
                listContainer.appendChild(row);

                // 더블 클릭 이벤트 추가
                row.addEventListener('dblclick', function () {
                    editDiv.style.display = 'block';
                    link.style.display = 'none';

                    select.value = bookmark.colorId;
                    input.value = bookmark.name;
                });

                // Enter 키 이벤트 리스너 추가
                input.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        const newName = input.value;
                        const newColorId = select.value;
                        updateBookmark(bookmark.id, newName, newColorId);

                        // 편집 모드 종료
                        editDiv.style.display = 'none';
                        link.style.display = 'block';
                        link.textContent = newName;
                        link.className = getColorClass(newColorId);

                        // 동적으로 색상 업데이트
                        link.style.color = pickColors[newColorId];
                    }
                });

                // 초기 색상 설정
                select.style.color = pickColors[bookmark.colorId];
                link.style.color = pickColors[bookmark.colorId];

                // 색상 변경 이벤트 리스너 추가
                select.addEventListener('change', function () {
                    select.style.color = pickColors[select.value];
                    link.style.color = pickColors[select.value];
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('북마크를 불러오는 데 실패했습니다.');
        });
}


/*
오류 : undefined 메세지 뜨는 이유는 data.message나 data.error 접근하려 할 때,
data 객체가 올바르게 파싱되지 않았거나 응답 데이터에 message 혹은 error필드가 없을 때 발생
*/
// 북마크 업데이트 함수
function updateBookmark(id, newName, newColorId) {
    fetch('/FDC/Proj/mjkoo/js/main/update_bookmark.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'id': id,
            'bookmark': newName,
            'color': newColorId
        })
    })
    .then(response => response.text())
    .then(text => {
        console.log('Response text:', text); // 서버에서 반환된 응답을 로그로 출력

        // 응답을 두 개의 JSON 객체로 나누기
        const jsonResponses = text.split('}{').map((part, index, arr) => {
            if (index === 0) return part + '}';
            if (index === arr.length - 1) return '{' + part;
            return '{' + part + '}';
        });

        jsonResponses.forEach(jsonResponse => {
            try {
                const data = JSON.parse(jsonResponse);
                // console.log('Parsed response data:', data);
                    getTabList(); // 업데이트 후 북마크 목록을 다시 불러옴
                    getBookmarkTabs();
            } catch (e) {
                console.error('Error parsing JSON:', e);
                console.error('Response text:', jsonResponse); // 파싱 오류 발생 시 응답 텍스트를 로그로 출력
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


// 초기 색상 설정 스크립트
// document.addEventListener('DOMContentLoaded', function () {
//     const colorPickers = document.querySelectorAll('.color-pick');
//     colorPickers.forEach(picker => {
//         const selectedColorCode = pickColors[picker.value];
//         picker.style.color = selectedColorCode;
//     });
// });

////////////////////////////////////////////////////////////////////////////////////
// 북마크 삭제
// 삭제 버튼 이벤트 리스너 추가
document.getElementById('delete-bmk').addEventListener('click', function () {
    const selectedCheckboxes = document.querySelectorAll('input[name="tab-list-checkbox"]:checked');
    const idsToDelete = Array.from(selectedCheckboxes).map(checkbox => {
        return checkbox.closest('tr').getAttribute('data-bookmark-id');
    });

    if (idsToDelete.length === 0) {
        alert('삭제할 북마크를 선택해주세요.');
        return;
    }

    deleteBookmarks(idsToDelete);
});

// 북마크 삭제 함수
function deleteBookmarks(ids) {
    let deletePromises = ids.map(id => {
        return fetch('/FDC/Proj/mjkoo/js/main/delete_bookmark.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'id=' + encodeURIComponent(id)
        })
            .then(response => response.json());
    });

    Promise.all(deletePromises)
        .then(results => {
            // 모든 결과에서 에러 확인
            const errors = results.filter(result => result.error);
            if (errors.length > 0) {
                alert('일부 북마크 삭제에 실패했습니다.');
            } else {
                alert('선택된 북마크가 성공적으로 삭제되었습니다.');
                location.reload(); // 페이지 새로고침
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('북마크 삭제 과정에서 문제가 발생했습니다.');
        });
}

///////////////////////////////////////////////////////////////////////////
// 북마크 탭에 데이터 등록(new logic)
// 모달에 북마크 목록을 로드하는 함수
function loadRegisterTabList() {
    fetch('/FDC/Proj/mjkoo/js/main/get_bookmark.php')
        .then(response => response.json())
        .then(data => {
            const tabList = document.querySelector('#register-list-modal .tab-list tbody');
            tabList.innerHTML = '';
            data.forEach((bookmark) => {
                const colorClass = getColorClass(bookmark.colorId);
                const tr = document.createElement('tr');
                tr.setAttribute('data-bookmark-id', bookmark.id);
                tr.setAttribute('data-bookmark-name', bookmark.name);
                tr.setAttribute('data-bookmark-colorid', bookmark.colorId);
                tr.innerHTML = `
                    <td>
                        <a href="#" class="${colorClass}"><span>${bookmark.name}</span></a>
                    </td>
                `;
                tabList.appendChild(tr);

                // 클릭 이벤트 리스너 추가
                const aTag = tr.querySelector('a');
                aTag.addEventListener('click', function () {
                    registerBookmarkData(bookmark.id, checkboxes);
                    toggleModal('manage-tab-modal');
                });
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// 북마크 데이터를 등록하는 함수
function registerBookmarkData(bookmarkId, checkboxes) {
    checkboxes.forEach(checkbox => {
        const no = checkbox.getAttribute('data-no');
        saveBookmarkData(no, bookmarkId);
    });
}

// 여러 데이터를 저장할 때 한 번만 메세지 표시하기 위해 Promise.all 사용
// 북마크 데이터를 서버에 저장하는 함수
function saveBookmarkData(dataNo, bookmarkId) {
    const payload = JSON.stringify({ no: dataNo, bookmarkId: bookmarkId });
    console.log('Sending payload:', payload);

    return fetch('/FDC/Proj/mjkoo/js/main/save_bookmark_data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

function saveMultipleBookmarkData(bookmarkData) {
    const savePromises = bookmarkData.map(data => saveBookmarkData(data.no, data.bookmarkId));

    Promise.all(savePromises)
        .then(results => {
            console.log('All data saved:', results);
            alert('모든 데이터가 성공적으로 저장되었습니다.');
            // 필요한 추가 작업 수행
            filterDataByBookmark(bookmarkData[0].bookmarkId); // 예시: 첫 번째 북마크 ID로 필터링
        })
        .catch(error => {
            console.error('Error during data registration:', error);
            alert('데이터 등록 중 오류가 발생했습니다: ' + error.message);
        });
}


// 모달을 열고 닫는 함수
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        if (modal.open) {
            modal.close();
            // 모달을 닫을 때 필요한 상태 초기화나 리소스 해제 로직 추가
            modal.querySelectorAll('input, select').forEach(element => element.value = '');
            modal.classList.remove('toggle-dialog');
        } else {
            modal.showModal();
            // 모달이 열릴 때 필요한 초기화 작업 추가
            modal.classList.add('toggle-dialog');
            const firstInput = modal.querySelector('input, select');
            if (firstInput) {
                firstInput.focus();
            }
        }
    } else {
        // console.error(`Modal with ID ${modalId} not found.`);
    }
}



// 모든 아이템 탭을 활성화하는 함수
function activateAllItemsTab() {
    const allItemsTab = document.querySelector('.all-item-tab');
    if (allItemsTab) {
        document.querySelectorAll('.tab-item a').forEach(tab => tab.classList.remove('active'));
        allItemsTab.classList.add('active');
    }
}

// 탭 선택을 설정하는 함수
function setupTabSelection(checkboxes) {
    document.querySelectorAll('.tab-item a').forEach(tab => {
        tab.addEventListener('click', function () {
            if (isCopyCompleted) return; // 이미 복사가 완료된 경우 추가 동작 방지

            const bookmarkId = this.getAttribute('data-bookmark-id');
            if (!bookmarkId) {
                alert('북마크를 선택하지 않았습니다. 다시 시도해주세요.');
                return;
            }

            registerBookmarkData(this, checkboxes);
        }, { once: true });
    });
}

//////////////////////////////////////////////////////////////////////////////
// 북마크 안에서 DB 삭제하기
document.getElementById('delete-db-in-bmk').addEventListener('click', function () {
    const activeTab = document.querySelector('.tab-item a.active');
    if (!activeTab) {
        alert('활성화된 탭이 없습니다.');
        return;
    }

    const bookmarkId = activeTab.getAttribute('data-bookmark-id');
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]:checked');
    const dataNos = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-no'));

    if (dataNos.length === 0) {
        alert('삭제할 항목을 선택해주세요.');
        return;
    }

    const confirmation = confirm('선택한 항목을 정말 삭제하시겠습니까?');
    if (confirmation) {
        deleteBookmarkItems(bookmarkId, dataNos);
    }
});

function deleteBookmarkItems(bookmarkId, dataNos) {
    fetch(`/FDC/Proj/mjkoo/js/main/delete_db_in_bookmark.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookmarkId: bookmarkId, dataNos: dataNos })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('항목이 성공적으로 삭제되었습니다.');
                // 선택된 체크박스를 기준으로 테이블에서 항목 제거
                const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]:checked');
                selectedCheckboxes.forEach(checkbox => {
                    const row = checkbox.closest('tr');
                    if (row) {
                        row.remove();
                    }
                });
                // 탭 이동 및 데이터 필터링
                filterDataByBookmark(bookmarkId); // 변경된 데이터를 다시 로드하여 실시간으로 UI를 업데이트
            } else {
                alert('항목 삭제에 실패했습니다: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('항목 삭제 중 오류가 발생했습니다.');
        });
}



//////////////////////////////////////////////////////////////////////////////

// 체크박스가 변경될 때마다 선택된 항목의 개수를 업데이트하는 함수
function updateSelectedCount() {
    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]:checked');
    console.log(`Checked checkboxes: ${checkedCheckboxes.length}`); // 로그 추가
    const countSpan = document.getElementById('count-checked');
    if (countSpan) {
        countSpan.textContent = `선택된 항목 ${checkedCheckboxes.length}개`;
    } else {
        console.error('count-checked 요소를 찾을 수 없습니다.'); // 에러 로그 추가
    }
}
