var RegExpStringMapper = require('..');
var moment = require('moment');
var Serializer = require('circular-serializer');

function MyType(name) {
  this.name = name;
}

var customFormatter = {
  detect: function (value) {
    return value instanceof MyType;
  },
  format: function (value, arg) {
    return value[arg];
  }
};

var serializer = Serializer();
var mapper = RegExpStringMapper({
  separator: '%',
  moment: moment,
  serialize: serializer.serialize.bind(serializer)
});
mapper.addFormatter(customFormatter);

var testMessage = '%time: YYYY-MM-DD% %testId% %testObj% %testObj.a% %testObj.e% %%rrr%% %my:name%';
var testTokens = {
  time: new Date('2014-10-11T11:51:56.822Z'),
  testId: 123,
  my: new MyType('test1'),
  testObj: {
    a: 1,
    b: [1, 2]
  }
};

console.log(mapper.map(testMessage, testTokens));
// 2014-10-11 123 {"a":1,"b":[1,2]} 1 %rrr% test1
