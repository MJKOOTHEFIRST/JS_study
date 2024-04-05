// parent_bar.js
import { startDataRefresh, loadData } from './parent_dataManager.js';

document.addEventListener('DOMContentLoaded', function () {
  // 초기 차트 로드
  loadData().then(data =>{
    console.log("loadData에서 반환된 데이터:", data);
    updateChartData(data); // 데이터를 가져와서 업데이트 함수 호출
  });
});

function updateChartData(data) {
  // console.log("업데이트할 차트 데이터:", data);

    // 데이터 존재 여부 확인 및 매핑
  console.log("e_day 데이터:", data['e_day']);
  console.log("e_hour 데이터:", data['e_hour']);
  console.log("e_month 데이터:", data['e_month']);
  console.log("t_day 데이터:", data['t_day']);
  console.log("t_hour 데이터:", data['t_hour']);
  console.log("t_month 데이터:", data['t_month']);

  // 데이터 존재 여부 확인 및 매핑
  const eDayData = data['e_day'] ? transformDataToChartData(data['e_day'], 'day') : null;
  const eHourData = data['e_hour'] ? transformDataToChartData(data['e_hour'], 'hour') : null;
  const eMonthData = data['e_month'] ? transformDataToChartData(data['e_month'], 'month') : null;
  const tDayData = data['t_day'] ? transformDataToChartData(data['t_day'], 'day') : null;
  const tHourData = data['t_hour'] ? transformDataToChartData(data['t_hour'], 'hour') : null;
  const tMonthData = data['t_month'] ? transformDataToChartData(data['t_month'], 'month') : null;


  // 이 부분이 null로 나와서 문제 
  console.log("변환된 eDayData:", eDayData);
  console.log("변환된 eHourData:", eHourData);
  console.log("변환된 eMonthData:", eMonthData);
  console.log("변환된 tDayData:", tDayData);
  console.log("변환된 tHourData:", tHourData);
  console.log("변환된 tMonthData:", tMonthData);


  // 차트 생성 또는 업데이트 (데이터가 null이 아닌 경우에만 실행)
  if (eDayData) {
    createOrUpdateChart('e_day_1', eDayData);
    createOrUpdateChart('e_day_2', eDayData);
  }
  if (eHourData) {
    createOrUpdateChart('e_hour_1', eHourData);
    createOrUpdateChart('e_hour_2', eHourData);
  }
  if (eMonthData) {
    createOrUpdateChart('e_month_1', eMonthData);
    createOrUpdateChart('e_month_2', eMonthData);
  }
  if (tDayData) {
    createOrUpdateChart('t_day_1', tDayData);
    createOrUpdateChart('t_day_2', tDayData);
  }
  if (tHourData) {
    createOrUpdateChart('t_hour_1', tHourData);
    createOrUpdateChart('t_hour_2', tHourData);
  }
  if (tMonthData) {
    createOrUpdateChart('t_month_1', tMonthData);
    createOrUpdateChart('t_month_2', tMonthData);
  }
}

// 데이터를 차트 형식에 맞게 변환하는 함수
function transformDataToChartData(dataSection, type) {
  if (!dataSection) {
    return null;
  }

  const labels = [];
  const dataset = [];

  for (const key in dataSection) {
    const value = dataSection[key];
    let timeLabel;
    switch (type) {
      case 'hour':
        timeLabel = key.split('_')[2] + "시"; // "e_production_00" -> "00시"
        break;
      case 'day':
        timeLabel = key.split('_')[2] + "일"; // "e_production_01" -> "01일"
        break;
      case 'month':
        timeLabel = key.split('_')[2] + "월"; // "e_production_01" -> "01월"
        break;
    }
    labels.push(timeLabel);
    dataset.push(parseFloat(value));
  }

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Production',
      data: dataset,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  console.log(`Chart data for ${type}:`, chartData);
  return chartData;
}

// 차트 생성 또는 업데이트하는 함수
function createOrUpdateChart(elementId, chartData) {
  console.log(`Creating or updating chart for ${elementId}`);
  const ctx = document.getElementById(elementId);
  if (!ctx) {
    console.error(`Canvas 엘리먼트를 찾을 수 없음: ${elementId}`);
    return;
  }

  let chart = Chart.getChart(ctx); // 이미 존재하는 차트 가져오기
  if (!chart) {
    // 차트가 존재하지 않으면 새로운 차트 생성
    chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              minRotation: 0,
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  } else {
    // 차트가 이미 존재하면 데이터 업데이트
    chart.data = chartData;
    chart.update();
  }
}

// 데이터 새로고침 시작
startDataRefresh(updateChartData, 10000);
