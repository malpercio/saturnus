class Negative extends Error {
  constructor(number){
    let message = number +
      "' should be a positive integer";
    super(message);
    this.negative =  number;
  }
}

module.exports = Negative;
