// stack_tag_manager.js

// 기능 플래그 설정
const featureFlags = {
  saveTagWithGet: true,
  renderTags: true,
  tagDeletion: true,
  updateTagButtonLabel: false,
  tagSelection: true
};

// 체크박스 상태 변경 감지 및 버튼 텍스트 업데이트
if (featureFlags.updateTagButtonLabel) {
  document.addEventListener('change', function (event) {
    if (event.target.type === 'checkbox' && event.target.name === 'search-checkbox') {
      updateTagButtonLabel();
    }
  });
}

// // 페이지 로드 시 초기 버튼 텍스트 설정
// document.addEventListener('DOMContentLoaded', function () {
//   updateTagButtonLabel();
// });

function updateTagButtonLabel() {
  // if(!featureFlags.updateTagButtonLabel) return; // 기능 플래그에 따라 실행 여부 결정
  const checkboxes = document.querySelectorAll('#stack_search_table input[type="checkbox"][name="search-checkbox"]');
  const tagButton = document.getElementById('new-tag');
  const tagInput = document.getElementById('new-tag-text');

  let checkedCount = 0;
  let labelSet = new Set();

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      checkedCount++;
      const row = checkbox.closest('tr');
      const input = row.querySelector('td:last-child input[type="text"]');
      const label = input ? input.value.trim() : '';
      if (label) {
        labelSet.add(label);
      }
    }
  });

  console.log("체크된 라벨들 :", labelSet);

  if (checkedCount === 1 && labelSet.size === 1) {
    tagInput.value = labelSet.values().next().value;
    tagButton.textContent = '라벨 ᐧ 태그 수정';
  } else if (checkedCount > 1 && labelSet.size > 0) {
    tagInput.value = [...labelSet].join(',');
    tagButton.textContent = '여러 태그 수정';
  } else if (checkedCount > 0 && labelSet.size === 0) {
    tagInput.value = '';
    tagButton.textContent = '라벨 ᐧ 태그 생성';
  } else {
    tagInput.value = '';
    tagButton.textContent = '태그 생성';
  }
}

// 페이지 로드 시 초기 버튼 텍스트 설정
document.addEventListener('DOMContentLoaded', function () {
  updateTagButtonLabel();
});

// 색상 선택기의 이벤트 리스너 설정
document.querySelector('.color-pick').addEventListener('change', updateTagColor);

// 환경상 GET으로 태그 데이터를 저장하는 것으로 개발
// 태그와 색상을 서버로 전송하는 함수 
function saveTagWithGet(tagName, color) {
  // 쿼리 파라미터를 URL에 추가
  const url = new URL('/FDC/work/dev/js/main/save_tag.php', window.location.origin);
  const params = { tag: tagName, color: color };
  url.search = new URLSearchParams(params).toString();

  fetch(url)
    .then(response => {
      if (response.ok) {
        console.log('태그가 성공적으로 보내졌습니다.');
        // return response.text();
        return response.json();
      }
      throw new Error('태그 저장에 실패했습니다.');
    })
    .then(data => {
      console.log(data);
      // 저장 성공 시 새 태그 생성 및 동그라미 색상 변경
      if (data.message === '태그가 성공적으로 저장되었습니다.') {
        // 서버로부터의 응답이 성공적일 때만 태그를 DOM에 추가
        renderTags([{
          name: tagName,
          color: color
        }]);
        // 입력 필드 초기화
        document.getElementById('new-tag-text').value = '';
      }
    })
    .catch(error => console.error(error));
}


// 태그 추가 및 서버로 전송
document.getElementById('new-tag').addEventListener('click', function () {
  const tagInput = document.getElementById('new-tag-text'); // 입력필드 자체를 변수에 저장
  const tagText = tagInput.value.trim(); // 입력 필드의 값을 가져와서 공백 제거
  if (tagText) {
    // 중복된 태그 검사
    if (isDuplicateTag(tagText)) {
     alert("중복된 태그입니다.", document.getElementById('new-tag-text'));
     tagInput.value=''; // 입력 필드를 빈칸으로 설정
    } else {
      // 태그명과 선택된 색상을 서버로 전송하는 로직 구현
      const selectedColor = updateTagColor(); // 색상 선택 로직
      if (featureFlags.saveTagWithGet) { // 조건 추가
        saveTagWithGet(tagText, selectedColor); // 서버로 태그 저장
      }
    }
  } else {
    alert('태그명을 입력해주세요.');
  }
});

// 중복된 태그 검사
function isDuplicateTag(tagName) {
  const existingTags = document.querySelectorAll('.main.tag-selector');
  for (const tag of existingTags) {
      if (tag.textContent.trim() === tagName) {
          return true;
      }
  }
  return false;
}


