class InvalidError extends Error {
  constructor(expression, regex){
    let message = "Invalid expression '" +
      expression +
      "' found. It should match " +
      regex;
    super(message);
    this.expression = expression;
    this.regex = regex;
  }
}

module.exports = InvalidError;
