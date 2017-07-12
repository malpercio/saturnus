class InvalidError extends Error {
  constructor(expression){
    let message = "Invalid expression '" +
      expression +
      "' found.";
    super(message);
    this.expression = expression;
  }
}

module.exports = InvalidError;
