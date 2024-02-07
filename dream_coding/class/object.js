// Object
// a collection of related data and/or functionality.
// nearly all objects in JS are instances of Objects.
// object = {key : value} 의 집합체;

// 1.  literals and properties
const obj1 = {}; // 'object ligeral' syntax
const obj2 = new Object(); // 'object constructor' syntax 

const name = 'ellie';
function print(person){
  console.log(person.name);
  console.log(person.age);
}

const ellie = {name: 'ellie', age: 4};
print(ellie);

ellie.hasJob = true;
console.log(ellie.hasJob);

delete ellie.hasJob;
console.log(ellie.hasJob);

// 2. computed properties
// key should be always string
 console.log(ellie.name); // 키에 해당하는것을 정말 받아오고 싶을 때 , 다시('.') 를 써서 받아온다
 console.log(ellie['name']); // computed properties  쓸 때는, 정확히 어떤 key가 필요한지 모를 때
 ellie['hasJob'] = true;
 console.log(ellie.hasJob);

function printValue(obj, key){
  console.log(obj[key]);
}
printValue(ellie, 'name');
printValue(ellie, 'age');

// 3. property value shorthand
const person1 = {name: 'bob', age:2};
const person2 = {name: 'steve', age:3};
const person3 = {name: 'dave', age:4};
const person4 = new Person('ellie', 30);
console.log(person4);

// 4. Constructor function
function Person(name, age){
  //  this = {};
  this.name = name;
  this.age = age;
  // return this;
}

// 5. in operator : property existence check (key in obj) 키가 있는지 없는지 확인
console.log('name' in ellie);
console.log('age' in ellie);
console.log('random' in ellie);
console.log(ellie.random);

// 6. for..in vs for..of
// for (key in obj)
console.clear();
for (key in ellie) {
  console.log(key);
}

// for (value of iterable)
const array = [1, 2, 4, 5]; 
for(value of array){
  console.log(value);
}
// old way
/*
for(let i =0; i<array.length; i++){
  console.log(array);
}
*/

// 7. Fun cloning
// Object.assign(dest, [obj1, obj2, obj3...])
const user = {name: 'ellie', age: '20'};
const user2 = user;
user2.name='coder';
console.log(user);

//  old way
const user3 = {};
for (key in user){
  user3[key] = user[key];
}
console.clear();
console.log(user3);

// new way
// const user4 = {};
// Object.assign(user4, user);
// console.log(user4);

// new way 2
const user4 = Object.assign({}, user);
console.log(user4);

// another example
const fruit1 = {color: 'red'};
const fruit2 = {color: 'blue', size: 'big'};
const mixed = Object.assign({}, fruit1, fruit2);

console.log(mixed.color);
console.log(mixed.size);

