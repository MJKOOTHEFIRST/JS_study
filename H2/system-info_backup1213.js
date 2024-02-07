var SystemInfoManager = {
    base_data_url: "/conf_data/",
    configFileName: 'total_data.conf',

    loadSystemData: function() {
        fetch(this.base_data_url + this.configFileName)
            .then(response => response.text())
            .then(conf => {
                const systemData = this.parseSystemConf(conf);
                this.updateSystemInfo(systemData);
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    parseSystemConf: function(conf) {
        const lines = conf.split('\n');
        let systemData = {};
        let sectionFound = false;

        lines.forEach(line => {
            if (line.trim() === '[system]') {
                sectionFound = true;
            } else if (sectionFound && line.startsWith('[')) {
                sectionFound = false;
            } else if (sectionFound) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const key = parts[0].trim();
                    const value = parts[1].trim();
                    systemData[key] = value;
                }
            }
        });

        return systemData;
    },

    updateSystemInfo: function(systemData) {
        document.getElementById('type').innerText = systemData.type || 'N/A';
        document.getElementById('capacity').innerText = systemData.capacity || 'N/A';
        document.getElementById('place').innerText = systemData.place || 'N/A';
        document.getElementById('date').innerText = systemData.date || 'N/A';
    }
};

// HTML 페이지 로딩 시 시스템 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    SystemInfoManager.loadSystemData();
});
