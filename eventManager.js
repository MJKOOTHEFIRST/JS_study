// eventManager.js 
// DOM loadded 됐을 때, event handling만 하는 것

import { loadData, startDataRefresh } from './dataManager.js';
import { QoeManager } from './qoe.js';
import { SystemInfoManager } from './system-info.js';
import { AlarmManager } from './alarm.js';
import { dayMonthProductionBarManager, toggleSwitch1, toggleSwitch2 } from './dayMonthProductionBar.js';

document.addEventListener('DOMContentLoaded', function() {
    //startDataRefresh 함수의 콜백에서 반환된 설정 데이터 저장
    // 이후 다른 함수나 이벤트 핸들러에서 이 데이터를 참조할 때 사용
    // 설정 파일에서 로드된 데이터가 필요한 경우, currentConf 변수를 통해 접근
    let currentConf = null;

      // 초기 데이터 로드 및 차트 생성
      loadData().then(conf => {
        currentConf = conf;
        SystemInfoManager.loadSystemData(conf);
        QoeManager.loadQoeData(conf);
        AlarmManager.loadAlarmData(conf);
        // 차트 생성
        const eData = dayMonthProductionBarManager.parseDayMonthConf(conf, 'e_day');
        const tData = dayMonthProductionBarManager.parseDayMonthConf(conf, 't_day');
        dayMonthProductionBarManager.createChart('eProduction-bar', eData, 'e_day');
        dayMonthProductionBarManager.createChart('tProduction-bar', tData, 't_day');
    }).catch(error => {
        console.error('초기 데이터 로드 중 오류 발생:', error);
    });

    // 주기적 데이터 업데이트 및 차트 업데이트
    startDataRefresh(conf => { 
        currentConf = conf;
        SystemInfoManager.loadSystemData(conf);
        QoeManager.loadQoeData(conf);
        AlarmManager.loadAlarmData(conf);
        // 차트 업데이트
        dayMonthProductionBarManager.updateChart('eProduction-bar', conf, 'e_day');
        dayMonthProductionBarManager.updateChart('tProduction-bar', conf, 't_day');
    }, 10000);

    // 토글 스위치 이벤트 핸들러
    toggleSwitch1.addEventListener('change', function(event) {
        const section = event.target.checked ? 'e_day' : 'e_month';
        dayMonthProductionBarManager.updateChart('eProduction-bar', currentConf, section);
    });

    toggleSwitch2.addEventListener('change', function(event) {
        const section = event.target.checked ? 't_day' : 't_month';
        dayMonthProductionBarManager.updateChart('tProduction-bar', currentConf, section);
    });
});

/*
    // 시스템 데이터 로드
    // SystemInfoManager.loadSystemData();
    startDataRefresh(SystemInfoManager.loadSystemData.bind(SystemInfoManager), 10000);

    // QOE 데이터 로드
    // QoeManager.loadQoeData();
    startDataRefresh(QoeManager.loadQoeData.bind(QoeManager), 10000);
    

    // 알람로그
    startDataRefresh(AlarmManager.loadAlarmData.bind(AlarmManager), 10000);
*/



