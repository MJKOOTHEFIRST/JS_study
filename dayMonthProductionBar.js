// dayMonthProductionBarManager.js
import { loadData, parseConf} from './dataManager.js';

const toggleSwitch1 = document.querySelector('#toggle-switch-1');
const toggleSwitch2 = document.querySelector('#toggle-switch-2');

const dayMonthProductionBarManager = {
    charts: {}, // 차트 인스턴스 저장 객체

    loadDayMonthProductionBarData: function(chartId, section) {
        loadData(section)
            .then(data => {
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

    parseDayMonthConf: function(conf, section) {
        const sectionData = parseConf(conf, section); // parseConf를 이용하여 기본 파싱 수행
    
        const result = [];
        for (const key in sectionData) {
            const value = parseFloat(sectionData[key]);
    
            if (section === 'e_day' || section === 't_day') {
                const time = key.split('_')[2];
                result.push({ label: `${time}시`, value });
            } else if (section === 'e_month' || section === 't_month') {
                const month = parseInt(key.split('_')[2], 10);
                result.push({ label: `${month}월`, value });
            }
        }
    
        console.log(`파싱된 결과:`, result);
        return result;
    },

    // 토글 클릭할때 차트가 새로 생긴다.  day - month 오가면서.
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
            options: this.getChartOptions(section),
            animation: true
        });
    }, 

    // 토글 클릭안하면 차트 수치만 바뀐다. 기존 코드의 파괴하고 새로 생성하는 로직은 없앴다.
    updateChart: function(chartId, conf, section) {
        const data = this.parseDayMonthConf(conf, section);
    
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

export { dayMonthProductionBarManager, toggleSwitch1, toggleSwitch2 };
