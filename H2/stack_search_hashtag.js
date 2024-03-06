//stack_search_hashtag.js
document.getElementById('new-label').addEventListener('click', function() {
  const hashtags = Array.from(document.querySelectorAll('.hashtag .main')).map(button => button.textContent);
  console.log('전송할 해시태그:', hashtags); // 디버깅을 위한 로깅

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'stack_search_hashtag.php', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.onload = function() {
      if (this.status === 200) {
          console.log('서버로부터의 응답:', this.responseText);
          // 성공적으로 데이터를 전송한 후의 처리 로직
      } else {
          console.error('서버 응답 실패:', this.status);
      }
  };

  xhr.onerror = function() {
      console.error('Request failed');
  };

  xhr.send('hashtags=' + encodeURIComponent(JSON.stringify(hashtags)));
});
