const InvalidError = require('./errors/InvalidError');
class TimeHandler{
  constructor(regex, partialExpression = '*'){
    this.regex = regex;
    this.partialExpression = partialExpression;
    this.ranges = [];
    this.cycles = [];
    this.punctuals  = [];
    if(!regex.test(partialExpression)){
      throw new InvalidError(partialExpression, regex);
    }
  }
}

module.exports = TimeHandler;
