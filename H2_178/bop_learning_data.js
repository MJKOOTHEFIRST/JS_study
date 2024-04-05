// bop_learning_data.js

// bop_dataManager.js에서 함수 임포트
import { parseCsvLearningData, startDataRefresh} from './bop_dataManager.js';
import { updatePagination } from './bop_eventManager.js';
// import { updatePagination, updateFirstCheckboxState, addCheckboxChangeListeners } from './bop_eventManager.js';

const ITEMS_PER_PAGE = 20;  // 한 페이지에 표시할 항목 수
let currentPage = 1;  // 현재 페이지 번호
let learningData = [];  // 학습 데이터
let allPeriodSelected = false;  // "모든기간" 버튼이 눌렸는지 여부
let checkboxStates = []; // 체크박스 상태를 저장하는 배열

// 데이터를 주기적으로 새로고침하는 로직 + 데이터 새로고침시에도 currentPage가 조정
const refreshLearningData = () => {
  startDataRefresh('bop_learning_data.csv', parseCsvLearningData, (newData) => {
    learningData = newData;
    checkboxStates = new Array(newData.length).fill(false);

    // 총 페이지 수를 계산
    const totalPages = Math.ceil(newData.length / ITEMS_PER_PAGE);

    // 현재 페이지 번호가 총 페이지 수를 초과하지 않도록 조정
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    displayLearningData(currentPage);
  });
};

const displayLearningData = (page) => {
  const tbody = document.querySelector('#bop-learning-data-table tbody');
  const firstCheckbox = document.querySelector('#bop-learning-data-table thead tr th input[type="checkbox"]');
  if (!tbody || !firstCheckbox) {
    throw new Error('Table body not found');
  }

  // 기존의 내용을 초기화
  tbody.innerHTML = '';

    // 표시할 데이터 범위를 계산
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = Math.min(start + ITEMS_PER_PAGE, learningData.length);


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

    // 첫 번째 체크박스 상태 업데이트
    updateFirstCheckboxState(checkboxStates, start, end, '#bop-learning-data-table thead tr th input[type="checkbox"]');

    // 현재 페이지의 체크박스들에 대한 이벤트 리스너 추가
    addCheckboxChangeListeners(checkboxStates, start, '#bop-learning-data-table tbody tr td input[type="checkbox"]', '#bop-learning-data-table thead tr th input[type="checkbox"]');


  // 현재 페이지 업데이트
  currentPage = page;

  // 페이지네이션 업데이트 
  updatePagination(learningData, currentPage, '#bop-learning-data-pagination', displayLearningData);
};

// 페이지 로드 시 데이터 주기적 새로고침 시작
document.addEventListener('DOMContentLoaded', refreshLearningData);


// 첫 번째 체크박스 선택, 상태 업데이트
// const firstCheckbox = document.querySelector('#bop-learning-data-table thead tr th input[type="checkbox"]');


// 첫 번째 체크박스에 이벤트 리스너 추가
/*
firstCheckbox.addEventListener('change', (event) => {
  // 첫 번째 체크박스의 상태
  const isChecked = event.target.checked;

  // 모든 체크박스 선택
  const checkboxes = document.querySelectorAll('#bop-learning-data-table tbody tr td input[type="checkbox"]');

  // 첫 번째 체크박스의 상태에 따라 다른 체크박스의 상태 변경
  checkboxes.forEach((checkbox, index) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    checkbox.checked = isChecked;
    checkboxStates[globalIndex] = isChecked; // checkboxStates 배열 업데이트
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

  // checkboxStates 배열의 모든 요소를 allPeriodSelected 값으로 설정
  checkboxStates.fill(allPeriodSelected);

    // 현재 페이지의 체크박스 상태 업데이트
  const checkboxes = document.querySelectorAll('#bop-learning-data-table tbody tr td input[type="checkbox"]');
  checkboxes.forEach((checkbox, index) => {
    checkbox.checked = allPeriodSelected;
  });

  // 첫 번째 체크박스 상태 업데이트
  updateFirstCheckboxState(checkboxStates, 0, checkboxStates.length, '#bop-learning-data-table thead tr th input[type="checkbox"]');
});
*/