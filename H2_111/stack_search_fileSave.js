//stack_search_fileSave.js
// 체크박스 클릭하면 해당 체크박스의 NO을 통해 /home/nstek/h2_system/patch_active/FDC/work/bjy/impedance/time_series 에서 /home/nstek/h2_system/patch_active/FDC/work/bjy/impedance//selected로 파일 옮기기
// 선택되면 `파일명{#을 뺀 rgb 숫자문자} ` 로 옮겨짐.

console.log("stack_search_fileSave.js 도달");

// import {displayResults, goToPage} from './stack_search.js';

document.addEventListener('resultsDisplayed', function() { //stack_search.js에서 Custom Event인 resultsDisplayed 실행될때마다 수신됨
  document.querySelectorAll('input[type="checkbox"][name="search-checkbox"]').forEach((checkbox, index) => {
      console.log(`체크박스 ${index + 1}번 클릭됨, 상태 : ${checkbox.checked ? '선택됨' : '선택해제됨'}`);
      if (checkbox.checked) {
          const no = checkbox.getAttribute('data-no'); // 'data-no'는 체크박스에 추가해야 할 데이터 속성
          console.log(`이동할 파일 NO: ${no}`);
          moveFile(no);
      }
  });
});

// 이벤트 리스너를 'change' 이벤트에 대해 등록합니다.
document.addEventListener('change', function(event) {
  const element = event.target;
  if (element.type === 'checkbox' && element.name === 'search-checkbox') {
    const no = element.getAttribute('data-no');
    if (element.checked && no) { // no가 undefined가 아닐 때만 moveFile 호출
      console.log(`이동할 파일 NO: ${no}`);
      moveFile(no);
    } else {
      // console.error('data-no 속성이 없거나 체크박스가 체크되지 않았습니다.');
    }
  }
});

function moveFile(no) {
  fetch(`/FDC/Proj/trunk/js/main/stack_search.php?no=${no}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('네트워크 응답 안됨');
    }
    return response.text(); // JSON 대신 텍스트로 응답을 받아서
  })
  .then(text => {
    console.log(text); // 콘솔에 출력해본다.
    const data = JSON.parse(text);
    console.log(data.message);
    if (data.fileName) { // 파일 이름이 응답에 포함되어 있다면 출력
        console.log(`이동된 파일 이름: ${data.fileName}`);
    }
})
  .catch(error => console.error('Error:', error));
}