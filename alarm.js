// alarm.js
import { loadData} from './dataManager.js';

const AlarmManager = {
    loadAlarmData: function() {
        loadData('alarm')
        .then(conf => {
            console.log("conf 타입:", typeof conf); // conf의 타입을 확인
            console.log("conf 내용:", conf); // conf의 실제 내용을 확인

            // parseAlarmSection 함수를 사용하여 데이터 파싱
            const alarmsArray = this.parseAlarmSection(conf);
            console.log("alarmsArray", alarmsArray);
            this.updateAlarmTable(alarmsArray);
        })
        .catch(error => {
            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
        });
    },

    parseAlarmSection: function(conf) {
    const lines = conf.split('\n');
    let alarms = [];
    let sectionFound = false;
    let isFirstLine = true;  // 첫 번째 줄인지 추적하기 위한 변수

    lines.forEach(line => {
        if (line.trim() === '[alarm]') {
            sectionFound = true;
            isFirstLine = true;  // 새 섹션이 시작될 때마다 첫 번째 줄로 초기화
        } else if (sectionFound && line.startsWith('[')) {
            sectionFound = false;
        } else if (sectionFound) {
            if (isFirstLine) {
                isFirstLine = false;  // 첫 번째 줄을 건너뛰고 플래그 변경
                return;
            }

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
