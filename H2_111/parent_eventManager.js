// parent_eventManager.js 
// DOM loadded 됐을 때, event handling만 하는 것

import { loadData, startDataRefresh } from './parent_dataManager.js';
import { parentBarManager } from './parent_bar.js';
import { parentRealTimeManager } from './parent_realTime.js';

/**********************************************************************************/
document.addEventListener('DOMContentLoaded', function () {
  //startDataRefresh 함수의 콜백에서 반환된 설정 데이터 저장
  // 이후 다른 함수나 이벤트 핸들러에서 이 데이터를 참조할 때 사용
  // 설정 파일에서 로드된 데이터가 필요한 경우, currentConf 변수를 통해 접근(callback)
  let currentConf = null;

  // [전기생산량/열생산량]
  function initializeCharts() {
    // 섹션별 차트 ID 배열
    const chartIds = {
      'e_hour': ['e_hour_1', 'e_hour_2'],
      'e_day': ['e_day_1', 'e_day_2'],
      'e_month': ['e_month_1', 'e_month_2'],
      't_hour': ['t_hour_1', 't_hour_2'],
      't_day': ['t_day_1', 't_day_2'],
      't_month': ['t_month_1', 't_month_2']
    };
  
    // 각 섹션별로 차트 초기화
    Object.keys(chartIds).forEach(section => {
      loadData(section).then(conf => {
        const data = parentBarManager.parseDayMonthConf(conf, section);
        chartIds[section].forEach(chartId => {
          parentBarManager.createChart(chartId, data, section);
        });
      });
    });
  }


/**********************************************************************************/
// 초기 데이터 로드 및 차트 생성
loadData().then(conf => {
  // console.log(conf);
  currentConf = conf;
  initializeCharts(); // [전기생산량/열생산량]
  parentRealTimeManager.loadRealTimeProductionData(); //[실시간생산량]
});

  /**********************************************************************************/
  // 주기적 데이터 업데이트 및 차트 업데이트
  startDataRefresh(conf => {
    currentConf = conf;
    parentRealTimeManager.loadRealTimeProductionData(); //[실시간생산량]
  
    // [금일/금월 생산량 막대차트] 업데이트 호출 전 디버깅 로그 추가
    // console.log(`[Debug] Calling updateCharts for section: e_hour with conf:`, currentConf);
    // parentBarManager.updateCharts(['e_hour_1', 'e_hour_2'], currentConf, 'e_hour');
  
    // // console.log(`[Debug] Calling updateCharts for section: e_day with conf:`, currentConf);
    // parentBarManager.updateCharts(['e_day_1', 'e_day_2'], currentConf, 'e_day');
  
    // // console.log(`[Debug] Calling updateCharts for section: e_month with conf:`, currentConf);
    // parentBarManager.updateCharts(['e_month_1', 'e_month_2'], currentConf, 'e_month');
  
    // // console.log(`[Debug] Calling updateCharts for section: t_hour with conf:`, currentConf);
    // parentBarManager.updateCharts(['t_hour_1', 't_hour_2'], currentConf, 't_hour');
  
    // // console.log(`[Debug] Calling updateCharts for section: t_day with conf:`, currentConf);
    // parentBarManager.updateCharts(['t_day_1', 't_day_2'], currentConf, 't_day');
  
    // // console.log(`[Debug] Calling updateCharts for section: t_month with conf:`, currentConf);
    // parentBarManager.updateCharts(['t_month_1', 't_month_2'], currentConf, 't_month');
  });

});
