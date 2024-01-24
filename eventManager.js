// eventManager.js 
// DOM loadded 됐을 때, event handling만 하는 것

import { loadData, startDataRefresh } from './dataManager.js';
import { QoeManager } from './qoe.js';
import { SystemInfoManager } from './system-info.js';
import { AlarmManager } from './alarm.js';
import { dayMonthProductionBarManager, toggleSwitch1, toggleSwitch2 } from './dayMonthProductionBar.js';
import { realTimeProductionManager } from './realTimeProduction.js';
import { operationRateManager } from './operation-rate.js';
import { BopDiagramManager } from './bopDiagram.js';

document.addEventListener('DOMContentLoaded', function() {
    //startDataRefresh 함수의 콜백에서 반환된 설정 데이터 저장
    // 이후 다른 함수나 이벤트 핸들러에서 이 데이터를 참조할 때 사용
    // 설정 파일에서 로드된 데이터가 필요한 경우, currentConf 변수를 통해 접근(callback)
    let currentConf = null;
    let currentOperationTimeUnit = 'e_day';  //발전량/가동율 초기 설정

    // [금일/금월 전기생산량 열생산량 토글스위치]
    // 페이지 로드 시 토글 스위치의 초기 상태에 따라 eSection과 tSection 결정
    const eSection = toggleSwitch1.checked ? 'e_month' : 'e_day';
    const tSection = toggleSwitch2.checked ? 't_month' : 't_day';

    // [발전량/가동율] - 시간 선택 버튼에 대한 이벤트 리스너 설정
    function clearSelected() {
        document.querySelectorAll('.watt-operation-rate .time-select').forEach(element => {
            element.classList.remove('selected');
        });
    }

    document.getElementById('operationRate-Stack').addEventListener('click', function() {
        clearSelected();
        this.classList.add('selected');
        currentOperationTimeUnit = 'e_total';
        operationRateManager.loadOperationRateData(currentOperationTimeUnit);
    });

    document.getElementById('operationRate-Year').addEventListener('click', function() {
        clearSelected();
        this.classList.add('selected');
        currentOperationTimeUnit = 'e_year';
        operationRateManager.loadOperationRateData(currentOperationTimeUnit);
    });

    document.getElementById('operationRate-Month').addEventListener('click', function() {
        clearSelected();
        this.classList.add('selected');
        const currentMonth = new Date().getMonth() + 1;
        currentOperationTimeUnit = `e_month`;
        operationRateManager.loadOperationRateData(currentOperationTimeUnit, currentMonth);
    });

    document.getElementById('operationRate-Day').addEventListener('click', function() {
        clearSelected();
        this.classList.add('selected');
        currentOperationTimeUnit = `e_day`;
        operationRateManager.loadOperationRateData(currentOperationTimeUnit, new Date().getDate());
    });

    /**********************************************************************************/
      // 초기 데이터 로드 및 차트 생성
    loadData().then(conf => {
        currentConf = conf;
        SystemInfoManager.loadSystemData(conf); //[시스템]
        QoeManager.loadQoeData(conf); //[qoe]
        AlarmManager.loadAlarmData(conf); //[알람로그]
        realTimeProductionManager.loadRealTimeProductionData(); //[실시간생산량]
        BopDiagramManager.loadBopData(conf); // [시스템구조도-BOP]
        //[발전량 / 가동율]
        const currentDate = new Date().getDate().toString().padStart(2, '0');
        operationRateManager.loadOperationRateData('e_day', currentDate) // 현재 날짜를 keySuffix로 전달

    
        // [알람로그] 페이지 로드  시 '전항목' 선택
        AlarmManager.currentFilters = ['전항목'];
        document.getElementById('alarmCountSelect').value = '전체';
        AlarmManager.loadAlarmData();

        // [금일/금월 생산량 막대차트]
        // 페이지 로드 시 토글 스위치의 초기 상태와 차트 데이터의 초기 로드 상태를 일치시켜야 한다!!
        const eData = dayMonthProductionBarManager.parseDayMonthConf(conf, eSection);
        const tData = dayMonthProductionBarManager.parseDayMonthConf(conf, tSection);
        dayMonthProductionBarManager.createChart('eProduction-bar', eData, eSection);
        dayMonthProductionBarManager.createChart('tProduction-bar', tData, tSection);
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
        operationRateManager.loadOperationRateData(currentOperationTimeUnit); // [발전량 / 가동율]
        BopDiagramManager.loadBopData(conf); // [시스템구조도-BOP]
        // [금일/금월 생산량 막대차트]
        dayMonthProductionBarManager.updateChart('eProduction-bar', conf, eSection);
        dayMonthProductionBarManager.updateChart('tProduction-bar', conf, tSection);
    }, 10000);
    
    
    /**********************************************************************************/
    // 이벤트 즉각동작

    //////////////////////////////////////////////////////////////////////
    // [발전량/가동율]
    // 시간 선택 클릭 이벤트 
    /*
    document.getElementById('operationRate-Stack').addEventListener('click', function() {
        clearSelected();
        this.classList.add('selected');
        currentOperationTimeUnit = 'e_total';
        operationRateManager.loadOperationRateData(currentOperationTimeUnit);
    });
    
    document.getElementById('operationRate-Year').addEventListener('click', function() {
        clearSelected();
        this.classList.add('selected');
        currentOperationTimeUnit = 'e_year';
        operationRateManager.loadOperationRateData(currentOperationTimeUnit, 'eProductionChartYear');
    });
    
    document.getElementById('operationRate-Month').addEventListener('click', function() {
        clearSelected();
        this.classList.add('selected');
        const currentMonth = new Date().getMonth() + 1;
        currentOperationTimeUnit = `e_month`;
        operationRateManager.loadOperationRateData(currentOperationTimeUnit, 'eProductionChartMonth', currentMonth);
    });
    
    document.getElementById('operationRate-Day').addEventListener('click', function() {
        clearSelected();
        this.classList.add('selected');
        const currentDate = new Date().getDate();
        currentOperationTimeUnit = `e_day`;
        operationRateManager.loadOperationRateData(currentOperationTimeUnit, 'eProductionChartDay', currentDate);
    });
    
    //////////////////////////////////////////////////////////////////////
    // [금일/금월 생산량 막대차트]
    // 토글 스위치 이벤트 핸들러
    toggleSwitch1.addEventListener('change', function(event) {
        const eSection = event.target.checked ? 'e_month' : 'e_day';
        dayMonthProductionBarManager.updateChart('eProduction-bar', currentConf, eSection);
    });
    toggleSwitch2.addEventListener('change', function(event) {
        const tSection = event.target.checked ? 't_month' : 't_day';
        dayMonthProductionBarManager.updateChart('tProduction-bar', currentConf, tSection);
    });
    */
    
    
    //////////////////////////////////////////////////////////////////////
    //  [알람로그]
    // 전항목 버튼 클릭 이벤트 처리
    document.querySelector('.all-C').addEventListener('click', function() {
        // currentFilters 배열이 4개의 요소를 모두 포함하거나 '전항목'을 포함하면 isAllSelected를 true로 설정, 그렇지 않으면 false
        const isAllSelected = AlarmManager.currentFilters.length === 4 || AlarmManager.currentFilters.includes('전항목');
        // isAllSelected가 true면 currentfilters 배열을 비운다. false면 배열에 모든 상태를 추가한다. 
        AlarmManager.currentFilters = isAllSelected ? [] : ['정상', '점검요망', '경고', '비상'];
        // 버튼의 selected 클래스 토글, isAllSelected가  true => selected 클래스 제거, false면 selected 클래스 추가
        document.querySelectorAll('.btn-wrapper button').forEach(btn => {
            btn.classList.toggle('selected', !isAllSelected);
        });
        this.classList.toggle('selected', !isAllSelected);
        AlarmManager.loadAlarmData();
    });
    
    // 각 상태 버튼 클릭 이벤트 처리 
    document.querySelectorAll('.btn-wrapper button').forEach(button => {
        button.addEventListener('click', function() {
            const status = this.innerText;
            const allButton = document.querySelector('.all-C');
            const index = AlarmManager.currentFilters.indexOf(status);
    
            if (index > -1) {
                // 상태 제거
                AlarmManager.currentFilters.splice(index, 1);
                this.classList.remove('selected');
            } else {
                // 상태 추가
                AlarmManager.currentFilters.push(status);
                this.classList.add('selected');
            }
    
            // '전항목' 버튼 상태 업데이트
            if (AlarmManager.currentFilters.length === 4) {
                allButton.classList.add('selected');
            } else {
                allButton.classList.remove('selected');
            }
    
            // 필터 상태에 따라 알람 데이터 로드
            AlarmManager.loadAlarmData();
        });
    });
    
    
    
    // 개수 선택 드롭다운에 이벤트 리스너 추가(이벤트 기반 별도의 업데이트 메커니즘추가로 즉각반영되도록함)
    const alarmCountSelect = document.getElementById('alarmCountSelect');
    alarmCountSelect.addEventListener('change', function(){
        //선택된 개수에 따라 알람 데이터 업데이트
        AlarmManager.loadAlarmData();
    });
  


});
