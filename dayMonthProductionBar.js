// dayMonthProductionBarManager.js
import { loadData, parseConf } from './dataManager.js';

const dayMonthProductionBarManager = {
    charts: {}, // 차트 인스턴스 저장 객체

    startAutoRefresh: function(chartId, section, interval) {
        console.log(`Auto-refresh 시작: ${chartId}, 섹션: ${section}, 간격: ${interval}`);
        this.loadData(chartId, section);
        setInterval(() => {
            this.loadData(chartId, section);
        }, interval);
    },

    loadData: function(chartId, section) {
        console.log(`데이터 로딩: ${chartId}, 섹션: ${section}`);
        loadData()
            .then(conf => {
                const data = parseConf(conf, section);
                console.log(`로딩된 데이터:`, data);
                 if (Object.keys(data).length > 0) {  // 객체가 비어있지 않은 경우(Object.keys(data)는 객체의 모든 열거 가능한 속성 이름들을 문자열 배열로 반환). data.length는 배열일 때 사용
                this.updateChart(chartId, data, section);
            } else {
                console.log("새로운 데이터가 없습니다.");
            }
        })
        .catch(error => {
            console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
        });
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
    
    updateChart: function(chartId, data, section) {
        console.log(`차트 업데이트: ${chartId}, 데이터 구조:`, data);
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

        this.charts[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => section.includes('day') ? item.time + '시' : item.month),
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

    initEventHandlers: function() {
        console.log('initEventHandlers 호출');
        document.querySelectorAll('.widget').forEach(widget => {
            // console.log('위젯 처리:', widget);
            widget.querySelectorAll('.date-selector').forEach(selector => {
                selector.addEventListener('click', function() {
                    console.log('date-selector 클릭 이벤트 발생');
                    const canvasElement = widget.querySelector('.myChartDiv canvas');
                    if (!canvasElement) {
                        console.error('Canvas 요소를 찾을 수 없습니다:', widget);
                        return;
                    }
                    const chartId = canvasElement.id;
                    const isToday = selector.classList.contains('today');
                    let section = '';
    
                    if (chartId === 'eProduction-bar') {
                        section = 'e_' + (isToday ? 'day' : 'month');
                    } else if (chartId === 'tProduction-bar') {
                        section = 't_' + (isToday ? 'day' : 'month');
                    }
    
                    if (section) {
                        console.log(`startAutoRefresh 호출: ${chartId}, ${section}`);
                        dayMonthProductionBarManager.startAutoRefresh(chartId, section, 10000);
                    }
                });
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 이벤트 발생');
    dayMonthProductionBarManager.initEventHandlers();

    //초기 차트 로드 
    dayMonthProductionBarManager.startAutoRefresh('eProduction-bar', 'e_day', 10000);
    dayMonthProductionBarManager.startAutoRefresh('tProduction-bar', 't_day', 10000);
});

