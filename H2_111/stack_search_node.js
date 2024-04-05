// stack_search.js
// XMLHttpRequest 객체 생성
const xhr = new XMLHttpRequest();

// 서버의 '/search' 경로로 GET 요청 설정
// 서버의 '/search' 경로로 GET 요청 설정
// xhr.open('GET', 'http://localhost:3000/search', true);
xhr.open('GET', 'http://192.168.100.111:3000/search', true);

// 요청 완료 시 처리할 이벤트 핸들러
xhr.onload = function() {
  if (this.status === 200) {
    // 서버로부터 받은 데이터(JSON 문자열)를 객체로 변환
    const results = JSON.parse(this.responseText);
    
    // 결과 데이터를 사용하여 테이블 채우기
    const tbody = document.querySelector('.stack_search_table tbody');
    results.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" name="search-checkbox"></td>
        <td>${row.time}</td>
        <td>${row.HM}</td>
        <td>${row.HL}</td>
        <td>${row.X1}</td>
        <td>${row.X2}</td>
        <td>${row.Y1}</td>
        <td>${row.Y2}</td>
        <td>${row.M}</td>
        <td>${row.L}</td>
        <td>${row.SQ}</td>
        <td>${row.BQ}</td>
        <td>${row.LABEL}</td>
      `;
      tbody.appendChild(tr)
      });
    } else {
      console.error('Error fetching data:', this.statusText);
    }
  };
  
  // 요청 전송
  xhr.send();