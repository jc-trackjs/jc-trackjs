window.jsTracker.prototype.initHooks = function() {
  console.log('jsTracker initHooks');
  var self = this;
  //window.onerror = function (message, url, line, column, error) {
  //  console.trackjs('window.onerror', message, url, line, column, error);
  //};

  window.addEventListener('error', function (err) {
    self.onError('js', err);
  });



  if (typeof angular !== 'undefined') {
      angular.module('jsTracker', [])
        .config(function ($provide) {
          console.trackjs('jsTracker $exceptionHandler');
          $provide.decorator('$exceptionHandler', function ($delegate) {
            return function (exception, cause) {
              self.onError('angular', exception);
              $delegate(exception, cause);
            };
          });
        })
        .config(function($logProvider, $provide){
          console.trackjs('jsTracker $logProvider');
          $logProvider.debugEnabled(false);

          $provide.decorator('$log', function ($delegate) {
            //Original methods
            var origInfo = $delegate.info;
            var origLog = $delegate.log;
            var origDebug = $delegate.debug;
            var origWarn = $delegate.warn;
            var origError = $delegate.error;
            //Override the default behavior
            $delegate.info = function () {
              self.console.add('info', arguments);
              origInfo.apply(null, arguments);
            };
            $delegate.error = function () {
              self.console.add('error', arguments);
              origError.apply(null, arguments);
            };
            $delegate.warn = function () {
              self.console.add('warn', arguments);
              origWarn.apply(null, arguments);
            };
            $delegate.debug = function () {
              self.console.add('debug', arguments);
              origDebug.apply(null, arguments);
            };
            $delegate.log = function () {
              self.console.add('log', arguments);
              origLog.apply(null, arguments);
            };

            return $delegate;
          });
        }).config(function ($httpProvider) {
          console.trackjs('jsTracker $httpProvider');
          $httpProvider.interceptors.push(function($q) {
            return {
              responseError: function(rejection){
                self.onError('ajax', rejection);
                return $q.reject(rejection);
              }
            };
          });
        });
    }

/*
  if (typeof jQuery !== 'undefined') {
    jQuery.error = function (message) {
      self.jsTracker('jquery', message);
    };
  }

  if (typeof $ !== 'undefined') {
    $.error = function (message) {
      self.onError('jquery', message);
    };
  }*/
};