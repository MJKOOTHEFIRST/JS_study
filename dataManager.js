// dataManager.js
const base_data_url = "/fuelcell_data/";
const configFileName = 'total_data.conf';

export function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줍니다.
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

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
    // console.log('parseConf의 conf : ', typeof conf);
    const lines = conf.split('\n');
    // console.log('lines : ', lines); 
    let sectionData = {};
    let sectionFound = false;

    lines.forEach((line, index) => {
        // console.log('Line ${index}: ', line);

        // 주석 제거: '#' 문자가 있으면 그 이전까지의 문자열만 사용
        const commentIndex = line.indexOf('#');
        if (commentIndex !== -1) {
            line = line.substring(0, commentIndex);
        }

        // 빈 라인 무시
        if (line.trim() === '') {
            return;
        }

        if (line.trim() === `[${section}]`) {
            sectionFound = true;
            // console.log(`Section ${section} found at line ${index}.`); // 섹션 시작 지점

        } else if (sectionFound && line.startsWith('[')) {
            sectionFound = false;
            // console.log(`Section ${section} ended at line ${index}.`); // 섹션 종료 지점을

        } else if (sectionFound) {
            const parts = line.split('=');
            // console.log(`Line ${index} split into parts:`, parts); // '='로 분할된 부분

            if (parts.length === 2) {
                const key = parts[0].trim();
                const value = parts[1].trim();
                sectionData[key] = value;
                // console.log(`Key-Value pair found: ${key} = ${value}`);
            }
        }
    });
    // console.log(`Section data for ${section}:`, sectionData); // 최종 섹션 데이터
    return sectionData;
};


export const startDataRefresh = (callback, interval = 10000) => {
    const refreshData = () => { 
        loadData().then(conf => { // refreshData는 loadData를 호출하여 데이터 로드
            // console.log('type of conf: ',typeof conf);
            // console.log(conf);
            callback(conf); // startDataRefresh 함수는 콜백 함수를 매개변수로 받아, 데이터 로딩이 완료될 때마다 해당 콜백함수 실행.
        }).catch(error=> {
            console.error('error loading data:', error);
        });
    };
    refreshData(); // 최초 실행
    setInterval(refreshData, interval); // 주기적 실행
};
// 데이터 로딩 로직은 dataManager.js에서 중앙집중적 관리, 로드된 데이터를 어떻게 사용할지는 각 위젯에서 결정


export const loadAllData = () => {
    const timestamp = new Date().toISOString(); // 현재 시간을 ISO 형식의 문자열로 변환
    const url = `${base_data_url}${configFileName}?t=${timestamp}`; // URL에 현재 시간을 파라미터로 추가(캐시없애기)

    return fetch(url)
        .then(response => response.text())
        .then(text => {
            const data = parseAllConf(text); // 모든 섹션의 데이터를 파싱
            console.log('Today is', getToday()); // 오늘 날짜 출력
            // console.log('Loaded data:', data); // 로드된 데이터 출력
            return data;
        })
        .catch(error => {
            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            throw error;
        });
};


export const parseAllConf = (conf) => {
    const lines = conf.split('\n');
    let data = {};
    let currentSection = null;

    lines.forEach(line => {
        // 주석 제거: '#' 문자가 있으면 그 이전까지의 문자열만 사용
        const commentIndex = line.indexOf('#');
        if (commentIndex !== -1) {
            line = line.substring(0, commentIndex);
        }

        // 빈 라인 무시
        if (line.trim() === '') {
            return;
        }

        // 섹션 시작
        if (line.startsWith('[')) {
            currentSection = line.slice(1, -1);
            data[currentSection] = {};
        } else if (currentSection) {
            const parts = line.split('=');
            if (parts.length === 2) {
                const key = parts[0].trim();
                const value = parts[1].trim();
                data[currentSection][key] = value;
            }
        }
    });

    return data;
};
