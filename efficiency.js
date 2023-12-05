var EfficiencyChartManager = {
    base_data_url: "/conf_data/",
    doughnutCharts: {}, // 차트 인스턴스를 저장하는 객체

    loadEfficiencyData: function(canvasId, section, label, color) {
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                console.log('Fetched data', conf);
                const efficiencyData = this.parseEfficiencyConf(conf);
                console.log('efficiencyData(parsed data): ', efficiencyData);
    
                console.log('Section:', section); // 추가된 디버깅 로그
                var efficiencyPercent = efficiencyData[section];
                console.log('Efficiency Percent before chart creation:', efficiencyPercent);
    
                this.createEfficiencyDoughnutChart(canvasId, efficiencyPercent, label, color);
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    createEfficiencyDoughnutChart: function(canvasId, efficiencyPercent, label, color) {
        console.log(`Efficiency Percent : ${efficiencyPercent}`); //값을 로그로 출력
        var canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas ID가 없음:', canvasId);
            return;
        }
        const ctx = canvas.getContext('2d'); 

        if (this.doughnutCharts[canvasId]) {
            // 차트 데이터 업데이트
            this.doughnutCharts[canvasId].data.datasets[0].data = [efficiencyPercent, 100 - efficiencyPercent];
        
            // 차트 업데이트 호출
            this.doughnutCharts[canvasId].update();
        } else {
            this.doughnutCharts[canvasId] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [efficiencyPercent, 100 - efficiencyPercent],
                        backgroundColor: [color, 'lightgrey'],
                        borderWidth: 0
                    }]
                },
                options: {
                    circumference: 180,
                    rotation: 270,
                    cutoutPercentage: 80,
                    tooltips: { enabled: false },
                    hover: { mode: null },
                    title: {
                        display: true,
                        text: label
                    }
                }
            });
        }
        //레이블 업데이트 
        var chartLabel = document.querySelector('#' + canvasId + ' + .chart-label');
        if(chartLabel){
            chartLabel.textContent = label + ':  ' + efficiencyPercent + '%';
        }
            },
    parseEfficiencyConf: function(conf) {
        const lines = conf.split('\n');
        let sectionFound = false;
        let eEfficiency = null;
        let tEfficiency = null;

        lines.forEach(line => {
            if (line.trim() === `[efficiency]`) {
                sectionFound = true;
            } else if (sectionFound && line.startsWith('[')) {
                sectionFound = false;
            } else if (sectionFound) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const key = parts[0].trim();
                    const value = parseFloat(parts[1].trim());
                    if (key === 'e_efficiency') {
                        eEfficiency = value;
                    } else if (key === 't_efficiency') {
                        tEfficiency = value;
                    }
                }
            }
        });
        //디버깅 
        console.log('eEfficiency:', eEfficiency); // ok
        console.log('tEfficiency:', tEfficiency); //ok  

        // return { eEfficiency, tEfficiency };
        return { e_efficiency: eEfficiency, t_efficiency: tEfficiency };
    }
};
