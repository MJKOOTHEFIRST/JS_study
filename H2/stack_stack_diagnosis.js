// stack_stack_diagnosis.js 스택 진단
import { loadStackData, parseCsvStackDiagnosisData , startDataRefresh } from './stack_dataManager.js';

// 카테고리를 한국어로 변환하는 함수
function translateCategory(category) {
  switch (category) {
    case 'High_Frequency': return '고주파';
    case 'Mid-band_Frequency': return '중간대역파';
    case 'Low_Frequency': return '저주파';
    case 'High': return 'High';
    case 'Low': return 'Low';
    case 'Stack_QoE': return 'Stack QoE';
    default: return category; // 알 수 없는 카테고리는 그대로 반환
  }
}

// 스택 진단 데이터를 HTML 테이블에 채우는 함수
const fillStackDiagnosisTable = (stackDiagnosisData) => {
  const tableBody = document.getElementById('stack-diagnosis-tbody');
  tableBody.innerHTML = ''; // 기존 내용을 비운다.

  stackDiagnosisData.forEach(data => {
    const row = document.createElement('tr');
    
    // 각 카테고리와 값에 대한 셀 생성
    const categoryCell = document.createElement('td');
    categoryCell.textContent = translateCategory(data.category); // 카테고리를 한국어로 변환

    if (data.category === 'Stack_QoE') {
      // Stack QoE의 경우 colspan을 적용
      categoryCell.colSpan = 2;
      row.appendChild(categoryCell);

      const valueCell = document.createElement('td');
      valueCell.textContent = data.normalValue;
      valueCell.colSpan = 2;
      valueCell.className = 'primary-C';
      row.appendChild(valueCell);
    } else {
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
    }

    tableBody.appendChild(row);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  startDataRefresh('stack_diagnosis_data.csv', csvText => {
    const diagnosisData = parseCsvStackDiagnosisData(csvText);
    fillStackDiagnosisTable(diagnosisData);
  });
});