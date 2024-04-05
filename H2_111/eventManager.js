// eventManager.js 
// DOM loadded 됐을 때, event handling만 하는 것

import { loadData, startDataRefresh } from './dataManager.js';
import { QoeManager } from './qoe.js';
import { SystemInfoManager } from './system-info.js';
import { AlarmManager } from './alarm.js';
import { dayMonthProductionBarManager} from './dayMonthProductionBar.js';
import { realTimeProductionManager } from './realTimeProduction.js';
import { operationRateManager } from './operation_rate.js';
import { BopDiagramManager } from './bopDiagram.js';

/**********************************************************************************/
document.addEventListener('DOMContentLoaded', function() {
    //startDataRefresh 함수의 콜백에서 반환된 설정 데이터 저장
    // 이후 다른 함수나 이벤트 핸들러에서 이 데이터를 참조할 때 사용
    // 설정 파일에서 로드된 데이터가 필요한 경우, currentConf 변수를 통해 접근(callback)
    let currentConf = null;
    let currentOperationTimeUnit = 'e_day';  //[발전량/가동율] 초기 설정
    let eSection; // [전기생산량]
    let tSection; // [열생산량]

    // [전기생산량/열생산량]
    // 페이지 로드 시 라디오 버튼의 초기 상태에 따라 eSection과 tSection 결정, 초기 상태 설정 및 차트 로드
    function initializeCharts() {
        // '시간' 라디오 버튼이 체크된 상태로 초기화
        document.getElementById('hour-e').checked = true;
        document.getElementById('hour-h').checked = true;

        // 초기 차트 데이터 로드 및 표시
        eSection = 'e_hour';
        tSection = 't_hour';
        const eData = dayMonthProductionBarManager.parseDayMonthConf(currentConf, eSection);
        const tData = dayMonthProductionBarManager.parseDayMonthConf(currentConf, tSection);
        dayMonthProductionBarManager.createChart('eProduction-bar', eData, eSection);
        dayMonthProductionBarManager.createChart('tProduction-bar', tData, tSection);
    } 

    /**********************************************************************************/
      // 초기 데이터 로드 및 차트 생성
    loadData().then(conf => {
        console.log(conf);
        currentConf = conf;

        SystemInfoManager.loadSystemData(conf); //[시스템]
        QoeManager.loadQoeData(conf); //[qoe]
        AlarmManager.loadAlarmData(conf); //[알람로그]
        realTimeProductionManager.loadRealTimeProductionData(); //[실시간생산량]
        BopDiagramManager.loadBopAndEventData(); // [시스템구조도-BOP]
        initializeCharts(); // [전기생산량/열생산량]

        // [발전량 / 가동율] 초기 데이터 로드 및 차트 생성
        const currentDate = new Date().getDate().toString().padStart(2, '0');
        const initialChartId = 'eProductionChart-day';
        updateOperationRateChart('e_day', currentDate);
        operationRateManager.loadOperationRateData('e_day', currentDate)
            .then(operationRate => {
                document.querySelector('.operation-rate').textContent = `${operationRate.toFixed(2)}`;
            })
            .then(() => {
                // 초기에 'e_day'에 해당하는 차트 생성
                operationRateManager.createChart(initialChartId, operationRateManager.getChartData(0), 0);

                // 초기 시간 선택 버튼 상태 설정
                const initialTimeSelection = document.getElementById('operationRate-day');
                if (initialTimeSelection) {
                    initialTimeSelection.classList.add('selected');
                }
            });

        // 발전량/가동율 차트 업데이트 함수
        function updateOperationRateChart(timeUnit, keySuffix) {
            operationRateManager.loadOperationRateData(timeUnit, keySuffix)
                .then(operationRate => {
                    // .operation-rate 요소에 가동율 표시
                    document.querySelector('.operation-rate').textContent = `${operationRate.toFixed(2)}`;

                    // 해당하는 차트 표시
                    operationRateManager.updateChartDisplay(timeUnit);
                });
        }

        // [알람로그] 페이지 로드  시 '전항목' 선택
        AlarmManager.currentFilters = ['전항목'];
        document.getElementById('alarmCountSelect').value = '전체';
        AlarmManager.loadAlarmData();


        // [금일/금월 생산량 막대차트]
        // 페이지 로드 시 토글 스위치의 초기 상태와 차트 데이터의 초기 로드 상태를 일치시켜야 한다!!
        /*
        const eData = dayMonthProductionBarManager.parseDayMonthConf(conf, eSection);
        const tData = dayMonthProductionBarManager.parseDayMonthConf(conf, tSection);
        dayMonthProductionBarManager.createChart('eProduction-bar', eData, eSection);
        dayMonthProductionBarManager.createChart('tProduction-bar', tData, tSection);
    }).catch(error => {
        console.error('초기 데이터 로드 중 오류 발생:', error);
    });
    */

    /**********************************************************************************/
    // 주기적 데이터 업데이트 및 차트 업데이트
    startDataRefresh(conf => { 
        currentConf = conf;
        SystemInfoManager.loadSystemData(conf); //[시스템]
        QoeManager.loadQoeData(conf); //[qoe]
        AlarmManager.loadAlarmData(conf); //[알람로그]
        realTimeProductionManager.loadRealTimeProductionData(); //[실시간생산량]
        BopDiagramManager.loadBopAndEventData(); // [시스템구조도-BOP]
        // [전기생산량/열생산량 막대 차트]           
        // 라디오 버튼의 상태에 따라 eSection과 tSection 설정
        const eRadioValue = document.querySelector('.e-switch-field input[type="radio"]:checked').value;
        const tRadioValue = document.querySelector('.t-switch-field input[type="radio"]:checked').value;
        eSection = 'e_' + eRadioValue;
        tSection = 't_' + tRadioValue;
        // [금일/금월 생산량 막대차트]
        dayMonthProductionBarManager.updateChart('eProduction-bar', currentConf, eSection);
        dayMonthProductionBarManager.updateChart('tProduction-bar', currentConf, tSection);
    
        // [발전량 / 가동율]
        let keySuffix;
        if (currentOperationTimeUnit === 'e_day') {
            keySuffix = new Date().getDate().toString().padStart(2, '0');
        } else if (currentOperationTimeUnit === 'e_month') {
            keySuffix = (new Date().getMonth() + 1).toString().padStart(2, '0');
        } else if (currentOperationTimeUnit === 'e_year') {
            keySuffix = new Date().getFullYear().toString();
        } else if (currentOperationTimeUnit === 'e_total') {
            keySuffix = null;
        }
        updateOperationRateChart(currentOperationTimeUnit, keySuffix);
    }, 10000);

    // 발전량/가동율 차트 업데이트 함수
    function updateOperationRateChart(timeUnit, keySuffix) {
        operationRateManager.loadOperationRateData(timeUnit, keySuffix)
        .then(operationRate => {
            // .operation-rate 요소에 가동율 표시
            document.querySelector('.operation-rate').textContent = `${operationRate.toFixed(2)}`;

            // 해당하는 차트 표시
            operationRateManager.updateChartDisplay(timeUnit);
        });
    }
});
    
// 이벤트 즉각동작
/**********************************************************************************/
    // [발전량/가동율]
    // 시간 선택 클릭 이벤트 
    function clearSelected() {
        document.querySelectorAll('.watt-operation-rate .time-select').forEach(element => {
            element.classList.remove('selected');
        });
    }
    
    async function handleTimeSelection(unitType, keySuffix) {
        clearSelected();
        const element = document.getElementById(`operationRate-${unitType}`);
        if (!element) {
            console.error(`Cannot find element with id 'operationRate-${unitType}'`);
            return;
        }
        element.classList.add('selected');
        currentOperationTimeUnit = `e_${unitType}`;
    
        let productionValue;
        switch (unitType) {
            case 'total':
                productionValue = currentConf['e_total'] ? currentConf['e_total']['e_production'] : 'N/A';
                break;
            case 'year':
                productionValue = currentConf['e_year'] ? currentConf['e_year'][`e_production_${new Date().getFullYear()}`] : 'N/A';
                break;
            case 'month':
                const currentMonth = new Date().getMonth() + 1;
                productionValue = currentConf['e_month'] ? currentConf['e_month'][`e_production_${currentMonth.toString().padStart(2, '0')}`] : 'N/A';
                break;
            case 'day':
                const currentDate = new Date().getDate();
                productionValue = currentConf['e_day'] ? currentConf['e_day'][`e_production_${currentDate.toString().padStart(2, '0')}`] : 'N/A';
                break;
        }
    
        document.querySelector('.operation-result').textContent = productionValue;
    
        const operationRate = await operationRateManager.loadOperationRateData(`e_${unitType}`, keySuffix);
        // 가동율 값을 받아서 처리
        const operationRateElement = document.querySelector('.operation-rate');
        if (operationRateElement) {
            operationRateElement.textContent = `${operationRate.toFixed(2)}`;
        }
    
        // 선택된 단위에 따른 차트 업데이트
        await updateOperationRateChart(`e_${unitType}`, keySuffix);
    }
    
    // 발전량/가동율 차트 업데이트 함수
    async function updateOperationRateChart(timeUnit, keySuffix) {
        const operationRate = await operationRateManager.loadOperationRateData(timeUnit, keySuffix);
        // .operation-rate 요소에 가동율 표시
        document.querySelector('.operation-rate').textContent = `${operationRate.toFixed(2)}`;
    
        // 해당하는 차트 표시
        operationRateManager.updateChartDisplay(timeUnit);
    }
    
    // 각 시간 단위 버튼에 이벤트 리스너 설정
    document.getElementById('operationRate-total').addEventListener('click', function() {
        handleTimeSelection('total');
    });
    
    document.getElementById('operationRate-year').addEventListener('click', function() {
        handleTimeSelection('year', new Date().getFullYear());
    });
    
    document.getElementById('operationRate-month').addEventListener('click', function() {
        handleTimeSelection('month', (new Date().getMonth() + 1).toString().padStart(2, '0'));
    });
    
    document.getElementById('operationRate-day').addEventListener('click', function() {
        handleTimeSelection('day', new Date().getDate().toString().padStart(2, '0'));
    });

      //////////////////////////////////////////////////////////////////////
    // [전기생산량 / 열생산량 막대차트 라디오 버튼 이벤트 핸들러]
    // 전기생산량
    document.querySelectorAll('.e-switch-field input[type="radio"]').forEach((radio) => {
        radio.addEventListener('change', function() {
            console.log('e-switch-field radio button changed:', this.value);
            eSection = 'e_' + this.value;
    
            // 즉시 차트 업데이트
            dayMonthProductionBarManager.updateChart('eProduction-bar', currentConf, eSection);
    
            // 비동기 작업 완료 후 차트 다시 업데이트
            dayMonthProductionBarManager.loadDayMonthProductionBarData('eProduction-bar', eSection)
                .then(() => {
                    dayMonthProductionBarManager.updateChart('eProduction-bar', currentConf, eSection);
                })
                .catch(error => {
                    console.error('Error loading data:', error);
                });
        });
    });
    
    // 열생산량
    document.querySelectorAll('.t-switch-field input[type="radio"]').forEach((radio) => {
        radio.addEventListener('change', function() {
            console.log('t-switch-field radio button changed:', this.value);
            tSection = 't_' + this.value;
    
            // 즉시 차트 업데이트
            dayMonthProductionBarManager.updateChart('tProduction-bar', currentConf, tSection);
    
            // 비동기 작업 완료 후 차트 다시 업데이트
            dayMonthProductionBarManager.loadDayMonthProductionBarData('tProduction-bar', tSection)
                .then(() => {
                    dayMonthProductionBarManager.updateChart('tProduction-bar', currentConf, tSection);
                })
                .catch(error => {
                    console.error('Error loading data:', error);
                });
        });
    });

    
    //////////////////////////////////////////////////////////////////////
    // [금일/금월 생산량 막대차트]
    // 토글 스위치 이벤트 핸들러
    /*
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
