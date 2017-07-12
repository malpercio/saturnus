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

  isAll(allowed){
    return this.start == allowed.start &&
      this.end == allowed.end &&
      this.step == allowed.step;
  }

  isPunctual(){
    return this.start == this.end &&
      this.step == 1;
  }

  isOneStepRange(){
    return this.start != this.end &&
      this.step == 1;
  }

  isRangeCycle(){
    return this.start != this.end &&
      this.step != 1;
  }
}

module.exports = Range;
