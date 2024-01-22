// bop_sensor_data.js

// bop_dataManager.js에서 함수 임포트
import { parseCsvSensorData, startDataRefresh } from './bop_dataManager.js';
import { updatePagination, updateFirstCheckboxState, addCheckboxChangeListeners } from './bop_eventManager.js';

const ITEMS_PER_PAGE = 20;  // 한 페이지에 표시할 항목 수
let currentPage = 1;  // 현재 페이지 번호
let sensorData = [];  // 센서 데이터
let checkboxStates = []; // 체크박스 상태를 저장하는 배열

// 데이터를 주기적으로 새로고침하는 로직
const refreshSensorData = () => {
  startDataRefresh('bop_sensor_data.csv', parseCsvSensorData, (newData) => {
    sensorData = newData;
    checkboxStates = new Array(newData.length).fill(false);

    // 총 페이지 수를 계산
    const totalPages = Math.ceil(newData.length / ITEMS_PER_PAGE);

    // 현재 페이지 번호가 총 페이지 수를 초과하지 않도록 조정
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    displaySensorData(currentPage);
  });
};


const displaySensorData = (page) => {
  const tbody = document.querySelector('#bop-sensor-data-table tbody');
  const firstCheckbox = document.querySelector('#bop-sensor-data-table thead tr th input[type="checkbox"]');
  if (!tbody || !firstCheckbox) {
    throw new Error('Table body or first checkbox not found');
  }

  // 기존의 내용을 초기화
  tbody.innerHTML = '';

  // 표시할 데이터 범위를 계산
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = Math.min(start + ITEMS_PER_PAGE, sensorData.length);

  // 첫 번째 체크박스 상태 초기화
  firstCheckbox.checked = false;

  // 새로운 행 추가
  sensorData.slice(start, end).forEach((item, index) => {
    const row = document.createElement('tr');
    const globalIndex = start + index; // 전체 센서 데이터에 대한 인덱스
    const isChecked = checkboxStates[globalIndex];
    row.innerHTML = `
      <td><input type="checkbox" ${isChecked ? 'checked' : ''}></td>
      <td>${item.date}</td>
      <td>${item.qoe}</td>
    `;
    tbody.appendChild(row);
  });

  // 첫 번째 체크박스 상태 업데이트
  updateFirstCheckboxState(checkboxStates, start, end, '#bop-sensor-data-table thead tr th input[type="checkbox"]');

  // 현재 페이지의 체크박스들에 대한 이벤트 리스너 추가
  addCheckboxChangeListeners(checkboxStates, start, '#bop-sensor-data-table tbody tr td input[type="checkbox"]', '#bop-sensor-data-table thead tr th input[type="checkbox"]');

  // 현재 페이지 업데이트
  currentPage = page;

  // 페이지네이션 업데이트
  updatePagination(sensorData, page, '#bop-sensor-data-pagination', displaySensorData);
};

// 페이지 로드 시 데이터 주기적 새로고침 시작
document.addEventListener('DOMContentLoaded', refreshSensorData);

  // 첫 번째 체크박스에 대한 이벤트 리스너 설정
  const firstCheckbox = document.querySelector('#bop-sensor-data-table thead tr th input[type="checkbox"]');
  firstCheckbox.addEventListener('change', (event) => {
    const isChecked = event.target.checked;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, sensorData.length);
    for (let i = start; i < end; i++) {
      checkboxStates[i] = isChecked;
      checkboxStates[i] = isChecked;
    }
    displaySensorData(currentPage); // 체크박스 상태를 업데이트하고 화면을 다시 그립니다.
  });