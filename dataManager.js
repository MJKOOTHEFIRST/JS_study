// dataManager.js
const base_data_url = "/conf_data/";
const configFileName = 'total_data.conf';

export const loadData = (section = null) => {
    const timestamp = new Date().toISOString(); // 현재 시간을 ISO 형식의 문자열로 변환
    const url = `${base_data_url}${configFileName}?t=${timestamp}`; // URL에 현재 시간을 파라미터로 추가(캐시없애기)

    return fetch(url)
        .then(response => response.text())
        .then(text => {
            if (section && section !== 'alarm') {
                return parseConf(text, section);
            }
            return text;
        })
        .catch(error => {
            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            throw error;
        });
};


export const parseConf = (conf, section) => {
    const lines = conf.split('\n');
    let sectionData = {};
    let sectionFound = false;

    lines.forEach(line => {
        if (line.trim() === `[${section}]`) {
            sectionFound = true;
        } else if (sectionFound && line.startsWith('[')) {
            sectionFound = false;
        } else if (sectionFound) {
            const parts = line.split('=');
            if (parts.length === 2) {
                const key = parts[0].trim();
                const value = parts[1].trim();
                sectionData[key] = value;
                // console.log(`Key: ${key}, Value: ${value}`);
            }
        }
    });
    return sectionData;
};

export const startDataRefresh = (callback, interval = 10000) => {
    const refreshData = () => { 
        loadData().then(conf => { // refreshData는 loadData를 호출하여 데이터 로드
            callback(conf); // startDataRefresh 함수는 콜백 함수를 매개변수로 받아, 데이터 로딩이 완료될 때마다 해당 콜백함수 실행.
        }).catch(error=> {
            console.error('error loading data:', error);
        });
    };
    refreshData(); // 최초 실행
    setInterval(refreshData, interval); // 주기적 실행
};
// 데이터 로딩 로직은 dataManager.js에서 중앙집중적 관리, 로드된 데이터를 어떻게 사용할지는 각 위젯에서 결정

