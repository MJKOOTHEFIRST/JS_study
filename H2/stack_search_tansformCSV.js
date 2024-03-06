// stack_search_transformCSV.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const fastcsv = require('fast-csv');

require('dotenv').config();

// MySQL 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// 데이터베이스 연결
connection.connect(error => {
  if (error) throw error;
  console.log('데이터베이스에 성공적으로 연결되었습니다.');
});

// CSV 파일 읽기
let stream = fs.createReadStream(path.resolve(__dirname, 'data', 'your-data.csv'));
let csvData = [];
let csvStream = fastcsv
  .parse()
  .on('data', function(data) {
    csvData.push(data);
  })
  .on('end', function() {
    // 첫 번째 행(헤더) 제거
    csvData.shift();

    // MySQL에 데이터 삽입
    const query = 'INSERT INTO search (Date, H-M, M-L, X1, X2, Y1, Y2, M, L, SQ, BQ, Label) VALUES ?';
    connection.query(query, [csvData], (error, response) => {
      console.log(error || response);
      // 연결 종료
      connection.end();
    });
  });

stream.pipe(csvStream);
