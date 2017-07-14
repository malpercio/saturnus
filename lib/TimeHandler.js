const InvalidError = require('./errors/InvalidError');
const Range = require('./Range');
const reduce = require('lodash/reduce');
class TimeHandler{
  constructor(partialExpression = '*', options){
    this.partialExpression = partialExpression;
    this.ranges = [];
    this.allowed = new Range(options.min, options.max)
    this.__populateAttributes__(partialExpression);
  }

  __populateAttributes__(partialExpression){
    let instructions = partialExpression.split(',');
    for(let instruction of instructions){
      let rangeCycle = TimeHandler.rangeCycle.exec(instruction),
        punctualCycle = TimeHandler.puntualCycle.exec(instruction),
        range = TimeHandler.range.exec(instruction),
        punctual = TimeHandler.punctual.exec(instruction),
        all = TimeHandler.all.exec(instruction),
        newRange;
      if(rangeCycle){
        let start = parseInt(rangeCycle[1]),
          end = parseInt(rangeCycle[2]),
          step = parseInt(rangeCycle[3]),
          contained = this.allowed.contains(start) && this.allowed.contains(end);
        if(contained){
          newRange = new Range(start, end, step);
        }
      }else if(punctualCycle){
        let start = punctualCycle[1] == '*'? this.allowed.start: parseInt(punctualCycle[1]),
          step = parseInt(punctualCycle[2]),
          contained = this.allowed.contains(start);
        if(contained){
          newRange = new Range(start, this.allowed.end, step);
        }
      }else if(range){
        let start = parseInt(range[1]),
          end = parseInt(range[2]),
          contained = this.allowed.contains(start) && this.allowed.contains(end);
        if(contained){
          newRange = new Range(start, end);
        }
      }else if(all){
          newRange = new Range(this.allowed.start, this.allowed.end);
      }else if(punctual){
        let exact = punctual[1] == '*'? this.allowed.end: parseInt(punctual[1]),
        contained = this.allowed.contains(exact);
        if(contained){
          newRange = new Range(exact, exact);
        }
      }
      if(newRange){
        this.ranges.push(newRange);
      }else{
        throw new InvalidError(partialExpression);
      }
    }
  }


  __partialPrettify__(typeHandler, i18n){
    let readable = "",
      firstDone = false;
    for(let range of this.ranges){
      if(range.__isAll__(this.allowed)){
        return i18n.__("every") + " " + typeHandler;
      }
      else if(range.__isPunctual__()){
        if(!firstDone){
          readable += typeHandler + " " + range.start;
        }
        else
          readable += ', ' + range.start;
      }
      else if(range.__isOneStepRange__()){
        readable += firstDone? ", " : "";
        readable += i18n.__("every") + " " + typeHandler + " " + i18n.__("from") + " " + range.start + " " + i18n.__("to") + " " + range.end;
      }
      else if(range.__isRangeCycle__()){
        readable += firstDone? ", " : "";
        readable += i18n.__("every") + " " +range.step + " " + typeHandler + "s " + i18n.__("from") + " " + range.start + " " + i18n.__("to") + " " + range.end;
      }
      firstDone = true;
    }
    return readable;
  }

  __findMin__(){
    return reduce(this.ranges, (previous, next) => {
      return Math.min(previous, next.start);
    }, this.allowed.start);
  }

  __findMax__(){
    return reduce(this.ranges, (previous, next) => {
      return Math.max(previous, next.end);
    }, this.allowed.end);
  }

  *iterator(){
    let value = this.__findMin__(),
    max = this.__findMax__(),
    i;
    while(value <= max){
      for(i = 0; i < this.ranges.length; i++){
        if(this.ranges[i].contains(value)){
          break;
        }
      }
      if(i < this.ranges.length){
        yield value;
      }
      value++;
    }
  }
}

TimeHandler.rangeCycle = /(.*)\-(.*)\/(.*)/;
TimeHandler.puntualCycle = /(.*)\/(.*)/;
TimeHandler.range = /(.*)\-(.*)/;
TimeHandler.punctual = /(.*)/;
TimeHandler.all = /(\*)/;

module.exports = TimeHandler;
