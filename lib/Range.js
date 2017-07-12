const InvalidError = require('./errors/InvalidError');
const NegativeError = require('./errors/NegativeError');

class Range{
  constructor(start, end, step = 1){
    this.start = start;
    this.end = end;
    this.step = step;
    if(this.end < this.start){
      throw new InverseOrderError(start, end);
    }
    if(this.step < 1){
      throw new NegativeError(step);
    }
  }

  contains(number){
    return number >= this.start
      && number <= this.end
      && number % this.step == this.start % this.step;
  }
}

module.exports = Range;
