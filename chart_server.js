/*
서버측 : node.js로 실행. 서버는 클라이언트로부터 오는 요청을 처리하고 `/e_day` 등 엔드포인트를 통해
e_day.conf 파일의 내용을 클라이언트에게 전달 
*/
const express = require('express');
const fs = require('fs');
const app = express();

const cors = require('cors');
app.use(cors());


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
