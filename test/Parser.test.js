const should = require('should');
const Parser = require('../lib/Parser');
const Instantiator = require('../lib/Instantiator');
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
        instance.isNow().should.be.false();

        exp = '* ' + minutes + ' * * * *',
        instance = new Parser(exp);
        instance.isNow().should.be.false();

        exp = minutes + ' * * * * *',
        instance = new Parser(exp, {type: '6b'});
        instance.isNow().should.be.false();

        exp = '* ' + minutes + ' * * * * *',
        instance = new Parser(exp);
        instance.isNow().should.be.false();
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
        instance.includes(date).should.be.false();

        exp = '* ' + minutes + ' * * * *',
        instance = new Parser(exp);
        instance.includes(date).should.be.false();

        exp = minutes + ' * * * * *',
        instance = new Parser(exp, {type: '6b'});
        instance.includes(date).should.be.false();

        exp = '* ' + minutes + ' * * * * *',
        instance = new Parser(exp);
        instance.includes(date).should.be.false();
        resolve();
      });
    });
  });

  describe('prettify method', () => {
    it('should make readable a cron expression', () => {
      return new Promise((resolve, reject) => {
        let exp = '30-55 3,5,9,15-19/3 * * 2-4 1-5 2001-2012';
        let instance = new Parser(exp);
        Parser.i18n.setLocale('en');
        instance.prettify().should.equal(
          "At every second from 30 to 55, minute 3, 5, 9, every 3 minutes from 15 to 19, every hour, every day, every month from 2 to 4, every week day from 1 to 5, every year from 2001 to 2012"
        );
        Parser.i18n.setLocale('es');
        instance.prettify().should.equal(
          "Durante cada segundo de 30 a 55, minuto 3, 5, 9, cada 3 minutos de 15 a 19, cada hora, cada día, cada mes de 2 a 4, cada día de la semana de 1 a 5, cada año de 2001 a 2012"
        );
        resolve();
      });
    });
  });

  describe('getMoments', () => {
    it('should finish iterating', () => {
      return new Promise((resolve, reject) => {
        let exp = '5 4 1 12 *',
          instance = new Parser(exp),
          iterator = instance.getMoments();
        while(iterator.next().value){}
        resolve();
      });
    });
    it('should finish give just certain moments', () => {
      function* moments(){
        let date = moment("3000-01-01T04:05:00.000");
        yield date;
        for(let i = 1; i <= 11; i++){
          yield date.add(1, 'month');
        }
      }
      return new Promise((resolve, reject) => {
        let exp = '5 4 1 * *',
          instance = new Parser(exp, {startDate: moment('2017-01-01T00:00')}),
          iterator = instance.getMoments(),
          next = iterator.next(),
          validDates = moments(),
          nextValidDate = validDates.next();
          date = moment('3000-01-01T04:05');
        do{
          next.value.format().should.equal(nextValidDate.value.format());
          next = iterator.next();
          nextValidDate = validDates.next();
        }
        while(!next.done);
        resolve();
      });
    });
    it('should finish give just certain moments (reloaded)', () => {
      function* moments(){
        let date = moment("3000-02-01T04:05:00.000");
        yield date;
        yield date.add(1, 'months')
        yield date.add(8, 'months')

      }
      return new Promise((resolve, reject) => {
        let exp = '5 4 1 * 6',
          instance = new Parser(exp, {startDate: moment('2017-01-01T00:00')}),
          iterator = instance.getMoments(),
          next = iterator.next(),
          validDates = moments(),
          nextValidDate = validDates.next();
          date = moment('3000-01-01T04:05');
        do{
          next.value.format().should.equal(nextValidDate.value.format());
          next = iterator.next();
          nextValidDate = validDates.next();
        }
        while(!next.done);
        resolve();
      });
    });
    it('should finish give just certain moments (revolutions)', () => {
      function* moments(){
        let date = moment("2017-01-01T04:05:00.000");
        yield date;
        for(let i = 1; i <= 11; i++){
          yield date.add(1, 'month');
        }
      }
      return new Promise((resolve, reject) => {
        let exp = '5 4 1 * * 2017',
          instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00')}),
          iterator = instance.getMoments(),
          next = iterator.next(),
          validDates = moments(),
          nextValidDate = validDates.next();
          date = moment('3000-01-01T04:05');
        do{
          next.value.format().should.equal(nextValidDate.value.format());
          next = iterator.next();
          nextValidDate = validDates.next();
        }
        while(!next.done);
        resolve();
      });
    });
  });

  describe('removeMinutes()', ()=> {
    it('should remove minute', () => {
      let exp = '5,* 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeMinutes('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
    it('should not remove an inexistent minute', () => {
      let exp = '5 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeMinutes('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('removeSeconds()', ()=> {
    it('should remove second', () => {
      let exp = '1,* 5 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeSeconds('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
    it('should not remove an inexistent second', () => {
      let exp = '1 5 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeSeconds('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('removeDays()', ()=> {
    it('should remove day', () => {
      let exp = '5 4 1,* 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeDays('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
    it('should not remove an inexistent day', () => {
      let exp = '5 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeDays('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('removeHours()', ()=> {
    it('should remove hour', () => {
      let exp = '5 4,* 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeHours('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
    it('should not remove an inexistent hour', () => {
      let exp = '5 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeHours('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('removeMonths()', ()=> {
    it('should remove month', () => {
      let exp = '5 4 1 1,* *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeMonths('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
    it('should not remove an inexistent month', () => {
      let exp = '5 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeMonths('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('removeWeekdays()', ()=> {
    it('should remove weekdays', () => {
      let exp = '5 4 1 1 *,0 2017',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeWeekdays('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
    it('should not remove an inexistent weekdays', () => {
      let exp = '5 4 1 1 0 2017',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeWeekdays('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('removeYears()', ()=> {
    it('should remove years', () => {
      let exp = '5 4 1 1 0 2017,*',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeYears('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
    it('should not remove an inexistent years', () => {
      let exp = '5 4 1 1 0 2017',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.removeYears('*');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('setMinutes()', ()=> {
    it('should set minute', () => {
      let exp = '* 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.setMinutes('5');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });

  describe('setSeconds()', ()=> {
    it('should set second', () => {
      let exp = '* 5 4 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.setSeconds('1');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });

  });
  describe('setDays()', ()=> {
    it('should set day', () => {
      let exp = '5 4 * 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.setDays('1');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });

  });
  describe('setHours()', ()=> {
    it('should set hour', () => {
      let exp = '5 * 1 1 *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.setHours('4');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('setMonths()', ()=> {
    it('should set month', () => {
      let exp = '5 4 1 * *',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.setMonths('1');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('setWeekdays()', ()=> {
    it('should set weekdays', () => {
      let exp = '5 4 1 1 * 2017',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.setWeekdays('0');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });
  describe('setYears()', ()=> {
    it('should set years', () => {
      let exp = '5 4 1 1 0 2017-2030',
        instance = new Parser(exp, {startDate: moment('2017-01-01T00:00'), endDate: moment('2017-12-31T00:00'), throw: true});
      return new Promise((resolve, reject) => {
        instance.setYears('2017');
        let iterator = instance.getMoments();
        iterator.next().done.should.equal(false);
        iterator.next().done.should.equal(true);
        resolve();
      });
    });
  });

  describe('__add__()', () => {
    it('should add whithout validations', () => {
      return new Promise((resolve, reject) => {
        let exp = '1 1 1 1 1';
        let instance = new Parser(exp,{throw:true});
        instance.minutes = null;
        instance.days = null;
        instance.months = null;
        instance.weekdays = null;
        instance.__add__('4-8', 'hours', 'notValidate');
        resolve();
      });
    });
  });

  describe('__set__()', () => {
    it('should set whithout validations', () => {
      return new Promise((resolve, reject) => {
        let exp = '1 1 1 1 1';
        let instance = new Parser(exp,{throw:true});
        instance.minutes = null;
        instance.days = null;
        instance.months = null;
        instance.weekdays = null;
        instance.__set__('4-8', 'hours', 'notValidate');
        resolve();
      });
    });
  });

  describe('addSeconds()', () => {
    it('should add to seconds', () => {
      return new Promise((resolve, reject) => {
        let exp = '14-20 * * * * *';
        let instance = new Parser(exp);
        instance.addSeconds('2-10');
        instance.getExpression().should.equal('14-20,2-10 * * * * *');
        resolve();
      });
    });

    it('should add to seconds if it is diferent from "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *';
        let instance = new Parser(exp);
        instance.addSeconds('2-10');
        instance.getExpression().should.equal('2-10 * * * * *');
        resolve();
      });
    });

    it('should not add to seconds if it is "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * * *';
        let instance = new Parser(exp);
        instance.addSeconds('2-10');
        instance.getExpression().should.equal('* * * * * *');
        resolve();
      });
    });
  });

  describe('addMinutes()', () => {
    it('should add to minutes if it is diferent from "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '12-24 * * * *';
        let instance = new Parser(exp);
        instance.addMinutes('2-10');
        instance.getExpression().should.equal('12-24,2-10 * * * *');
        resolve();
      });
    });

    it('should not add to minutes if it is "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *';
        let instance = new Parser(exp);
        instance.addMinutes('2-10');
        instance.getExpression().should.equal('* * * * *');
        resolve();
      });
    });
  });

  describe('addHours()', () => {
    it('should add to hours', () => {
      return new Promise((resolve, reject) => {
        let exp = '* 12-20 * * *';
        let instance = new Parser(exp);
        instance.addHours('2-10');
        instance.getExpression().should.equal('* 12-20,2-10 * * *');
        resolve();
      });
    });

    it('should not add to Hours if it is "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *';
        let instance = new Parser(exp);
        instance.addHours('2-10');
        instance.getExpression().should.equal('* * * * *');
        resolve();
      });
    });
  });

  describe('addDays()', () => {
    it('should add to days', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * 12-20 * *';
        let instance = new Parser(exp);
        instance.addDays('2-10');
        instance.getExpression().should.equal('* * 12-20,2-10 * *');
        resolve();
      });
    });

    it('should not add to days if it is "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *';
        let instance = new Parser(exp);
        instance.addDays('2-10');
        instance.getExpression().should.equal('* * * * *');
        resolve();
      });
    });
  });

  describe('addMonths()', () => {
    it('should add to months', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * 2-5 *';
        let instance = new Parser(exp);
        instance.addMonths('3-10');
        instance.getExpression().should.equal('* * * 2-5,3-10 *');
        resolve();
      });
    });

    it('should not add to months if it is "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *';
        let instance = new Parser(exp);
        instance.addMonths('2-10');
        instance.getExpression().should.equal('* * * * *');
        resolve();
      });
    });
  });

  describe('addWeekdays()', () => {
    it('should add to week days', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * 0-3';
        let instance = new Parser(exp);
        instance.addWeekdays('5-6');
        instance.getExpression().should.equal('* * * * 0-3,5-6');
        resolve();
      });
    });

    it('should not add to week days if it is "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * *';
        let instance = new Parser(exp);
        instance.addWeekdays('2-10');
        instance.getExpression().should.equal('* * * * *');
        resolve();
      });
    });
  });

  describe('addYears()', () => {
    it('should add to years', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * * * 2000-2014';
        let instance = new Parser(exp);
        instance.addYears('2016-2020');
        instance.getExpression().should.equal('* * * * * * 2000-2014,2016-2020');
        resolve();
      });
    });

    it('should not add to years if it is "*"', () => {
      return new Promise((resolve, reject) => {
        let exp = '* * * * * *';
        let instance = new Parser(exp);
        instance.addSeconds('2-10');
        instance.getExpression().should.equal('* * * * * *');
        resolve();
      });
    });
  });

  describe('parse()', () => {
    it('should return an Instantiator', () => {
      return new Promise((resolve, reject) => {
        let instance = new Parser();
        instance.isValid.should.be.false();
        (instance.parse() instanceof Instantiator).should.be.true();
        resolve();
      });
    });
  });

});
