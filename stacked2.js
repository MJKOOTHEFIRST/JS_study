// stacked.js
/*
가로 누적 막대 그래프로, 전체가 _capacity고 그 중에 해당값이 _stacked 그리고 나머지는 _capacity- _stacked
total_data.conf 에서 읽어올 데이터 
# 누적차트
[e_year_stacked]
e_production_stacked=2365.70

[e_month_stacked]
e_production_stacked=2664

[e_day_stacked]
e_production_stacked=74

#100%기준 설정
[e_year_capacity]
e_production_capacity=10000

[e_month_capacity]
e_production_capacity=1000

[e_day_capacity]
e_production_capacity=100
*/
var StackedChartManager = {
    base_data_url: "/conf_data/", // 데이터 위치 설정
    stackedChart: null, // 차트를 저장할 변수 초기화

    // 데이터 불러오는 함수
    loadStackedChartData: function(timeUnit = 'day') {
        fetch(this.base_data_url + 'total_data.conf')
            .then(response => response.text())
            .then(conf => {
                const capacityData = this.parseCapacityData(conf);
                const parsedData = this.parseConfData(conf, timeUnit);
    
                const capacityValue = timeUnit === 'year' ? capacityData.eProductionYear : 
                                      timeUnit === 'month' ? capacityData.eProductionMonth : 
                                      capacityData.eProductionDay;
                        
                const chartData = {
                    eProductionStacked: parsedData.eProductionStacked,
                    Capacity: capacityValue,
                    labels: [timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)],
                    datasets: [{
                        label: '누적량',
                        data: [parsedData.eProductionStacked, capacityValue - parsedData.eProductionStacked],
                        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(211, 211, 211, 0.5)'],
                        borderSkipped:false,
                        borderRadius:[
                            {topLeft:10, topRight:0, bottomLeft:10, bottomRight:0},
                        ]
                    }],
                };
    
                this.createStackedChart(`eProductionChart${timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}`, chartData, timeUnit);
                const resultElement = document.querySelector('.result');
                if (resultElement) {
                    resultElement.textContent = chartData.eProductionStacked + ' kW';
                }
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },
    

    // CONF 파일 파싱 함수
    parseConfData: function(conf, timeUnit) {
        console.log('파싱 시작 - timeUnit:', timeUnit);
        
        const lines = conf.split('\n');
        let eProductionStackedValue = null;
    
        const sectionHeader = `[e_${timeUnit}_stacked]`;
        console.log('찾고자 하는 섹션 헤더:', sectionHeader);
        let foundSection = false;
    
        lines.forEach(line => {
            if (line.startsWith(sectionHeader)) {
                foundSection = true;
            } else if (foundSection && line.trim().startsWith('e_production_stacked')) {
                const parts = line.split('=');
                eProductionStackedValue = parseFloat(parts[1].trim());
                console.log(`e_production_stacked 값 발견: ${eProductionStackedValue}`);
                foundSection = false; // 섹션 종료
            }
        });
    
        if (eProductionStackedValue === null) {
            console.error(`섹션 ${sectionHeader}에서 e_production_stacked 값을 찾지 못함`);
        }
    
        return {
            eProductionStacked: eProductionStackedValue
        };
    },
    
    

    // 차트 생성 함수
    createStackedChart: function(canvasId, chartData, timeUnit) {
        var canvas = document.getElementById(canvasId);
        let totalCapacity = chartData.Capacity;
        if (!canvas) {
            console.error('Canvas ID가 없음:', canvasId);
            return;
        }
        const ctx = canvas.getContext('2d');

        // 데이터셋 구성
        let datasets = [{
            label: 'Used Capacity',
            data: [chartData.eProductionStacked], // 사용된 용량
            backgroundColor: 'rgba(54, 162, 235, 0.5)', 
            borderSkipped: false,
            borderRadius: [
                {topLeft: 10, topRight:0, bottomLeft:10, bottomRight:0},
            ],
        }, {
            label: 'Unused Capacity',
            data: [totalCapacity - chartData.eProductionStacked], // 미사용 용량
            backgroundColor: 'rgba(211, 211, 211, 0.5)', 
            borderSkipped: false,
            borderRadius: [
                {topLeft: 10, topRight:0, bottomLeft:10, bottomRight:0},
            ],
        }];

         // .result 와 .rate에 엘리먼트에 표시할 값
        const resultElement = document.querySelector('.result');
        const rateElement = document.querySelector('.rate');
        if (resultElement && rateElement) {
            resultElement.textContent = chartData.eProductionStacked + ' kW';
            let rateValue = (chartData.eProductionStacked / totalCapacity) * 100;
            rateElement.textContent = rateValue.toFixed(2) + '%';
        }

        // 차트 생성 또는 업데이트
        if (this.stackedChart) {
            this.stackedChart.data.datasets = datasets;
            this.stackedChart.update();
        } else {
            this.stackedChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)],
                    datasets: datasets
                },
                options: {
                    indexAxis: 'y',
                    scales: {
                        x: { stacked: true },
                        y: { stacked: true }
                    },
                    barThickness: 50, // 막대 두께 조절
                    categoryPercentage: 0.8,
                    barPercentage: 0.9,
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false // 범례 숨기기
                        }
                    }
                }
            });
        }
    },


// e_year/month/day_capacity 섹션 파싱
parseCapacityData: function(conf) {
    const lines = conf.split('\n');
    let eProductionYear = null;
    let eProductionMonth = null;
    let eProductionDay = null;

    lines.forEach(line => {
        if (line.trim().startsWith('e_production_capacity')) {
            const parts = line.split('=');
            const value = parseFloat(parts[1].trim());
            if (line.includes('e_year_capacity')) {
                eProductionYear = value;
            } else if (line.includes('e_month_capacity')) {
                eProductionMonth = value;
            } else if (line.includes('e_day_capacity')) {
                eProductionDay = value;
            }
        }
    });

    return {
        eProductionYear,
        eProductionMonth,
        eProductionDay
    };
},


// 페이지 로드 시 차트 로드
init: function(){
    this.loadStackedChartData();
    
    // 데이터 불러온 후에 값을 확인하려면 다음과 같이 수정
    fetch(this.base_data_url + 'total_data.conf')
        .then(response => response.text())
        .then(conf => {
            const totalCapacityData = this.parseCapacityData(conf);
            console.log('eProductionYearCapacity:', totalCapacityData.eProductionYearCapacity);
            console.log('eProductionMonthCapacity:', totalCapacityData.eProductionMonthCapacity);
            console.log('eProductionDayCapacity:', totalCapacityData.eProductionDayCapacity);
        })
        .catch(error => {
            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
        });
}
};


// 페이지 로드 시 차트 로드
StackedChartManager.init();