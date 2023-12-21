// system-info.js
import { loadData, parseConf } from './dataManager.js';

const SystemInfoManager = {
    loadSystemData: function() {
        loadData()
        .then(conf => {
            const systemData = parseConf(conf, 'system');
            this.updateSystemInfo(systemData);
        })
        .catch(error => {
            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
        });
    },

    updateSystemInfo: function(systemData) {
        document.getElementById('type').innerText = systemData.type || 'N/A';
        document.getElementById('capacity').innerText = systemData.capacity || 'N/A';
        document.getElementById('place').innerText = systemData.place || 'N/A';
        document.getElementById('date').innerText = systemData.date || 'N/A';
    }
};

export { SystemInfoManager };

/*
각 파일마다 단 한개의 default export만 존재할 수 있다. 
*/
