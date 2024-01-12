//bop_dataManager.js

export const loadData = (filename = 'bop_learning_data.csv') => {
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
// 정상 학습 데이터
export const parseCsvLearningData = (csvText) => {
  const lines = csvText.split('\n');
  let learningData = [];
  
  for (let i = 1; i < lines.length; i++) { // 첫 번째 줄은 헤더로 건너뛴다.
    const line = lines[i].trim();
    if (line) {
      const [date, startTime, endTime] = line.split(',');
      learningData.push({ date, startTime, endTime }); 
    }
  }
  
  return learningData;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// 센서 데이터
export const parseCsvSensorData = (csvText) => {
  const lines = csvText.split('\n');
  let sensorData = [];

  for (let i = 1; i < lines.length; i++) { // 첫 번째 줄은 헤더로 건너뛴다.
    const line = lines[i].trim();
    if (line) {
      const parts = line.split(',');
      const date = parts[0];
      const qoe = parseInt(parts[1], 10);
      sensorData.push({ date, qoe });
    }
  }

  return sensorData;
};

