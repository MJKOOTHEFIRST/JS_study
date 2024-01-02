import { loadData } from './dataManager.js';

const BopDiagramManager = {
    // BOP 데이터를 불러오고 DOM에 업데이트하는 함수
    loadBopData: function() {
        loadData('BOP')
        .then(conf => {
            this.updateBopDiagram(conf); // 로드된 데이터를 바탕으로 다이어그램 업데이트
        })
        .catch(error => {
            console.error('BOP 데이터를 불러오는 데 실패했습니다.', error);
        });
    },

    // BOP 다이어그램 업데이트 함수
    updateBopDiagram: function(conf) {
        // `conf`에서 필요한 데이터 추출 및 DOM 업데이트
        Object.keys(conf).forEach(key => {
            // HTML에서 해당하는 요소의 ID를 찾아 값을 업데이트
            const element = document.getElementById(`${key}_value`);
            if (element) {
                // 값만 설정하면 됨 (단위는 이미 HTML에 설정되어 있음)
                element.textContent = conf[key];
            }
        });
    }
};

export { BopDiagramManager };
