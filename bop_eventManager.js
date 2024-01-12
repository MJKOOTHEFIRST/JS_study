// bop_eventManager.js (bop_learning_data.js와 bop_sensor_data.js의 공통 기능 기능 모듈화 -  테이블에 데이터 표시, 페이지네이션, 체크박스 체크, '모든기간' 버튼)

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



