// dataManagerEtag.js 
// 현재 코드는 전체 파일에 ETag 하는 경우.
// 개별 섹션에 ETag 하고 일부 섹션에서만 ETag를 하는 경우 달라진다. 

const base_data_url = "/conf_data/";
const configFileName = 'total_data.conf';

let etags = {}; // 섹션별 ETag를 저장할 객체

export const loadData = (section = null) => {
    const timestamp = new Date().toISOString();
    const url = `${base_data_url}${configFileName}?t=${timestamp}`;

    const headers = etags[section] ? { 'If-None-Match': etags[section] } : {}; // 섹션별 ETag가 있으면 헤더에 추가

    return fetch(url, { headers })
        .then(response => {
            if (response.status === 304) { // ETag가 변경되지 않았다면
                throw new Error('No change'); // 에러를 던져서 다음 then을 건너뛰기
            }

            etags[section] = response.headers.get('ETag'); // 섹션별 ETag를 저장

            return response.text();
        })
        .then(text => {
            if (section && section !== 'alarm') {
                return parseConf(text, section);
            }
            return text;
        })
        .catch(error => {
            if (error.message === 'No change') { // ETag가 변경되지 않았다면
                return null; // null 반환
            }

            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            throw error;
        });
};



export const parseConf = (conf, section) => {
    const lines = conf.split('\n');
    let sectionData = {};
    let sectionFound = false;

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
            }
        }
    });
    return sectionData;
};


export const startDataRefresh = (callback, interval = 10000) => {
    const refreshData = () => { 
        loadData().then(conf => { // refreshData는 loadData를 호출하여 데이터 로드
            if (conf !== null) { // 데이터가 변경되었을 때만 콜백 함수 실행! 이게 기존 코드와 차이.
                callback(conf);
            }
        }).catch(error=> {
            console.error('error loading data:', error);
        });
    };
    refreshData(); // 최초 실행
    setInterval(refreshData, interval); // 주기적 실행
  };