'use strict';

// Promise is JavaScript object for asynchronous operation. 1) state 2)  Producer VS Customer
// State : pending -> fulfilled or rejected 
// Producer vs Consumer 

// 1. Producer
// when Promise is created,the executor runs automatically.
const promise = new Promise((resolve, reject) => {
  // doing some heavy work (network, read files)
  console.log('doing something...');
  setTimeout(() => {
    resolve('minjoo');
    // reject(new Error('no network'));
  }, 2000);
}); 

// 2. Consumers : then, catch, finally
promise
  .then((value) => {  // then은 Promise가 정상적으로 잘 수행되어서 마지막에 resolve라는 콜백함수 통해서 
  //value라는 파라미터를 통해서 들어온 resolve 안에 있는 'minjoo'
    console.log(value);
  })
  .catch(error => {
    console.log(error);
  })
  .finally(() => {
    console.log('finally');
  });

  // 3. Promise chaining
  const fetchNumber = new Promise((resolve, reject )=> {
    setTimeout(()=> resolve(1), 1000);
  });

  fetchNumber // 1
  .then(num => num * 2) // 2
  .then(num => num *3) // 6
  .then(num =>{ // 6
    return new Promise((resolve,reject) => {
      setTimeout(() => resolve(num -1), 1000); // 5
    });
  })
  .then(num => console.log(num));

  // 4. Error Handling
  const getHen = () =>
    new Promise((resolve, reject) => {
      setTimeout(() => resolve('닭'), 1000);
    });

  const getEgg = hen =>
    new Promise((resolve, reject) => {
      // setTimeout(() => resolve(`${hen} => 달걀`), 1000);
      setTimeout(() => reject(new Error(`error! ${hen} => 달걀`)), 1000);
    });

  const cook = egg =>
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(`${egg} => 계란프라이`), 1000);
    });

  getHen()
    .then(getEgg)
    .catch(error => {
      return 'bread';
    })
    .then(cook)
    .then(console.log)
    .catch(console.log);
