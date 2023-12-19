// dayMonthProductionBarManager.js
import { loadData, parseConf, startDataRefresh } from './dataManager.js';

const dayMonthProductionBarManager = {
    charts: {}, // 차트 인스턴스 저장 객체

    startAutoRefresh: function(chartId, section, interval) {
        console.log(`Auto-refresh 시작: ${chartId}, 섹션: ${section}, 간격: ${interval}`);
        
        // 이곳에서 loadData 함수 호출
        this.loadData(chartId, section);
        
        // 나머지 코드는 그대로 유지
        setInterval(() => {
            this.loadData(chartId, section);
        }, interval);
    },
    
    loadDayMonthProductionBarData: function(chartId, section) {
        console.log(`loadDay~함수 호출`)
        // console.log(`데이터 로딩: ${chartId}, 섹션: ${section}`);

        loadData()
            .then(conf => {
                const data = parseConf(conf, section);
                console.log(`로딩된 데이터:`, data);
                if (Object.keys(data).length > 0) {
                    this.updateChart(chartId, data, section);
                } else {
                    console.log("새로운 데이터가 없습니다.");
                }
            })
            .catch(error => {
                console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
            });
    },

    parseDayConf: function(conf, section) {
        console.log(`Parsing data for section: ${section}`);
        const lines = conf.split('\n');
        let sectionFound = false;
        const result = [];

        lines.forEach(line => {
            if (line.trim() === `[${section}]`) {
                console.log(`Found section: ${section}`);
                sectionFound = true;
            } else if (sectionFound && line.startsWith('[')) {
                console.log(`End of section: ${section}`);
                sectionFound = false;
            } else if (sectionFound) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    console.log(`Parsing line: ${line}`);
                    result.push({
                        time: parts[0].trim().split('_')[2],
                        value: parseFloat(parts[1].trim())
                    });
                }
            }
        });
        return result;
    },
    
    parseConf: function(conf, section) {
        console.log(`구성 파싱: 섹션 ${section}`);
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
                    const key = parts[0].trim();
                    const value = parseFloat(parts[1].trim());
    
                    if (section === 'e_day' || section === 't_day') {
                        const time = key.split('_')[2];
                        result.push({ label: `${time}시`, value });
                    } else if (section === 'e_month' || section === 't_month') {
                        const month = parseInt(key.split('_')[2], 10);
                        result.push({ label: `${month}월`, value });
                    }
                    // 연간 및 기타 섹션에 대한 처리
                }
            }
        });
    
        console.log(`파싱된 결과:`, result);
        return result;
    },
    
    updateChart: function(chartId, conf, section) {
        console.log(`차트 업데이트: ${chartId}, 데이터 구조:`, conf);
       // 이전에 생성된 차트가 있다면 파괴
        if(this.charts[chartId]){
            console.log(`이전 차트 파괴: ${chartId}`);
            this.charts[chartId].destroy();
        }

        const ctx = document.getElementById(chartId).getContext('2d');
        if (!ctx) {
            console.error(`Canvas 컨텍스트를 찾을 수 없음: ${chartId}`);
            return;
        }
        const label = section.includes('e_') ? '전기생산량(kW)' : '열생산량(kW)';
        const backgroundColor = section.includes('e_') ? "rgba(0, 123, 255, 0.5)" : "pink";

        const data = this.parseDayConf( conf, section);

        this.charts[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => section.includes('day') ? item.time + '시' : item.month),
                // labels: '',
                datasets: [{
                    label: label,
                    data: data.map(item => item.value),
                    borderWidth: 1,
                    barThickness: 20,
                    backgroundColor: backgroundColor
                }]
            },
            options: this.getChartOptions(section)
        });
        console.log(`새 차트 생성: ${chartId}`);
    },

    getChartOptions: function(section) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'kW',
                        position: 'top'
                    },
                    ticks: { font: { size: 10 } }
                },
                x: {
                    scaleLabel: {
                        display: true,
                        labelString: section.includes('day') ? '시' : '월',
                        position: 'right'
                    },
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        font: { size: 10 }
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
    },
    //함수 표현식 사용 : 익명 함수의 사용. 이벤트 리스너에서 흔함. 해당 이벤트가 발생할 때만 함수가 실행되도록! 
    initEventHandlers: function() {
        console.log('initEventHandlers 호출');
        document.querySelectorAll('.widget').forEach(widget => {
            widget.querySelectorAll('.date-selector').forEach(selector => {
                selector.addEventListener('click', function(event) {
                    const chartId = widget.querySelector('.myChartDiv canvas').id;
                    const isToday = event.target.classList.contains('today');
                    // 현재 섹션 업데이트
                    dayMonthProductionBarManager.currentSection[chartId] = isToday ? 'e_day' : 'e_month';
    
                    // 차트에 대한 새로고침 로직
                    const section = dayMonthProductionBarManager.currentSection[chartId];
                    console.log(`startAutoRefresh 호출: ${chartId}, ${section}`);
                    dayMonthProductionBarManager.startAutoRefresh(chartId, section, 10000);
                });
            });
        });
    }
}

function determineSectionBasedOnChartId(chartId) {
    console.log(`determineSectionBasedOnChartId 호출됨, chartId: ${chartId}`);

    if (chartId === 'eProduction-bar') {
        console.log('차트 ID는 eProduction-bar, 반환 섹션: e_day');
        return 'e_day'; // 'e_month'도 가능한 경우 추가
    } else if (chartId === 'tProduction-bar') {
        console.log('차트 ID는 tProduction-bar, 반환 섹션: t_day');
        return 't_day'; // 't_month'도 가능한 경우 추가
    } else {
        console.log('일치하는 차트 ID 없음, 반환 값: null');
        return null; // 차트 ID에 해당하는 섹션이 없는 경우
    }
}

// 페이지 로드 시 차트 데이터 초기 로드 및 주기적 업데이트
document.addEventListener('DOMContentLoaded', () => {

    console.log(`이벤트리스너`);// 통신ok

    startDataRefresh((conf) => {
    
        dayMonthProductionBarManager.updateChart('eProduction-bar', conf, 'e_day');
        dayMonthProductionBarManager.updateChart('tProduction-bar', conf, 't_day');
     
    }, 10000);

    // /*
    document.querySelector('#e_production .date-selector-bar.today').addEventListener('click', function() {
        console.log('전기생산량 금일 클릭됨');
        dayMonthProductionBarManager.updateChart('eProduction-bar', conf, 'e_day');
    });
    
    // 전기생산량에 대한 금월 클릭 이벤트
    document.querySelector('#e_production .date-selector-bar.month').addEventListener('click', function() {
        console.log('전기생산량 금월 클릭됨');
        dayMonthProductionBarManager.updateChart('eProduction-bar', conf, 'e_month');
    });
    
    // 열생산량에 대한 금일 클릭 이벤트
    document.querySelector('#h_production .date-selector-bar.today').addEventListener('click', function() {
        console.log('열생산량 금일 클릭됨');
        dayMonthProductionBarManager.updateChart('tProduction-bar', conf, 't_day');
    });
    
    // 열생산량에 대한 금월 클릭 이벤트
    document.querySelector('#h_production .date-selector-bar.month').addEventListener('click', function() {
        console.log('열생산량 금월 클릭됨');
        dayMonthProductionBarManager.updateChart('tProduction-bar', conf, 't_month');
    });
});



