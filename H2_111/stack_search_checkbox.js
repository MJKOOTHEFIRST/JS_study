// stack_search_checkbox.js

// 전체 선택 체크박스 이벤트 리스너 추가
document.querySelector('#search-all-checkbox').addEventListener('change', function () {
  // 현재 페이지의 모든 검색 체크박스를 가져온다.
  const checkboxes = document.querySelectorAll(`#stack_search_table tr[data-page="${currentPage}"] input[type="checkbox"]`);
  // 전체 선택 체크박스의 상태에 따라 모든 체크박스를 체크하거나 해제합니다.
  checkboxes.forEach(checkbox => {
      checkbox.checked = this.checked;
  });
});