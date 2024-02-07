'use strict';
// object-oriented programming 
// class : template
// object : instance of a class
// JavaScript classes
// - introduced in ES6
// - syntactical sugar over prototype-based inheritance

// 1. Class declarations
class Person { 
  // constructor(생성자)
  constructor(name, age){
    // fileds
    this.name = name;
    this.age = age;
  }

  // methods
  speak(){
    console.log(`${this.name}: hello!`)
  }
}

const ellie = new Person('ellie', 20);
console.log(ellie.name);
console.log(ellie.age);
ellie.speak();


// 2. Getters and Setters
// 사용자가 바보같이 값을 설정해도 그 값을 방어적으로 값을 설정할 수 있게 도와준다.
class User{
  constructor(firstName, lastName, age){
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
  }

  get age(){
    return this._age;
  }

  set age(value){
    // if(value<0){
    //   throw Error('age can not be negative');
    // }
    this._age = value < 0 ?  0 : value;
  }
}

const user1 = new User('Steve', 'Jobs', -1);
console.log(user1.age);

// 3. Fields ( public, private) 
//  too soon!!! 
class Experiment {
  publicField = 2;
  #privateField = 0;
}
const experiment = new Experiment();
console.log(experiment.publicField);
console.log(experiment.privateField);

// 4. Static properties and methods
// Too soon!
class Article {
  static publisher = 'Dream coding';
  constructor(articleNumber){
    this.articleNumber = articleNumber;
  }

  static printPublisher(){
    console.log(Article.publisher);
  }
}

const article1 = new Article(1);
const article2 = new Article(2);
console.log(Article.publisher);
Article.printPublisher();

