// stack_tag_manager.js
import { 
  initializeColorPickers,
  getColorCode,
  addSearchButtonListener, 
  initCheckboxStateAndSelectAll, 
  loadColorMap,
  searchWithData,  
  handleSelectAllChange, 
  updateSelectedCount, 
  generateColorOptions,
  getColorClass
} from './stack_search2.js';

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

// 태그 호출(GET, fetch는 HTTP 메소드를 별도로 지정하지 않으면 GET 요청이 기본적으로 수행된다.)
// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
  loadColorMap().then(() => {
    initializeColorPickers();
  }); // 색상 맵 로드 및 초기화

  initCheckboxStateAndSelectAll(false);

  fetch('/FDC/Proj/trunk/js/main/load_tags.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('태그를 불러오는데 실패했습니다.');
      }
      return response.json();
    })
    .then(tags => {
      if (featureFlags.renderTags) {
        renderTags(tags);
      }
    })
    .catch(error => console.error('Error loading tags:', error));
});

//랜덤 컬러 생성
function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 환경상 GET으로 태그 데이터를 저장하는 것으로 개발
// 태그와 색상을 서버로 전송하는 함수
function saveTagWithGet(tagName) {
  const colorSelector = document.getElementById('tag-color-selector');
  const selectedColorValue = colorSelector.value;

  fetch('/FDC/Proj/mjkoo/js/main/color_map.php')
    .then(response => response.json())
    .then(colorMap => {
      const selectedColor = selectedColorValue !== 'color-null' ? colorMap[selectedColorValue] : generateRandomColor();
      
      const url = new URL('/FDC/Proj/mjkoo/js/main/save_tag.php', window.location.origin);
      const params = { tag: tagName, color: selectedColor };
      url.search = new URLSearchParams(params).toString();

      fetch(url)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('태그 저장에 실패했습니다.');
        })
        .then(data => {
          if (data.message === '태그가 성공적으로 저장되었습니다.') {
            renderTags([{ name: tagName, color: selectedColor }]);
            document.getElementById('new-tag-text').value = '';
            colorSelector.value = 'color-null';
            colorSelector.style.color = getColorCode('color-null'); // 색상 초기화
          }
        })
        .catch(error => console.error(error));
    })
    .catch(error => console.error('색상 맵 로딩에 실패했습니다.', error));
}

// 태그 추가 및 서버로 전송
document.getElementById('new-tag').addEventListener('click', function () {
  const tagInput = document.getElementById('new-tag-text'); // 입력필드 자체를 변수에 저장
  const tagText = tagInput.value.trim(); // 입력 필드의 값을 가져와서 공백 제거
  if (tagText) {
    // 중복된 태그 검사
    if (isDuplicateTag(tagText)) {
      alert("중복된 태그입니다.", document.getElementById('new-tag-text'));
      tagInput.value = ''; // 입력 필드를 빈칸으로 설정
    } else {
      // 태그명과 선택된 색상을 서버로 전송하는 로직 구현
      if (featureFlags.saveTagWithGet) { // 조건 추가
        saveTagWithGet(tagText); // 서버로 태그 저장
      }
    }
  } else {
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
      button.style.setProperty('border-color', tag.color); //CSS 변수 설정을 button에 적용
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

    // 여기에 클릭 이벤트 리스너 추가
    button.addEventListener('click', function () {
      const tagContent = button.textContent.trim();
      const tagWithHash = `#${tagContent}`;
      const labelInput = document.getElementById('input-label');
      let currentInputValue = labelInput.value.trim();

      if (button.classList.contains('active')) {
        // 태그 제거
        button.classList.remove('active');
        const newInputValue = currentInputValue.replace(new RegExp(`\\s*${tagWithHash}\\s*`, 'g'), ' ').trim();
        labelInput.value = newInputValue;
        console.log("입력 필드 값 (태그 제거 후):", newInputValue); // 태그 제거 후 입력 필드 값 확인
      } else {
        // 태그 추가
        button.classList.add('active');
        if (currentInputValue) {
          labelInput.value = `${currentInputValue} ${tagWithHash}`;
        } else {
          labelInput.value = tagWithHash;
        }
        console.log("입력 필드 값 (태그 추가 후):", labelInput.value); // 태그 추가 후 입력 필드 값 확인
      }
      // 자동으로 검색 버튼 클릭 이벤트 트리거
      document.querySelector('.stk-sch-btn').click();
    });
  });
}

// 검색 버튼 리스너
addSearchButtonListener();


function updateInputLabel(inputLabel) {
  const activeTags = document.querySelectorAll('.main.tag-selector.active');
  const tagNames = Array.from(activeTags).map(tag => `#${tag.textContent.trim()}`);
  inputLabel.value = tagNames.join('');
}

// 태그 삭제 버튼
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('del') && featureFlags.tagDeletion) {
    const parentElement = event.target.parentElement;
    if (parentElement) {
      const spanElement = parentElement.querySelector('span');
      if (spanElement) {
        const tagToRemove = spanElement.textContent.trim();
        removeTag(tagToRemove, parentElement);
      } else {
        console.error('Span element not found');
      }
    } else {
      console.error('Parent element not found');
    }
  }
});

// 태그 삭제 함수
function removeTag(tagName, parentElement) {
  const confirmMessage = `정말로 태그 "${tagName}"을(를) 삭제하시겠습니까?`;
  if (confirm(confirmMessage)) {
    const url = new URL('/FDC/Proj/trunk/js/main/delete_tag.php', window.location.origin);
    const params = { tag: tagName };
    url.search = new URLSearchParams(params).toString();

    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.text();  // 먼저 텍스트로 응답을 받음
        }
        throw new Error('서버에서 오류가 발생했습니다.');
      })
      .then(text => {
        if (text.includes('<br />')) {
          console.error('서버에서 HTML 오류 메시지를 반환했습니다:', text);
          return;  // HTML 태그가 포함된 경우 처리 중단
        }
        const data = JSON.parse(text);  // 응답을 JSON으로 파싱
        console.log('태그가 성공적으로 삭제되었습니다.', data);
        parentElement.remove();  // 화면에서 태그 제거
      })
      .catch(error => console.error(error));
  } else {
    console.log('태그 삭제가 취소되었습니다.');
  }
}




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


/*
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
*/
