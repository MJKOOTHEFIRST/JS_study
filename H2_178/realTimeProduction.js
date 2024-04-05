import { loadData } from './dataManager.js';

const realTimeProductionManager = {
    doughnutCharts: {}, // 하프 도넛 차트 인스턴스 저장 객체

    loadRealTimeProductionData: function () {
        loadData('realtime_production')
            .then(realtimeData => {
                loadData('real_per_production')
                    .then(perData => {
                        const totalData = {
                            e_realtime_production: realtimeData.e_realtime_production,
                            t_realtime_production: realtimeData.t_realtime_production,
                            e_real_per_production: perData.e_real_per_production,
                            t_real_per_production: perData.t_real_per_production
                        };

                        if (Object.keys(realtimeData).length > 0) {
                            this.updateCharts(realtimeData, totalData);
                        } else {
                            console.log("새로운 데이터가 없습니다.");
                        }
                    })
                    .catch(error => {
                        console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
                    });
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    updateCharts: function (data, totalData) {
        // 퍼센티지 계산
        const ePercentage = Number(totalData.e_real_per_production).toFixed(0);
        const tPercentage = Number(totalData.t_real_per_production).toFixed(0);

        // 전기 발전량 차트 업데이트
        this.createHalfDoughnutChart('realtime-eProduction', ePercentage, '전기발전량', '#4CB9E7');
        // 열 발전량 차트 업데이트
        this.createHalfDoughnutChart('realtime-tProduction', tPercentage, '열 발전량', '#FF8F8F');

        // 퍼센티지 업데이트
        document.querySelector('.realtime-e-percentage').innerHTML = ePercentage;
        document.querySelector('.realtime-t-percentage').innerHTML = tPercentage;

        // 하단의 숫자 데이터 업데이트
        document.querySelector('.e-bottom-side').innerHTML = this.formatPower(totalData.e_realtime_production);
        document.querySelector('.t-bottom-side').innerHTML = this.formatPower(totalData.t_realtime_production);
    },

    // 전력 단위 변환 함수
    formatPower: function (powerValue) {
        const power = Number(powerValue);
        if (power >= 1000) {
            return (power / 1000).toFixed(2) + ' <sub>kW</sub>';
        } else {
            return power + ' <sub>W</sub>';
        }
    },

    createHalfDoughnutChart: function (canvasId, productionPercent, label, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        const options = {
            // 차트의 옵션 설정
            circumference: 180,
            rotation: 270,
            //    cutoutPercentage: 80, <-- old version //Eung
            cutout: '80%',
            tooltips: {
                callbacks: {
                    label: function (tooltipItem) {
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
