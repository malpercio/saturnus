const TimeHandler = require('../lib/TimeHandler');
const Range = require('../lib/Range');
const InvalidError = require('./errors/InvalidError');
const moment = require('moment');
const path = require('path');
const i18n = require("i18n");
const isValid = require('sancronos-validator').isValid;
const Instantiator = require('./Instantiator');
const fields = require('./fields');

class Parser {
  constructor(cronExp = null, options = {}) {
    options.throw = options.throw !== false && options.throw !== undefined? true: false;
    options.locale = options.locale ? options.locale: 'en';
    options.startDate = options.startDate? moment(options.startDate): moment();
    options.endDate = options.endDate? moment(options.endDate): moment('3000-12-31T23:59');
    this.throw = options.throw;
    this.forcedType = options.type;
    i18n.configure({
      locales:['en', 'es'],
      directory: path.join(__dirname, '../locales'),
      autoReload: true,
      updateFiles: false,
      syncFiles: false,
    });
    i18n.setLocale(options.locale);
    for (let method of ['add', 'remove', 'set']){
      for(let field of fields){
        let capitalized = field.charAt(0).toUpperCase() + field.slice(1) + 's',
          plural = field + 's';
        this[method + capitalized] = (expression) => {
          let match = /(set|add|remove)([A-z]*)/.exec(this.name);
          return this['__' + method + '__'](expression, plural);
        };
      }
    }
    this.reset = () => {return this.parse(true)};
    this.startDate = moment(options.startDate);
    this.endDate = moment(options.endDate);
    if(!cronExp){
      this.isValid = false;
      return;
    };
    try{
      this.isValid = !!isValid(cronExp, true);
      let expression = cronExp.split(' ');
      this.type = this.__getType__(expression);
      let add = (this.type == Parser.TypeEnum.T5 || this.type == Parser.TypeEnum.T6b)? 0 : 1;
      this.seconds = null;
      if(this.type == Parser.TypeEnum.T6a || this.type == Parser.TypeEnum.T7){
        this.seconds = new TimeHandler(
          expression[0],
          Parser.limits.seconds
        );
      }
      this.minutes = new TimeHandler(
        expression[0 + add],
        Parser.limits.minutes
      );
      this.hours = new TimeHandler(
        expression[1 + add],
        Parser.limits.hours
      );
      this.days = new TimeHandler(
        expression[2 + add],
        Parser.limits.days
      );
      this.months = new TimeHandler(
        expression[3 + add],
        Parser.limits.months
      );
      this.weekdays = new TimeHandler(
        expression[4 + add],
        Parser.limits.weekdays
      );
      this.years = null;
      if(this.type == Parser.TypeEnum.T6b || this.type == Parser.TypeEnum.T7){
        this.years = new TimeHandler(
          expression[5 + add],
          Parser.limits.years
        );
      }
    }
    catch(err){
      if(this.throw){
        throw err;
      }
      this.isValid = false;
    }
  }

  __getType__(arrExpression){
    if(arrExpression.length == 5){
      return '5';
    }
    if(arrExpression.length == 7){
      return '7';
    }
    if(!/(\d{4})/.exec(arrExpression[5]) && this.forcedType != '6b'){
      return '6a';
    }
    if(/(\d{4}|\*)/.exec(arrExpression[5]) && this.forcedType != '6a'){
      return '6b';
    }
    throw new InvalidError(arrExpression[5]);
  }

  __isValid__(isValid, partialDate, attrib){
    if(isValid){
      let localValid = false;
      for(let range of this[attrib].ranges){
        localValid = localValid || range.contains(partialDate);
      }
      isValid = isValid && localValid;
    }
    return isValid;
  }

