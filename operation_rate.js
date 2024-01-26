//operation-rate.js
import { loadData } from './dataManager.js';

const operationRateManager = {
    charts: {},


    loadOperationRateData: function(sectionName, keySuffix) {
        console.log("loadOperationRateData called", sectionName, keySuffix);
        keySuffix = keySuffix || 'default';
    
        let dataKey, capacityKey;
        if (sectionName === 'e_total') {
            dataKey = 'e_production';
            capacityKey = 'e_total_capacity';
        } else if (sectionName === 'e_year') {
            dataKey = `e_production_${new Date().getFullYear()}`;
            capacityKey = 'e_year_capacity';
        } else if (sectionName === 'e_month') {
            const currentMonth = new Date().getMonth() + 1;
            dataKey = `e_production_${currentMonth.toString().padStart(2, '0')}`;
            capacityKey = 'e_month_capacity';
        } else if (sectionName === 'e_day') {
            const currentDay = new Date().getDate();
            dataKey = `e_production_${currentDay.toString().padStart(2, '0')}`;
            capacityKey = 'e_day_capacity';
        }
    
        return Promise.all([
            loadData(dataKey),
            loadData(capacityKey)
        ])
        .then(([operationData, capacityData]) => {
            const operation = parseFloat(operationData[dataKey] || 0);
            const capacity = parseFloat(capacityData[capacityKey] || 0);
            this.updateDOMElements(operation);
            this.updateChart(operation, capacity, sectionName);
        })
        .catch(error => console.error('Error loading operation data:', error));
    },
    
    
    updateDOMElements: function(operation) {
        const operationValueElement = document.querySelector('.operation-result');
        const operationUnitElement = document.querySelector('.result-unit');
    
        // 1000Wh 이상일 경우 단위를 kWh로 변경, 그렇지 않으면 Wh 사용
        if (operation >= 1000) {
            operationValueElement.textContent = `${(operation / 1000).toFixed(2)}`;
            operationUnitElement.textContent= 'kWh';
        } else {
            operationValueElement.textContent = `${operation.toFixed(2)} `;
            operationUnitElement.textContent= 'Wh';
        }
    },

    getChartData: function(operation, capacity) {
        // 운영 결과가 차지하는 비율 계산(백분율)
        const operationRate = (operation / capacity) * 100;

        var chartData = {
            labels: ['', ''],
            datasets: [{
                label: 'Data',
                data: [operationRate, 100 - operationRate],
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(211, 211, 211, 0.5)']
            }]
        };
    
        return chartData;
    },


    createChart: function(canvasId, chartData, totalCapacity) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) { // 캔버스 요소가 실제로 존재하는지 확인
            console.error(`Cannot find canvas element with id '${canvasId}'`);
            return; // 캔버스 요소가 없으면 함수를 종료
        }
        const ctx = canvas.getContext('2d');
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: this.getChartOptions(totalCapacity) // 이 부분이 추가됨
        });
    },
  
    updateChart: function(operation, capacity, timeUnit) {
        let canvasId;
        switch (timeUnit) {
            case 'e_month':
                canvasId = 'eProductionChartMonth';
                break;
            case 'e_day':
                canvasId = 'eProductionChartDay';
                break;
            case 'e_year':
                canvasId = 'eProductionChartYear';
                break;
            case 'e_total':
                canvasId = 'eProductionChartTotal';
                break;
            default:
                console.error('Invalid time unit:', timeUnit);
                return;
        }

        const chartData = this.getChartData(operation, capacity);
  
      if (this.charts[canvasId]) {
          this.charts[canvasId].data.datasets[0].data = chartData.datasets[0].data;
          this.charts[canvasId].options = this.getChartOptions(capacity); // 차트 옵션 업데이트
          this.charts[canvasId].update();
      } else {
          this.createChart(canvasId, chartData, capacity);
      }

  },

  getChartOptions: function() {
    return {
        indexAxis: 'y',
        scales: {
            x: { 
                stacked: true, 
                max: 100, // x축 최대값 100%
                min: 0, // x축 최소값
                ticks: {
                    font:{size: 8}
                    // display: false // x축 눈금 숨김
                },
                grid:{
                    drawOnChartArea: false, // 차트 영역에 그리드 라인 그리지 않음
                    drawTicks: false, // 눈금 라인을 그리지 않음
                },
                // offset: true // 축과 데이터 포인트의 정렬 조절
            },
            y: { stacked: true }
        },
        barThickness: 50,
        barPercentage: 1,
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { display: false }}
    };
},


    updateChartDisplay: function(timeUnit) {
        // 모든 .graph-wrapper 숨기기
        const allWrappers = document.querySelectorAll('.watt-operation-rate .graph-wrapper');
        
        allWrappers.forEach(wrapper => {
            wrapper.style.display = 'none';
        });

        // 선택된 시간 단위에 해당하는 .graph-wrapper만 표시
        let selectedChartId, selectedId;
        switch (timeUnit) {
            case 'e_month':
                selectedChartId = 'eProductionChartMonth';
                selectedId = 'operationRate-Month';
                break;
            case 'e_day':
                selectedChartId = 'eProductionChartDay';
                selectedId = 'operationRate-Day';
                break;
            case 'e_year':
                selectedChartId = 'eProductionChartYear';
                selectedId = 'operationRate-Year';
                break;
            case 'e_total':
                selectedChartId = 'eProductionChartTotal';
                selectedId = 'operationRate-Total';
                break;
            default:
                console.error('Invalid time unit:', timeUnit);
                return;
        }

        let selectedWrapper = document.getElementById(selectedChartId);
        if (!selectedWrapper) { // 선택된 요소가 실제로 존재하는지 확인
            (`Cannot find element with id '${selectedChartId}'`);
            return; // 선택된 요소가 없으면 함수를 종료
        }
        selectedWrapper.style.display = 'block';

        // 모든 버튼의 스타일 초기화 및 선택된 버튼의 스타일 강조
        ['Year', 'Month', 'Day', 'Total'].forEach(unit => {
            const button = document.getElementById(`operationRate-${unit}`);
            if (button) {
                button.style.color = '#BEBEBE';
                button.style.fontWeight = '500';
            }
        });
        const selectedButton = document.getElementById(selectedId);
        if (selectedButton) {
            selectedButton.style.color = '#000';
            selectedButton.style.fontWeight = '800';
        }
    }


}

export { operationRateManager };
