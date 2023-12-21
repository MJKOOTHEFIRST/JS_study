// qoe.js
import { loadData, parseConf } from './dataManager.js';

const QoeManager = {
    loadQoeData: function() {
        loadData()
            .then(conf => {
                const qoeData = parseConf(conf, 'qoe');
                this.updateQoeInfo(qoeData);
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    updateQoeInfo: function(qoeData) {
        document.getElementById('qoeValue').innerText = qoeData.qoe || 'N/A';
    }
};

export { QoeManager };
