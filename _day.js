var DayChartManager = {
    base_data_url: "/conf_data/",
    currentChart: null,

    startAutoRefresh: function(chartId, section, interval) {
        // console.log(`Auto refresh started for ${section} with interval ${interval} ms`); // 자동 새로고침 시작 로그
        // console.log(this); // 디버깅
        this.loadDayData(chartId, section); // 첫 데이터 로드
        setInterval(() => {
            // console.log(this); //디버깅 - 현재 컨텍스트 출력
            // console.log(`Loading data for ${section} at ${new Date().toLocaleTimeString()}`); // 데이터 로딩 로그
            this.loadDayData(chartId, section);
        }, interval);
    },

    parseDayConf: function(conf, section) {
        // console.log(`Parsing data for section: ${section}`);
        const lines = conf.split('\n');
        let sectionFound = false;
        const result = [];

        lines.forEach(line => {
            if (line.trim() === `[${section}]`) {
                // console.log(`Found section: ${section}`);
                sectionFound = true;
            } else if (sectionFound && line.startsWith('[')) {
                // console.log(`End of section: ${section}`);
                sectionFound = false;
            } else if (sectionFound) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    // console.log(`Parsing line: ${line}`);
                    result.push({
                        time: parts[0].trim().split('_')[2],
                        value: parseFloat(parts[1].trim())
                    });
                }
            }
        });
        return result;
    },

    loadDayData: function(chartId, section) {
        // console.log(`loadDayData 호출됨 - section: ${section}, time: ${new Date().toLocaleTimeString()}`); // 디버깅
        // console.log("Requested section:", section);  // 섹션 이름 출력
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                // console.log("loaded data :", conf) //디버깅
                // const data = this.parseDayConf(conf, section);
                const data = this.parseDayConf(conf, section);
                console.log("parsed data: ", data); // 디버깅.. 여기서부터 막혔다. 
                if(data.length>0){
                    // console.log("updating chart with data")
                    this.updateDayChart(chartId, data, section);
                } else {
                    console.log("새로운 데이터가 없습니다.");
                }
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    updateDayChart: function(chartId, data, section) {
        if(this.currentChart){
            this.currentChart.destroy();
        }

        const ctx = document.getElementById(chartId).getContext('2d');
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.time + '시'),
                datasets: [{
                    label: section === 'e_day' ? '전기생산량(kW)' : '열생산량(kW)',
                    data: data.map(item => item.value),
                    borderWidth: 1,
                    barThickness: 10,
                    backgroundColor: section === 'e_day' ? "rgba(0, 123, 255, 0.5)" : "pink"
                }]
            },
            options: this.getDayChartOptions()
        });
    },

    getDayChartOptions: function() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins:{
                legend:{
                    display:false, //범례 표시하지 않도록한다. 
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
                        labelString: '시',
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



