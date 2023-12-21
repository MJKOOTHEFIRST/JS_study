// alarm.js
import { loadData} from './dataManager.js';

const AlarmManager = {
    loadAlarmData: function() {
        loadData('alarm')
            .then(alarmData => {
                // conf 타입 확인 X
                // alarmData 객체를 직접 사용
                /*
                if (typeof conf === 'string') {
                    const alarmData = this.parseAlarmSection(conf);
                */    
                    this.updateAlarmTable(alarmData);
                    /*
                } else {
                    console.error('conf is not a string. Actual type: ' + typeof conf);
                }
                */
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    parseAlarmSection: function(conf) {
        const lines = conf.split('\n');
        let alarms = [];
        let sectionFound = false;
    
        lines.forEach(line => {
            if (line.trim() === '[alarm]') {
                sectionFound = true;
            } else if (sectionFound && line.startsWith('[')) {
                sectionFound = false;
            } else if (sectionFound) {
                const parts = line.split('^_^');
                if (parts.length === 3) {
                    const [time, comment, status] = parts.map(part => part.trim());
                    alarms.push({ time, comment, status });
                }
            }
        });
    
        return alarms;
    },

    updateAlarmTable: function(alarmData) {
        const tbody = document.querySelector('#alarm-log');
        tbody.innerHTML = ''; // 기존 내용을 비움

         // 선택된 항목 수에 따라 데이터를 필터링
         const selectedCount = parseInt(document.getElementById('alarmCountSelect').value, 10); //값 가져와서 10진수로 변환
         const limitedAlarmData = alarmData.slice(0, selectedCount); // 배열의 첫번째 요소부터 selectedCount 번째 요소까지 추출해서 저장

        limitedAlarmData.forEach(alarm => {
            const tr = document.createElement('tr');
            let statusClass = '';
            switch (alarm.status) {
                case '경고':
                    statusClass = 'warning-C';
                    break;
                case '비상':
                    statusClass = 'critical-C';
                    break;
                case '점검요망':
                    statusClass = 'watchout-C';
                    break;
            }
    
            tr.innerHTML = `
            <td class="col-4">${alarm.time}</td>
            <td class="col-6">${alarm.comment}</td> 
            <td class="col-2 ${statusClass}">${alarm.status}</td>
            `;
            tbody.appendChild(tr);
        });
    }
};

// 10초마다 데이터 새로고침 --> eventManager.js 로 보낸다.
// startDataRefresh(() => alarmManager.loadAlarmData(), 10000);

export { AlarmManager };
