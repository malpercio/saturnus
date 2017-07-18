const TimeHandler = require('../lib/TimeHandler');
const Range = require('../lib/Range');
const InvalidError = require('./errors/InvalidError');
const moment = require('moment');
const path = require('path');
const i18n = require("i18n");

function parserFactory(options = {}){
  options.throw = options.throw !== false && options.throw !== undefined? true: false;
  options.locale = options.locale ? options.locale: 'en';

  i18n.configure({
    locales:['en', 'es'],
    directory: path.join(__dirname, '../locales'),
    autoReload: true,
    updateFiles: false,
    syncFiles: false,
  });
  i18n.setLocale(options.locale);

  function getType(arrExpression, type){
    if(arrExpression.length == 5){
      return '5';
    }
    if(arrExpression.length == 7){
      return '7';
    }
    if(!/(\d{4})/.exec(arrExpression[5]) && type != '6b'){
      return '6a';
    }
    if(/(\d{4}|\*)/.exec(arrExpression[5]) && type != '6a'){
      return '6b';
    }
    throw new InvalidError(arrExpression[5]);
  }

  class Parser {
    constructor(cronExp = '* * * * *', startDate, endDate) {
      this.isValid = true;
      let expression = cronExp.split(' ');
      this.startDate = moment(startDate);
      this.endDate = moment(endDate);
      try{
        this.type = getType(expression, options.type);
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
        this.weekDays = new TimeHandler(
          expression[4 + add],
          Parser.limits.weekDays
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
        if(options.throw){
          throw err;
        }
        this.isValid = false;
      }
    }

    __isValid__(isValid, partialDate, attrib){
      if(isValid){
        for(let range of this[attrib].ranges){
          isValid = isValid || range.contains(partialDate)
        }
      }
      return isValid;
    }

    includes(date){
      let isValid;
      date = moment(date);
      isValid = date.isValid();
      if(this.type == Parser.TypeEnum.T6b || this.type == Parser.TypeEnum.T7){
        this.__isValid__(isValid, date.year(), 'years');
      }
      this.__isValid__(isValid, date.month(), 'months');
      this.__isValid__(isValid, date.weekday(), 'weekDays');
      this.__isValid__(isValid, date.date(), 'days');
      this.__isValid__(isValid, date.hour(), 'hours');
      this.__isValid__(isValid, date.minute(), 'minutes');
      if(this.type == Parser.TypeEnum.T6a || this.type == Parser.TypeEnum.T7){
        this.__isValid__(isValid, date.second(), 'seconds');
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
        this.weekDays.__partialPrettify__( i18n.__("week day"), i18n ),
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
    *getMoments(options = {}) {
      options.ignoreYear = options.ignoreYear? options.ignoreYear: true;
      options.ignoreSeconds = options.ignoreSeconds? options.ignoreSeconds: true;
      let nextDate = moment(this.startDate),
        previousDate,
        month = this.months.iterator(),
        hour = this.hours.iterator(),
        minute = this.minutes.iterator(),
        weekday = this.weekDays.iterator(),
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
              weekday = this.__refresh__('weekDays');
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
        this.weekDays.partialExpression,
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
      this.isValid &= true;
      try{
        expression = expression.replace('*', '\\*');
        let re = new RegExp(',?' + expression)
        expression = this[location].partialExpression.replace(re, '');
        this.type = getType(this.__joinExpression__(), options.type);
        this[location] = new TimeHandler(
          expression,
          Parser.limits[location]
        );
      }
      catch(err){
        if(options.throw){
          throw err;
        }
        this.isValid = false;
      }
    }

    removeMinutes(expression){
      return this.__remove__(expression, 'minutes');
    }

    removeSeconds(expression){
      return this.__remove__(expression, 'seconds');
    }

    removeHours(expression){
      return this.__remove__(expression, 'hours');
    }

    removeDays(expression){
      return this.__remove__(expression, 'days');
    }

    removeWeekdays(expression){
      return this.__remove__(expression, 'weekDays');
    }

    removeMonths(expression){
      return this.__remove__(expression, 'months');
    }

    removeYears(expression){
      return this.__remove__(expression, 'years');
    }

    __set__(expression, location){
      this.isValid &= true;
      try{
        this[location] = new TimeHandler(
          expression,
          Parser.limits[location]
        );
        this.type = getType(this.__joinExpression__(), options.type);
      }
      catch(err){
        if(options.throw){
          throw err;
        }
        this.isValid = false;
      }
    }

    setMinutes(expression){
      return this.__set__(expression, 'minutes');
    }

    setSeconds(expression){
      return this.__set__(expression, 'seconds');
    }

    setHours(expression){
      return this.__set__(expression, 'hours');
    }

    setDays(expression){
      return this.__set__(expression, 'days');
    }

    setWeekdays(expression){
      return this.__set__(expression, 'weekDays');
    }

    setMonths(expression){
      return this.__set__(expression, 'months');
    }

    setYears(expression){
      return this.__set__(expression, 'years');
    }

    __add__(expression, type){
      try{
        if(this[type] === undefined){
          return;
        }
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
        this.type = getType(this.__joinExpression__(), options.type);
      }
      catch(err){
        if(options.throw){
          throw err;
        }
        this.isValid = false;
      }
    }

    addSeconds(expression){
      return this.__add__(expression, 'seconds');
    }

    addMinutes(expression){
      return this.__add__(expression, 'minutes');
    }


    addHours(expression){
      return this.__add__(expression, 'hours');
    }

    addDays(expression){
      return this.__add__(expression, 'days');
    }

    addWeekdays(expression){
      return this.__add__(expression, 'weekDays');
    }

    addMonths(expression){
      return this.__add__(expression, 'months');
    }

    addYears(expression){
      return this.__add__(expression, 'years');
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
      min: 1,
      max: 12,
    },
    weekDays: {
      min: 0,
      max: 7,
    },
    years: {
      min: 1970,
      max: 3000,
    },
  }

  return Parser;
}


module.exports = (options) => {
  return parserFactory(options);
};
