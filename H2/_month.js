// _month.js
var MonthChartManager = {
    base_data_url: "/conf_data/",
    currentChart: null,

    startAutoRefresh: function(chartId, section, interval) {
        // console.log(`Auto refresh started for ${section} with interval ${interval} ms`); // 자동 새로고침 시작 로그
        // console.log(this); // 디버깅
        this.loadMonthData(chartId, section); // 첫 데이터 로드
        setInterval(() => {
            // console.log(this); //디버깅 - 현재 컨텍스트 출력
            // console.log(`Loading data for ${section} at ${new Date().toLocaleTimeString()}`); // 데이터 로딩 로그
            this.loadMonthData(chartId, section);
        }, interval);
    },

    loadMonthData: function(chartId, section) {
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                const data = this.parseMonthConf(conf, section);
                if(data.length>0){
                    this.updateMonthChart(chartId, data, section);
                } else {
                    console.log("새로운 데이터가 없습니다.");
                }
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    parseMonthConf: function(conf, section) {
        const lines = conf.split('\n');
        let sectionFound = false;
        const result = [];

        lines.forEach(line => {
            if (line.trim() === `[${section}]`) {
                sectionFound = true;
            } else if (sectionFound && line.startsWith('[')) {
                sectionFound = false;
            } else if (sectionFound) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    result.push({
                        month: parseInt(parts[0].trim().split('_')[2], 10) + '월',
                        value: parseFloat(parts[1].trim())
                    });
                }
            }
        });
        return result;
    },

    updateMonthChart: function(chartId, data, section) {
        if(this.currentChart){
            this.currentChart.destroy();
        }

        const ctx = document.getElementById(chartId).getContext('2d');
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.month),
                datasets: [{
                    label: section === 'e_month' ? '전기생산량(kW)' : '열생산량(kW)',
                    data: data.map(item => item.value),
                    borderWidth: 1,
                    barThickness: 20,
                    backgroundColor: section === 'e_month' ? "rgba(0, 123, 255, 0.5)" : "pink"
                }]
            },
            options: this.getMonthChartOptions()
        });
    },

    getMonthChartOptions: function() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend:{
                    display:false //범례 표시 없도록
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'kW',
                        position: 'top'
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    scaleLabel: {
                        display: true,
                        labelString: '월',
                        position: 'right'
                    },
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            tooltips: {
                callbacks: {
                    title: function(tooltipItems, data) {
                        return `${tooltipItems[0].label} 데이터`;
                    }
                }
            }
        };
    }
};
