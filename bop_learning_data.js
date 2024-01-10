// bop_learning_data.js

// bop_dataManager.js에서 함수 임포트
import { loadData, parseCsvLearningData } from './bop_dataManager.js';

const ITEMS_PER_PAGE = 20;  // 한 페이지에 표시할 항목 수
let currentPage = 1;  // 현재 페이지 번호
let learningData = [];  // 학습 데이터
let allPeriodSelected = false;  // "모든기간" 버튼이 눌렸는지 여부
let checkboxStates = []; // 체크박스 상태를 저장하는 배열

const loadAndDisplayLearningData = (page = 1) => {
  loadData('bop_learning_data.csv')
    .then(csvText => parseCsvLearningData(csvText))
    .then(data => {
      learningData = data;
      displayLearningData(page);
    })
    .catch(error => {
      console.error('Error loading or displaying data:', error);
    });
};

const displayLearningData = (page) => {
  const tbody = document.querySelector('.widget.bop-data-learning .table-responsive tbody');
  if (!tbody) {
    throw new Error('Table body not found');
  }

  // 기존의 내용을 초기화
  tbody.innerHTML = '';

  // 표시할 데이터 범위를 계산
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

 // 새로운 행 추가
  learningData.slice(start, end).forEach((item, index) => {
    const row = document.createElement('tr');
    const globalIndex = start + index; // 전체 학습 데이터에 대한 인덱스
    const isChecked = checkboxStates[globalIndex] !== undefined ? checkboxStates[globalIndex] : allPeriodSelected;
    row.innerHTML = `
      <td><input type="checkbox" ${isChecked ? 'checked' : ''}></td>
      <td>${item.date} ${item.startTime} ~ ${item.date} ${item.endTime}</td>
    `;
    tbody.appendChild(row);
  });

  
// 체크박스의 상태 변경 이벤트 핸들러
  tbody.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
    const globalIndex = start + index; // 전체 학습 데이터에 대한 인덱스
    checkbox.addEventListener('change', (event) => {
      checkboxStates[globalIndex ] = event.target.checked;
    });
  });

  // 현재 페이지 업데이트
  currentPage = page;

  // 페이지네이션 업데이
  updatePagination();
};

const updatePagination = () => {
  const pagination = document.querySelector('.widget.bop-data-learning .pagination-wrap .pagination');
  if (!pagination) {
    throw new Error('Pagination not found');
  }

  // 기존의 내용을 초기화
  pagination.innerHTML = '';

  // 총 페이지 수 계산
  const totalPages = Math.ceil(learningData.length / ITEMS_PER_PAGE);

   // "왼쪽으로 가기" 버튼 추가
   const prevLi = document.createElement('li');
   prevLi.className = 'page-item';
   prevLi.innerHTML = `<a class="page-link" href="#" data-page="${Math.max(1, currentPage - 1)}">&laquo;</a>`;
   pagination.appendChild(prevLi);

  // 페이지 번호 추가
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item';
    if (i === currentPage) {
      li.className += ' active';
    }
    li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    pagination.appendChild(li);
  }

   // "오른쪽으로 가기" 버튼 추가
   const nextLi = document.createElement('li');
   nextLi.className = 'page-item';
   nextLi.innerHTML = `<a class="page-link" href="#" data-page="${Math.min(totalPages, currentPage + 1)}">&raquo;</a>`;
   pagination.appendChild(nextLi);

  // 페이지 번호 클릭 이벤트 핸들러 추가
  pagination.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const page = parseInt(event.target.dataset.page, 10);
      displayLearningData(page);
    });
  });
};

// 페이지 로드 시 데이터 로드 및 표시
document.addEventListener('DOMContentLoaded', () => loadAndDisplayLearningData(currentPage));

// 첫 번째 체크박스 선택
const firstCheckbox = document.querySelector('#bop-data-learning-table thead tr th input[type="checkbox"]');

// 첫 번째 체크박스에 이벤트 리스너 추가
firstCheckbox.addEventListener('change', (event) => {
  // 첫 번째 체크박스의 상태
  const isChecked = event.target.checked;

  // 모든 체크박스 선택
  const checkboxes = document.querySelectorAll('#bop-data-learning-table tbody tr td input[type="checkbox"]');

  // 첫 번째 체크박스의 상태에 따라 다른 체크박스의 상태 변경
  checkboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
});

// "모든기간" 버튼 선택
const allPeriodButton = document.querySelector('.widget-head-gadget .mini');

// "모든기간" 버튼에 이벤트 리스너 추가
allPeriodButton.addEventListener('click', (event) => {
  // "모든기간" 버튼이 눌렸는지 여부 토글
  allPeriodSelected = !allPeriodSelected;
  // 첫번째 체크박스의 상태를 allPeriodSelected와 동일하게 설정
  firstCheckbox.checked = allPeriodSelected;

  //모든 체크박스 선택
  const checkboxes = document.querySelectorAll('#bop-data-learning-table tbody tr td input[type="checkbox"]');

  // 모든 체크박스의 상태를 체크된 상태로 변경
  checkboxes.forEach(checkbox => {
    checkbox.checked = allPeriodSelected;
  });
});