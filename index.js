const parserFactory = require('./lib/Parser');
const sancronos = require("sancronos-validator");
const Promise = require('bluebird');
const moment = require('moment');

module.exports = (expression, options, callback) => {
  options = options? options: {};
  options.startDate = options.startDate? moment(options.startDate): moment();
  options.endDate = options.endDate? moment(options.endDate): moment('3000-12-31T23:59');
  callback = callback? callback: options || expression;
  return sancronos.isValid(expression)
    .then((crontab) => {
      let Parser = parserFactory(options);
      return new Parser(crontab, options.startDate, options.endDate);
    })
    .asCallback(callback);
};
