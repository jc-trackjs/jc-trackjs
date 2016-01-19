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