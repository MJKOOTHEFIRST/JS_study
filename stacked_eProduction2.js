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
                this.createOrUpdateChart(chartData, parsedData.capacity, canvasId);
            })
            .catch(error => console.error('Error fetching config data:', error));
    },

    // 차트 데이터 업데이트 로직
updateChartData: function(canvasId, newData) {
    var chart = this.charts[canvasId];
    if (chart) {
        // 차트 데이터를 새 데이터로 업데이트합니다.
        chart.data.datasets[0].data = [newData.stacked, newData.capacity - newData.stacked];
        chart.update();
    }
},

// loadStackedChartData 함수에서 새로운 데이터로 차트 업데이트
createOrUpdateChart: function(chartData, totalCapacity, canvasId) {
    var ctx = document.getElementById(canvasId).getContext('2d');

    if (!this.charts[canvasId]) {
        // 새 차트 인스턴스 생성
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: this.getChartOptions(totalCapacity)
        });
    } else {
        // 기존 차트 인스턴스에 새 데이터 업데이트
        this.updateChartData(canvasId, {stacked: chartData.datasets[0].data[0], capacity: totalCapacity});
    }
},

/*
    createOrUpdateChart: function(chartData, totalCapacity, canvasId) {
        var ctx = document.getElementById(canvasId).getContext('2d');
        if (this.charts[canvasId]) {
            console.log("Destroying old chart instance for canvasId: ", canvasId);
            this.charts[canvasId].destroy();
        }
    
        // 새 차트 생성 전에 데이터셋 내용 출력
        console.log("New chartData datasets for canvasId: ", canvasId, chartData.datasets);
    
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: this.getChartOptions(totalCapacity)
        });
    
        console.log("Created new chart instance for canvasId: ", canvasId, this.charts[canvasId]);
    },
    */

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
                    ticks: {
                        font:{size: 8}
                        // display: false // x축 눈금 숨김
                        
                    }
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
    /*
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
    
                    if (key === 'e_production_stacked' && currentSection.includes(timeUnit)) {
                        data.stacked = value;
                    } else if (key === 'e_production_capacity' && currentSection.includes(timeUnit)) {
                        data.capacity = value;
                    }
                }
            }
        });
    
        return data;
    },
    */
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
        // 모든 차트를 숨깁니다.
        const allCharts = document.querySelectorAll('.stacked-chart');
        allCharts.forEach(chart => {
            chart.style.display = 'none';
        });
    
        // 선택된 시간 단위에 해당하는 차트만 표시합니다.
        const selectedChartId = 'eProductionChart' + timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1);
        const selectedChart = document.getElementById(selectedChartId);
        if (selectedChart) {
            selectedChart.style.display = 'block';
        }
    }
};
    
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드 시 'day' 데이터를 로드합니다.
    document.getElementById('stackedDay').click();

    document.getElementById('stackedYear').addEventListener('click', () => StackedChartManager.loadStackedChartData('year'));
    document.getElementById('stackedMonth').addEventListener('click', () => StackedChartManager.loadStackedChartData('month'));
    document.getElementById('stackedDay').addEventListener('click', () => StackedChartManager.loadStackedChartData('day'));
});
