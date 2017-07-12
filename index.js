const parserFactory = require('./lib/Parser');
const sancronos = require("sancronos-validator");
const Promise = require('bluebird');

module.exports = (expression, options, callback) => {
  options = options? options: {};
  callback = callback? callback: options || expression;
  return sancronos.isValid(expression)
    .then((crontab) => {
      let Parser = parserFactory(options);
      return new Parser(crontab);
    })
    .asCallback(callback);
};
