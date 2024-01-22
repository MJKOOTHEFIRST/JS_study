// stack_stack_diagnosis.js 스택 진단
import { loadStackData, parseCsvStackDiagnosisData , startDataRefresh } from './stack_dataManager.js';

// 스택 진단 데이터를 HTML 테이블에 채우는 함수
const fillStackDiagnosisTable = (stackDiagnosisData) => {
  const tableBody = document.getElementById('stack-diagnosis-tbody');
  tableBody.innerHTML = ''; // 기존 내용을 비운다.

  stackDiagnosisData.forEach(data => {
    const row = document.createElement('tr');
    
    // 각 카테고리와 값에 대한 셀 생성
    const categoryCell = document.createElement('td');
    categoryCell.textContent = data.category;
    row.appendChild(categoryCell);

    const normalValueCell = document.createElement('td');
    normalValueCell.textContent = data.normalValue;
    row.appendChild(normalValueCell);

    const standardDeviationCell = document.createElement('td');
    standardDeviationCell.textContent = data.standardDeviation;
    row.appendChild(standardDeviationCell);

    const currentMeasurementCell = document.createElement('td');
    currentMeasurementCell.textContent = data.currentMeasurement;
    row.appendChild(currentMeasurementCell);

    tableBody.appendChild(row);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  loadStackData('stack_diagnosis_data.csv')
    .then(response => parseCsvStackDiagnosisData(response))
    .then(data => fillStackDiagnosisTable(data))
    .catch(error => console.error('Error loading or parsing data:', error));
});
