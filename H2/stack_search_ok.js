//stack_search.js
console.log('stack_search.js 도달!')


// 페이지 로드 시 전체 데이터 불러오기
document.addEventListener('DOMContentLoaded', function() {
    searchWithData({}); // 초기 검색 조건 없이 호출하여 전체 데이터를 불러옵니다.
});

// 검색 버튼 이벤트 리스너 추가
document.querySelector('#stack_search_btn').addEventListener('click', function() {
    console.log('검색 버튼 클릭 이벤트 발생');

    // 검색 조건 수집 함수
    const getInputValue = (inputId) => {
        console.log(`Getting value for input: ${inputId}`); // ID 로깅
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
        'H-M': {value: getInputValue('input-h-m'), condition: getSelectedCondition('a01')},
        'M-L': {value: getInputValue('input-m-l'), condition: getSelectedCondition('a02')},
        'X1': {value: getInputValue('input-x1'), condition: getSelectedCondition('a03')},
        'X2': {value: getInputValue('input-x2'), condition: getSelectedCondition('a04')},
        'Y1': {value: getInputValue('input-y1'), condition: getSelectedCondition('a05')},
        'Y2': {value: getInputValue('input-y2'), condition: getSelectedCondition('a06')},
        'M': {value: getInputValue('input-m'), condition: getSelectedCondition('a07')},
        'L': {value: getInputValue('input-l'), condition: getSelectedCondition('a08')},
        'SQ': {value: getInputValue('input-sq'), condition: getSelectedCondition('a09')},
        'BQ': {value: getInputValue('input-bq'), condition: getSelectedCondition('a10')},
        'LABEL': {value: getInputValue('input-label')}
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
function searchWithData(conditions) {
    let query = Object.keys(conditions).map(key => {
        if (key === 'LABEL') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(conditions[key].value)}`;
        } else {
            return `${encodeURIComponent(key)}=${encodeURIComponent(conditions[key].value)}&${encodeURIComponent(key + 'Condition')}=${encodeURIComponent(conditions[key].condition)}`;
        }
    }).join('&');

    const xhr = new XMLHttpRequest();
    // 동적으로 생성된 query를 사용하여 서버에 GET 요청을 보냄
    xhr.open('GET', `http://192.168.100.111/FDC/work/dev/js/main/stack_search.php?${query}`, true);

    xhr.onload = function() {
        if (this.status === 200) {
            // 성공적으로 데이터를 받아온 경우의 처리 로직
            console.log("서버로부터의 응답:", this.responseText);
            const results = JSON.parse(this.responseText);
            displayResults(results); // 결과를 표시하는 함수
        } else {
            // 요청 실패 시의 처리 로직
            console.error('서버응답 실패:', this.status);
        }
    };

    xhr.onerror = function() {
        // 네트워크 오류 등의 문제가 발생했을 때의 처리 로직
        console.error('Request failed');
    };

    console.log('요청된 Query:', query);
    xhr.send(); // 실제 요청을 서버로 보냄
}


// 결과를 표시하는 함수
function displayResults(results) {
    const tbody = document.querySelector('#stack_search_table');
    tbody.innerHTML = ''; // 기존 내용을 비움

    results.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" name="search-checkbox"></td>
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
            <td>${row.LABEL}</td>
        `;
        tbody.appendChild(tr);
    });
}
