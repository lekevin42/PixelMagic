import Ember from 'ember';

export default Ember.Service.extend({
  CANVAS_ELEMENT_ID: 'pixelCanvas',
  CANVAS_WIDTH: 50,
  CANVAS_HEIGHT: 50,
  CANVAS_INITIAL_ZOOM: 20,
  CANVAS_MIN_ZOOM: 10,
  CANVAS_MAX_ZOOM: 40,
  CANVAS_COLORS: ['#eeeeee', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', '#614126', 'white', 'black'],

  stage: null, // EaselJS stage
  pixels: null, // EaselJS container to store all the pixels
  zoom: 20, // zoom level is broken

  pixelMap: new Array(this.CANVAS_WIDTH), // map of pixels


  isDrawing: false, // whether a new pixel to draw is being selected
  drawingShape: new createjs.Shape(), // shape to render pixel selector
  drawColor: 'red', // color to render new pixel being drawn


  //WebSocket
  PIXEL_SERVER: 'ws://home.suncion.tech:3001',

  pixelService: Ember.inject.service('pixel-socket'),

  init() {
    this._super(...arguments);

    let pSocket = this.get('pixelService');

    pSocket.start(this.PIXEL_SERVER);

    pSocket.setCanvasRefreshHandler(pixelData => {
      if (!this.pixels){
        return;
      }
      console.log('Pixel data synced');
      for (var x = 0; x < this.CANVAS_WIDTH; x++) {
        for (var y = 0; y < this.CANVAS_HEIGHT; y++) {
          var colorID = pixelData[x + y * this.CANVAS_HEIGHT];
          var color = this.CANVAS_COLORS[colorID];

          if (colorID != this.pixelMap[x][y]['color']) {
            this.pixelMap[x][y]['shape'].graphics.beginFill(color).drawRect(x, y, 1, 1);
            this.pixelMap[x][y]['color'] = colorID;
          }
        }
      }
      this.stage.update();
    });


    pSocket.setMessageHandler(data => {
      //console.log('RECV >>', data);

      var action, received;
      try {
        received = JSON.parse(data);
        action = received['action'];
      } catch (e) {
        console.log('Received unknown command from server', data);
        return;
      }

      //console.log('ACTION', action);
      switch (action) {
        case 'canvasInfo': // in case we want to control the canvas dimensions from the server
          this.CANVAS_WIDTH = received['width'];
          this.CANVAS_HEIGHT = received['height'];
          break;

        case 'updatePixel':
          if (!this.pixels){
            return;
          }

          var x = received['data']['x'];
          var y = received['data']['y'];
          var colorID = received['data']['color'];
          var color = this.CANVAS_COLORS[colorID];
          console.log('Pixel Update', x, y, 'color', colorID);

          if (colorID != this.pixelMap[x][y]['color']) {
            this.pixelMap[x][y]['shape'].graphics.beginFill(color).drawRect(x, y, 1, 1);
          }
          received['data']['shape'] = this.pixelMap[x][y]['shape'];
          this.pixelMap[x][y] = received['data'];

          this.stage.update();
          break;

        default:
          break;
      }
    });
    console.log('Initializing EaselJS Stage');
    this.set('stage', new createjs.Stage(this.CANVAS_ELEMENT_ID));

    var context = this.stage.canvas.getContext("2d");
    context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = false;
    this.set('pixels', new createjs.Container());

    this.pixels.scaleX = this.zoom;
    this.pixels.scaleY = this.zoom;

    for (var i = 0; i < this.CANVAS_WIDTH; i++) {
      this.pixelMap[i] = Array(this.CANVAS_HEIGHT);
    }

    for (var x = 0; x < this.CANVAS_WIDTH; x++) {
      for (var y = 0; y < this.CANVAS_HEIGHT; y++) {
        var shape = new createjs.Shape();
        shape.graphics.beginFill('#eeeeee').drawRect(x, y, 1, 1);
        this.pixels.addChild(shape);
        this.pixelMap[x][y] = {
          'color': 0,
          'shape': shape
        };

      }
    }
    this.pixels.addChild(this.drawingShape);
    this.stage.addChild(this.pixels);

    this.pixels.x = (window.innerWidth - (this.CANVAS_INITIAL_ZOOM * this.CANVAS_WIDTH)) / 2;
    this.pixels.y = (window.innerHeight - (this.CANVAS_INITIAL_ZOOM * this.CANVAS_HEIGHT)) / 2;

    this.stage.update();

    console.log('canvas initialization finished!');
    this.stage.canvas.width = this.stage.canvas.height = Math.max(window.innerHeight, window.innerWidth);
    this.stage.update();

    var dragX = 0;
    var dragY = 0;


    pSocket.connect(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    this.pixels.on('mousedown', function(e){
      dragX = e.rawX - this.pixels.x;
      dragY = e.rawY - this.pixels.y;
    }.bind(this));

    this.pixels.on('pressmove', function(e){
      this.pixels.x = e.rawX - dragX;
      this.pixels.y = e.rawY - dragY;
      this.stage.update();
    }.bind(this))

    $(window).on('mousewheel', function(e){
         e.preventDefault();
         this.zoom = (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) ? this.zoom + 1 : this.zoom - 1;
         this.zoom = Math.min(Math.max(this.zoom, this.CANVAS_MIN_ZOOM), this.CANVAS_MAX_ZOOM);
         //console.log("Zoom", zoom);

         // zoom in/out to cursor position
         var centerX = this.stage.mouseX;         // var centerX = window.innerWidth / 2;
         var centerY = this.stage.mouseY;         // var centerY = window.innerHeight / 2;

         var local = this.pixels.globalToLocal(centerX, centerY);
         this.pixels.regX = local.x;
         this.pixels.regY = local.y;
         this.pixels.x = centerX;
         this.pixels.y = centerY;
         this.pixels.scaleX = this.pixels.scaleY = this.zoom;
         this.stage.update();
     }.bind(this));

     $(window).on('resize', function(e){
    // canvas MUST always be a square, otherwise it will get distorted
      this.stage.canvas.width = this.stage.canvas.height = Math.max(window.innerHeight, window.innerWidth);
      this.stage.update();
    }.bind(this));

  },

  openHandler() {
    console.log('PixelSocket opened');

    //this.requestRefresh();
  },

  closeHandler() {
    console.log('PixelSocket closed');
  },

  errorHandler(event) {
    console.log("PixeSocket error", event.data);
  },

  add(x, y, color) {
    let pSocket = this.get('pixelService');
    console.log('Adding a pixel and update');
    if (x >= 0 && y >= 0 && x < this.CANVAS_WIDTH && y < this.CANVAS_HEIGHT) {
      console.log("Drawing to pixel", x, y, color);
      this.pixelMap[x][y]['shape'].graphics.clear().beginFill(this.CANVAS_COLORS[this.drawColor]).drawRect(x, y, 1, 1);
      pSocket.sendPixel(x, y, this.drawColor);

    }
    this.stage.update();
  },

  getX() {
    return this.stage.mouseX;
  },

  getY() {
    return this.stage.mouseY;
  },

  getCoordinates() {
    var p = this.pixels.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    return p;
  },


  getCanvasColorsLength() {
    return this.CANVAS_COLORS.length;
  },

  getColor() {
    return this.CANVAS_COLORS[this.drawColor];
  },

  setColor(index) {
    this.drawColor = index;
  },

  getPixels() {
    return this.pixels;
  },

  getMap() {
    return this.pixelMap;
  },

  update() {
    this.stage.update();
  },

  visibleColor(p) {
    console.log(`X: ${p.x} Y: ${p.y}`);
    this.drawingShape.graphics.clear().beginFill(this.CANVAS_COLORS[this.drawColor]).drawRect(0, 0, 1, 1);
    this.drawingShape.x = Math.floor(p.x);
    this.drawingShape.y = Math.floor(p.y);
    this.drawingShape.visible = true;
    this.stage.update();
    console.log('visible color');
  },

  moveShape(p) {
    this.drawingShape.x = Math.floor(p.x);
    this.drawingShape.y = Math.floor(p.y);
    this.stage.update();
  },

  setDrawing(value){
    this.isDrawing = value;
  },

  getDrawing(){
    return this.isDrawing;
  }


});
