// stack_dataManager.js

// dataManager.js
const base_data_url = "/fuelcell_data/";

export const loadStackData = (filename) => {
  const timestamp = new Date().toISOString(); 
  const url = `${base_data_url}${filename}?t=${timestamp}`;

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.text();
    })
    .catch(error => {
      console.error('Failed to load CSV file:', error);
      throw error;
    });
};

export const startDataRefresh = (filename, callback, interval = 10000) => {
  const refreshData = () => {
    loadStackData(filename)
      .then(csvText => callback(csvText))
      .catch(error => console.error('Error loading data:', error));
  };

  refreshData(); // 최초 실행
  setInterval(refreshData, interval); // 주기적 실행
};

/////////////////////////////////////////////////////////////////////////////////////////////
// 진단 로그 데이터(stack_diagnosis_log_data.csv)
export const parseCsvDiagnosisLogData = (csvText) => {
  const lines = csvText.split('\n');
  let diagnosisLogData = [];
  
  for (let i = 1; i < lines.length; i++) { // 첫 번째 줄은 헤더로 건너뛴다.
    const line = lines[i].trim();
    if (line) {
      const [time, content] = line.split(',');
      diagnosisLogData.push({ time, content }); 
    }
  }
  
  return diagnosisLogData;
};

/////////////////////////////////////////////////////////////////////////////////////////////
// 스택 진단 데이터(stack_diagnosis_data.csv)
// stack_diagnosis_data.csv 파일에서 스택 진단 데이터를 파싱하는 함수
export const parseCsvStackDiagnosisData = (csvText) => {
  const lines = csvText.split('\n');
  let stackDiagnosisData = [];

  for (let i = 1; i < lines.length; i++) { // 첫 번째 줄은 헤더로 건너뛴다.
    const line = lines[i].trim();
    if (line) {
      const [category, normalValue, standardDeviation, currentMeasurement] = line.split(',');
      stackDiagnosisData.push({
        category,
        normalValue: normalValue === '' ? null : parseFloat(normalValue),
        standardDeviation: standardDeviation === '' ? null : parseFloat(standardDeviation),
        currentMeasurement: currentMeasurement === '' ? null : parseFloat(currentMeasurement)
      });
    }
  }

  return stackDiagnosisData;
};

