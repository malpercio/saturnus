const should = require('should');
const Saturnus = require('../index');

describe('Saturnus tests', () => {
  describe('parsed object creation', () => {
    it('should create a parsed object with no options', () => {
      let crontab = new Saturnus('* * * * *');
      crontab.type.should.equal('5');
    });
    it('should create a parsed object with forced type', () => {
      let crontab = new Saturnus('* * * * * *', {type: '6b'});
      crontab.type.should.equal('6b');
      crontab.years.partialExpression.should.equal('*');
      should.not.exist(crontab.seconds);
    });
    it('should create a parsed object without throwing errors', () => {
      let crontab = new Saturnus('* * * * * 1,2', {throw: false, type: '6b'});
      crontab.isValid.should.equal(false);
    });
  });
});
