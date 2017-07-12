class InvalidError extends Error {
  constructor(expression, regex){
    let message = "Invalid expression '" +
      expression +
      "' found.";
    super(message);
    this.expression = expression;
  }
}

module.exports = InvalidError;
