//search_copyFile.js
console.log('search_copyFile.js 도달!');

export function copyFile(no) {
  fetch(`/FDC/Proj/trunk/js/main/search_copyFile.php?no=${no}`)
  .then(response => {
    console.log('response', response); // 서버로부터 받은 응답 객체 콘솔에 기록
    if (!response.ok) {
      throw new Error('네트워크 응답 안됨');
    }
    return response.json(); // JSON 응답으로 처리
  })
  .then(data => {
    console.log('data:', data);
    if (data.message === '파일 복사 실패') {
        console.error('파일 복사 실패', data.error);
    } else if (data.message === '파일 복사 성공') {
        console.log(`복사된 파일 이름: ${data.fileName}`);
        // tryShowGraph(); // 수정된 부분: show_graph 함수 호출 시도
    } else {
        console.error('알 수 없는 응답:', data);
    }
  })
  .catch(error => console.error('Error:', error));
}

// // show_graph 함수 호출 시도를 위한 함수
// function tryShowGraph() {
//   console.log("tryShowGraph 함수 호출됨");
//   if (typeof show_graph === "function") {
//       console.log("show_graph 함수호출!");
//       show_graph();
//     } else {
//       console.log("show_graph 함수실패!");
//       setTimeout(tryShowGraph, 100); // 100ms 후에 다시 시도
//   }
// }