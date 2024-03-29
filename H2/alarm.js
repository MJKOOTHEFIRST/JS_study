// alarm.js
import { loadData} from './dataManager.js';

const AlarmManager = {
    currentFilters:['전항목'], // 여러 상태를 클릭할 수 있도록 배열로 변수를 설정.
    
    loadAlarmData: function() {
        loadData('alarm')
        .then(conf => {
    
            // 데이터 파싱
            const alarmsArray = this.parseAlarmSection(conf);
            // console.log("alarmsArray", alarmsArray);
    
            // 데이터 필터링 로직
            let filteredAlarmData;
            // 배열이 '전항목'을 포함하거나 비어있는 경우, 모든 알람 데이터 사용
            if (this.currentFilters.includes('전항목') || this.currentFilters.length === 0) {
                filteredAlarmData = alarmsArray;
            } else { //currentFilters가 특정 상태만 포함하는 경우 해당 상태의 알람만 필터링
                filteredAlarmData = alarmsArray.filter(alarm => this.currentFilters.includes(alarm.status));
            }
    
            // 필터링된 데이터로 알람 테이블 업데이트
            this.updateAlarmTable(filteredAlarmData);
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

    // 화면에 표시하는 기능
    updateAlarmTable: function(alarmData) {
        const tbody = document.querySelector('#alarm-log');
        tbody.innerHTML = ''; // 기존 내용을 비움

        // 선택된 항목 수에 따라 데이터를 필터링
        const selectedCount = document.getElementById('alarmCountSelect').value === '전체' ? alarmData.length : parseInt(document.getElementById('alarmCountSelect').value, 10);
        const limitedAlarmData = alarmData.slice(0, selectedCount);

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


export { AlarmManager };
