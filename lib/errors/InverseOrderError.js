class InverseOrderError extends Error {
  constructor(min, max){
    let message = "Altered order. '" +
      min +
      "' should be greater than or equal to " +
      max;
    super(message);
    this.min = min;
    this.max = max;
  }
}

module.exports = InverseOrderError;
