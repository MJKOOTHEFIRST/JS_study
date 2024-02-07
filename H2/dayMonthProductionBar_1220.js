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
        // console.log(`Parsing data for section: ${section}`);
        const lines = conf.split('\n');
        let sectionFound = false;
        const result = [];

        lines.forEach(line => {
            if (line.trim() === `[${section}]`) {
                // console.log(`Found section: ${section}`);
                sectionFound = true;
            } else if (sectionFound && line.startsWith('[')) {
                // console.log(`End of section: ${section}`);
                sectionFound = false;
            } else if (sectionFound) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    // console.log(`Parsing line: ${line}`);
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

    // 토글 클릭할때 생긴다. day - month 오가면서.
    createChart: function(chartId, data, section) {
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
                labels: data.map(item => item.label),
                datasets: [{
                    label: label,
                    data: data.map(item => item.value),
                    borderWidth: 1,
                    barThickness: 10,
                    backgroundColor: backgroundColor
                }]
            },
            options: this.getChartOptions(section)
        });
    }, 

    // 토글 클릭안하면 차트 수치만 바뀐다. 기존 코드의 파괴하고 새로 생성하는 로직은 없앴다.
    updateChart: function(chartId, conf, section) {
        const data = this.parseDayConf(conf, section);
    
        if (this.charts[chartId]) {
            // 데이터만 업데이트
            this.charts[chartId].data.labels = data.map(item => item.label);
            this.charts[chartId].data.datasets.forEach((dataset) => {
                dataset.data = data.map(item => item.value);
            });
            this.charts[chartId].update();
        } else {
            // 새 차트 생성
            this.createChart(chartId, data, section);
        }
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
            animation: false, 
            tooltips: {
                callbacks: {
                    title: function(tooltipItems, data) {
                        return `${tooltipItems[0].label} 데이터`;
                    }
                }
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch1 = document.querySelector('#toggle-switch-1');
    const toggleSwitch2 = document.querySelector('#toggle-switch-2');

    // 데이터 리프레시 및 초기 차트 업데이트
    startDataRefresh((conf) => {
        const eData = dayMonthProductionBarManager.parseDayConf(conf, 'e_day');
        const tData = dayMonthProductionBarManager.parseDayConf(conf, 't_day');
        dayMonthProductionBarManager.createChart('eProduction-bar', eData, 'e_day');
        dayMonthProductionBarManager.createChart('tProduction-bar', tData, 't_day');

        // 주기적인 차트 업데이트
        setInterval(() => {
            loadData().then(conf => {
                const eSection = toggleSwitch1.checked ? 'e_month' : 'e_day';
                const tSection = toggleSwitch2.checked ? 't_month' : 't_day';
                const eData = dayMonthProductionBarManager.parseDayConf(conf, eSection);
                const tData = dayMonthProductionBarManager.parseDayConf(conf, tSection);

                dayMonthProductionBarManager.updateChart('eProduction-bar', eData, eSection);
                dayMonthProductionBarManager.updateChart('tProduction-bar', tData, tSection);
            });
        }, 10000);
    });

    // 전기생산량 토글 이벤트
    toggleSwitch1.addEventListener('change', function(event) {
        loadData().then(conf => {
            const section = event.target.checked ? 'e_month' : 'e_day';
            const parsedData = dayMonthProductionBarManager.parseDayConf(conf, section);
            dayMonthProductionBarManager.updateChart('eProduction-bar', parsedData, section);
        });
    });

    // 열생산량 토글 이벤트
    toggleSwitch2.addEventListener('change', function(event) {
        loadData().then(conf => {
            const section = event.target.checked ? 't_month' : 't_day';
            const parsedData = dayMonthProductionBarManager.parseDayConf(conf, section);
            dayMonthProductionBarManager.updateChart('tProduction-bar', parsedData, section);
        });
    });
});

export { dayMonthProductionBarManager, toggleSwitch1, toggleSwitch2 };
