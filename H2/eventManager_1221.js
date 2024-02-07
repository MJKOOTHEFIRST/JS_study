// eventManager.js 
// DOM loadded 됐을 때, event handling만 하는 것

import { startDataRefresh } from './dataManager.js';
import { QoeManager } from './qoe.js';
import { SystemInfoManager } from './system-info.js';
import { AlarmManager } from './alarm.js';
import {dayMonthProductionBarManager} from './dayMonthProductionBarManager.js';

document.addEventListener('DOMContentLoaded', function() {
    // conf를 다 넘겨줘야한다. 

    // 시스템 데이터 로드
    // SystemInfoManager.loadSystemData();
    startDataRefresh(SystemInfoManager.loadSystemData.bind(SystemInfoManager), 10000);

    // QOE 데이터 로드
    // QoeManager.loadQoeData();
    startDataRefresh(QoeManager.loadQoeData.bind(QoeManager), 10000);
    

    // 알람로그
    startDataRefresh(AlarmManager.loadAlarmData.bind(AlarmManager), 10000);

    // 전기/열 금일/금월 생산량 로드 
    //  dayMonthProductionBarManager.loadDayMonthProductionBarData('eProduction-bar', 'e_day');
    //  dayMonthProductionBarManager.loadDayMonthProductionBarData('tProduction-bar', 't_day');
});


