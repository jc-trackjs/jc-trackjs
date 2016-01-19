window.jsTracker.prototype.initConsole = function() {
  console.log('jsTracker initConsole');
  var jsTrackerConsole = function () {
    this.events = [];
    this.setProxy();
  };

  jsTrackerConsole.prototype = {
    setProxy: function () {
      console.log('jsTracker','setProxy');
      var methods = [
       'assert', 'clear', 'count', 'debug', 'dir', 'dirxml',
       'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
       'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
       'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
      ];
      console.trackjs = (function(){return console.log;})();
      var self = this;
      for(var i in methods){
        console[methods[i]] = (function(method, originalConsole){
           return function(exception){
             self.add(method, arguments);
             /*if (typeof exception !== 'undefined') {
               originalConsole.call(console, exception);
             } else {*/
               originalConsole.apply(this, arguments);
            // }
           };
        })(methods[i], console[methods[i]]);
      }

    },
    get: function () {
      return this.events;
    },
    add: function (method, message) {
      this.events.push({
        method: method,
        message: message
      });
    }
  };
  this.console = new jsTrackerConsole();
};
