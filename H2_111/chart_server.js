/*
서버측 : node.js로 실행. 서버는 클라이언트로부터 오는 요청을 처리하고 `/e_day` 등 엔드포인트를 통해
e_day.conf 파일의 내용을 클라이언트에게 전달.

웹 애플리케이션에서 실시간으로 데이터를 처리하고 자동화된 방식으로 원격 서버의 파일에 접근하려면 Node.js를 사용하는 것이 가장 적합하다. 
1.	자동화된 데이터 처리 
2.	API를 통한 데이터 접근
3.	보안과 접근 제어
4.	확장성과 유연성
*/
const express = require('express'); // express 모듈을 사용하여 웹 서버 생성
const fs = require('fs');
const app = express();
const cors = require('cors'); //미들웨어를 사용하여 다른 도메인/포트에서 오는 요청 허용(CORS 문제 방지)

app.use(cors());

const cors = require('cors');
app.use(cors());

// /e_day 경로로 GET 요청이 오면 e_day.conf 파일의 내용을 읽고 응답으로 전송
app.get('/e_day', (req, res) => { //실제 시스템의 경로나 폴더를 나타내는게 아니라 엔드포인트! url의 일부로 임의로 정함
      // 이 경로는 서버의 api 설계에 따라 생성되며, 실제 파일 시스템의 구조와 관련이 없다. 
    fs.readFile('./e_day.conf', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('파일을 읽을 수 없습니다.');
        } else {
            res.send(data);
        }
    });
});

app.listen(3000, () => {
    console.log('서버가 포트 3000에서 실행 중입니다.');
});