  includes(date){
    let isValid;
    date = moment(date);
    isValid = date.isValid();
    if(this.type == Parser.TypeEnum.T6b || this.type == Parser.TypeEnum.T7){
      isValid = this.__isValid__(isValid, date.year(), 'years');
    }
    isValid = this.__isValid__(isValid, date.month(), 'months');
    isValid = this.__isValid__(isValid, date.weekday(), 'weekdays');
    isValid = this.__isValid__(isValid, date.date(), 'days');
    isValid = this.__isValid__(isValid, date.hour(), 'hours');
    isValid = this.__isValid__(isValid, date.minute(), 'minutes');
    if(this.type == Parser.TypeEnum.T6a || this.type == Parser.TypeEnum.T7){
      isValid = this.__isValid__(isValid, date.second(), 'seconds');
    }
    return isValid;
  }

  isNow(){
    return this.includes(moment());
  }

  prettify() {
    let readable =[
      this.minutes.__partialPrettify__( i18n.__("minute"), i18n ),
      this.hours.__partialPrettify__( i18n.__("hour"), i18n ),
      this.days.__partialPrettify__( i18n.__("day"), i18n ),
      this.months.__partialPrettify__( i18n.__("month"), i18n ),
      this.weekdays.__partialPrettify__( i18n.__("week day"), i18n ),
    ];
    if(this.type == Parser.TypeEnum.T7 || this.type == Parser.TypeEnum.T6a){
      readable.unshift(this.seconds.__partialPrettify__( i18n.__("second"), i18n ));
    }
    if(this.type == Parser.TypeEnum.T7 || this.type == Parser.TypeEnum.T6b){
      readable.push(this.years.__partialPrettify__( i18n.__("year"), i18n ));
    }
    return i18n.__('At') + " " + readable.join(", ");
  }

  __refresh__(f){
    if(f == 'seconds'){
      return this.seconds? this.seconds.iterator(): Parser.falseIterator(0, 59)
    }else if(f == 'years'){
      this.years? this.years.iterator(): Parser.falseIterator(this.startDate.year(), 3000)
    }
    return this[f].iterator();
  }
  getAllMoments(){
    let currentDate = moment(this.startDate),
      moments = [],
      metric = this.type == Parser.TypeEnum.T6a || this.type == Parser.TypeEnum.T7? 's': 'm';
    while(currentDate.isBefore(this.endDate)){
      if(this.includes(currentDate)){
        moments.push(currentDate);
      }
      currentDate = moment(currentDate).add(1, metric)
    }
    return moments;
  }

  *getMoments(options = {}) {
    options.ignoreYear = options.ignoreYear? options.ignoreYear: true;
    options.ignoreSeconds = options.ignoreSeconds? options.ignoreSeconds: true;
    let nextDate = moment(this.startDate),
      previousDate,
      month = this.months.iterator(),
      hour = this.hours.iterator(),
      minute = this.minutes.iterator(),
      weekday = this.weekdays.iterator(),
      day = this.days.iterator(),
      hasSeconds = !options.ignoreSeconds || this.type == Parser.TypeEnum.T6a || this.type == Parser.TypeEnum.T7,
      hasYears = !options.ignoreYear || this.type == Parser.TypeEnum.T6b || this.type == Parser.TypeEnum.T7,
      year = this.years? this.years.iterator(): Parser.falseIterator(this.startDate.year(), 3000),
      second = this.seconds? this.seconds.iterator(): Parser.falseIterator(0, 59);
    do{
      let nextYear = year.next(),
        nextSecond = second.next(),
        nextMonth = month.next(),
        nextHour = hour.next(),
        nextMinute = minute.next(),
        nextWeekday = weekday.next(),
        nextDay = day.next();
      previousDate = moment(nextDate);
      while(!nextYear.done){
        if(hasYears){
          nextDate.year(year.next().value);
          nextYear = year.next();
        }else{
          nextDate.year(3000);
          nextYear.done = true;
        }
        while(!nextMonth.done){
          nextDate.month(--nextMonth.value);
            while(!nextDay.done){
              nextDate.date(nextDay.value);
              while(!nextWeekday.done){
                if(nextDate.weekday() == nextWeekday.value){
                  while(!nextHour.done){
                    nextDate.hour(nextHour.value);
                    while(!nextMinute.done){
                      nextDate.minute(nextMinute.value);
                      while(!nextSecond.done){
                        if(hasSeconds){
                          nextDate.second(nextSecond.value);
                          nextSecond = second.next();
                        }else{
                          nextDate.second(0);
                          nextSecond.done = true;
                        }
                        yield nextDate;
                      }
                      nextMinute = minute.next();
                      second = this.__refresh__('seconds');
                      nextSecond = second.next();
                    }
                    nextHour = hour.next();
                    minute = this.__refresh__('minutes');
                    nextMinute = minute.next();
                  }
                  hour = this.__refresh__('hours');
                  nextHour = hour.next();
                }
              nextWeekday = weekday.next();
            }
            nextDay = day.next();
            weekday = this.__refresh__('weekdays');
            nextWeekday = weekday.next();
          }
          day = this.__refresh__('days');
          nextDay = day.next();
          nextMonth = month.next();
        }
        month = this.__refresh__('months');
        nextMonth = month.next();
      }
    }while(nextDate.isBefore(previousDate));
  }

