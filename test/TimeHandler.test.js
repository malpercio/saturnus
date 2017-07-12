const TimeHandler = require('../lib/TimeHandler');
const Range = require('../lib/Range');
const ErrorHandler = require('./helpers/ErrorHandler');
const should = require('should');
describe('TimeHandler tests', () => {
  describe('constructor()', () => {
    it('should create a TimeHandler object', () => {
      return new Promise((resolve, reject) => {
        let expression = '5',
          instance,
          options = {
            min: 1,
            max: 10,
          };
        instance = new TimeHandler(expression, options);
        instance.partialExpression.should.equal('5');
        instance.allowed.start.should.equal(options.min);
        instance.allowed.end.should.equal(options.max);
        resolve();
      });
    });
    it('should create a TimeHandler object with the default expression', () => {
      return new Promise((resolve, reject) => {
        let instance,
          options = {
            min: 1,
            max: 10,
          };
        instance = new TimeHandler(undefined, options);
        instance.partialExpression.should.equal('*');
        resolve();
      });
    });
    it('should not create a TimeHandler object with an invalid range', () => {
      return new Promise((resolve, reject) => {
        let expression = '11',
          instance,
          options = {
            min: 1,
            max: 10,
          };
        instance = new TimeHandler(expression, options);
        resolve();
      })
      .then(ErrorHandler.reject)
      .catch(ErrorHandler.resolve);
    });
  });
  describe('__populateAttributes__()', () => {
    it('should add a range cycle', () => {
      return new Promise((resolve, reject) => {
        let expression = '1-5/3',
          instance,
          options = {
            min: 1,
            max: 60,
          },
          newRange = new Range(1, 5, 3);
        instance = new TimeHandler(expression, options);
        instance.ranges.should.containDeep([newRange]);
        resolve();
      });
    });
    it('should add a punctual cycle', () => {
      return new Promise((resolve, reject) => {
        let expression = '1/3',
          instance,
          options = {
            min: 1,
            max: 60,
          },
          newRange = new Range(1, 60, 3);
        instance = new TimeHandler(expression, options);
        instance.ranges.should.containDeep([newRange]);
        resolve();
      });
    });
    it('should add a punctual all inclusive cycle', () => {
      return new Promise((resolve, reject) => {
        let expression = '*/4',
          instance,
          options = {
            min: 1,
            max: 60,
          },
          newRange = new Range(1, 60, 4);
        instance = new TimeHandler(expression, options);
        instance.ranges.should.containDeep([newRange]);
        resolve();
      });
    });
    it('should add range', () => {
      return new Promise((resolve, reject) => {
        let expression = '4-50',
        instance,
        options = {
          min: 1,
          max: 60,
        },
        newRange = new Range(4, 50);
        instance = new TimeHandler(expression, options);
        instance.ranges.should.containDeep([newRange]);
        resolve();
      });
    });
    it('should add all', () => {
      return new Promise((resolve, reject) => {
        let expression = '*',
          instance,
          options = {
            min: 1,
            max: 60,
          },
          newRange = new Range(1, 60);
        instance = new TimeHandler(expression, options);
        instance.ranges.should.containDeep([newRange]);
        resolve();
      });
    });
    it('should add punctual', () => {
      return new Promise((resolve, reject) => {
        let expression = '10',
          instance,
          options = {
            min: 1,
            max: 60,
          },
          newRange = new Range(10, 10);
        instance = new TimeHandler(expression, options);
        instance.ranges.should.containDeep([newRange]);
        resolve();
      });
    });
    it('should add multiple', () => {
      return new Promise((resolve, reject) => {
        let expression = '10,10-15,34/3',
          instance,
          options = {
            min: 1,
            max: 60,
          },
          newRanges = [
            new Range(10, 10),
            new Range(10, 15),
            new Range(34, 60, 3),
          ];
        instance = new TimeHandler(expression, options);
        instance.ranges.should.containDeep(newRanges);
        resolve();
      });
    });
  });
});
