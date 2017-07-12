const should = require('should');
const Parser = require('../lib/Parser')();
const moment = require('moment');

describe('Parser tests', () => {
  describe('constructor()', () => {
    it('should create a Parser object type 5', () => {
      return new Promise((resolve, reject) => {
        let instance = new Parser('* * * * *');
        instance.type.should.equal('5');
        instance.hours.partialExpression.should.equal('*');
        should.not.exist(instance.seconds);
        should.not.exist(instance.years);
        resolve();
      });
    });

    it('should create a Parser object type 6a', () => {
    return new Promise((resolve, reject) => {
        let instance = new Parser('* * * * * *');
        instance.type.should.equal('6a');
        instance.hours.partialExpression.should.equal('*');
        instance.seconds.partialExpression.should.equal('*');
        should.not.exist(instance.years);
        resolve();
      });
    });

    it('should create a Parser object type 6b', () => {
    return new Promise((resolve, reject) => {
        instance = new Parser('* * * * * 2024');
        instance.type.should.equal('6b');
        instance.hours.partialExpression.should.equal('*');
        instance.years.partialExpression.should.equal('2024');
        should.not.exist(instance.seconds);
        resolve();
      });
    });

    it('should create a Parser object type 7', () => {
    return new Promise((resolve, reject) => {
        instance = new Parser('* * * * * * *');
        instance.type.should.equal('7');
        instance.hours.partialExpression.should.equal('*');
        instance.seconds.partialExpression.should.equal('*');
        instance.years.partialExpression.should.equal('*');
        resolve();
      });
    });
  });


  describe('getExpression()', () => {
    it('should return cron expression', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *';
        let instance = new Parser(exp);
        instance.getExpression().should.equal(exp);

        exp = '* * * * * 2024';
        instance = new Parser(exp);
        instance.getExpression().should.equal(exp);

        exp = '3-8 * * * * *';
        instance = new Parser(exp);
        instance.getExpression().should.equal(exp);

        exp = '1 2 3 4 5 6 2007';
        instance = new Parser(exp);
        instance.getExpression().should.equal(exp);
        resolve();
      });
    });
  });

  describe('isNow()', () => {
    it('should accept', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *';
        let instance = new Parser(exp);
        instance.isNow().should.be.true();

        exp = '* * * * * *';
        instance = new Parser(exp);
        instance.isNow().should.be.true();

        exp = '* * * * * *';
        instance = new Parser(exp, {type: '6b'});
        instance.isNow().should.be.true();

        exp = '* * * * * * *';
        instance = new Parser(exp);
        instance.isNow().should.be.true();
        resolve();
      });
    });
    it('should reject', () => {
      return new Promise((resolve, reject) => {
        let minutes = moment().add(5, 'minutes').minutes(),
          exp = minutes + ' * * * *';
        let instance = new Parser(exp);
        instance.isNow().should.be.true();

        exp = '* ' + minutes + ' * * * *',
        instance = new Parser(exp);
        instance.isNow().should.be.true();

        exp = minutes + ' * * * * *',
        instance = new Parser(exp, {type: '6b'});
        instance.isNow().should.be.true();

        exp = '* ' + minutes + ' * * * * *',
        instance = new Parser(exp);
        instance.isNow().should.be.true();
        resolve();
      });
    });
  });
  describe('includes()', () => {
    it('should accept', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *',
          date = moment().subtract(1, 'years');
        let instance = new Parser(exp);
        instance.includes(date).should.be.true();

        exp = '* * * * * *',
        date = moment().subtract(1, 'years');
        instance = new Parser(exp);
        instance.includes(date).should.be.true();

        exp = '* * * * * *',
        date = moment().subtract(1, 'years');
        instance = new Parser(exp, {type: '6b'});
        instance.includes(date).should.be.true();

        exp = '* * * * * * *',
        date = moment().subtract(1, 'years');
        instance = new Parser(exp);
        instance.includes(date).should.be.true();
        resolve();
      });
    });
    it('should reject', () => {
      return new Promise((resolve, reject) => {
        let minutes = moment().minutes(),
          exp = minutes + ' * * * *',
          date = moment().add(5, 'minutes');
        let instance = new Parser(exp);
        instance.includes(date).should.be.true();

        exp = '* ' + minutes + ' * * * *',
        instance = new Parser(exp);
        instance.includes(date).should.be.true();

        exp = minutes + ' * * * * *',
        instance = new Parser(exp, {type: '6b'});
        instance.includes(date).should.be.true();

        exp = '* ' + minutes + ' * * * * *',
        instance = new Parser(exp);
        instance.includes(date).should.be.true();
        resolve();
      });
    });
  });

});
