var StackedChartManager = {
    // 차트를 저장할 변수 초기화
    stackedChart: null,

    // 데이터 로드 및 차트 생성
    loadStackedChartData: function(timeUnit) {
        var data = {
            'year': { 'stacked': 2365.70, 'capacity': 10000 },
            'month': { 'stacked': 266, 'capacity': 1000 },
            'day': { 'stacked': 74, 'capacity': 100 }
        };

        var currentData = data[timeUnit];

        document.querySelector('.result').innerText = currentData.stacked + ' kW';
        var percentage = (currentData.stacked / currentData.capacity) * 100;
        document.querySelector('.rate').innerText = percentage.toFixed(2) + '%';

        var chartData = {
            labels: [''],
            datasets: [{
                label: '',
                data: [currentData.stacked, currentData.capacity - currentData.stacked],
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(211, 211, 211, 0.5)']
            }]
        };

        // 차트 업데이트 및 캔버스 표시 업데이트
        this.createOrUpdateChart(chartData, currentData.capacity, timeUnit);
        this.updateChartDisplay(timeUnit);
    },

    // 차트 생성 또는 업데이트 함수
    createOrUpdateChart: function(chartData, totalCapacity, timeUnit) {
        var canvasId = 'eProductionChart' + timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1);
        var ctx = document.getElementById(canvasId).getContext('2d');

        if (this.stackedChart) {
            this.stackedChart.destroy();
        }
        this.stackedChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                indexAxis: 'y',
                scales: {
                    x: { 
                        stacked: true, 
                        ticks: {
                            max: totalCapacity
                        }
                    },
                    y: { stacked: true }
                },
                barThickness: 50,
                barPercentage: 1,
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    // 차트 표시 업데이트 함수
    updateChartDisplay: function(timeUnit) {
        const charts = document.querySelectorAll('.stacked-chart');
        charts.forEach(chart => {
            chart.style.display = chart.id.includes(timeUnit) ? 'block' : 'none';
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    StackedChartManager.loadStackedChartData('day');
    document.getElementById('stackedYear').addEventListener('click', function() {
        StackedChartManager.loadStackedChartData('year');
    });
    document.getElementById('stackedMonth').addEventListener('click', function() {
        StackedChartManager.loadStackedChartData('month');
    });
    document.getElementById('stackedDay').addEventListener('click', function() {
        StackedChartManager.loadStackedChartData('day');
    });
});
