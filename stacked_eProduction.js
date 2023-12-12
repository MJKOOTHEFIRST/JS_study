// stacked_eProduction.js
var StackedChartManager = {
    charts: {},
    base_data_url: "/conf_data/", // 데이터 URL 설정

    loadStackedChartData: function(timeUnit) {
        console.log("loadStackedChartData called for: ", timeUnit); // 디버깅
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                var parsedData = this.parseConfData(conf, timeUnit);
                console.log("parsedData", parsedData);
                this.updateDOMElements(parsedData, timeUnit); 
                var chartData = this.getChartData(parsedData);
                var canvasId = 'eProductionChart' + timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1);
                console.log("canvasId", canvasId); // 디버깅
    
                // 존재하는 차트 업데이트 또는 새 차트 생성
                if (this.charts[canvasId]) {
                    this.updateChartData(canvasId, parsedData);
                } else {
                    this.createChart(canvasId, chartData, parsedData.capacity);
                }
            })
            .catch(error => console.error('Error fetching config data:', error));
    },
    
    // 새 차트 생성 함수
    createChart: function(canvasId, chartData, totalCapacity) {
        var ctx = document.getElementById(canvasId).getContext('2d');
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: this.getChartOptions(totalCapacity)
        });
    },
    
    // 차트 데이터 업데이트 함수
    updateChartData: function(canvasId, newData) {
        var chart = this.charts[canvasId];
        if (chart) {
            console.log("Before update: ", chart.data.datasets[0].data);
            chart.data.datasets[0].data = [newData.stacked, newData.capacity - newData.stacked];
            chart.update();
            console.log("After update: ", chart.data.datasets[0].data);
        }
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
    
        // 데이터셋 내용 출력
        // console.log("Generated chartData datasets: ", chartData.datasets);
        console.log("Generated chartData for canvasId: ", chartData.datasets[0].data);
    
        return chartData;
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
    
    updateDOMElements: function(parsedData, timeUnit) {
        var resultElement = document.querySelector('.result');
        var rateElement = document.querySelector('.rate');

        var stackedValue = parsedData.stacked;
        var capacityValue = parsedData.capacity;

        resultElement.innerText = stackedValue ; 
        var percentage = (stackedValue / capacityValue) * 100;
        rateElement.innerText = percentage.toFixed(0) +'%'; 
    },
   
    parseConfData: function(conf, timeUnit) {
        var data = { stacked: 0, capacity: 0 };
        var lines = conf.split('\n');
        var currentSection = '';
    
        lines.forEach(function(line) {
            line = line.trim();
            if (line && line.startsWith('[') && line.endsWith(']')) {
                currentSection = line.slice(1, -1);
            } else if (line) {
                var parts = line.split('=');
                if (parts.length === 2) {
                    var key = parts[0].trim();
                    var value = parseFloat(parts[1].trim());
                    // Check for exact section names
                    if (key === 'e_production_stacked' && currentSection === 'e_' + timeUnit + '_stacked') {
                        data.stacked = value;
                    } else if (key === 'e_production_capacity' && currentSection === 'e_' + timeUnit + '_capacity') {
                        data.capacity = value;
                    }
                }
            }
        });
    
        return data;
    },
    
    updateChartDisplay: function(timeUnit) {
        // 모든 차트를 숨김.
        const allCharts = document.querySelectorAll('.stacked-chart');
        allCharts.forEach(chart => {
            chart.style.visibility = 'hidden';
        });
    
        // 선택된 시간 단위에 해당하는 차트만 표시
        const selectedChartId = 'eProductionChart' + timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1);
        const selectedChart = document.getElementById(selectedChartId);
        if (selectedChart) {
            selectedChart.style.visibility = 'visible';
        }
    }
}
    
/*    
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드 시 'day' 데이터를 로드합니다.
    document.getElementById('stackedDay').click();

    document.getElementById('stackedYear').addEventListener('click', () => StackedChartManager.loadStackedChartData('year'));
    document.getElementById('stackedMonth').addEventListener('click', () => StackedChartManager.loadStackedChartData('month'));
    document.getElementById('stackedDay').addEventListener('click', () => StackedChartManager.loadStackedChartData('day'));
});
*/
