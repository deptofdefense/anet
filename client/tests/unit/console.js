define(function (require) {
  var registerSuite = require('intern!object');

  registerSuite({
    setup: function () {
      console.log('outer setup');

    },
    beforeEach: function () {
      console.log('outer beforeEach');
    },
    afterEach: function () {
      console.log('outer afterEach');
    },
    teardown: function () {
      console.log('outer teardown');
    },

    'inner suite': {
      setup: function () {
          debugger
        console.log('inner setup');
      },
      beforeEach: function () {
        console.log('inner beforeEach');
      },
      afterEach: function () {
        console.log('inner afterEach');
      },
      teardown: function () {
        console.log('inner teardown');
      },

      'test A': function () {
        console.log('inner test A');
      },
      'test B': function () {
        console.log('inner test B');
      }
    },

    'test C': function () {
      console.log('outer test C');
    }
  });
});
