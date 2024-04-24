//search_bookmark.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("문서 로드");
    getBookmarkList();

    // 이벤트 위임을 사용하여 동적으로 생성된 버튼에 이벤트 리스너 추가
    document.body.addEventListener('click', function(event) {
        if (event.target.id === 'add-bookmark-btn') {
            console.log("북마크 추가버튼 클릭됨");
            var bookmarkName = document.getElementById('add-bookmark').value;
            addBookmark(bookmarkName);
        }
    });
});

// 서버에 북마크를 추가하는 함수
function addBookmark(bookmarkName) {
    // AJAX를 사용하여 PHP 파일에 POST 요청을 보냄
    fetch('/FDC/Proj/trunk/js/main/add_bookmark.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'bookmark=' + encodeURIComponent(bookmarkName)
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function(data) {
        if (data.error) {
            // 에러 메시지가 있는 경우 경고창을 표시
            alert(data.error);
        } else {
            // 성공 메시지가 있는 경우 경고창을 표시하고 새로운 북마크 디렉터리 이름을 출력
            alert(data.message + ' 생성된 디렉터리 이름: ' + data.dirName);

            // 입력 필드를 초기화
            document.getElementById('add-bookmark').value = '';

            // 새로운 북마크 목록을 서버에서 가져와서 화면에 표시
            getBookmarkList();
        }
    })
    .catch(function(error) {
        // AJAX 요청이 실패한 경우 에러 메시지를 출력
        alert('북마크 추가에 실패했습니다.');
        console.error('There was a problem with the fetch operation:', error);
    });
}

// 서버에서 북마크 목록을 가져와서 화면에 표시하는 함수
function getBookmarkList() {
    fetch('/FDC/Proj/trunk/js/main/get_bookmark.php')
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function(data) {
        // 가져온 북마크 목록을 화면에 표시
        var bookmarkList = document.getElementById('bookmark-tab').querySelector('ul');
        bookmarkList.innerHTML = ''; // 기존 목록 초기화
        data.forEach(function(bookmark, index) {
            var newTabItem = document.createElement('li');
            newTabItem.classList.add('tab-item');
            
            // 각 북마크에 순차적으로 클래스 할당 (tab-color-01 ~ tab-color-10)
            var colorClass = 'tab-color-' + pad(index + 1, 2); // 숫자를 두 자리로 변환
            newTabItem.innerHTML = '<a class="' + colorClass + '">' + bookmark + '</a><button class="del" title="삭제" onclick="alert(\'삭제\')">×</button>';

            bookmarkList.appendChild(newTabItem);
        });

        // 목록 추가 버튼 추가
        addPlusButton(bookmarkList);
    })
    .catch(function(error) {
        // AJAX 요청이 실패한 경우 에러 메시지를 출력
        console.error('There was a problem with the fetch operation:', error);
    });
}

// 숫자를 두 자리로 변환하는 함수
function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

// 목록 추가 버튼을 추가하는 함수
function addPlusButton(bookmarkList) {
    var plusListItem = document.createElement('li');
    plusListItem.innerHTML = '<a class="plus" title="목록추가">+</a>' +
                             '<span class="tab-name-input" style="margin-left: 5px;">' +
                             '<input type="text" id="add-bookmark" style="width: 50px;">' +
                             '<button class="btn-of w-24" id="add-bookmark-btn">추가</button>' +
                             '</span>';
    bookmarkList.appendChild(plusListItem);
}

////////////////////////////////////////////////////////////////////////////////////
// 북마크 삭제
document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('del')) {
        // 삭제 버튼이 클릭된 경우
        var bookmarkName = event.target.parentElement.querySelector('a').innerText;
        deleteBookmark(bookmarkName);
    }
});

function deleteBookmark(bookmarkName) {
    fetch('/FDC/Proj/trunk/js/main/delete_bookmark.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'bookmark=' + encodeURIComponent(bookmarkName)
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function(data) {
        if (data.error) {
            // 에러 메시지가 있는 경우 경고창을 표시
            alert(data.error);
        } else {
            // 성공 메시지가 있는 경우 경고창을 표시
            alert(data.message);

            // 삭제된 북마크를 화면에서도 제거
            var bookmarkElement = event.target.parentElement;
            bookmarkElement.parentElement.removeChild(bookmarkElement);
        }
    })
    .catch(function(error) {
        // AJAX 요청이 실패한 경우 에러 메시지를 출력
        alert('북마크 삭제에 실패했습니다.');
        console.error('There was a problem with the fetch operation:', error);
    });
}
