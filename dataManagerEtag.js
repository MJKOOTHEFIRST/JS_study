export const loadData = (section = null) => {
  const url = `${base_data_url}${configFileName}`;
  const headers = new Headers();
  const etag = localStorage.getItem(`etag-${section}`); // 섹션별 ETag 불러오기

  if (etag) {
      headers.append('If-None-Match', etag);
  }

  return fetch(`${url}?section=${section}`, { headers }) // 섹션 파라미터 추가
      .then(response => {
          if (response.status === 304) {
              // 데이터 변경 없음, 캐시된 데이터 사용
              return;
          }
          const newEtag = response.headers.get('ETag');
          if (newEtag) {
              localStorage.setItem(`etag-${section}`, newEtag); // 새로운 ETag 저장
          }
          return response.text();
      })
      .then(text => {
          if (!text) return; // 304 응답 시 text는 없음
          if (section && section !== 'alarm') {
              return parseConf(text, section);
          }
          return text;
      })
      .catch(error => {
          console.error('CONF 파일을 불러오는 데 실패했습니다.', error);
          throw error;
      });
};
