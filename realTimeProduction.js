import { loadData } from './dataManager.js';

const realTimeProductionManager = {
    doughnutCharts: {}, // 하프 도넛 차트 인스턴스 저장 객체

    loadRealTimeProductionData: function() {
        loadData('realtime_production') // '[realtime_production]' 섹션에서 데이터 로드
            .then(data => {
                if (Object.keys(data).length > 0) {
                    this.updateCharts(data);
                } else {
                    console.log("새로운 데이터가 없습니다.");
                }
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    updateCharts: function(data) {
        // 전기 발전량 차트 업데이트
        this.createHalfDoughnutChart('realtime-eProduction', data.e_realtime_production, '전기발전량', '#4CB9E7');
        // 열 발전량 차트 업데이트
        this.createHalfDoughnutChart('realtime-tProduction', data.t_realtime_production, '열 발전량', '#FF8F8F');

        // 퍼센티지 업데이트(임시데이터 섹션)
        document.querySelector('.realtime-e-percentage').innerHTML = data.e_realtime_production;
        document.querySelector('.realtime-t-percentage').innerHTML = data.t_realtime_production;

        // 하단의 숫자 데이터 업데이트(임시데이터 섹션)
        document.querySelector('.e-bottom-side').innerHTML = data.e_realtime_production + ' <sub>kW</sub>';
        document.querySelector('.t-bottom-side').innerHTML = data.t_realtime_production + ' <sub>kW</sub>';
    },

    createHalfDoughnutChart: function(canvasId, productionPercent, label, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');

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
        };

        if (this.doughnutCharts[canvasId]) {
            this.doughnutCharts[canvasId].data.datasets[0].data = [productionPercent, 100 - productionPercent];
            this.doughnutCharts[canvasId].options = options;
            this.doughnutCharts[canvasId].update();
        } else {
            this.doughnutCharts[canvasId] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [productionPercent, 100 - productionPercent],
                        backgroundColor: [color, 'lightgrey'],
                        borderWidth: 0
                    }]
                },
                options: options
            });
        }
    }
};

export { realTimeProductionManager };
