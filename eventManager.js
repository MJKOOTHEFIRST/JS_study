// eventManager.js 
// DOM loadded 됐을 때, event handling만 하는 것

import { loadData, startDataRefresh } from './dataManager.js';
import { QoeManager } from './qoe.js';
import { SystemInfoManager } from './system-info.js';
import { AlarmManager } from './alarm.js';
import { dayMonthProductionBarManager, toggleSwitch1, toggleSwitch2 } from './dayMonthProductionBar.js';
import { realTimeProductionManager } from './realTimeProduction.js';
import { operationRateManager } from './operationRate.js';

document.addEventListener('DOMContentLoaded', function() {
    //startDataRefresh 함수의 콜백에서 반환된 설정 데이터 저장
    // 이후 다른 함수나 이벤트 핸들러에서 이 데이터를 참조할 때 사용
    // 설정 파일에서 로드된 데이터가 필요한 경우, currentConf 변수를 통해 접근(callback)
    let currentConf = null;
    let currentOperationTimeUnit = 'day'; 

    // [발전량/가동율]
    // 시간 선택 이벤트 리스너 설정
    document.getElementById('operationRate-Year').addEventListener('click', function() {
        currentOperationTimeUnit = 'year';
        operationRateManager.loadOperationRateData(currentOperationTimeUnit);
    });
    document.getElementById('operationRate-Month').addEventListener('click', function() {
        currentOperationTimeUnit = 'month';
        operationRateManager.loadOperationRateData(currentOperationTimeUnit);
    });
    document.getElementById('operationRate-Day').addEventListener('click', function() {
        currentOperationTimeUnit = 'day';
        operationRateManager.loadOperationRateData(currentOperationTimeUnit);
    });

    /**********************************************************************************/
      // 초기 데이터 로드 및 차트 생성
      loadData().then(conf => {
        currentConf = conf;
        SystemInfoManager.loadSystemData(conf); //[시스템]
        QoeManager.loadQoeData(conf); //[qoe]
        AlarmManager.loadAlarmData(conf); //[알람로그]
        realTimeProductionManager.loadRealTimeProductionData(); //[실시간생산량]
        // operationRateManager.loadOperationRateData('day'); //[발전량 / 가동율]
        // [금일/금월 생산량 막대차트]
        const eData = dayMonthProductionBarManager.parseDayMonthConf(conf, 'e_day');
        const tData = dayMonthProductionBarManager.parseDayMonthConf(conf, 't_day');
        dayMonthProductionBarManager.createChart('eProduction-bar', eData, 'e_day');
        dayMonthProductionBarManager.createChart('tProduction-bar', tData, 't_day');
    }).catch(error => {
        console.error('초기 데이터 로드 중 오류 발생:', error);
    });

    /**********************************************************************************/
    // 주기적 데이터 업데이트 및 차트 업데이트
    startDataRefresh(conf => { 
        currentConf = conf;
        SystemInfoManager.loadSystemData(conf); //[시스템]
        QoeManager.loadQoeData(conf); //[qoe]
        AlarmManager.loadAlarmData(conf); //[알람로그]
        realTimeProductionManager.loadRealTimeProductionData(); //[실시간생산량]
        operationRateManager.loadOperationRateData(currentOperationTimeUnit); // 발전량 / 가동율
        // [금일/금월 생산량 막대차트]
        dayMonthProductionBarManager.updateChart('eProduction-bar', conf, 'e_day');
        dayMonthProductionBarManager.updateChart('tProduction-bar', conf, 't_day');
    }, 10000);
    
    
    /**********************************************************************************/
    // 이벤트 즉각동작

    // [알람로그]
    // 개수 선택 드롭다운에 이벤트 리스너 추가(이벤트 기반 별도의 업데이트 메커니즘추가로 즉각반영되도록함)
    const alarmCountSelect = document.getElementById('alarmCountSelect');
    alarmCountSelect.addEventListener('change', function(){
        //선택된 개수에 따라 알람 데이터 업데이트
        AlarmManager.loadAlarmData();
    });
    // 필터
    const filterButtons = document.querySelectorAll('.widget-head-gadget-alarm button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function(){
            AlarmManager.currentFilter = this.textContent;
            AlarmManager.loadAlarmData();
        })
    });

     // [발전량/가동율]
     // 시간 선택 클릭 이벤트 
     document.getElementById('operationRate-Year').addEventListener('click', function() {
        operationRateManager.loadOperationRateData('year');
    });
    document.getElementById('operationRate-Month').addEventListener('click', function() {
        operationRateManager.loadOperationRateData('month');
    });
    document.getElementById('operationRate-Day').addEventListener('click', function() {
        operationRateManager.loadOperationRateData('day');
    });

    // [금일/금월 생산량 막대차트]
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


