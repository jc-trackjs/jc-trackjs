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