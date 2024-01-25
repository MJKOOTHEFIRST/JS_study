// operation_info.js
import { loadAllData } from './dataManager.js';

const updateOperatingInfo = () => {
    loadAllData().then(conf => {
        console.log(conf);
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // JavaScript에서는 월이 0부터 시작하므로 1을 더해줍니다.
        const year = today.getFullYear();

        const dailyProduction = conf['e_day'] ? conf['e_day'][`e_production_${day}`] : '데이터 없음';
        const monthlyProduction = conf['e_month'] ? conf['e_month'][`e_production_${month}`] : '데이터 없음';
        const yearlyProduction = conf['e_year'] ? conf['e_year'][`e_production_${year}`] : '데이터 없음';
        const totalProduction = conf['e_total'] ? conf['e_total']['e_production'] : '데이터 없음';

        document.querySelector('#e_today td:nth-child(2)').innerText = `${dailyProduction} kWh`;
        document.querySelector('#e_this_month td:nth-child(2)').innerText = `${monthlyProduction} kWh`;
        document.querySelector('#e_this_year td:nth-child(2)').innerText = `${yearlyProduction} kWh`;
        document.querySelector('#e_total td:nth-child(2)').innerText = `${totalProduction} kWh`;
    }).catch(error => {
        console.error('운전 정보를 업데이트하는 데 실패했습니다.', error);
    });
};

// 페이지 로드 시 운전 정보 업데이트
window.addEventListener('DOMContentLoaded', updateOperatingInfo);