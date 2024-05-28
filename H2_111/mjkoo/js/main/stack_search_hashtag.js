//stack_search_hashtag.js
// 스택 검색에서 해시태그 생성/삭제하기
document.getElementById('new-tag').addEventListener('click', function() {
    const inputField = document.querySelector('input[type="text"]');
    const tagName = inputField.value.trim(); // 입력된 태그 이름을 가져옴

    if (tagName) {
        // 새로운 태그 버튼을 생성
        const newTag = document.createElement('div');
        newTag.classList.add('hashtag');

        const newButton = document.createElement('button');
        newButton.classList.add('main');
        newButton.textContent = tagName;

        const newLink = document.createElement('a');
        newLink.classList.add('del');
        newLink.href = '#';
        newLink.title = '삭제';
        newLink.textContent = '×';

        const newDeletedDiv = document.createElement('div');
        newDeletedDiv.classList.add('deleted');

        const newYesButton = document.createElement('button');
        newYesButton.classList.add('yes');
        newYesButton.title = '삭제';
        newYesButton.textContent = '×';

        // 생성한 요소들을 태그에 추가
        newTag.appendChild(newButton);
        newTag.appendChild(newLink);
        newTag.appendChild(newDeletedDiv);
        newDeletedDiv.appendChild(newYesButton);

        // 생성한 태그를 .scrollmini.hashtag-outer에 추가
        document.querySelector('.scrollmini.hashtag-outer').appendChild(newTag);

        // 새로 생성된 태그에 이벤트 리스너 추가
        newButton.addEventListener('click', function() {
            this.classList.toggle('active');
        });

        newLink.addEventListener('click', function() {
            const isActive = this.classList.contains('active');

            if (isActive) {
                this.classList.remove('active');
                this.textContent = '×';
                this.title = '삭제';
                newButton.removeAttribute('disabled');
                newDeletedDiv.style.display = 'none';
            } else {
                this.classList.add('active');
                this.textContent = '○';
                this.title = '취소';
                if (newButton.classList.contains('active')) {
                    newButton.classList.remove('active');
                }
                newButton.disabled = 'disabled';
                newDeletedDiv.style.display = 'block';
            }
        });

        newYesButton.addEventListener('click', function() {
            newTag.remove();
            saveTagToFile(tagName); // 태그를 파일에 저장
        });

        // 입력 필드 초기화
        inputField.value = '';
    }
});


function saveTagToFile(tagName) {
    // Ajax 요청을 사용하여 서버에 태그를 저장하는 코드
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/save_tag.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('태그가 성공적으로 저장되었습니다.');
        }
    };
    const data = 'tag=' + encodeURIComponent(tagName);
    xhr.send(data);
}
