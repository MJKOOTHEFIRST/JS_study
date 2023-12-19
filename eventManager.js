// eventManager.js 
// DOM loadded 됐을 때, event handling만 하는 것

// 시스템 데이터 로드
import { SystemInfoManager } from './system-info.js';

document.addEventListener('DOMContentLoaded', function() {
    SystemInfoManager.loadSystemData();
});


// 금일/금월 전기생산량 위젯
/*
참조: 동적 모듈
document.addEventListener('DOMContentLoaded', () => {
    import('./SystemInfoManager.js') // import를 위에 하는 대신에 동적 import를 수행해서 로드시간을 단축한다. 
        .then(SystemInfoManager => {
            SystemInfoManager.loadSystemData();
        })
        .catch(error => {
            console.error('모듈 로드 실패:', error);
        });
});

const btn = document.getElementById('yourButtonId'); // 버튼 ID에 맞게 수정하세요.

btn.addEventListener("click", () => {
    import('./SystemInfoManager.js')
        .then(SystemInfoManager => {
            SystemInfoManager.loadSystemData();
        })
        .catch(error => {
            console.error('모듈 로드 실패:', error);
        });
});



*/

