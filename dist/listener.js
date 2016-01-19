window.jsTracker.prototype._getOS = function () {
  var os = "Unknown OS";
  if (navigator.appVersion.indexOf("Win") != -1) os = "Windows";
  if (navigator.appVersion.indexOf("Mac") != -1) os = "MacOS";
  if (navigator.appVersion.indexOf("X11") != -1) os = "UNIX";
  if (navigator.appVersion.indexOf("Linux") != -1) os = "Linux";

  return os;
};
window.jsTracker.prototype._getInnerSize =function () {
  return window.innerWidth + ' x ' + window.innerHeight;
};
window.jsTracker.prototype._getSize = function () {
  return screen.width + ' x ' + screen.height;
};
window.jsTracker.prototype._getUserAgent = function () {
  return navigator.userAgent;
};
window.jsTracker.prototype._getBrowser = function () {
  var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {name: 'IE', version: (tem[1] || '')};
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/)
    if (tem != null) {
      return {name: 'Opera', version: tem[1]};
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }
  return M[0] + ' ' + M[1];
};
window.jsTracker.prototype._loadFile = function (url, callback) {
  console.trackjs('jsTracker _loadFile', url);
  var promise = new Promise(function(resolve, reject) {
    // do a thing, possibly async, then…

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return;
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.status + ': ' + xhr.statusText);
      }
    };
    xhr.open('GET', url, true);
    xhr.send();
  });
  return promise;

};
window.jsTracker.prototype.getDetails = function () {
  return {
    os: this._getOS(),
    userAgent: this._getUserAgent(),
    screenSize: this._getSize(),
    screenInnerSize: this._getInnerSize(),
    location: window.location.href,
    browser: this._getBrowser()
  };
};
/*window.jsTracker.prototype.getToken = function () {

  var self = this;
  if (self.token){
    return new Promise(function(resolve, reject) {
      resolve(self.token);
    });
  }
  return this._loadFile(window.location.pathname + 'trackjs.json').then(function(response){
        if (!self.token && response.length > 0){
          try{
            self.token = JSON.parse(response).token;
            console.trackjs('jsTracker set Token', window.location.pathname + 'trackjs.json', self.token);
          } catch(e) {}
        }
        return self.token;
    }, function(){
    return self._loadFile('/trackjs.json').then(function(response){
      if (!self.token && response.length > 0){
        try {
          self.token = JSON.parse(response).token;
          console.trackjs('jsTracker set Token', '/trackjs.json', self.token);
        } catch(e) {}
      }
      return self.token;
    }, function(){
      console.trackjs('undefined jsTracker Token');
    });
  });
};*/


window.jsTracker.prototype.getToken = function () {
  var scripts = window.document.getElementsByTagName("script");
  for (var i in scripts) {
    if (scripts[i].src) {
      var pa = scripts[i].src.split("?").pop().split("&");
      var p = {}
      for (var j in pa) {
        var kv = pa[j].split("=");
        p[kv[0]] = kv[1];
     }
     if (p['token']) {
        return p['token'];
      }
    }
  }
  console.error("undefined TrackJS Token");
};
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
window.jsTracker = function () {
  console.log('jsTracker init');
  this.initHooks();
  this.initConsole();
  this.getToken();
};
window.jsTracker.prototype.onError = function (errorType, e) {

  var handler = new XMLHttpRequest();
      handler.open('POST', 'https://api.parse.com/1/classes/Log', true);
      handler.setRequestHeader('X-Parse-Application-Id', 'Sxl3ayGGamC32hd6gbiCq6ctVo2Kl5ViaUVZOKqv');
      handler.setRequestHeader('X-Parse-REST-API-Key', 'WVryeQAhXtWpJCBYo8iuHgBQQzFxQRl4N1lAfsLR');
      handler.setRequestHeader('Content-Type', 'application/json');

  this.getInfo(errorType, e).then(function(json){
    handler.send(JSON.stringify(json));
  });

};
window.jsTracker.prototype.getInfo = function (errorType, e) {
  console.trackjs('jsTracker getInfo');
  var json = this.getDetails();
  var self = this;
  return self.getToken().then(function(token){
    json.type = errorType;
    json.domain = window.document.location.hostname;
    json.instanceId =  {
      __type: 'Pointer',
      className: 'Instance',
      objectId: token
    };
    json.console = self.console.get();
    switch (errorType) {
      case 'js':
        if (e.error && e.error.stack){
          json.stack = String(e.error.stack).replace(/(?:\r\n|\r|\n)/g, '<br />');
        }
        console.trackjs(e);
        json.info = {
          line: e.lineno,
          column: e.colno,
          message: e.message,
          filename: e.filename
        };

        break;
      case 'angular':
        json.stack =  String(e.stack).replace(/(?:\r\n|\r|\n)/g, '<br />');
        //    at m.$scope.a (http://localhost:8002/test/2/main.js:17:24)"
        var link = String(e.stack).split(/\r\n?|\n/)[1].match(/\http([-a-zA-Z0-9@:%._\+~#=\/]+)/g)[0];

        json.info = (function(ll){
          function get_line(l){
            var n = l.match(/(\d+)/g);
            return Number(n[n.length - 2]);
          }
          function get_column(l){
            var n = l.match(/(\w+)/g);
            return Number(n[n.length - 1]);
          }
          function get_file(l){
            return l.match(/([a-z]{1,5}[:][-a-zA-Z0-9._\/]+)[:]([-a-zA-Z0-9@%._\+~#=\/]+)/g)[0];
          }
          return {
            line: get_line(ll),
            column: get_column(ll),
            message: e.message,
            filename: get_file(ll)
          };
        })(link);

        break;
      case 'ajax':
        json.info = {
          message:  e.config.method + ' ' + e.config.url + ': ' + e.status + ' ' + e.statusText,
          method:   e.config.method,
          params:   e.config.params,
          headers:  e.config.headers,
          url:      e.config.url,
          data:     e.data,
          status:   e.status,
          statusText: e.statusText
        };
        break;
      case 'jquery':

        break;
    }
    json.info = json.info || {};
    json.cookie = window.document.cookie;
    json.localStorage = (function(){
      var storage = [];
      for ( var i = 0, len = window.localStorage.length; i < len; ++i ) {
        var key = window.localStorage.key( i );
        var data = window.localStorage.getItem(key);
        var object = {
          key: key.replace(/$-./g,'')
        };
        try{
          object.data = JSON.parse(data);
        }
        catch(e)
        {
          object.data = data;
        }
        storage.push(object);
      }
      return storage;
    })();

    if (json.info.filename){
        return self._loadFile(json.info.filename).then(function (file) {
          var lines = String(file).split(/\r\n?|\n/);
          if (lines.length > 20){
            var errorLine = json.info.line;
            var startLine = errorLine - 11;
            var endLine = errorLine + 11;
            lines = lines.slice(startLine, endLine);
            json.file = lines.join('\r\n');
          }
          return json;
        }, function(e){
          console.error('Could not find file', e);
        });
      } else {
        return  new Promise(function(resolve, reject) {
          resolve(json);
        });
      }



  });

};
window.jsTracker = new jsTracker();
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