  __joinExpression__(){
    let exp = [
      this.minutes.partialExpression,
      this.hours.partialExpression,
      this.days.partialExpression,
      this.months.partialExpression,
      this.weekdays.partialExpression,
    ];
    if(this.seconds){
      exp.unshift(this.seconds.partialExpression);
    }
    if(this.years){
      exp.push(this.years.partialExpression);
    }
    return exp;
  }

  getExpression() {
    return this.__joinExpression__().join(" ");
  }

  __remove__(expression, location){
    if(!this[location]){
      return;
    }
    try{
      expression = expression.replace('*', '\\*');
      let re = new RegExp(expression + ',?');
      expression = this[location].partialExpression.replace(re, '');
      expression = expression.replace(/,$/, '');
      this.type = this.__getType__(this.__joinExpression__());
      this.isValid = !!isValid(this.getExpression(), true);
      this[location] = new TimeHandler(
        expression,
        Parser.limits[location]
      );
    }
    catch(err){
      if(this.throw){
        throw err;
      }
      this.isValid = false;
    }
  }

  __set__(expression, location, noValidate){
    try{
      this[location] = new TimeHandler(
        expression,
        Parser.limits[location]
      );
      if(!noValidate){
        this.type = this.__getType__(this.__joinExpression__());
        this.isValid = !!isValid(this.getExpression(), true);
      }
    }
    catch(err){
      if(this.throw){
        throw err;
      }
      this.isValid = false;
    }
  }

  __add__(expression, type, noValidate){
    try{
      if(!this[type]){
        this[type] = new TimeHandler(
          expression,
          Parser.limits[type]
        );
      }
      else if(this[type].partialExpression == '*'){
        return;
      }
      else{
        this[type] = new TimeHandler(
          this[type].partialExpression + "," + expression,
          Parser.limits[type]
        );
      }
      if(!noValidate){
        this.type = this.__getType__(this.__joinExpression__());
        this.isValid = !!isValid(this.getExpression(), true);
      }
    }
    catch(err){
      if(this.throw){
        throw err;
      }
      this.isValid = false;
    }
  }

  parse(reset){
    return new Instantiator(this, reset);
  }

}

Parser.falseIterator = (start, end) => {
  return (new Range(start, end)).iterator()
};

Parser.TypeEnum = {
  T5: '5',
  T6a: '6a',
  T6b: '6b',
  T7: '7',
};

Parser.i18n = i18n;

Parser.limits = {
  seconds: {
    min: 0,
    max: 59,
  },
  minutes: {
    min: 0,
    max: 59,
  },
  hours: {
    min: 0,
    max: 23,
  },
  days: {
    min: 0,
    max: 31,
  },
  months: {
    min: 0,
    max: 11,
  },
  weekdays: {
    min: 0,
    max: 7,
  },
  years: {
    min: 1970,
    max: 3000,
  },
}


module.exports = Parser;
