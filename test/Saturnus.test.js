const should = require('should');
const saturnus = require('../index');

describe('Saturnus tests', () => {
  describe('parsed object creation', () => {
    it('should create a parsed object with no options', () => {
      return saturnus('* * * * *')
        .then((crontab) => {
          crontab.type.should.equal('5');
        });
    });
    it('should create a parsed object with forced type', () => {
      return saturnus('* * * * * *', {type: '6b'})
        .then((crontab) => {
          crontab.type.should.equal('6b');
          crontab.years.partialExpression.should.equal('*');
          should.not.exist(crontab.seconds);
        });
    });
    it('should create a parsed object without throwing errors', () => {
      return saturnus('* * * * * 1,2', {throw: false, type: '6b'})
        .then((crontab) => {
          crontab.isValid.should.equal(false);
        });
    });
    it('should create a parsed object with callbacks', (done) => {
      saturnus('* * * * *', (err, crontab) => {
        if(err){
          return done(err);
        }
        crontab.isValid.should.equal(true);
        return done();
      });
    });
    it('should create a parsed object with callbacks and options', (done) => {
      saturnus('* * * * * 1,2', {throw: false, type: '6b'}, (err, crontab) => {
        if(err){
          return done(err);
        }
        crontab.isValid.should.equal(false);
        return done();
      });
    });

  });

});
