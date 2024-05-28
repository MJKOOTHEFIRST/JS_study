import { loadData } from './dataManager.js';

const BopDiagramManager = {
    loadBopAndEventData: function() {
        loadData() // 변경: 섹션 이름 없이 전체 파일 내용 반환
        .then(confText => {
            const { bopData, eventData } = this.parseConf(confText); // confText를 파싱하여 bopData와 eventData 추출
            this.updateBopDiagram(bopData); // BOP 데이터로 다이어그램 업데이트
            this.updateEventStatus(eventData); // Event 데이터로 경고 상태 업데이트
        })
        .catch(error => {
            console.error('데이터를 불러오는 데 실패했습니다.', error);
        });
    },

    // total_data.conf 파일 내용을 파싱하여 BOP와 event 섹션 데이터를 분리
    parseConf: function(confText) {
        const bopData = {};
        const eventData = {};
        let currentSection = '';

        confText.split('\n').forEach(line => {
            if (line.startsWith('[')) {
                currentSection = line.match(/\[(.*?)\]/)[1];
            } else {
                const [key, value] = line.split('=').map(part => part.trim());
                if (currentSection === 'BOP') {
                    bopData[key] = value;
                } else if (currentSection === 'event') {
                    eventData[key] = value;
                }
            }
        });

        return { bopData, eventData };
    },

    // BOP 데이터를 사용하여 다이어그램 업데이트
    updateBopDiagram: function(bopData) {
        Object.keys(bopData).forEach(key => {
            const elementId = `${key}_num`; // HTML 요소의 ID를 구성
            const element = document.getElementById(elementId);
            if (element) {
                const unit = element.querySelector('sup') ? element.querySelector('sup').outerHTML : '';
                element.innerHTML = `${bopData[key]}${unit}`; // 값과 단위를 업데이트
            }
        });
    },

    // event 데이터를 사용하여 경고 상태 업데이트
    updateEventStatus: function(eventData) {
        Object.keys(eventData).forEach(key => {
            let element = document.getElementById(`${key}_value`);
            if (element) {
                if (eventData[key] === 'red') {
                    element.classList.add('warning');
                } else if (eventData[key] === 'green') {
                    element.classList.remove('warning');
                }
            }
        });
    }
};

export { BopDiagramManager };
