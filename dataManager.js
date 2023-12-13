// dataManager.js
const base_data_url = "/conf_data/";
const configFileName = 'total_data.conf';

export const loadData = () => {
    return fetch(base_data_url + configFileName)
        .then(response => response.text())
        .catch(error => console.error('CONF 파일을 불러오는 데 실패했습니다.', error));
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
            }
        }
    });

    return sectionData;
};
