[![forthebadge](http://forthebadge.com/images/badges/built-by-codebabes.svg)](https://jaque.me/)

[![Stories in Progress](https://img.shields.io/waffle/label/malpercio/saturnus/in%20progress.svg?style=flat)](https://waffle.io/malpercio/saturnus)
[![Build Status](https://travis-ci.org/malpercio/saturnus.svg?branch=master)](https://travis-ci.org/malpercio/saturnus)
[![Dependencies](https://david-dm.org/malpercio/saturnus.svg)](https://travis-ci.org/malpercio/saturnus)
[![DevDependencies](https://david-dm.org/malpercio/saturnus/dev-status.svg)](https://david-dm.org/malpercio/saturnus)
[![npm version](https://badge.fury.io/js/saturnus.svg)](https://badge.fury.io/js/saturnus)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/malpercio/saturnus/master/LICENSE)

# Saturnus
`Saturnus` is a cron parser for ES6, using [Moment.js](https://momentjs.com/) to parse into manageable dates.

## Installation
```bash
npm install saturnus
```

## Introduction
You must know about [cron](https://www.wikiwand.com/en/Cron) and its expressions, well... sometimes it can be a pain parsing them by yourself. Specially if you only want to validate an ISO string. That's when `Saturnus` comes into play.

This library is under heavy development, because (guess what?) us, "the creators", are using it for many projects so... we might as well share part of our efforts with the Node community. ;)

## Quickstart

```js
const Saturnus = require('saturnus');

//Don't worry I'm bot asynchronous and I'm non-blocking
let chronos = new Saturnus('* * * * *');
//But if you need me on the fly...
let buildingCron = new Saturnus();
buildingCron.parse()
  .every().step(5).second()         //Every five seconds
  .at(15).minute()                  //At minute 15
  .between(12, 15).hours()          //From 12 to 3 p.m.
  .every.weekday()                  //Any day of the weekday
  .between(2,9).step(2).months()    //In February, April, June and August
  .exec()                           //Finish building
```

When returning a date, we use [Moment.js](momentjs.com), so it can be easier to manipulate.

And knowing that, just a glimpse at the methods and you're ready to go.

## Configuration

When creating a parsed expression, you can use various options to change its behaviour. The defaults are shown below:

```js
let options = {
  throw: false,                 //Throws error in real time (bad for callbacks)
  startDate: Date.now(),        //When to start validating
  endDate: '3000-12-31T23:59',  //When to stop recognizing dates
  locale: 'en',                 //Locale for prettify
};
let chronos = new Saturnus('* * * * *');

```

If you use `throw:false`, be aware that the attibute `isValid` will be set to `false`.

```js
let options = {
  throw: false,
};
let chronos = new Saturnus('*');
chronos.isValid()                  //false
```

## Available methods

### includes(Object: date)
---
**Description:** Verify if the expression includes certain date

**Input:**
* date
  - An ISO string, integer, Date object or Moment object

**Output:**
* boolean
  - Just a response to know if it's valid or not

**Example:**
```js
let a = chronos.includes(456678);
console.log(a); //Prints true or false
```

### isNow()
---
**Description:** Alias for `chronos.includes(Date.now())`

**Output:**
* boolean
  - Just a response to know if it's valid or not

**Example:**
```js
let a = chronos.isNow();
console.log(a); //Prints true or false
```

### *getMoments()
---
**Description:** Iteratee for returning every valid moment in order. Don't worry, it will return values as long as you want it to.

**Output:**
* [JS iterator](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Iterators_and_Generators)
  - A iterator that returns valid [moment](momentjs.com) instances.

**Example:**
```js
let iterator = chronos.getMoments(),
  next = iterator.next();
while(!next.done){
  console.log(next.value); //Prints moment(ISO_STRING)
}
```

### prettify()
---
**Description:** Returns a human readable string

**Output:**
* string
  - Representation of the cron expression

**Example:**
```js
let pretty = chronos.prettify();
console.log(pretty); //At every second, every minute ...
```

_________________
[![NPM](https://nodei.co/npm/saturnus.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/saturnus/)
