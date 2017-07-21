const isValid = require('sancronos-validator').isValid;
const fields = require('./fields');

class Instantiator{
  constructor(chronos, reset){
    this.time = {};
    this.chronos = chronos;
    this.next;
    this.method = !!reset? '__set__': '__add__';
    for(let method of fields){
      let plural = method + 's';
      this[method] = () => {return this.__close__(plural)};
      this[plural] = () => {return this.__close__(plural)};
      this.time[plural] = '';
    }
  }

  __close__(attrib){
    this.time[attrib] += this.next + ',';
    return this;
  }

  every(){
    this.next = '*';
    return this;
  }

  between(start, end){
    this.next = start + '-' + end;
    return this;
  }

  at(moment){
    this.next = '' + moment;
    return this;
  }

  step(step){
    this.next += '/' + step;
    return this;
  }

  exec(){
    for(let attrib in this.time){
      this.time[attrib] = this.time[attrib].replace(/,$/, '');
      if(this.time[attrib] != ''){
        this.chronos[this.method](this.time[attrib], attrib, true);
      }
    }
    try{
      this.chronos.isValid = !!isValid(this.chronos.getExpression(), true);
      this.chronos.type = this.chronos.__getType__(this.chronos.__joinExpression__());
    }
    catch(err){
      if(this.chronos.throw){
        throw err;
      }
      this.chronos.isValid = false;
    }
  }

}

module.exports = Instantiator;
