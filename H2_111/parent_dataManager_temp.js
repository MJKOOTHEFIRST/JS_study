// parent_dataManager.js
const base_data_url = "/fuelcell_data/";
const configFileName = 'total_data.conf'; //변경하면됨

function parseData(text, section = null) {
  const data = {};
  const lines = text.split('\n');
  let currentSection = null; // 현재 파싱 중인 섹션을 추적

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('[') && line.endsWith(']')) {
      // 섹션 헤더를 찾았을 때
      currentSection = line.substring(1, line.length - 1).trim();
      console.log(`현재 파싱 중인 섹션: ${currentSection}`); // 섹션 시작 로그
    } else if (line && !line.startsWith('#')) {
      // 유효한 데이터 라인일 때
      const parts = line.split('=');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        if (!section || section === currentSection) {
          // section 매개변수가 null이거나 현재 섹션과 일치할 때만 데이터 추가
          data[key] = value;
           console.log(`키: ${key}, 값: ${value}`); // 데이터 라인 로그
        }
      }
    }
  });

  return data;
}

export const loadData = (section = null) => {
  const timestamp = new Date().toISOString();
  const url = `${base_data_url}${configFileName}?t=${timestamp}`;

  return fetch(url)
    .then(response => response.text())
    .then(text => {
      // console.log("로드데이터", text);
      const data = parseData(text, section); // section 매개변수 추가
      console.log("파싱데이터", data);
      return data;
    })
    .catch(error => {
      console.error('CONF 파일을 불러오는 데 실패했습니다:', error);
      throw error;
    });
};

// 데이터 새로고침 함수
export const startDataRefresh = (callback, interval = 10000) => {
  const refreshData = () => {
    loadData().then(data => {
      callback(data); // 콜백 함수에 데이터를 전달
    }).catch(error => {
      console.error('Error loading data:', error);
    });
  };

  refreshData(); // 최초 실행
  setInterval(refreshData, interval); // 주기적 실행
};
