//operation-rate.js
import { loadData } from './dataManager.js';

const operationRateManager = {
    charts: {},


    loadOperationRateData: function(sectionName, keySuffix = 'default') {
        console.log("loadOperationRateData called", sectionName, keySuffix);
        
        let dataKey, capacityKey;
        const currentDate = new Date();
        if (sectionName === 'e_total') {
            dataKey = 'e_production';
            capacityKey = 'e_total_capacity';
        } else if (sectionName === 'e_year') {
            keySuffix = `${currentDate.getFullYear()}`;
            dataKey = `e_production_${keySuffix}`;
            capacityKey = 'e_year_capacity';
        } else if (sectionName === 'e_month') {
            keySuffix = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
            dataKey = `e_production_${keySuffix}`;
            capacityKey = 'e_month_capacity';
        } else if (sectionName === 'e_day') {
            keySuffix = `${currentDate.getDate().toString().padStart(2, '0')}`;
            dataKey = `e_production_${keySuffix}`;
            capacityKey = 'e_day_capacity';
        }
    
        return Promise.all([
            loadData(sectionName), // 발전량 데이터 로드
            loadData(capacityKey)  // 총량(capacity) 데이터 로드
        ])
        .then(([operationData, capacityData]) => {
            const operation = parseFloat(operationData[dataKey] || 0);
            const capacity = parseFloat(capacityData['e_production_capacity'] || 0); // 총량 데이터 키 수정
            const operationRate  = (operation/capacity)*100; //가동율 계산
            this.updateDOMElements(operation, capacity); // operation과 capacity 전달
            this.updateChart(operation, capacity, sectionName);
            return operationRate; // 가동율 반환
        })
        .catch(error => {
            console.error('Error loading operation data:', error);
            return 0; 
        });
    },
    
   
    getChartData: function(operationRate) {
        document.querySelector('#operation-rate-rect').setAttribute('width', `${operationRate}%`) //EUNG SVG 변경
        // 차트 데이터 생성 로직
        var chartData = {
            labels: ['', ''],
            datasets: [{
                label: 'Data',
                data: [operationRate, 100 - operationRate], // 가동율과 나머지 부분을 데이터로 설정
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(211, 211, 211, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(211, 211, 211, 1)'
                ],
                borderWidth: 1
            }]
        };
    
        return chartData;
    },
    


    createChart: function(canvasId, chartData, totalCapacity) {
        console.log("createChart 호출", canvasId, chartData);
        console.log(Chart); 
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Cannot find canvas element with id '${canvasId}'`);
            return;
        }
        const ctx = canvas.getContext('2d');
    
        // 같은차트 존재하면 파괴
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
    
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: this.getChartOptions(totalCapacity)
        });
    },
    
  
    updateChart: function(operation, capacity, sectionName) {
        const operationRate = (operation / capacity) * 100; // 가동율 계산
        const chartData = this.getChartData(operationRate); // 차트 데이터 생성

        let canvasId;
        switch (sectionName) {
            case 'e_day':
                canvasId = 'eProductionChart-day';
                break;
            case 'e_month':
                canvasId = 'eProductionChart-month';
                break;
            case 'e_year':
                canvasId = 'eProductionChart-year';
                break;
            case 'e_total':
                canvasId = 'eProductionChart-total';
                break;
            default:
                console.error('Invalid section name:', sectionName);
                return;
        }
    
        if (this.charts[canvasId]) {
            // 기존 차트 업데이트
            this.charts[canvasId].data.datasets[0].data = chartData.datasets[0].data;
            this.charts[canvasId].update();
        } else {
            // 새 차트 생성
            this.createChart(canvasId, chartData, capacity);
        }
    },

  getChartOptions: function(maxCapacity) {
    return {
        indexAxis: 'y',
        scales: {
            x: { 
                stacked: true, 
                max: maxCapacity, // x축 최대값 100%
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

updateDOMElements: function(operation, capacity) {
    console.log("updateDOMElements 호출", operation, capacity);
    const operationValueElement = document.querySelector('.operation-result');
    const operationUnitElement = document.querySelector('.result-unit');

    // 1000Wh 이상일 경우 단위를 kWh로 변경, 그렇지 않으면 Wh 사용
    if (operation >= 1000) {
        operationValueElement.textContent = `${(operation / 1000).toFixed(2)}`;
        operationUnitElement.textContent = 'kWh';
    } else {
        operationValueElement.textContent = `${operation.toFixed(2)} `;
        operationUnitElement.textContent = 'Wh';
    }
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
            case 'e_day':
                selectedChartId = 'eProductionChart-day';
                selectedId = 'operationRate-day';
                break;
            case 'e_month':
                selectedChartId = 'eProductionChart-month';
                selectedId = 'operationRate-month';
                break;
            case 'e_year':
                selectedChartId = 'eProductionChart-year';
                selectedId = 'operationRate-year';
                break;
            case 'e_total':
                selectedChartId = 'eProductionChart-total';
                selectedId = 'operationRate-total';
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
        ['year', 'month', 'day', 'total'].forEach(unit => {
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
