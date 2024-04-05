// parent_bar.js
import { loadData } from './parent_dataManager.js';

const parentBarManager = {
  charts: {}, // 차트 인스턴스 저장 객체

  loadDayMonthProductionBarData: function (chartId, section) {
    return loadData(section)
      .then(data => {
        // JSON.parse 대신 직접 데이터 사용
        if (Object.keys(data).length > 0) {
          this.updateChart(chartId, data, section);
        } else {
          console.log("새로운 데이터가 없습니다.");
        }
      })
      .catch(error => {
        console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
      });
  },

  parseDayMonthConf: function (conf, section) {
    const result = [];
    // 섹션명에 따라 필요한 키 접두사를 설정합니다.
    const sectionPrefix = section.startsWith('e_') ? 'e_production_' : 't_production_';

    for (const key in conf) {
      // 키가 올바른 접두사로 시작하는지 확인합니다.
      if (key.startsWith(sectionPrefix)) {
        // 시간, 일, 월 단위를 추출합니다.
        const timeUnit = key.split('_')[2];
        const value = parseFloat(conf[key]);
        if (!isNaN(value)) {
          let label;
          if (section.includes('hour')) {
            label = `${timeUnit}시`;
          } else if (section.includes('day')) {
            label = `${timeUnit}일`;
          } else if (section.includes('month')) {
            label = `${timeUnit}월`;
          }
          result.push({ label, value });
        }
      }
    }
    console.log('Final result:', result);
    return result;
  },


  // 새 차트 생성
  createChart: function (chartId, data, section) {
    // console.log(`Creating chart with ID: ${chartId}`);
    // console.log(`Chart data:`, data);
    // console.log(`Chart section:`, section);
    const ctx = document.getElementById(chartId).getContext('2d');
    if (!ctx) {
      console.error(`Canvas 컨텍스트를 찾을 수 없음: ${chartId}`);
      return;
    }

    // 기존에 생성된 차트가 있는지 확인하고 있다면 파기
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    const label = section.includes('e_') ? '전기생산량(kW)' : '열생산량(kW)';
    const backgroundColor = section.includes('e_') ? "rgba(0, 123, 255, 0.5)" : "pink"; // 막대그래프 색상
    const borderColor = section.includes('e_') ? "#007bff" : "red"; // 선 그래프의 색상 설정

    // 막대 그래프 데이터셋과 선 그래프 데이터셋을 모두 포함하는 데이터 객체
    const chartData = {
      labels: data.map(item => item.label),
      datasets: [
        {
          // 선 그래프 유형 데이터셋
          type: 'line',
          label: label + " (선)", // 선 그래프 레이블
          data: data.map(item => item.value),
          // 선 그래프 관련 속성 설정
          borderColor: borderColor,
          borderWidth: 2,
          fill: false,
          pointRadius: 1,
          pointHoverRadius: 2,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          zIndex: 2
        },
        {
          // 막대 그래프 유형 데이터셋
          type: 'bar',
          label: label, // 막대 그래프 레이블
          data: data.map(item => item.value),
          // 막대 그래프 관련 속성 설정
          backgroundColor: backgroundColor,
          borderWidth: 1,
          barThickness: 10,
          zIndex: 1
        }
      ]
    };
    
    // 차트 생성
    this.charts[chartId] = new Chart(ctx, {
      type: 'bar', // 기본 차트 유형을 막대 그래프로 설정
      data: chartData,
      options: this.getChartOptions(section)
    });
  },

  /*
      this.charts[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.label),
          datasets: [{
            label: label,
            data: data.map(item => item.value),
            borderWidth: 1,
            barThickness: 10,
            backgroundColor: backgroundColor
          }]
        },
        options: this.getChartOptions(section),
        animation: true
      });
    },
    */


  // 주어진 데이터와 섹션에 따라 차트 업데이트
  updateCharts: function (chartIds, conf, section) {
    // console.log(`Updating charts for section:`, section);
    // console.log(`Chart IDs:`, chartIds);
    const data = this.parseDayMonthConf(conf, section);
    console.log(`[Debug] Parsed data for section ${section}:`, data);
    // console.log(`Parsed data:`, data);

    chartIds.forEach(chartId => {
      if (this.charts[chartId]) {
        // 데이터만 업데이트
        this.charts[chartId].data.labels = data.map(item => item.label);
        this.charts[chartId].data.datasets.forEach((dataset) => {
          dataset.data = data.map(item => item.value);
        });
        this.charts[chartId].update();

        console.log(`[Debug] Updating chart with ID: ${chartId} - After update:`, this.charts[chartId].data);
      } else {

        console.log(`[Debug] Creating new chart with ID: ${chartId}`);
        // 새 차트 생성
        this.createChart(chartId, data, section);
      }
    });
  },

  getChartOptions: function (section) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          scaleLabel: {
            display: true,
            labelString: 'kW',
            position: 'top'
          },
          ticks: { font: { size: 10 } }
        },
        x: {
          scaleLabel: {
            display: true,
            labelString: section.includes('hour') ? '시' : section.includes('day') ? '일' : '월',
            position: 'right'
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            font: { size: 10 }
          }
        }
      },
      animation: false,
      tooltips: {
        callbacks: {
          title: function (tooltipItems, data) {
            return `${tooltipItems[0].label} 데이터`;
          }
        }
      }
    };
  }
}

export { parentBarManager };
