//search_bookmark.js
import { currentPage, resetSearchConditions, searchWithData } from './stack_search2.js';

document.addEventListener('DOMContentLoaded', function () {
    console.log("문서 로드");
    getBookmarkTabs();
    getTabList(); // 탭 목록을 로드(탭 관리 모달에서 보임)

    document.body.addEventListener('click', function (event) {
        if (event.target.id === 'add-bmk-btn') {
            console.log("북마크 추가버튼 클릭됨");
            var bookmarkName = document.getElementById('new-tag-name').value;
            addBookmark(bookmarkName);
        } else if (event.target.id === 'bmk-btn') {
            // 먼저 북마크 목록을 로드
            loadBookmarkListToModal();
            // 모달 ID를 사용하여 모달 토글
            toggleModal2('bmk-list-modal');
        }
    });
});

function toggleModal2(tabId, loadList = false) {
    console.log("toggleModal2 called with ID:", tabId); // 로그 추가
    const element = document.getElementById(tabId);
    if (element) {
        element.classList.toggle('toggle-dialog');
        if (loadList) {
            loadBookmarkListToModal(); // 올바르게 함수 호출
        }
    } else {
        console.error('Element with ID ' + tabId + ' not found.');
    }
}

// 전역 객체에 함수 할당
window.toggleModal2 = toggleModal2;

// 목록 추가 버튼을 추가하는 함수
function addPlusButton(bookmarkList) {
    var plusListItem = document.createElement('li');
    plusListItem.innerHTML = '<a class="plus" title="목록추가" onclick="toggleModal()">+</a>';
    bookmarkList.appendChild(plusListItem);
}


// 서버에 북마크를 추가하는 함수
function addBookmark(bookmarkName) {
    const colorPicker = document.querySelector('.color-pick');
    let colorValue = colorPicker.options[colorPicker.selectedIndex].value;

    // 색상 선택이 없을 경우 기본 색상 식별자 설정
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
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                document.getElementById('new-tag-name').value = '';
                getTabList();
                getBookmarkTabs();
            }
        })
        .catch(error => {
            alert('북마크 추가에 실패했습니다.');
            console.error('There was a problem with the fetch operation:', error);
        });
}


/////////////////////////////////////////////////////////////////////////////
//화면조회

// '스택 데이터 관리' 누르면 필터 검색 초기화 버튼 클릭 이벤트 설정
document.getElementById('stack-data-mng-head').addEventListener('click', function () {
    console.log('스택 데이터 관리 클릭 이벤트 발생');
    resetSearchConditions(); // 검색 조건 초기화 함수 호출
    // 서버에 빈 검색 요청 전송
    searchWithData({});
    totalRowsFiltered = 0; // 필터링된 데이터의 총 수 초기화

    // bold 스타일을 가진 클래스 추가
    this.classList.add('bold');

    // 다른 tab-item 요소에서 active 클래스 제거
    document.querySelectorAll('.tab-item a').forEach(tab => {
        tab.classList.remove('active');
    });
});

