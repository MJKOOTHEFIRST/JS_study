// dataManager.js
/*
export const loadData = async () => {
    const response = await fetch('/conf_data/total_data.conf');
    if (!response.ok) {
        throw new Error('Failed to load data');
    }
    const data = await response.text();
    return data;
};

export const parseDataBySection = (data, section) => {
    const lines = data.split('\n');
    let sectionFound = false;
    const result = [];

    lines.forEach(line => {
        if (line.trim() === `[${section}]`) {
            sectionFound = true;
        } else if (sectionFound && line.startsWith('[')) {
            sectionFound = false;
        } else if (sectionFound) {
            const parts = line.split('=');
            if (parts.length === 2) {
                result.push({
                    time: parts[0].trim().split('_')[2],
                    value: parseFloat(parts[1].trim())
                });
            }
        }
    });

    return result;
};
*/

// dataManager.js
const base_data_url = "/conf_data/";
const configFileName = 'total_data.conf';

console.log(`dataManager.js 호출`);

export const loadData = () => {
    return fetch(base_data_url + configFileName)
        .then(response => response.text())
        .catch(error => {
            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            throw error
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


const refreshData = () => {
    console.log(`refreshData 확인`); 
    loadData().then(conf => {
        //console.log(`conf:`,conf);
        //const parsedData = parseConf(conf); // 섹션을 명시하지 않은 경우는 전체 데이터 파싱
        //console.log(`parsedData:`,parsedData);
        callback( conf );
    });
};

//데이터 업데이트
// startDataRefresh 함수는 콜백 함수와 업데이트 간격을 매개변수로 받는다. 
// loadData를 호출해서 데이터 로드하고, parseConf 통해 파싱된 데이터 콜백함수에 전달
// 다른 모듈에서 이 기능을 사용하려면, 해당 모듈에서 'startDataRefresh'함수 import 해서 쓰면된다
// 예 : import { startDataRefresh} from './dataManager.js'; 
// const updateWidgetData = (data) => {} 


export const startDataRefresh = (callback, interval = 10000) => {
    refreshData();
    setInterval(refreshData, interval);
};

