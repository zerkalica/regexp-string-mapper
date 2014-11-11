var expect = require('./test-helpers').expect;
var RegExpStringMapper = require('../lib/regexp-string-mapper');
var moment = require('moment');

describe('RegExpStringMapper', function () {
  var mapper = RegExpStringMapper({
    moment: moment
  });

  var testMessage = '%time: YYYY-MM-DD% %testId% %testObj% %testObj.a% %testObj.e% %%rrr%%';
  var testTokens = {
    time: new Date('2014-10-11T11:51:56.822Z'),
    testId: 123,
    testObj: {
      a: 1,
      b: [1, 2]
    }
  };
  var testResult = '2014-10-11 123 {\"a\":1,\"b\":[1,2]} 1 %rrr%';

  describe('#map', function () {
    it('should map tokens', function () {
      mapper.map(testMessage, testTokens).should.to.be.equal(testResult);
    });
  });
});
