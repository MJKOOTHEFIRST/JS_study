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
    Object.keys(conf).forEach(key => {
        try {
            let element = document.getElementById(`${key}_value`);
            console.log('element:', element);  // 요소가 제대로 선택되었는지 확인

            if (element) {
                let unit = element.querySelector('sup') ? element.querySelector('sup').outerHTML : '';
                console.log('conf[key]:', conf[key]);  // conf의 키 값 확인
                console.log('Unit:', unit);  // 단위가 제대로 선택되었는지 확인
                element.innerHTML = conf[key] + unit;
            }
        } catch (error) {
            console.error('Error updating BOP diagram for key:', key, error);
        }
    });
}

};

export { BopDiagramManager };
