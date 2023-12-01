var EfficiencyChartManager = {
    base_data_url: "/conf_data/",
    doughnutCharts: {}, // 차트 인스턴스를 저장하는 객체

    loadEfficiencyData: function(canvasId, section, label, color) {
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                const efficiencyData = this.parseEfficiencyConf(conf);
                if (efficiencyData) {
                    var efficiencyPercent = efficiencyData[section];
                    this.createEfficiencyDoughnutChart(canvasId, efficiencyPercent, label, color);
                } else {
                    console.log("새로운 데이터가 없습니다.");
                }
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    createEfficiencyDoughnutChart: function(canvasId, efficiencyPercent, label, color) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas ID가 없음:', canvasId);
            return;
        }
        const ctx = canvas.getContext('2d');

        if (this.doughnutCharts[canvasId]) {
            this.doughnutCharts[canvasId].data.datasets[0].data = [efficiencyPercent, 100 - efficiencyPercent];
            this.doughnutCharts[canvasId].options.title.text = label;
            this.doughnutCharts[canvasId].data.datasets[0].backgroundColor[0] = color;
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
        return { eEfficiency, tEfficiency };
    }
};
