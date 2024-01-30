// operation_info.js
import { loadAllData } from './dataManager.js';

const updateOperatingInfo = () => {
    loadAllData().then(conf => {
        console.log(conf);
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        
        // 값이 1000 이 넘으면 Wh -> kWh
        const formatValue = (value) => {
            return value > 1000 ? `${(value / 1000).toFixed(2)} kWh` : `${value} Wh`;
        };

        const dailyProduction = conf['e_day'] ? conf['e_day'][`e_production_${day}`] : '데이터 없음';
        const monthlyProduction = conf['e_month'] ? conf['e_month'][`e_production_${month}`] : '데이터 없음';
        const yearlyProduction = conf['e_year'] ? conf['e_year'][`e_production_${year}`] : '데이터 없음';
        const totalProduction = conf['e_total'] ? conf['e_total']['e_production'] : '데이터 없음';

        document.querySelector('#e_today td:nth-child(2)').innerText = formatValue(dailyProduction);
        document.querySelector('#e_this_month td:nth-child(2)').innerText = formatValue(monthlyProduction);
        document.querySelector('#e_this_year td:nth-child(2)').innerText = formatValue(yearlyProduction);
        document.querySelector('#e_total td:nth-child(2)').innerText = formatValue(totalProduction);
    }).catch(error => {
        console.error('운전 정보를 업데이트하는 데 실패했습니다.', error);
    });
};

// 페이지 로드 시 운전 정보 업데이트
window.addEventListener('DOMContentLoaded', updateOperatingInfo);
