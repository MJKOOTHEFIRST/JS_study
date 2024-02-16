// server.js

require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); // CORS 미들웨어 require
const app = express();

app.use(cors()); // CORS 미들웨어 사용

const port = 3000;

// MySQL 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});


// 데이터베이스 연결
// connection.connect();
connection.connect((error) => {
  if (error) {
    console.error('데이터베이스 연결 실패:', error);
  } else {
    console.log('데이터베이스에 성공적으로 연결되었습니다.');
  }
});

// 루트 경로에 대한 GET 요청 처리
app.get('/search', (req, res) => {
  // SQL 쿼리 실행
  connection.query('SELECT * FROM search', (error, results, fields) => {
    if (error) throw error;
    // 결과를 JSON 형태로 클라이언트에 전송
    res.json(results);
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
