// SystemInfoManager.js
import { loadData, parseConf } from './dataManager.js';

var OperationInfoManager={
    loadSystemData: function() {
        loadData()
            .then(conf => {
                const operationData = parseConf(conf, 'system');
                this.updateSystemInfo(operationData);
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },
    parseOperationConf: function(conf){
        const lines = conf.split("\n");
        let operationData = {};
        let sectionFound = false;

        lines.forEach(line => {
        })
    }



}