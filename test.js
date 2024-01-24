import { loadData } from './dataManager.js';

const realTimeProductionManager = {
    doughnutCharts: {}, // 하프 도넛 차트 인스턴스 저장 객체

    loadRealTimeProductionData: function() {
        loadData('real_per_production') // '[real_per_production]' 섹션에서 데이터 로드
            .then(data => {
                // 총 발전량 데이터 로드
                Promise.all([loadData('e_total'), loadData('t_total')])
                    .then(totalDataArray => {
                        const totalData = {
                            e_production: totalDataArray[0].e_production,
                            t_production: totalDataArray[1].t_production
                        };
    
                        if (Object.keys(data).length > 0) {
                            this.updateCharts(data, totalData);
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

    updateCharts: function(data, totalData) {
        // 퍼센티지 계산
        const ePercentage = data.e_real_per_production.toFixed(0);
        const tPercentage = data.t_real_per_production.toFixed(0);
    
        // 전기 발전량 차트 업데이트
        this.createHalfDoughnutChart('realtime-eProduction', ePercentage, '전기발전량', '#4CB9E7');
        // 열 발전량 차트 업데이트
        this.createHalfDoughnutChart('realtime-tProduction', tPercentage, '열 발전량', '#FF8F8F');
    
        // 퍼센티지 업데이트
        document.querySelector('.realtime-e-percentage').innerHTML = ePercentage;
        document.querySelector('.realtime-t-percentage').innerHTML = tPercentage;
    
        // 하단의 숫자 데이터 업데이트
        document.querySelector('.e-bottom-side').innerHTML = totalData.e_production + ' <sub>W</sub>'; //<sub>kW</sub>
        document.querySelector('.t-bottom-side').innerHTML = totalData.t_production + ' <sub>W</sub>'; //<sub>kW</sub>
    },

    createHalfDoughnutChart: function(canvasId, productionPercent, label, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        const options = {
           // 차트의 옵션 설정
           circumference: 180,
           rotation: 270,
        //    cutoutPercentage: 80, <-- old version //Eung
           cutout: '80%',
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
