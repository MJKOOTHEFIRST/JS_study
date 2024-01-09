// bop_eventManager.js

// bop_dataManager.js에서 함수 임포트
import { loadData, parseCsvLearningData } from './bop_dataManager.js';

const loadAndDisplayLearningData = () => {
  loadData('bop_learning_data.csv')
    .then(csvText => parseCsvLearningData(csvText))
    .then(learningData => {
      const tbody = document.querySelector('.widget.bop-data-learning .table-responsive tbody');
      if (!tbody) {
        throw new Error('Table body not found');
      }

      // 기존의 내용을 초기화
      tbody.innerHTML = '';

      // 새로운 행 추가
      learningData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="checkbox"></td>
          <td>${item.date} ${item.startTime} ~ ${item.date} ${item.endTime}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error loading or displaying data:', error);
    });
};

// 페이지 로드 시 데이터 로드 및 표시
document.addEventListener('DOMContentLoaded', loadAndDisplayLearningData);
