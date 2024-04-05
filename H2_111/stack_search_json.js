// stack_search.js 
// JSON stringfy ver.
console.log('stack_search.js 도달!');

// 서버에 검색 조건을 전송하고 결과를 받아 테이블에 표시하는 함수
function searchWithData(conditions) {
    const xhr = new XMLHttpRequest();
    // xhr.open('POST', 'http://192.168.100.111/FDC/work/dev/js/main/stack_search.php', true);
    xhr.open('POST', 'http://fuelcelldr.nstek.com/FDC/work/dev/js/main/stack_search.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
        if (this.status === 200) {
            const results = JSON.parse(this.responseText);
            displayResults(results);
        } else {
            console.error('서버응답 실패:', this.status);
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    console.log('JSON stringfy(conditions):', JSON.stringify(conditions));
    xhr.send(JSON.stringify(conditions));
}


    // 결과를 표시하는 함수
    function displayResults(results) {
        const tbody = document.querySelector('#stack_search_table');
        tbody.innerHTML = '';

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

// 페이지 로드 시 전체 데이터 불러오기
document.addEventListener('DOMContentLoaded', function () {
    searchWithData({});
});

// 검색 버튼 이벤트 리스너 추가
document.querySelector('#stack_search_btn').addEventListener('click', function () {
    console.log('검색 버튼 클릭 이벤트 발생');

    // 검색 조건 수집 함수
    function getInputValue(name) {
        const overElement = document.querySelector(`input[name="${name}"][id^="o"]`);
        const underElement = document.querySelector(`input[name="${name}"][id^="u"]`);
        // 입력 값이 유효한 경우에만 값을 반환. 둘다 적혀있어야한다.
        if (overElement && underElement) {
            return {
                over: overElement.value, // 'over' 값
                under: underElement.value // 'under' 값
            };
        }
        // 유효한 입력이 없는 경우, null을 반환
        return null;
    }

    // 조건 선택 함수
    function getSelectedCondition(name) {
        // '초과' 조건 체크
        const overElement = document.querySelector(`input[name="${name}"][type="radio"][id^="o"]`);
        if (overElement && overElement.checked) {
            return '>'; // '초과' 조건이 선택된 경우
        }

        // '미만' 조건을 체크
        const underElement = document.querySelector(`input[name="${name}"][type="radio"][id^="u"]`);
        if (underElement && underElement.checked) {
            return '<'; // '미만' 조건이 선택된 경우
        }

        // 조건이 선택되지 않은 경우 빈 문자열을 반환
        return '';
    }


    // 검색 조건 수집 로직 수정
    const searchConditions = {};
    const conditionFields = [
        { key: 'H-M', conditionId: 'a01', inputPrefix: 'input-h-m' },
        { key: 'M-L', conditionId: 'a02', inputPrefix: 'input-m-l' },
        { key: 'X1', conditionId: 'a03', inputPrefix: 'input-x1' },
        { key: 'X2', conditionId: 'a04', inputPrefix: 'input-x2' },
        { key: 'Y1', conditionId: 'a05', inputPrefix: 'input-y1' },
        { key: 'Y2', conditionId: 'a06', inputPrefix: 'input-y2' },
        { key: 'M', conditionId: 'a07', inputPrefix: 'input-m' },
        { key: 'L', conditionId: 'a08', inputPrefix: 'input-l' },
        { key: 'SQ', conditionId: 'a09', inputPrefix: 'input-sq' },
        { key: 'BQ', conditionId: 'a10', inputPrefix: 'input-bq' }
    ];

    // 각 조건 필드에 대한 입력 값을 검증하고, 유효한 경우에만 객체에 추가
    conditionFields.forEach(({ key, conditionId, inputPrefix }) => {
        const value = getInputValue(inputPrefix); // inputPrefix를 사용하여 입력 값을 가져옵니다.
        if (value) { // 입력 값이 유효한 경우에만 추가
            searchConditions[key] = {
                value,
                condition: getSelectedCondition(conditionId)
            };
        }
    });

    // 라벨 조건은 별도로 처리
    searchConditions['LABEL'] = {
        value: document.getElementById('input-label').value,
        condition: '' // LABEL에 대한 조건은 없으므로 빈 문자열 처리
    };

    // 검증된 searchConditions 객체 사용
    console.log(searchConditions);

    

});