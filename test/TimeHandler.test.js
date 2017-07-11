const TimeHandler = require('../lib/TimeHandler');
const ErrorHandler = require('./helpers/ErrorHandler');
const should = require('should');
describe('TimeHandler tests', () => {
  describe('constructor', () => {
    it('should create a TimeHandler object', () => {
      return new Promise((resolve, reject) => {
        let regex = /./,
          expression = '5',
          instance;
        instance = new TimeHandler(regex, expression);
        instance.regex.should.equal(regex);
        instance.partialExpression.should.equal('5');
        resolve();
      });
    });
    it('should create a TimeHandler object with the default expression', () => {
      return new Promise((resolve, reject) => {
        let regex = /\*/,
          instance;
        instance = new TimeHandler(regex);
        instance.partialExpression.should.equal('*');
        resolve();
      });
    });
    it('should not create a TimeHandler object with an invalid expression', () => {
      return new Promise((resolve, reject) => {
        let regex = /5/,
          expression = '6',
          instance;
        instance = new TimeHandler(regex, expression);
        resolve();
      })
      .then(ErrorHandler.reject)
      .catch(ErrorHandler.resolve);
    });
  });
});
