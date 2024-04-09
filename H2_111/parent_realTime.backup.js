// parent_realTime.js
import { loadData } from './parent_dataManager.js';

const parentRealTimeManager = {
  doughnutCharts: {}, // 하프 도넛 차트 인스턴스 저장 객체
  charts: {}, // 가로 막대 차트 인스턴스 저장 객체

  loadRealTimeProductionData: function () {
    loadData('realtime_production')
      .then(realtimeData => {
        loadData('real_per_production')
          .then(perData => {
            const totalData = {
              e_realtime_production: realtimeData.e_realtime_production,
              t_realtime_production: realtimeData.t_realtime_production,
              e_real_per_production: perData.e_real_per_production,
              t_real_per_production: perData.t_real_per_production,
            };

            if (Object.keys(realtimeData).length > 0) {
              this.updateCharts(realtimeData, totalData); // 도넛 차트
              this.createHorizontalBarChart('eProductionBarChart', totalData);
              this.createHorizontalBarChart('tProductionBarChart', totalData);
            } else {
              console.log("새로운 데이터가 없습니다.");
            }
          })
          .catch(error => {
            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
          });
      })
      .catch(error => {
        console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
      });
  },

  updateCharts: function (data, totalData) {
    // 퍼센티지 계산
    const ePercentage = Number(totalData.e_real_per_production).toFixed(0);
    const tPercentage = Number(totalData.t_real_per_production).toFixed(0);

    // 전기 발전량 차트 업데이트
    this.createHalfDoughnutChart('realtime-eProduction', ePercentage, '전기발전량', '#4CB9E7');
    // 열 발전량 차트 업데이트
    this.createHalfDoughnutChart('realtime-tProduction', tPercentage, '열 발전량', '#FF8F8F');

    // 퍼센티지 업데이트
    document.querySelector('.realtime-e-percentage').innerHTML = ePercentage; //도넛
    document.querySelector('.realtime-t-percentage').innerHTML = tPercentage; //도넛
    document.querySelector('.e-percentage-bar').innerHTML = ePercentage; //바
    document.querySelector('.t-percentage-bar').innerHTML = tPercentage; //바

    // 하단의 숫자 데이터 업데이트
    document.querySelector('.e-bottom-side').innerHTML = this.formatPower(totalData.e_realtime_production); //도넛
    document.querySelector('.t-bottom-side').innerHTML = this.formatPower(totalData.t_realtime_production); //도넛
    document.querySelector('.e-production-bar').innerHTML = this.formatPower(totalData.e_realtime_production); //바 
    document.querySelector('.t-production-bar').innerHTML = this.formatPower(totalData.t_realtime_production); //바 

  },

  // 전력 단위 변환 함수
  formatPower: function (powerValue) {
    const power = Number(powerValue);
    if (power >= 1000) {
      return (power / 1000).toFixed(2) + ' <sub>kW</sub>';
    } else {
      return power + ' <sub>W</sub>';
    }
  },

  createHalfDoughnutChart: function (canvasId, productionPercent, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const options = {
      // 차트의 옵션 설정
      circumference: 180,
      rotation: 270,
      //    cutoutPercentage: 80, <-- old version //Eung
      cutout: '80%',
      tooltips: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.formattedValue + '%';
          }
        }
      },
      hover: { mode: null },
      title: {
        display: true,
        text: label
      }
    };

    if (this.doughnutCharts[canvasId]) {
      this.doughnutCharts[canvasId].data.datasets[0].data = [productionPercent, 100 - productionPercent];
      this.doughnutCharts[canvasId].options = options;
      this.doughnutCharts[canvasId].update();
    } else {
      this.doughnutCharts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [productionPercent, 100 - productionPercent],
            backgroundColor: [color, 'lightgrey'],
            borderWidth: 0
          }]
        },
        options: options
      });
    }
  },

  // 가로 막대 차트 생성 함수
  createHorizontalBarChart: function (canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    // 데이터셋을 조정하여 각 차트에 맞는 데이터만 표시하도록 설정
    const dataset = canvasId === 'eProductionBarChart' ? [data.e_realtime_production] : [data.t_realtime_production];
    const backgroundColor = canvasId === 'eProductionBarChart' ? '#4CB9E7' : '#FF8F8F';
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [canvasId === 'eProductionBarChart' ? '' : ''],
        datasets: [{
          label: '', // 빈 문자열로 설정하여 범례에 표시되지 않도록 함
          data: dataset,
          backgroundColor: [backgroundColor],
          borderWidth: 1,
          barThickness: 30,
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false // 범례를 표시하지 않도록 설정
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.x;
                return label;
              }
            }
          }
        }
      }
    });
    this.charts[canvasId] = chart; // 차트 인스턴스 저장
  },

  // 가로 막대 차트 업데이트 함수
  updateHorizontalBarChart: function (canvasId, newData) {
    const chart = this.charts[canvasId];
    if (chart) {
      chart.data.datasets.forEach((dataset) => {
        dataset.data = [newData.e_realtime_production, newData.t_realtime_production];
      });
      chart.update();
    }
  },

  updateHorizontalBarCharts: function (newData) {
    // 모든 가로 막대 차트의 ID를 배열로 정의
    const chartIds = ['eProductionBarChart', 'tProductionBarChart'];
    // 각 차트 ID에 대해 updateHorizontalBarChart 함수를 호출
    chartIds.forEach((chartId) => {
      this.updateHorizontalBarChart(chartId, newData);
    });
  }

};

export { parentRealTimeManager };
