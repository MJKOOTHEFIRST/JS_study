// bop_eventManager.js (bop_learning_data.js와 bop_sensor_data.js의 공통 기능 기능 모듈화 -  테이블에 데이터 표시, 페이지네이션, 체크박스 체크, '모든기간' 버튼)

///////////////////////////////////////////////////////////////////////////////////
/*********************************************************/
// BOP 정상 학습 데이터, BOP 센서 데이터 
export const ITEMS_PER_PAGE = 20; // 한 페이지에 표시할 항목 수

export const displayData = (data, page, tbodySelector, rowHTMLCallback) => {
  const tbody = document.querySelector(tbodySelector);
  if(!tbody){
    throw new Error('Table body not found');
  }

  // 기존의 내용을 초기화
  tbody.innerHTML='';

  // 표시할 데이터 범위 계산
  const start = (page-1)*ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  // 새로운 행 추가
  data.slice(start, end).forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = rowHTMLCallback(item);
    tbody.appendChild(row);
  });
};

export const updatePagination = (data, page, paginationSelector, pageChangeCallback) => {
  const pagination = document.querySelector(paginationSelector);
  if(!pagination){
    throw new Error('Pagination not found');
  }

  // 기존 내용 초기화
  pagination.innerHTML='';

  // 총 페이지 수 계산
  const totalPages = Math.ceil(data.length/ITEMS_PER_PAGE);
  
  // "왼쪽으로 가기" 버튼 추가
  const prevLi = document.createElement('li');
  prevLi.className = 'page-item';
  prevLi.innerHTML = `<a class="page-link" href="#" data-page="${Math.max(1, page - 1)}">&laquo;</a>`;
  pagination.appendChild(prevLi);

  // 페이지 번호 추가
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item';
    if (i === page) {
      li.className += ' active';
    }
    li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    pagination.appendChild(li);
  }

    // "오른쪽으로 가기" 버튼 추가
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item';
    nextLi.innerHTML = `<a class="page-link" href="#" data-page="${Math.min(totalPages, page + 1)}">&raquo;</a>`;
    pagination.appendChild(nextLi);

    // 페이지번호 클릭 이벤트 핸들러 추가
    pagination.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const page = parseInt(event.target.dataset.page, 10);
        pageChangeCallback(page);
      });
    });

  };

 // 체크박스 이벤트
export const updateFirstCheckboxState = (checkboxStates, start, end, firstCheckboxSelector) => {
  const firstCheckbox = document.querySelector(firstCheckboxSelector);
  if (firstCheckbox) {
    firstCheckbox.checked = checkboxStates.slice(start, end).every(state => state);
  }
};

export const addCheckboxChangeListeners = (checkboxStates, start, checkboxesSelector, firstCheckboxSelector) => {
  const checkboxes = document.querySelectorAll(checkboxesSelector);
  checkboxes.forEach((checkbox, index) => {
    const globalIndex = start + index;
    checkbox.addEventListener('change', () => {
      checkboxStates[globalIndex] = checkbox.checked;
      updateFirstCheckboxState(checkboxStates, start, start + checkboxes.length, firstCheckboxSelector);
    });
  });
};

///////////////////////////////////////////////////////////////////////////////////
/*********************************************************/
// HW BOP 센서 리스트, 소프트 센서 리스트 '전체 선택' , '선택 해제'
document.addEventListener('DOMContentLoaded', function() {
  // HW BOP 센서 리스트 위젯의 버튼 선택
  var hwBopWidget = document.getElementById('hw-bop-sensor-list');
  var hwBopSelectAll = hwBopWidget.querySelector('.widget-head-gadget .mini:nth-child(1)');
  var hwBopDeselectAll = hwBopWidget.querySelector('.widget-head-gadget .mini:nth-child(2)');

  // 소프트 센서 리스트 위젯의 버튼 선택
  var softSensorWidget = document.getElementById('soft-sensor-list');
  var softSelectAll = softSensorWidget.querySelector('.widget-head-gadget .mini:nth-child(1)');
  var softDeselectAll = softSensorWidget.querySelector('.widget-head-gadget .mini:nth-child(2)');

  // HW BOP 센서 리스트 위젯에 대한 '모두 선택' 및 '선택 해제' 기능
  hwBopSelectAll.addEventListener('click', function() {
    var checkboxes = hwBopWidget.querySelectorAll('.tree input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
      checkbox.checked = true;
    });
  });

  hwBopDeselectAll.addEventListener('click', function() {
    var checkboxes = hwBopWidget.querySelectorAll('.tree input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
      checkbox.checked = false;
    });
  });

  // 소프트 센서 리스트 위젯에 대한 '모두 선택' 및 '선택 해제' 기능
  softSelectAll.addEventListener('click', function() {
    var checkboxes = softSensorWidget.querySelectorAll('.tree input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
      checkbox.checked = true;
    });
  });

  softDeselectAll.addEventListener('click', function() {
    var checkboxes = softSensorWidget.querySelectorAll('.tree input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
      checkbox.checked = false;
    });
  });
});


///////////////////////////////////////////////////////////////////////////////////
/*********************************************************/
// HW BOP 센서 리스트
// 공기공급계 체크박스에 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
  var sections = document.querySelectorAll('.tree-ui details');

  sections.forEach(function(section) {
      var parentCheckbox = section.querySelector('summary input[type="checkbox"]');
      var childCheckboxes = section.querySelectorAll('ul input[type="checkbox"]');

      // 부모 체크박스 상태 변경 시 자식 체크박스 상태 변경
      parentCheckbox.addEventListener('change', function() {
          childCheckboxes.forEach(function(checkbox) {
              checkbox.checked = parentCheckbox.checked;
          });
      });

      // 자식 체크박스 상태 변경 시 부모 체크박스 상태 업데이트
      childCheckboxes.forEach(function(checkbox) {
          checkbox.addEventListener('change', function() {
              var allChecked = Array.from(childCheckboxes).every(checkbox => checkbox.checked);
              // console.log(allChecked);
              parentCheckbox.checked = allChecked;
          });
      });
  });
});




