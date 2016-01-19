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