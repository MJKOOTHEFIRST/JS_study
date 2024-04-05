//stack_stack_diagnosis.js
import { loadStackData, parseCsvStackDiagnosisData, startDataRefresh } from './stack_dataManager.js';
// HTML에 값을 채워 넣기
const fillStackDiagnosisTable = (data) => {
  const tbody = document.getElementById('stack-diagnosis-tbody');

  // 테이블의 내용을 초기화합니다.
  tbody.innerHTML = '';

  // 데이터를 반복하여 테이블에 추가합니다.
  data.forEach(({ category, normalValue, standardDeviation, currentMeasurement }) => {
    const row = document.createElement('tr');

    // 카테고리 열을 생성하고 값 추가
    const categoryCell = document.createElement('td');
    categoryCell.textContent = category;
    row.appendChild(categoryCell);

    // 정상 열을 생성하고 값 추가
    const normalValueCell = document.createElement('td');
    normalValueCell.textContent = normalValue !== null ? normalValue : '';
    row.appendChild(normalValueCell);

    // 표준편차 열을 생성하고 값 추가
    const standardDeviationCell = document.createElement('td');
    standardDeviationCell.textContent = standardDeviation !== null ? standardDeviation : '';
    row.appendChild(standardDeviationCell);

    // 현재 측정값 열을 생성하고 값 추가
    const currentMeasurementCell = document.createElement('td');
    currentMeasurementCell.textContent = currentMeasurement !== null ? currentMeasurement : '';
    row.appendChild(currentMeasurementCell);

    // 생성된 행을 tbody에 추가
    tbody.appendChild(row);
  });

  // Stack QoE와 BOP QoE 값을 가진 td 요소를 찾아서 가운데 정렬을 적용합니다.
  const stackQoECell = tbody.querySelector('td[colspan="2"].primary-C');
  if (stackQoECell) {
    stackQoECell.style.textAlign = 'center';
  }

  const bopQoECell = tbody.querySelector('td[colspan="2"].primary-C');
  if (bopQoECell) {
    bopQoECell.style.textAlign = 'center';
  }
};


// 데이터를 가져와서 테이블을 채우는 함수
const fetchDataAndFillTable = () => {
  loadStackData('stack_diagnosis_data.csv')
    .then(csvText => {
      const stackDiagnosisData = parseCsvStackDiagnosisData(csvText);
      fillStackDiagnosisTable(stackDiagnosisData);
    })
    .catch(error => console.error('Error loading data:', error));
};

// 시작할 때 한 번 호출하고, 그 후 주기적으로 호출합니다.
fetchDataAndFillTable();
startDataRefresh('stack_diagnosis_data.csv', fetchDataAndFillTable);
