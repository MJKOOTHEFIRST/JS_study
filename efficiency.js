var EfficiencyChartManager = {
    base_data_url: "/conf_data/",
    doughnutCharts: {}, // 차트 인스턴스를 저장하는 객체

    loadEfficiencyData: function(canvasId, section, label, color) {
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                // console.log('Fetched data', conf);
                const efficiencyData = this.parseEfficiencyConf(conf);
                // console.log('efficiencyData(parsed data): ', efficiencyData);
    
                // console.log('Section:', section); // 추가된 디버깅 로그
                var efficiencyPercent = efficiencyData[section];
                // console.log('Efficiency Percent before chart creation:', efficiencyPercent);
    
                this.createEfficiencyDoughnutChart(canvasId, efficiencyPercent, label, color);
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    // 10초에 한번씩 데이터 로드되게
    startDataLoading: function() {
        // 첫 번째 데이터 로드
        this.loadEfficiencyData('eEfficiencyChart', 'e_efficiency', '현재전력생산량', 'skyblue');
        this.loadEfficiencyData('tEfficiencyChart', 't_efficiency', '현재열생산량', 'pink');
        this.loadRealTimeData();
    
        // 10초마다 반복적으로 데이터 로드
        setInterval(() => {
            console.log("10초마다 데이터 로드");
            this.loadEfficiencyData('eEfficiencyChart', 'e_efficiency', '현재전력생산량', 'skyblue');
            this.loadEfficiencyData('tEfficiencyChart', 't_efficiency', '현재열생산량', 'pink');
            this.loadRealTimeData();
        }, 10000); // 10000ms = 10초
    },    

    loadRealTimeData: function() {
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                const productionData = this.parseProductionConf(conf);
                if (productionData) {
                    // e_production과 t_production 값을 .chart-data에 표시
                    var eProductionElement = document.querySelector('.e-production .chart-data');
                    var tProductionElement = document.querySelector('.t-production .chart-data');
                    if (eProductionElement) {
                        eProductionElement.textContent = '전력 생산량: ' + productionData.e_production + ' kW';
                    }
                    if (tProductionElement) {
                        tProductionElement.textContent = '열 생산량: ' + productionData.t_production + ' kW';
                    }
                }
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    parseProductionConf: function(conf) {
        // [production] 섹션에서 e_production과 t_production 값을 파싱
        const lines = conf.split('\n');
        let sectionFound = false;
        let eProduction = null;
        let tProduction = null;

        lines.forEach(line => {
            if (line.trim() === `[production]`) {
                sectionFound = true;
            } else if (sectionFound && line.startsWith('[')) {
                sectionFound = false;
            } else if (sectionFound) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const key = parts[0].trim();
                    const value = parseFloat(parts[1].trim());
                    if (key === 'e_production') {
                        eProduction = value;
                    } else if (key === 't_production') {
                        tProduction = value;
                    }
                }
            }
        });
        return { e_production: eProduction, t_production: tProduction };
    },

    createEfficiencyDoughnutChart: function(canvasId, efficiencyPercent, label, color) {
        const options = {
            // 차트의 옵션 설정
            circumference: 180,
            rotation: 270,
            cutoutPercentage: 80,
            tooltips: {
                callbacks: {
                    label: function(tooltipItem) {
                        return tooltipItem.formattedValue + '%';
                    }
                }
            },
            hover: { mode: null },
            title: {
                display: true,
                text: label
            }
            // 기타 필요한 옵션들...
        };
    
        var canvas = document.getElementById(canvasId);
        if (!canvas) {
            // console.error('Canvas ID가 없음:', canvasId);
            return;
        }
        const ctx = canvas.getContext('2d');
    
        if (this.doughnutCharts[canvasId]) {
            // 기존 차트 업데이트
            this.doughnutCharts[canvasId].options = options;
            this.doughnutCharts[canvasId].update();
        } else {
            // 새 차트 생성
            this.doughnutCharts[canvasId] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [efficiencyPercent, 100 - efficiencyPercent],
                        backgroundColor: [color, 'lightgrey'],
                        borderWidth: 0
                    }]
                },
                options: options // 옵션 사용
            });
        }
    
        // 레이블 업데이트
        var chartLabel = document.querySelector('#' + canvasId + ' + .chart-label');
        if (chartLabel) {
            chartLabel.textContent = label + ': ' + efficiencyPercent + '%';
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
        // console.log('eEfficiency:', eEfficiency); // ok
        // console.log('tEfficiency:', tEfficiency); //ok  

        // return { eEfficiency, tEfficiency };
        return { e_efficiency: eEfficiency, t_efficiency: tEfficiency };
    }
};


// HTML 페이지 로딩 시 실시간 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    EfficiencyChartManager.startDataLoading();
});