// stacked.js 에서 총량(100% 일때 량을) 데이터 섹션으로 따로 뺐을 때 버전
/*
tota_data.conf 에서 읽어올 데이터 
# 누적차트
[e_year_stacked]
e_production_stacked=2365.70

[e_month_stacked]
e_production_stacked=2664

[e_day_stacked]
e_production_stacked=74

#총량설정
[e_year_total_capacity]
e_production_total=10000

[e_month_total_capacity]
e_production_total=1000

[e_day_total_capacity]
e_production_total=100
*/
var StackedChartManager = {
    base_data_url: "/conf_data/", // 데이터 위치 설정
    stackedChart: null, // 차트를 저장할 변수 초기화

    // 데이터 불러오는 함수
    loadStackedChartData: function(timeUnit = 'day') {
        // console.log("loadStackedChartData  호출"); //디버깅 OK
        fetch(this.base_data_url + 'total_data.conf') // CONF 파일 가져오기
            .then(response => response.text())
            .then(conf => {
                console.log("응답 데이터:", conf); // 디버깅 OK
                // CONF 파일에서 데이터 파싱
                const parsedData = this.parseConfData(conf, timeUnit);

                 // 각 섹션에서 절대 total capacity 값을 가져옴
                 const totalCapacityYear = parsedData.eProductionTotalYearCapacity;
                 const totalCapacityMonth = parsedData.eProductionTotalMonthCapacity;
                 const totalCapacityDay = parsedData.eProductionTotalDayCapacity;
                
                // 차트 데이터 객체 생성
                const chartData = {
                    eProductionStacked: parsedData.eProductionStacked,
                    totalCapacity: totalCapacityYear, // 각 섹션에서의 값을 따로 사용
                    datasets: [{
                        label: '',
                        data: [parsedData.eProductionStacked, totalCapacityYear - parsedData.eProductionStacked],
                        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(211, 211, 211, 0.5)']
                    }],
                    labels: [timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)]
                };

                // 차트 생성
                this.createStackedChart(`eProductionChart${timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}`, chartData, timeUnit);
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    // CONF 파일 파싱 함수
    parseConfData: function(conf, timeUnit) {
        console.log('parseConfData 함수 호출됨'); // 디버깅 OK
        const lines = conf.split('\n');
        let section = '';
        let eProductionStackedValue = null; // 초기값을 null로 설정

        // timeUnit 변수를 올바르게 설정하도록 수정
        const sectionHeader = `[e_${timeUnit}_stacked]`;

        lines.forEach(line => {
            // 섹션 시작 확인
            if (line.trim() === sectionHeader) {
                section = `e_${timeUnit}_stacked`;
                console.log(`Section matched: ${section}`); // 디버깅
            } else if (section === `e_${timeUnit}_stacked`) {
                // 현재 섹션 내에서 e_production_stacked 키 확인
                if (line.trim().startsWith('e_production_stacked')) {
                    const parts = line.split('=');
                    eProductionStackedValue = parseFloat(parts[1].trim());
                    console.log(`e_production_stacked value for ${section}:`, eProductionStackedValue); // 디버깅
                }
            } else if (line.trim().startsWith('[') && section) {
                // 다음 섹션을 만났을 때 현재 섹션 종료
                section = '';
            }
        });

        if (eProductionStackedValue === null) {
            console.error(`Value for e_production_stacked not found in section ${section}`);
        }

        return {
            eProductionStacked: eProductionStackedValue
        };
    },

    // 차트 생성 함수
    createStackedChart: function(canvasId, chartData, timeUnit) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas ID가 없음:', canvasId);
            return;
        }
        const ctx = canvas.getContext('2d');

        // 데이터셋 구성
        let datasets = [{
            label: 'Used Capacity',
            data: [chartData.eProductionStacked], // 사용된 용량
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }, {
            label: 'Unused Capacity',
            data: [chartData.totalCapacity - chartData.eProductionStacked], // 미사용 용량
            backgroundColor: 'rgba(211, 211, 211, 0.5)'
        }];

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
    // total_data.conf 파일 파싱 함수
    parseTotalCapacityData : function(conf) {
    const lines = conf.split('\n');
    let eProductionTotalYear = null;
    let eProductionTotalMonth = null;
    let eProductionTotalDay = null;

    lines.forEach(line => {
        if (line.trim() === '[e_year_total]') {
            // 연간 총량 섹션 시작
        } else if (line.trim() === '[e_month_total]') {
            // 월간 총량 섹션 시작
        } else if (line.trim() === '[e_day_total]') {
            // 일간 총량 섹션 시작
        } else if (line.trim().startsWith('e_production_total')) {
            const parts = line.split('=');
            const valueString = parts[1].trim();
            const value = parseInt(valueString);

            if (line.includes('[e_year_total]')) {
                eProductionTotalYear = value;
            } else if (line.includes('[e_month_total]')) {
                eProductionTotalMonth = value;
            } else if (line.includes('[e_day_total]')) {
                eProductionTotalDay = value;
            }
        }
    });

    return {
        eProductionTotalYear,
        eProductionTotalMonth,
        eProductionTotalDay
    };
},
// 페이지 로드 시 차트 로드 
init: function(){
    this.loadStackedChartData();
}
};


// 페이지 로드 시 차트 로드
StackedChartManager.init();