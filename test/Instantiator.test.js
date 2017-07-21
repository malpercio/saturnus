const should = require('should');
const Saturnus = require('../index');
const Instantiator = require('../lib/Instantiator');

describe('Instantiator tests', () => {
  describe('creation', () => {
    it('should create an Instantiator', () => {
      let chronos = new Saturnus(),
        instantiator = chronos.parse();
      instantiator.chronos.should.equal(chronos);
    });
  });
  describe('parsing', () => {
    it('should parse at', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .at(1).second()
        .at(1).minute()
        .at(1).hour()
        .at(1).day()
        .at(1).weekday()
        .at(1).month()
        .at(3000).year()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('1 1 1 1 1 1 3000');
    });
    it('should parse every', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .every().second()
        .every().minute()
        .every().hour()
        .every().day()
        .every().weekday()
        .every().month()
        .every().year()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('* * * * * * *');
    });
    it('should parse between', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .between(1,2).second()
        .between(1,2).minute()
        .between(1,2).hour()
        .between(1,2).day()
        .between(1,2).weekday()
        .between(1,2).month()
        .between(2999, 3000).year()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('1-2 1-2 1-2 1-2 1-2 1-2 2999-3000');
    });
    it('should parse every step', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .every().step(3).second()
        .every().step(3).minute()
        .every().step(3).hour()
        .every().step(3).day()
        .every().step(3).weekday()
        .every().step(3).month()
        .every().step(3).year()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('*/3 */3 */3 */3 */3 */3 */3');
    });
    it('should parse between step', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .between(1,2).step(3).seconds()
        .between(1,2).step(3).minutes()
        .between(1,2).step(3).hours()
        .between(1,2).step(3).days()
        .between(1,2).step(3).weekdays()
        .between(1,2).step(3).months()
        .between(2999, 3000).step(3).years()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('1-2/3 1-2/3 1-2/3 1-2/3 1-2/3 1-2/3 2999-3000/3');
    });
    it('should keep keep * when adding to it', () => {
      let chronos = new Saturnus('* * * * *');
      chronos.parse()
        .between(1,2).step(3).seconds()
        .between(1,2).step(3).minutes()
        .between(1,2).step(3).hours()
        .between(1,2).step(3).days()
        .between(1,2).step(3).weekdays()
        .between(1,2).step(3).months()
        .between(2999, 3000).step(3).years()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('1-2/3 * * * * * 2999-3000/3');
    });
    it('should keep initial values', () => {
      let chronos = new Saturnus('2 2 2 2 2');
      chronos.parse()
        .between(1,2).step(3).seconds()
        .between(1,2).step(3).minutes()
        .between(1,2).step(3).hours()
        .between(1,2).step(3).days()
        .between(1,2).step(3).weekdays()
        .between(1,2).step(3).months()
        .between(2999, 3000).step(3).years()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('1-2/3 2,1-2/3 2,1-2/3 2,1-2/3 2,1-2/3 2,1-2/3 2999-3000/3');
    });
    it('should reset', () => {
      let chronos = new Saturnus('2 2 2 2 2');
      chronos.reset()
        .between(1,2).step(3).seconds()
        .between(1,2).step(3).minutes()
        .between(1,2).step(3).hours()
        .between(1,2).step(3).days()
        .between(1,2).step(3).weekdays()
        .between(1,2).step(3).months()
        .between(2999, 3000).step(3).years()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('1-2/3 1-2/3 1-2/3 1-2/3 1-2/3 1-2/3 2999-3000/3');
    });
    it('should selectively reset', () => {
      let chronos = new Saturnus('2 2 2 2 2');
      chronos.reset()
        .between(1,2).step(3).minutes()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('1-2/3 2 2 2 2');
    });
    it('should mix and match', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .at(3).second()
        .between(1,2).step(3).minutes()
        .every().step(3).hours()
        .between(1,2).step(6).days()
        .at(0).weekday()
        .between(1,2).step(3).months()
        .between(2999, 3000).step(3).years()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('3 1-2/3 */3 1-2/6 1-2/3 0 2999-3000/3');
    });
    it('should add multiple', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .at(3).second()
        .between(1,2).step(3).seconds()
        .every().step(3).seconds()
        .between(1,2).step(3).minutes()
        .every().step(3).hours()
        .between(1,2).step(6).days()
        .at(0).weekday()
        .between(1,2).step(3).months()
        .between(2999, 3000).step(3).years()
        .exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('3,1-2/3,*/3 1-2/3 */3 1-2/6 1-2/3 0 2999-3000/3');
    });
    it('should fail with missing arguments', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .at(3).second()
        .every().step(3).hours()
        .at(0).weekday()
        .between(1,2).step(3).months()
        .between(2999, 3000).step(3).years()
        .exec();
      chronos.isValid.should.be.false();
    });
    it('should revalidate after missing arguments', () => {
      let chronos = new Saturnus();
      chronos.parse()
        .at(3).second()
        .every().step(3).hours()
        .between(1,2).step(6).days()
        .at(0).weekday()
        .between(1,2).step(3).months()
        .between(2999, 3000).step(3).years()
        .exec();
      chronos.isValid.should.be.false();
      chronos.parse().between(1,2).step(3).minutes().exec();
      chronos.isValid.should.be.true();
      chronos.getExpression().should.equal('3 1-2/3 */3 1-2/6 1-2/3 0 2999-3000/3');
    });
  });
});
