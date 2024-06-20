//search_copyFile.js
// console.log('search_copyFile.js 도달!');

export function copyFilesForGraph(no, color) {
    console.log(`Starting copyFilesForGraph function with NO: ${no} and Color: ${color}`); // 함수 진입 로깅

    return fetch(`/FDC/Proj/mjkoo/js/main/copyFileForGraph.php?no=${no}&color=${encodeURIComponent(color)}`)
        .then(response => {
            console.log('response from copyFileForGraph.php:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data from copyFileForGraph.php:', data);
            if (data.message === '파일 복사 실패') {
                console.error('File copy failed:', data.error);
                return null;
            } else if (data.message === '파일 복사 성공') {
                console.log(`File copied successfully: ${data.fileName}`);
                return data; // 데이터를 반환
            } else {
                console.error('Unknown response:', data);
                return null;
            }
        })
        .catch(error => {
            console.error('Error during copyFileForGraph fetch:', error);
            return null;
        });
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