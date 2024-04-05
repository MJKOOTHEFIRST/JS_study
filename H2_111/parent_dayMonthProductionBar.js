// parent_dayMonthProductionBar.js
import { startDataRefresh } from './parent_dataManager.js';

// 차트 데이터를 업데이트하는 함수
function updateChartData(data) {
  console.log("업데이트할 차트 데이터:",  data);

  // 데이터 존재 여부 확인
  const eDayData = data['e_day'] ? transformDataToChartData(data['e_day']) : null;
  const eHourData = data['e_hour'] ? transformDataToChartData(data['e_hour']) : null;
  const eMonthData = data['e_month'] ? transformDataToChartData(data['e_month']) : null;
  const tDayData = data['t_day'] ? transformDataToChartData(data['t_day']) : null;
  const tHourData = data['t_hour'] ? transformDataToChartData(data['t_hour']) : null;
  const tMonthData = data['t_month'] ? transformDataToChartData(data['t_month']) : null;

  // 차트 생성 또는 업데이트 (데이터가 null이 아닌 경우에만 실행)
  if (eDayData) createOrUpdateChart('e_day_1', eDayData);
  if (eHourData) createOrUpdateChart('e_hour_1', eHourData);
  if (eMonthData) createOrUpdateChart('e_month_1', eMonthData);
  if (tDayData) createOrUpdateChart('t_day_1', tDayData);
  if (tHourData) createOrUpdateChart('t_hour_1', tHourData);
  if (tMonthData) createOrUpdateChart('t_month_1', tMonthData);
}

// 데이터를 차트 형식에 맞게 변환하는 함수
function transformDataToChartData(dataSection) {
  if (!dataSection) {
    // 데이터 섹션이 없는 경우, 빈 차트 데이터 반환
    return {
      labels: [],
      datasets: [{
        label: 'production',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    };
  }

  // 정상적인 데이터 변환 로직
  return {
    labels: Object.keys(dataSection).map(key => key.split('_')[2]),
    datasets: [{
      label: 'production',
      data: Object.values(dataSection),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };
}

// 차트를 생성하거나 업데이트하는 함수
function createOrUpdateChart(canvasId, data) {
  let chart = Chart.getChart(canvasId); // Chart.js 3.x 버전
  console.log(`차트 ${chart ? "업데이트" : "생성"}:`,  canvasId);
  if (chart) {
    chart.data = data;
    chart.update();
  } else {
    const ctx = document.getElementById(canvasId).getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: data,
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
  }
}

// 데이터 새로고침 시작
startDataRefresh(updateChartData, 10000);

document.addEventListener('DOMContentLoaded', function () {
  // 초기 차트 로드
  startDataRefresh(updateChartData, 10000);
});





/* 이 코드를 parent_dataManager.js와 상단의 코드로 나눠서 데이터를 total_data.conf에서 들고와 주기적으로 업데이트하는 로직으로 수정한 것. 
document.addEventListener('DOMContentLoaded', function () {
  // e_day 섹션 데이터
  const eDayData = {
    labels: Array.from({ length: 31 }, (_, i) => i + 1),
    datasets: [{
      label: 'e_production',
      data: [
        692.13, 6922.40, 6238.31, 1116.15, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00
      ],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  // e_hour 섹션 데이터
  const eHourData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'e_production',
      data: [
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 130.08, 986.07, 0.00,
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00
      ],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  // e_month 섹션 데이터
  const eMonthData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    datasets: [{
      label: 'e_production',
      data: [
        38968.40, 120023.47, 62996.38, 14968.99, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00
      ],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  // e_day_1과 e_day_2에 대한 차트 생성
  createChart('e_day_1', eDayData);
  createChart('e_day_2', eDayData);

  // e_hour_1과 e_hour_2에 대한 차트 생성
  createChart('e_hour_1', eHourData);
  createChart('e_hour_2', eHourData);

  // e_month_1과 e_month_2에 대한 차트 생성
  createChart('e_month_1', eMonthData);
  createChart('e_month_2', eMonthData);

  // t_day 섹션 데이터
  const tDayData = {
    labels: Array.from({ length: 31 }, (_, i) => i + 1),
    datasets: [{
      label: 't_production',
      data: [
        700.79, 7318.67, 6656.04, 1178.21, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00
      ],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }]
  };

  // t_hour 섹션 데이터
  const tHourData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 't_production',
      data: [
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 133.31, 1044.90, 0.00,
        0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00
      ],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }]
  };

  // t_month 섹션 데이터
  const tMonthData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    datasets: [{
      label: 't_production',
      data: [
        40928.39, 126342.61, 66369.69, 15853.71, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00
      ],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }]
  };

  // t_day_1과 t_day_2에 대한 차트 생성
  createChart('t_day_1', tDayData);
  createChart('t_day_2', tDayData);

  // t_hour_1과 t_hour_2에 대한 차트 생성
  createChart('t_hour_1', tHourData);
  createChart('t_hour_2', tHourData);

  // t_month_1과 t_month_2에 대한 차트 생성
  createChart('t_month_1', tMonthData);
  createChart('t_month_2', tMonthData);
});



// 차트 생성 함수는 한 번만 정의
function createChart(canvasId, data) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 0, // 레이블을 수평으로 유지
            minRotation: 0, // 레이블을 수평으로 유지
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
}
*/