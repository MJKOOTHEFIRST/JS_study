// bop_dataManager.js
const base_data_url = "/fuelcell_data/";

export const loadData = (filename) => {
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

// 주기적인 데이터 리프레시를 위한 함수
export const startDataRefresh = (filename, parseFunction, callback, interval = 10000) => {
  const refreshData = () => {
    loadData(filename)
      .then(csvText => {
        const data = parseFunction(csvText);
        callback(data);
      })
      .catch(error => console.error('Error loading data:', error));
  };

  refreshData(); // 최초 실행
  setInterval(refreshData, interval); // 지정된 인터벌로 주기적 실행
};

////////////////////////////////////////////////////////////////////////////////////////////////
// 정상 학습 데이터 파싱 함수
export const parseCsvLearningData = (csvText) => {
  const lines = csvText.split('\n');
  let learningData = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const [date, startTime, endTime] = line.split(',');
      learningData.push({ date, startTime, endTime }); 
    }
  }
  
  return learningData;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// 센서 데이터 파싱 함수
export const parseCsvSensorData = (csvText) => {
  const lines = csvText.split('\n');
  let sensorData = [];

  for (let i = 1; i < lines.length; i++) {
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
