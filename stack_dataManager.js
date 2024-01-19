// stack_dataManager.js

export const loadStackData = (filename = 'stack_diagnosis_log_data.csv') => {
  const base_data_url = "/fuelcell_data/";
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

////////////////////////////////////////////////////////////////////////////////////////////////
// 진단 로그 데이터
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