// 상단 북마크 탭 조회 /선택 및 데이터 필터링
function getBookmarkTabs() {
    fetch('/FDC/Proj/mjkoo/js/main/get_bookmark.php')
        .then(response => response.json())
        .then(data => {
            console.log("loaded bookmark data:", data);
            if (data.length > 0) {
                var bookmarkList = document.getElementById('bookmark-tab').querySelector('ul');
                bookmarkList.innerHTML = '';
                data.forEach(bookmark => {
                    var newTabItem = document.createElement('li');
                    newTabItem.classList.add('tab-item');
                    var colorClass = getColorClass(bookmark.colorId);
                    newTabItem.innerHTML = `<a class="${colorClass}" data-id="${bookmark.id}">${bookmark.name}</a>`;
                    bookmarkList.appendChild(newTabItem);
                });
                addPlusButton(bookmarkList);
            } else {
                console.log("No bookmark data received.");
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

// 이벤트 위임을 사용하여 탭 클릭 이벤트 핸들러 설정
document.getElementById('bookmark-tab').addEventListener('click', function(event) {
    // closest 메서드를 사용하여 클릭된 요소가 a 태그가 아닐 경우 a 태그를 찾음
    const target = event.target.closest('a');
    if (target && target.parentElement.classList.contains('tab-item')) {
        const bookmarkId = target.dataset.id;
        console.log("Clicked bookmarkId :", bookmarkId); // 로그 추가하여 dirName 확인
        document.querySelectorAll('.tab-item a').forEach(tab => tab.classList.remove('active'));
        target.classList.add('active');
        filterDataByBookmark(bookmarkId);
    }
});


// 데이터 필터링 및 표시 함수
function filterDataByBookmark(bookmarkId) {
    const timestamp = new Date().getTime();
    fetch(`/FDC/Proj/mjkoo/js/main/filter_bookmark.php?bookmarkId=${encodeURIComponent(bookmarkId)}&t=${timestamp}`)
        .then(response => response.json())
        .then(data => {
            console.log("Data received for bookmark ID :", bookmarkId, data);
            displayFilteredData(data);
        })
        .catch(error => {
            console.error('Error fetching filtered data:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        });
}

// 필터링된 데이터를 화면에 표시하는 함수
function displayFilteredData(data) {
    console.log("displayFilteredData 호출됨, 데이터:", data); // 데이터 로깅 추가

    const tbody = document.querySelector('#stack_search_table');
    if (!tbody) {
        console.error('Table body not found');
        return; // tbody가 없으면 함수를 종료
    }

    tbody.innerHTML = ''; // 기존 내용을 비움

    if (Array.isArray(data) && data.length > 0) {
        data.forEach((row) => {
            console.log("처리중인 행:", row);
            const tr = document.createElement('tr');

            // 체크박스 추가
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
                <td><input type="text" class="label-input" value="${row.LABEL}"></td>
            `;
            tbody.appendChild(tr);
        });

        // 전체 데이터 수를 HTML에 업데이트
        const countSelectedDiv = document.getElementById('count-selected');
        if (countSelectedDiv) {
            countSelectedDiv.textContent = `전체 갯수 | ${data.length} `;
        }
        
    } else {
        console.error("데이터가 배열 형태가 아니거나 비어 있습니다:", data);
        // 데이터가 없을 경우 갯수를 0으로 표시
        const countSelectedDiv = document.getElementById('count-selected');
        if(countSelectedDiv){
            countSelectedDiv.textContent = `전체 갯수 | 0`;
        }
    }
}

// 북마크 목록을 모달에 동적으로 로드하는 함수 
export function loadBookmarkListToModal() {
    fetch('/FDC/Proj/mjkoo/js/main/get_bookmark.php')
        .then(response => response.json())
        .then(data => {
            const listContainer = document.querySelector('.bmk-list');
            listContainer.innerHTML = '';
            data.forEach((bookmark) => {
                const link = document.createElement('a');
                link.href = 'javascript:void(0)'; // 링크의 기본 동작 방지
                link.textContent = bookmark.name; // bookmark 객체에서 이름을 올바르게 표시
                link.className = getColorClass(bookmark.colorId); // 색상 식별자를 클래스 이름으로 변환
                listContainer.appendChild(link);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('북마크를 불러오는 데 실패했습니다.');
        });
}

// 서버에서 북마크 목록을 가져와서 탭 목록에 표시하는 함수(관리의 + 표시에 있음)
function getTabList() {
    console.log("getTabList() 호출됨");
    fetch('/FDC/Proj/mjkoo/js/main/get_bookmark.php')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function (data) {
            console.log("Data from server:", data);
            const tabList = document.querySelector('.table.tab-list tbody');
            tabList.innerHTML = '';
            data.forEach((bookmark, index) => {
                const colorClass = getColorClass(bookmark.colorId);
                console.log("선택된 colorId: ", bookmark.colorId);
                const tr = document.createElement('tr');
                tr.setAttribute('data-bookmark-id', bookmark.id);
                tr.setAttribute('data-bookmark-name', bookmark.name);
                tr.setAttribute('data-bookmark-colorid', bookmark.colorId);
                tr.innerHTML = `
                    <td><input type="checkbox" name="" id=""></td>
                    <td>
                        <a href="#" class="${colorClass}"><span>${bookmark.name}</span></a>
                        <button class="btn-of w-24 float-end mx-1 bmk-edit">수정</button>
                    </td>
                `;
                tabList.appendChild(tr);
            });
        })
        .catch(function (error) {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// 이벤트 리스너를 한 번만 설정
document.querySelector('.table.tab-list tbody').addEventListener('click', function (event) {
    if (event.target.classList.contains('bmk-edit')) {
        const tr = event.target.closest('tr');
        const bookmarkId = tr.getAttribute('data-bookmark-id');
        const bookmarkName = tr.getAttribute('data-bookmark-name');
        const bookmarkColorId = tr.getAttribute('data-bookmark-colorid');

        document.getElementById('new-tag-name').value = bookmarkName;
        var colorPicker = document.getElementById('tab-color-select');
        Array.from(colorPicker.options).forEach(option => {
            option.selected = (option.value === bookmarkColorId);
        });

        var addButton = document.getElementById('add-bmk-btn');
        addButton.textContent = '수정';
        addButton.removeEventListener('click', addBookmark); //기존 이벤트 리스너 제거
        addButton.onclick = function () {
            updateBookmark(bookmarkId, document.getElementById('new-tag-name').value, colorPicker.value);
        };
    }
});



//수정버튼을 누르면 #tab-color-select에 색깔이 들어와야하는데 지금 기본컬러에서 안바뀌던 문제
// -> JS에서는 select 요소의 값을 변경해도 option 요소의 내용이 변경되지 않는 한 화면에 변화가 없다.
// 따라서 수정 버튼 클릭시, 색상 코드에 해당하는 option 요소를 찾아서 선택되도록 코드 추가해야함.
// 태그 수정
function updateBookmark(id, newName, newColorId) {
    fetch('/FDC/Proj/mjkoo/js/main/update_bookmark.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'id': id, // 인자로 받은 id 사용
            'bookmark': newName, // 인자로 받은 newName 사용
            // 'color': newColorId // 인자로 받은 newColorId 사용
            'color': newColorId // 인자로 받은 newColorId 사용
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                getTabList(); // 탭 목록을 다시 불러옴
                getBookmarkTabs();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('북마크 업데이트 중 오류가 발생했습니다.');
        });
}


// 색상 식별자를 클래스 이름으로 변환하는 함수
function getColorClass(colorId) {
    // console.log("Received color ID:", colorId); // 로그 추가
    const colorClassMap = {
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
    const className = colorClassMap[colorId] || 'default-color-class';
    // console.log("Returning class name:", className); // 로그 추가
    return className;
}

// // 숫자를 두 자리로 변환하는 함수
// function pad(num, size) {
//     var s = num + "";
//     while (s.length < size) s = "0" + s;
//     return s;
// }

// 서버에서 북마크 목록을 가져와서 화면에 표시하는 함수(상단 목록)
/*
북마크 이름 표시 문제 해결: 원래 코드에서는 북마크 객체를 직접 문자열로 변환하려고 했기 때문에 [object Object]라는 결과가 나왔습니다. 이를 해결하기 위해 bookmark.name을 사용하여 각 북마크의 이름을 올바르게 표시하도록 수정

잘못된 코드
newTabItem.innerHTML = '<a class="' + colorClass + '">' + bookmark + '</a><button class="del" title="삭제" onclick="alert(\'삭제\')">×</button>';

올바른 코드 
newTabItem.innerHTML = `<a class="${colorClass}">${bookmark.name}</a>`; // bookmark.name을 사용하여 이름 표시
*/



////////////////////////////////////////////////////////////////////////////////////
// 북마크 삭제
// 북마크 삭제
document.body.addEventListener('click', function (event) {
    if (event.target.classList.contains('del')) {
        // 삭제 버튼이 클릭된 경우
        var bookmarkId = event.target.parentElement.querySelector('a').dataset.id; // 북마크 ID를 가져옴
        deleteBookmarks(bookmarkId);
    }
});

function deleteBookmarks(ids) {
    // 북마크 ID 리스트를 기반으로 각 ID에 대한 삭제 요청을 생성
    const deletePromises = ids.map(id => {
        return fetch('/FDC/Proj/mjkoo/js/main/delete_bookmark.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'id=' + encodeURIComponent(id)
        })
        .then(response => response.json()) // 응답을 JSON 형식으로 파싱
        .then(data => {
            if (data.error) {
                // 서버에서 오류가 반환된 경우 예외 발생
                throw new Error(data.error);
            } else {
                // 성공 시 DOM에서 해당 북마크 요소 제거
                const elementToRemove = document.querySelector(`[data-bookmark-id="${id}"]`);
                if (elementToRemove) {
                    elementToRemove.parentNode.removeChild(elementToRemove);
                }
            }
            return data; // 성공 데이터 반환
        });
    });

    // 모든 삭제 요청이 완료되면 실행되는 부분
    Promise.all(deletePromises)
    .then(results => {
        alert('선택된 북마크가 성공적으로 삭제되었습니다.');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('북마크 삭제 과정에서 문제가 발생했습니다.');
    });
}
