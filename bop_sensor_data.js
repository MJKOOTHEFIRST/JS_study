// bop_sensor_data.js

// bop_dataManager.js에서 함수 임포트
import { loadData, parseCsvSensorData } from './bop_dataManager.js';
import { updatePagination } from './bop_eventManager.js';

const ITEMS_PER_PAGE = 20;  // 한 페이지에 표시할 항목 수
let currentPage = 1;  // 현재 페이지 번호
let sensorData = [];  // 센서 데이터

const loadAndDisplaySensorData = (page = 1) => {
  loadData('bop_sensor_data.csv')
    .then(csvText => parseCsvSensorData(csvText))
    .then(data => {
      sensorData = data;
      displaySensorData(page);
    })
    .catch(error => {
      console.error('Error loading or displaying data:', error);
    });
};

const displaySensorData = (page) => {
  const tbody = document.querySelector('#bop-sensor-data-table tbody');
  if (!tbody) {
    throw new Error('Table body not found');
  }

  // 기존의 내용을 초기화
  tbody.innerHTML = '';

  // 표시할 데이터 범위를 계산
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  // 새로운 행 추가
  sensorData.slice(start, end).forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox"></td>
      <td>${item.date}</td>
      <td>${item.qoe}</td>
    `;
    tbody.appendChild(row);
  });

  // 현재 페이지 업데이트
  currentPage = page;

  // 페이지네이션 업데이트
  updatePagination(sensorData, page, '#bop-sensor-data-pagination', displaySensorData);
};

// 페이지 로드 시 데이터 로드 및 표시
document.addEventListener('DOMContentLoaded', () => loadAndDisplaySensorData(currentPage));