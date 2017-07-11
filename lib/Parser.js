const TimeHandler = require('../lib/TimeHandler');
const sancronos = require("sancronos-validator");

class Parser{

  constructor(cronExp = '* * * * *') {
    this.isValid = true;
    let expression = cronExp.split(' ');
    this.type = getType(expression);
    let add = (this.type == Parser.TypeEnum.T5 || this.type == Parser.TypeEnum.T6b)? 0 : 1;
    try{
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
      throw err;
    }
  }

  isNow() {
    return;
  }

  prettify() {
    return;
  }

  getMoments() {
    return;
  }

  getExpression() {
    return;
  }
}

Parser.TypeEnum = {
  T5: '5',
  T6a: '6a',
  T6b: '6b',
  T7: '7',
};


function getType(arrExpression){
  if(arrExpression.length == 5){
    return '5';
  }
  if(arrExpression.length == 7){
    return '7';
  }
  if(/(\d{4})/.exec(arrExpression[5])){
    return '6b';
  }
  return '6a'
}

module.exports= Parser;