// 태그 호출(GET, fetch는 HTTP 메소드를 별도로 지정하지 않으면 GET 요청이 기본적으로 수행된다.)
// 태그 데이터를 불러와서 렌더링하는 함수
function renderTags(tags) {
  const hashtagOuter = document.querySelector('.scrollmini.hashtag-outer');
  tags.forEach(tag => {
    const hashtagDiv = document.createElement('div');
    hashtagDiv.classList.add('hashtag');
    const button = document.createElement('button');
    button.classList.add('main', 'tag-selector');

    // 새로운 span 요소 생성
    const newSpan = document.createElement('span');

    // 태그 이름 설정
    newSpan.textContent = tag.name;

    // 배경색 설정
    if (tag.color && tag.color !== 'undefined') {
      newSpan.dataset.color = tag.color;
      button.style.setProperty('--tag-color', tag.color); //CSS 변수 설정을 button에 적용
    }

    // 버튼에 span 추가
    button.appendChild(newSpan);

    // div에 버튼 추가
    hashtagDiv.appendChild(button);

    // 삭제 버튼 추가
    const delButton = document.createElement('button');
    delButton.classList.add('del');
    delButton.title = '삭제';
    delButton.textContent = '×';
    hashtagDiv.appendChild(delButton);

    // 완료 버튼 추가
    const finishButton = document.createElement('button');
    finishButton.classList.add('finish');
    finishButton.title = '완료';
    finishButton.textContent = '×';
    hashtagDiv.appendChild(finishButton);

    // 최종적으로 hashtagOuter에 추가
    hashtagOuter.appendChild(hashtagDiv);
  });
}

// 태그 호출(GET, fetch는 HTTP 메소드를 별도로 지정하지 않으면 GET 요청이 기본적으로 수행된다.)
document.addEventListener('DOMContentLoaded', function () {
  fetch('/FDC/work/dev/js/main/load_tags.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('태그를 불러오는데 실패했습니다.');
      }
      return response.json();
    })
    .then(tags => {
      if (featureFlags.renderTags) {
        renderTags(tags); // 여기에서 renderTags 함수를 호출하여 태그 렌더링 처리
      }
      // 각 버튼에 클릭 이벤트 리스너 추가
      const tagButtons = document.querySelectorAll('.main.tag-selector');
      tagButtons.forEach(button => {
        // 버튼의 상태를 나타내는 변수 선언
        let isActive = false;
        button.addEventListener('click', function () {
          // 상태 토글
          isActive = !isActive;
          // 상태에 따라 active 클래스 추가 또는 제거
          if (isActive) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }

          // 클릭된 태그의 내용 가져오기 
          const tagContent = button.textContent.trim();
          // 가져온 내용에 #을 추가 
          const tagWithHash = `#${tagContent}`;

          // 현재 입력 필드의 값을 가져오기
          const labelInput = document.getElementById('input-label');
          let currentInputValue = labelInput.value.trim();

          // 입력 필드가 비어있지 않으면 현재 값에 새 태그 추가
          if (currentInputValue) {
            currentInputValue += ` ${tagWithHash}`; // 새 태그를 현재 값 뒤에 추가
          } else {
            currentInputValue = tagWithHash; //현재 값이 비어있다면 새 태그만 입력
          }

          // 입력 픽드에 새로운 값 적용
          labelInput.value = currentInputValue;

        });
      });
    })
    .catch(error => console.error('Error loading tags:', error));

  // 태그 선택 이벤트 리스너를 조건적으로 초기화
  if (featureFlags.tagSelection) {
    initializeTagSelection(); // 태그 선택 이벤트 리스너를 초기화하는 함수 호출
  }
});

// 태그 선택 이벤트 리스너를 초기화하는 함수
function initializeTagSelection() {
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('tag-selector')) {
      console.log("태그 선택됨:", event.target.textContent);
      const tagInput = document.getElementById('new-tag-text');
      const selectedTag = event.target.textContent.trim(); // 선택된 태그의 텍스트 가져오기

      // 입력 필드에 라벨이 있으면, 라벨 뒤에 선택된 태그 추가
      if (tagInput.value) {
        tagInput.value += ` #${selectedTag}`;
      }
    }
  });
}

// 태그 삭제 기능 추가
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('del') && featureFlags.tagDeletion) {
    const tagToRemove = event.target.parentElement.querySelector('span').textContent.trim();
    removeTag(tagToRemove);
    event.target.parentElement.remove();
  }
});

// 태그 삭제 함수
function removeTag(tagName) {
  // 태그 삭제를 위한 서버 요청
  const url = new URL('/FDC/work/dev/js/main/delete_tag.php', window.location.origin);
  const params = { tag: tagName };
  url.search = new URLSearchParams(params).toString();

  fetch(url)
    .then(response => {
      if (response.ok) {
        console.log('태그가 성공적으로 삭제되었습니다.');
        // return response.text();
        return response.json();
      }
      throw new Error('태그 삭제에 실패했습니다.');
    })
    // .then(text => console.log(text))
    .then(data => console.log(data))
    // .catch(error => console.error(error));
    .catch(error => console.error(error));
}


