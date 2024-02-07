// stack_diagnosisAnalysis.js

import { loadStackData, parseCsvDiagnosisLogData} from './stack_dataManager.js';


// 한 페이지에 표시할 항목 수를 50으로 설정
const ITEMS_PER_PAGE = 50;

// 페이지 로드 시 데이터 로드 및 표시
document.addEventListener('DOMContentLoaded', () => {
  loadStackData().then(csvText => {
    const diagnosisLogData = parseCsvDiagnosisLogData(csvText);
    displayData(diagnosisLogData, 1); // 첫 페이지 데이터 표시
    setupPagination(diagnosisLogData, 1); // 페이지네이션 설정
  });
});

// 데이터 표시 함수
function displayData(data, page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const tableBody = document.querySelector('.scrollmini');
  tableBody.innerHTML = ''; // 테이블 초기화

  data.slice(start, end).forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" name="diagnosis-log-checkbox"></td>
      <td>${item.time}</td>
      <td>${item.content}</td>
    `;
    tableBody.appendChild(row);
  });

  // 체크박스 관련 이벤트 리스너 설정
  setupCheckboxes();
}

// 페이지네이션 설정 함수
function setupPagination(data, currentPage) {
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById('diagnosis-log-pagination');
  pagination.innerHTML = ''; // 페이지네이션 초기화

  // "왼쪽으로 가기" 버튼 추가
  const prevLi = document.createElement('li');
  prevLi.className = 'page-item';
  prevLi.innerHTML = `<a class="page-link" href="#" data-page="${Math.max(1, currentPage - 1)}">&laquo;</a>`;
  pagination.appendChild(prevLi);

  // 페이지 번호 추가
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    pagination.appendChild(li);
  }

  // "오른쪽으로 가기" 버튼 추가
  const nextLi = document.createElement('li');
  nextLi.className = 'page-item';
  nextLi.innerHTML = `<a class="page-link" href="#" data-page="${Math.min(totalPages, currentPage + 1)}">&raquo;</a>`;
  pagination.appendChild(nextLi);

  // 페이지번호 클릭 이벤트 핸들러 추가
  pagination.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const newPage = parseInt(event.target.dataset.page, 10);
      displayData(data, newPage);
      setupPagination(data, newPage);
    });
  });
}

// 체크박스 관련 기능 설정 함수
function setupCheckboxes() {
  const selectAllCheckbox = document.getElementById('diagnosis-log-checkbox');
  selectAllCheckbox.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.scrollmini input[type="checkbox"]:not(#diagnosis-log-checkbox)');
    checkboxes.forEach(checkbox => {
      checkbox.checked = this.checked;
    });
  });

  document.querySelector('.scrollmini').addEventListener('change', function(e) {
    if (e.target.type === 'checkbox' && !e.target.checked) {
      selectAllCheckbox.checked = false;
    }
  });
}