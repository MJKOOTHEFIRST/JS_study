// stack_diagnosisAnalysis.js

import { loadStackData, parseCsvDiagnosisLogData, startDataRefresh } from './stack_dataManager.js';

const ITEMS_PER_PAGE = 50;  // 한 페이지에 표시할 항목 수
let currentPage = 1;  // 현재 페이지 번호
let diagnosisData = [];  // 진단 데이터
let checkboxStates = []; // 체크박스 상태를 저장하는 배열

// 페이지 로드 시 데이터 로드 및 표시
document.addEventListener('DOMContentLoaded', () => {
  loadAndDisplayDiagnosisData(currentPage);
  startDataRefresh('stack_diagnosis_log_data.csv', data => {
    diagnosisData = data;
    displayData(currentPage);
  });
});

function loadAndDisplayDiagnosisData(page) {
  loadStackData('stack_diagnosis_log_data.csv')
    .then(csvText => {
      diagnosisData = parseCsvDiagnosisLogData(csvText);
      console.log(diagnosisData.length); // 배열의 길이를 콘솔에 출력
      if (diagnosisData.length === 0) {
        console.log('진단 데이터가 비어 있습니다.');
      } else {
        checkboxStates = new Array(diagnosisData.length).fill(false);
        displayData(page);
        setupPagination(diagnosisData.length, page);
        setupCheckboxes();
      }
    })
    .catch(error => {
      console.error('Error loading or displaying data:', error);
    });
}

function displayData(page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = Math.min(start + ITEMS_PER_PAGE, diagnosisData.length);
  const tableBody = document.querySelector('#diagnosis-log-table');
  tableBody.innerHTML = ''; // 테이블 초기화

  diagnosisData.slice(start, end).forEach((item, index) => {
    const globalIndex = start + index;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" name="diagnosis-log-checkbox" ${checkboxStates[globalIndex] ? 'checked' : ''}></td>
      <td>${item.time}</td>
      <td>${item.content}</td>
    `;
    tableBody.appendChild(row);
  });
}

function setupPagination(totalItems, currentPage) {
  const paginationContainer = document.getElementById('diagnosis-log-pagination');
  paginationContainer.innerHTML = ''; // 기존의 페이지네이션을 초기화

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  for (let page = 1; page <= totalPages; page++) {
    addPaginationButton(paginationContainer, page, currentPage);
  }
}

function addPaginationButton(paginationContainer, page, currentPage) {
  const button = document.createElement('button');
  button.innerText = page;
  button.classList.add('pagination-button');
  if (page === currentPage) {
    button.classList.add('active');
  }
  button.addEventListener('click', () => {
    loadAndDisplayDiagnosisData(page);
  });
  paginationContainer.appendChild(button);
}

function setupCheckboxes() {
  const selectAllCheckbox = document.getElementById('diagnosis-log-checkboxes'); //
  selectAllCheckbox.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('#diagnosis-log-table input[type="checkbox"]:not(#diagnosis-log-checkboxes)');
    checkboxes.forEach((checkbox, index) => {
      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
      checkbox.checked = this.checked;
      checkboxStates[globalIndex] = this.checked; // 체크박스 상태 배열 업데이트
    });
  });

  document.querySelector('#diagnosis-log-table').addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
      const rowCheckbox = e.target;
      const rowIndex = [...document.querySelectorAll('#diagnosis-log-table input[type="checkbox"]:not(#diagnosis-log-select-all-checkbox)')].indexOf(rowCheckbox);
      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + rowIndex;
      checkboxStates[globalIndex] = rowCheckbox.checked;
      if (!rowCheckbox.checked) {
        selectAllCheckbox.checked = false;
      } else {
        // 모든 체크박스가 선택되었는지 확인
        const allChecked = checkboxStates.slice(start, end).every(state => state);
        selectAllCheckbox.checked = allChecked;
      }
    }
  });
}