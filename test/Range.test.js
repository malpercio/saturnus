const Range = require('../lib/Range');
const ErrorHandler = require('./helpers/ErrorHandler');
const should = require('should');
describe('Range tests', () => {
  describe('constructor()', () => {
    it('should create a Range object', () => {
      return new Promise((resolve, reject) => {
        let start = 1,
          end = 10,
          step = 5;
        instance = new Range(start, end, step);
        instance.start.should.equal(start);
        instance.end.should.equal(end);
        instance.step.should.equal(step);
        resolve();
      });
    });
    it('should create a Range object with the default step', () => {
      return new Promise((resolve, reject) => {
        let start = 1,
          end = 10;
        instance = new Range(start, end);
        instance.start.should.equal(start);
        instance.end.should.equal(end);
        instance.step.should.equal(1);
        resolve();
      });
    });
    it('should not create a Range object with an invalid order', () => {
      return new Promise((resolve, reject) => {
        let start = 1,
          end = 10;
        instance = new Range(end, start);
        resolve();
      })
      .then(ErrorHandler.reject)
      .catch(ErrorHandler.resolve);
    });
    it('should not create a Range object with an invalid order', () => {
      return new Promise((resolve, reject) => {
        let start = 1,
          end = 10;
        instance = new Range(end, start);
        resolve();
      })
      .then(ErrorHandler.reject)
      .catch(ErrorHandler.resolve);
    });
    it('should not create a Range object with a negative step', () => {
      return new Promise((resolve, reject) => {
        let start = 1,
          end = 10,
          step = -1;
        instance = new Range(start, end, step);
        resolve();
      })
      .then(ErrorHandler.reject)
      .catch(ErrorHandler.resolve);
    });
  });
  describe('contains()', () => {
    it('should contain a number', () => {
      return new Promise((resolve, reject) => {
        let start = 1,
          end = 10,
          step = 4;
        instance = new Range(start, end, step);
        instance.contains(5).should.be.true();
        resolve();
      });
    });
    it('should not contain a number', () => {
      return new Promise((resolve, reject) => {
        let start = 1,
          end = 10,
          step = 5;
        instance = new Range(start, end, step);
        instance.contains(11).should.be.false();
        resolve();
      });
    });
  });

  describe('methods for type of range', () => {
    it('should be All', () => {
      return new Promise((resolve, reject) => {
        let start = 0,
          end = 59,
          step = 1;
        instance = new Range(start, end, step);
        let all = new Range(start, end, step);
        instance.__isAll__(all).should.be.true();
        resolve();
      });
    });

    it('should be Punctual', () => {
      return new Promise((resolve, reject) => {
        let start = 10,
          end = 10,
          step = 1;
        instance = new Range(start, end, step);
        instance.__isPunctual__().should.be.true();
        resolve();
      });
    });

    it('should be OneStepRange', () => {
      return new Promise((resolve, reject) => {
        let start = 10,
          end = 20,
          step = 1;
        instance = new Range(start, end, step);
        instance.__isOneStepRange__().should.be.true();
        resolve();
      });
    });

    it('should be RangeCycle', () => {
      return new Promise((resolve, reject) => {
        let start = 10,
          end = 20,
          step = 4;
        instance = new Range(start, end, step);
        instance.__isRangeCycle__().should.be.true();
        resolve();
      });
    });

  });

});
