var StackedChartManager = {
    base_data_url: "/conf_data/",
    stackedChart: null,

    // 데이터 로드 함수
    loadStackedChartData: function() {
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                const chartData = this.parseConfData(conf);
                 // 각각의 캔버스에 대해 차트 생성
                this.createStackedChart('eProductionChartYear', chartData);
                this.createStackedChart('eProductionChartMonth', chartData);
                this.createStackedChart('eProductionChartDay', chartData);
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    // CONF 파일 파싱
    parseConfData: function(conf) {
        const lines = conf.split('\n');
        let eProductionYearStacked = 0;
        let eProductionMonthStacked = 0;
        let eProductionDayStacked = 0;

        lines.forEach(line => {
            if (line.includes('e_production_stacked')) {
                const parts = line.split('=');
                const value = parseFloat(parts[1].trim());

                if (line.startsWith('[e_year_stacked]')) {
                    eProductionYearStacked = value;
                } else if (line.startsWith('[e_month_stacked]')) {
                    eProductionMonthStacked = value;
                } else if (line.startsWith('[e_day_stacked]')) {
                    eProductionDayStacked = value;
                }
            }
        });

        return {
            labels: ['Year', 'Month', 'Day'],
            datasets: [{
                label: 'Electricity Production (Stacked)',
                data: [eProductionYearStacked, eProductionMonthStacked, eProductionDayStacked],
                backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)']
            }]
        };
    },

    // Stacked Chart 생성
    createStackedChart: function(canvasId, data) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas ID가 없음:', canvasId);
            return;
        }
        const ctx = canvas.getContext('2d');

        if (this.stackedChart) {
            // 기존 차트 업데이트
            this.stackedChart.data = data;
            this.stackedChart.update();
        } else {
            // 새 차트 생성
            this.stackedChart = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    indexAxis: 'y', //가로형 바 
                    scales: {
                        x: { stacked: true },
                        y: { stacked: true }
                    }
                }
            });
        }
    },
};

// 페이지 로드 시 차트 로드
document.addEventListener('DOMContentLoaded', function() {
    StackedChartManager.loadStackedChartData();
});
