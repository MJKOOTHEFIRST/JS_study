//search_copyFile.js
// console.log('search_copyFile.js 도달!');

export function copyFilesForGraph(no, color) { // 선택된 색상 코드 전달받는 매개변수 추가 
  fetch(`/FDC/Proj/mjkoo/js/main/copyFileForGraph.php?no=${no}&color=${encodeURIComponent(color)}`) // URL에 색상코드 포함시킬 때  인코딩해야함. 
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
      } else {
        console.error('알 수 없는 응답:', data);
      }
    })
    .catch(error => console.error('Error:', error));
}


// 데이터의 체크박스들을 체크하고 '항목등록' 버튼을 누르면 해당 디렉터리로 복사.
// 버튼 클릭 이벤트 처리. 항목 등록 로직 수행
export function copyFilesForBookmark(no, destinationDir) {
  console.log(`요청 시작: no= ${no}, destinationDir=${destinationDir}`);
  fetch(`/FDC/Proj/mjkoo/js/main/copyFileForBookmark.php?no=${no}&destinationDir=${encodeURIComponent(destinationDir)}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('네트워크 응답이 올바르지 않습니다.');
          }
          return response.json();
      })
      .then(data => {
          if (data.message === '파일 복사 실패') {
              console.error('파일 복사 실패', data.error);
          } else if (data.message === '파일 복사 성공') {
              console.log(`복사된 파일 이름: ${data.fileName}`);
          }
      })
      .catch(error => console.error('Error:', error));
}