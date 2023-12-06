var StackedChartManager = {
    base_data_url: "/conf_data/",
    stackedChart: null,

    /*
    # 누적차트
    [e_year_stacked] == 년
    e_production_stacked=2365.70

    [e_month_stacked] ==  월
    e_production_stacked=9,990

    [e_day_stacked] == 일
    e_production_stacked = 74
    */

    // 데이터 로드 함수
    loadStackedChartData: function(timeUnit = 'day') {
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                const chartData = this.parseConfData(conf, timeUnit); // 시간 단위에 따라 파싱
                this.createStackedChart(`eProductionChart${timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}`, chartData);

                // 결과 업데이트
                document.querySelector('.result').textContent = chartData.datasets[0].data[0] + ' kW';
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },


    // CONF 파일 파싱
    parseConfData: function(conf, timeUnit) {
        const lines = conf.split('\n');
        let section = '';
        let eProductionStacked = 0;
    
        lines.forEach(line => {
            if (line.startsWith(`[${timeUnit}_stacked]`)) {
                section = timeUnit;
            } else if (line.includes('e_production_stacked') && section === timeUnit) {
                const parts = line.split('=');
                eProductionStacked = parseFloat(parts[1].trim());
            }
        });
    
        return {
            labels: [timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)],
            datasets: [{
                label: `Electricity Production (${timeUnit})`,
                data: [eProductionStacked],
                backgroundColor: 'rgba(54, 162, 235, 0.5)'
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
                    },
                    // 막대의 두깨 조절
                    bartThickness: 20, 
                    categoryPercentage: 0.8, // 카테고리 내에서 막대가 차지하는 비율 (0-1)
                    barPercentage: 0.9 // 막대가 카테고리 폭에 비해 차지하는 비율 (0-1)
                }
            });
        }
    },
};

// 페이지 로드 시 차트 로드
document.addEventListener('DOMContentLoaded', function() {
    StackedChartManager.loadStackedChartData();
});
