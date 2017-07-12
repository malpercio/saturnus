const TimeHandler = require('../lib/TimeHandler');
const InvalidError = require('./errors/InvalidError');
const moment = require('moment');

function parserFactory(options = {}){
  options.throw = options.throw !== false && options.throw !== undefined? true: false;
  function getType(arrExpression, type){
    if(arrExpression.length == 5){
      return '5';
    }
    if(arrExpression.length == 7){
      return '7';
    }
    if(!/(\d{4})/.exec(arrExpression[5]) && type != '6b'){
      return '6a'
    }
    if(/(\d{4}|\*)/.exec(arrExpression[5]) && type != '6a'){
      return '6b';
    }
    throw new InvalidError(arrExpression[5]);
  }

  class Parser {
    constructor(cronExp = '* * * * *') {
      this.isValid = true;
      let expression = cronExp.split(' ');
      try{
        this.type = getType(expression, options.type);
        let add = (this.type == Parser.TypeEnum.T5 || this.type == Parser.TypeEnum.T6b)? 0 : 1;
        this.seconds = null;
        if(this.type == Parser.TypeEnum.T6a || this.type == Parser.TypeEnum.T7){
          this.seconds = new TimeHandler(
            expression[0],
            {
              min: 0,
              max: 59,
            }
          );
        }
        this.minutes = new TimeHandler(
          expression[0 + add],
          {
            min: 0,
            max: 59,
          }
        );
        this.hours = new TimeHandler(
          expression[1 + add],
            {
              min: 0,
              max: 23,
            }
        );
        this.days = new TimeHandler(
          expression[2 + add],
            {
              min: 0,
              max: 31,
            }
        );
        this.months = new TimeHandler(
          expression[3 + add],
            {
              min: 1,
              max: 12,
            }
        );
        this.weekDays = new TimeHandler(
          expression[4 + add],
            {
              min: 0,
              max: 7,
            }
        );
        this.years = null;
        if(this.type == Parser.TypeEnum.T6b || this.type == Parser.TypeEnum.T7){
          this.years = new TimeHandler(
            expression[5 + add],
            {
              min: 1970,
              max: 3000,
            }
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
      return;
    }

    getMoments() {
      return;
    }

    getExpression() {
      let exp = [
        this.minutes.partialExpression,
        this.hours.partialExpression,
        this.days.partialExpression,
        this.months.partialExpression,
        this.weekDays.partialExpression,
      ];
      if(this.type == Parser.TypeEnum.T7 || this.type == Parser.TypeEnum.T6a){
        exp.unshift(this.seconds.partialExpression);
      }
      if(this.type == Parser.TypeEnum.T7 || this.type == Parser.TypeEnum.T6b){
        exp.push(this.years.partialExpression);
      }
      return exp.join(" ");
    }
  }

  Parser.TypeEnum = {
    T5: '5',
    T6a: '6a',
    T6b: '6b',
    T7: '7',
  };

  return Parser;
}



module.exports = (options) => {
  return parserFactory(options);
};
