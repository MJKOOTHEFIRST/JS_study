// qoe.js (품질지수)
import { loadData, parseConf } from './dataManager.js';

const QoeManager = {
    loadQoeData: function() {
        loadData()
            .then(conf => {
                // console.log("원본 데이터:", conf);
                const qoeData = parseConf(conf, 'qoe');
                // console.log("파싱된 데이터:", qoeData);
                this.updateQoe(qoeData);
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },
    

    updateSystemInfo: function(qoeData) {
        document.getElementById('qoeValue').innerText = qoeData.type || 'N/A';
    }
};

export { QoeManager };
/*
각 파일마다 단 한개의 default export만 존재할 수 있다. 
*/
