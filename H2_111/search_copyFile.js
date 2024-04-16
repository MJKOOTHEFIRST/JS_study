//search_copyFile.js
export function copyFile(no) {
  fetch(`/FDC/Proj/trunk/js/main/stack_search_fileSave.php?no=${no}`)
  .then(response => {
    console.log(response); // 서버로부터 받은 응답 객체 콘솔에 기록
    if (!response.ok) {
      throw new Error('네트워크 응답 안됨');
    }
    return response.json(); // JSON 응답으로 처리
  })
  .then(data => {
    if (data.message === '파일 복사 실패') {
        console.error('파일 복사 실패', data.error);
    } else if (data.message === '파일 이동 성공') {
        console.log(`복사된 파일 이름: ${data.fileName}`);
    } else {
        console.error('알 수 없는 응답:', data);
    }
  })
  .catch(error => console.error('Error:', error));
}
