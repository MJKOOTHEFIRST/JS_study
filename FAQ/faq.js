// faq.js

// 새로 입력하는 창 나올때 
function toggleInputFieldVisibility(fieldId, isVisible) {
  var inputField = document.getElementById(fieldId);

  if (isVisible) {
    inputField.classList.add("add-field-active"); // 입력 필드를 보이게 하고 애니메이션 클래스 추가
    inputField.style.display = 'block';
  } else {
    inputField.classList.remove("add-field-active"); // 애니메이션 클래스 제거
    inputField.style.display = 'none';
  }
}





/////////////////////////////////////////////////////////////////////////////
// Chapter
function handleChapterChange() {
  var chapterSelect = document.getElementById('chapter');
  var isNewChapter = chapterSelect.value === 'new-chapter';

  // 새 챕터 입력의 표시 상태를 조정
  toggleInputFieldVisibility('new_chapter', isNewChapter);

  // 선택된 챕터가 'new-chapter'가 아닐 때만 서브 챕터를 가져오기 위해
  if (!isNewChapter) {
    const chapterId = chapterSelect.value;

    // 서브 챕터 요청을 위한 Fetch API
    fetch('fetch_subchapters.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'chap_id=' + encodeURIComponent(chapterId),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다');
      }
      return response.text();
    })
    .then(data => {
      // 응답으로 서브 챕터 선택 옵션 업데이트
      var subChapterSelect = document.getElementById('sub_chapter');
      subChapterSelect.innerHTML = data;
    })
    .catch(error => {
      console.error('fetch 작업에 문제가 있었습니다:', error);
    });
  }
}


/////////////////////////////////////////////////////////////////////////////
// Sub Chapter

// 페이지 로드 시 한 번만 실행되도록 이벤트 리스너를 설정
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('change', function(event) {
    // 서브 챕터 선택 드롭다운에서 변경 사항이 발생한 경우
    if (event.target && event.target.id === 'sub_chapter') {
      var isNewSubChapter = event.target.value === 'new-subChapter';
      // 새 서브 챕터 입력의 표시 상태를 조정
      toggleInputFieldVisibility('new_sub_chapter', isNewSubChapter);
    }
  });
});


function handleSubChapterChange() {
  var subChapterSelect = document.getElementById('sub_chapter');
  var sectionSelect = document.getElementById('section');
  var subChapterId = subChapterSelect.value;

  if (subChapterId) {
    fetch('fetch_sections.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'sub_chap_id=' + encodeURIComponent(subChapterId),
    })
    .then(response => response.text())
    .then(data => {
      sectionSelect.innerHTML = data;
    })
    .catch(error => console.error('Error:', error));
  }
}

/////////////////////////////////////////////////////////////////////////////
// Section
// Section 변경 시 Subsection 데이터 가져오기
function handleSectionChange() {
  var sectionSelect = document.getElementById('section');
  var isNewSection = sectionSelect.value === 'new-section';
  toggleInputFieldVisibility('new_section', isNewSection); // 새 섹션 입력 필드의 표시 여부 조정

  var subSectionSelect = document.getElementById('sub_section');
  var sectionId = sectionSelect.value;

  // 새 섹션을 추가하는 경우가 아니라면, 기존 섹션이 선택되었을 경우 서브 섹션 데이터 가져오기
  if (!isNewSection) {
    fetch('fetch_subsections.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'section_id=' + encodeURIComponent(sectionId),
    })
    .then(response => response.text())
    .then(data => {
      subSectionSelect.innerHTML = data;
    })
    .catch(error => console.error('Error:', error));
  } else {
    // 새 섹션을 추가하는 경우, 서브섹션 선택 드롭다운을 초기화
    subSectionSelect.innerHTML = '<option value="">서브섹션 선택...</option>';
    toggleInputFieldVisibility('new_sub_section', false); // 새 서브섹션 입력 필드 숨기기
  }
}



/////////////////////////////////////////////////////////////////////////////
// Sub Section
  function handleSubSectionChange() {
    var subSectionSelect = document.getElementById('sub_section');
    var isNewSubSection = subSectionSelect.value === 'new-subsection'; // 옵션 값 확인
  
    // 새 서브섹션 입력 필드의 표시 여부 조정
    toggleInputFieldVisibility('new_sub_section', isNewSubSection);
  }
  


