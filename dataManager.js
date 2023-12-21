// dataManager.js
const base_data_url = "/conf_data/";
const configFileName = 'total_data.conf';

export const loadData = (section = null) => {
    return fetch(base_data_url + configFileName)
        .then(response => response.text())
        .then(text => {
            if (section) {
                return parseConf(text, section);
            }
            return text; // 전체 데이터를 반환
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
                ///console.log(`Key: ${key}, Value: ${value}`);
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

/*
이전코드
refreshData 함수가 모든 위젯에 대해 동일한 데이터 로딩 방식을 사용하고, 
차이가 있는 부분이 주로 시각적인 차트 구현이라면, callback 함수를 refreshData에 포함시킬 필요가 없다. 
export const startDataRefresh = (callback, interval = 10000) => {
    const refreshData = (callback) => { 
        loadData().then(conf => {
         // const parsedData = parseConf(conf); // 섹션을 명시하지 않은 경우는 전체 데이터 파싱
         callback( conf );
     });
 };
    // refreshData(); //callback을 여기서 패스한다
    refreshData(callback); //callback을 여기서 패스한다
    // setInterval(refreshData, interval);
    setInterval(() => refreshData(callback), interval); // 
};
*/