import { loadData } from './dataManager.js';

const operationRateManager = {
    charts: {},

    loadOperationRateData: function(timeUnit) {
        loadData(`e_${timeUnit}_operation`)
            .then(operationData => {
                loadData(`e_${timeUnit}_capacity`)
                    .then(capacityData => {
                        const operation = parseFloat(operationData[`e_production_stacked`]);
                        const capacity = parseFloat(capacityData[`e_production_capacity`]);
                        const percentage = ((operation / capacity) * 100).toFixed(0);

                        this.updateDOMElements(operation, percentage, timeUnit);
                        this.updateChart(operation, capacity, timeUnit);
                        this.updateChartDisplay(timeUnit); // 차트 표시 업데이트 추가
                    });
            })
            .catch(error => console.error('Error loading operation data:', error));
    },

    updateDOMElements: function(operation, percentage, timeUnit) {
        document.querySelector('.operation-result').textContent = operation + ' kW';
        document.querySelector('.operation-rate').textContent = percentage + '%';
    },

    getChartData: function(data) {
        var chartData = {
            labels: [''],
            datasets: [{
                label: 'Data',
                data: [data.stacked, data.capacity - data.stacked],
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(211, 211, 211, 0.5)']
            }]
        };
    
        return chartData;
    },

    createChartData: function(operation, capacity) {
      return [operation, capacity - operation];
  },

    createChart: function(canvasId, chartData, totalCapacity) {
      const ctx = document.getElementById(canvasId).getContext('2d');
      this.charts[canvasId] = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: this.getChartOptions(totalCapacity) // 이 부분이 추가됨
      });
  },
  
  updateChart: function(operation, capacity, timeUnit) {
      const canvasId = `eProductionChart${timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}`;
      const chartData = this.getChartData({stacked: operation, capacity: capacity});
  
      if (this.charts[canvasId]) {
          this.charts[canvasId].data.datasets[0].data = chartData.datasets[0].data;
          this.charts[canvasId].options = this.getChartOptions(capacity); // 차트 옵션 업데이트
          this.charts[canvasId].update();
      } else {
          this.createChart(canvasId, chartData, capacity);
      }
  },

  getChartOptions: function(totalCapacity) {
    return {
        indexAxis: 'y',
        scales: {
            x: { 
                stacked: true, 
                max: totalCapacity,
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
        // console.log('timeUnit =' + timeUnit);
        const allWrappers = document.querySelectorAll('.watt-operation-rate .graph-wrapper');
        
        
        allWrappers.forEach(wrapper => {
            wrapper.style.display = 'none';
        });

        // 선택된 시간 단위에 해당하는 .graph-wrapper만 표시
        const selectedChartId = `eProductionChart${timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}`;
        const selectedId = `operationRate-${timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}`;
        const selectedWrapper = document.getElementById(selectedChartId).parentNode.parentNode;
        // const selectedOperationRateYMD = `operationRate-$(timeUint)`;
        if (selectedWrapper) {
            selectedWrapper.style.display = 'block';
            // console.log('selectedId=', selectedId);
            // console.log('allSelectId=', allSelectId);
            // document.getElementById(selectedId).style.color = '#000';
            // document.getElementById(selectedId).style.fontWeight = '700';
            document.getElementById('operationRate-Year').style.color = '#BEBEBE';
            document.getElementById('operationRate-Year').style.fontWeight = '500';
            document.getElementById('operationRate-Day').style.color = '#BEBEBE';
            document.getElementById('operationRate-Day').style.fontWeight = '500';
            document.getElementById('operationRate-Month').style.color = '#BEBEBE';
            document.getElementById('operationRate-Month').style.fontWeight = '500';
            document.getElementById(selectedId).style.color = '#000';
            document.getElementById(selectedId).style.fontWeight = '700';
            // selecteId.style.color = 'red';
            // document.querySelectorAll('.watt-operation-rate span.time-select').style.fontWeight = '700';
            // selecteId.style.fontWeight = '700';
        }
    }
};

export { operationRateManager };
