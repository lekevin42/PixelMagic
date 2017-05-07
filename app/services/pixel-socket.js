import Ember from 'ember';

export default Ember.Service.extend({

  /*
    PixelSocket is a WebSocket wrapper for sending/receiving pixel information
  */

  socket: null,

  server: null,

  refreshCallback: null,

  messageHandler: null,

  //requestRefresh: null,

  init() {
    this._super(...arguments);

  },

  start(server, autoconnect = false){
    this.server = server;
    if (autoconnect){
      this.connect();
    }

  },

  connect(width, height){
    this.socket = new WebSocket(this.server);

    this.socket.binaryType = 'arraybuffer';

    this.socket.onmessage = function(event) {
        if (event.data.byteLength === width * height) {
            if (this.refreshCallback){
              this.refreshCallback(new Uint8Array(event.data));
            }

        } else if (this.messageHandler) {
            this.messageHandler(event.data);
        }

    }.bind(this);

    this.socket.onclose = function() {
        console.log('PixelSocket closed');
    };

    this.socket.onerror = function(event) {
        console.log('PixelSocket websocket error', event.data);
    };

      this.socket.onopen  = () => {
          console.log('PixelSocket opened');
          this.requestRefresh();
      };
  },

  sendPixel(x, y, colorID, username = ''){
    this.socket.send(JSON.stringify({'action': 'paint', x, y, 'color': colorID, username}));
  },

  getPixel(x, y){
    this.socket.send(JSON.stringify({'action': 'getPixel', x, y}));
  },

  setMessageHandler(callback){
    this.messageHandler = callback;
  },

  requestRefresh(){
    this.socket.send('refreshPixels');
  },

  setCanvasRefreshHandler(callback){
    this.refreshCallback = callback;
  }
});
