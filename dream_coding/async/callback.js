'use strict';

// synchronous callback
function printImmediately(print) {
  print();
}

// Asynchronous callback
function printWithDelay(print, timeout) {
  setTimeout(print, timeout);
}

// Javascript si synchronous.
// Execute the code block by order after hoisting.
// hosting : var, function declaration
console.log('1');
setTimeout(() => { console.log('2') }, 1000); // 나중에 다시 불러줘~ call back
console.log('3');


printImmediately(() => console.log('hello'));
//Asynchronous callback 


printWithDelay(() => console.log('async callback'), 2000);

// Callback hell example
class UserStorage {
  loginUser(id, password, onSuccess, onError) {
    setTimeout(() => {
      if (
        (id === 'ellie' && password === 'dream') ||
        (id === 'coder' && password === 'academy')
      ) {
        onSuccess(id);
      } else {
        onError(new Error('not Found'));
      }
    }, 2000);
  }

  getRoles(user, onSuccess, onError) {
    setTimeout(() => {
      if (user === 'ellie') {
        onSuccess({ name: 'ellie', role: 'admin' });
      } else {
        onError(new Error('no access'));
      }
    }, 1000);
  }
}

const userStorage = new UserStorage();
const id = prompt('enter your id');
const password = prompt('enter your password');
userStorage.loginUser(
  id,
  password,
  user => {
    userStorage.getRoles(
      user,
      userWithRole => {
        alert(
          `hello ${userWithRole.name}, you have a ${userWithRole.role} role` 
          );
      },
      error => {
        console.log(error);
      }
    );
  },
  error => {
    console.log(error)
  }
);