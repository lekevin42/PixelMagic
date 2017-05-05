import Ember from 'ember';

export default Ember.Service.extend({
  CANVAS_ELEMENT_ID: 'pixelCanvas',
  CANVAS_WIDTH: 50,
  CANVAS_HEIGHT: 50,
  CANVAS_INITIAL_ZOOM: 20,
  CANVAS_MIN_ZOOM : 10,
  CANVAS_MAX_ZOOM : 40,
  CANVAS_COLORS : ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],

  stage: null,                                  // EaselJS stage
  pixels: null,                                 // EaselJS container to store all the pixels
  zoom : 20,             // zoom level is broken

  pixelMap : new Array(this.CANVAS_WIDTH),     // map of pixels


  isDrawing : false,                      // whether a new pixel to draw is being selected
  drawingShape : new createjs.Shape(),    // shape to render pixel selector
  drawColor : 'red',                      // color to render new pixel being drawn


  //WebSocket
  PIXEL_SERVER: 'ws://home.suncion.tech:3001',

  //pixelSocket: new PixelSocket(this.PIXEL_SERVER),


  init() {
    this._super(...arguments);

  },

  start(){
    this.set('stage', new createjs.Stage(this.CANVAS_ELEMENT_ID));
    var context = this.stage.canvas.getContext("2d");
    context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = false;
    this.set('pixels', new createjs.Container());
    this.pixels.scaleX = this.zoom;
    this.pixels.scaleY = this.zoom;

    console.log('Setting up pixelMap');
    for (var i = 0; i < this.CANVAS_WIDTH; i++){
      this.pixelMap[i] = Array(this.CANVAS_HEIGHT);
    }

    for(var x = 0; x < this.CANVAS_WIDTH; x++){
      for (var y = 0; y < this.CANVAS_HEIGHT; y++){
        var shape = new createjs.Shape();
        shape.graphics.beginFill('#eeeeee').drawRect(x, y, 1, 1);
        this.pixels.addChild(shape);
        this.pixelMap[x][y] = {'color': 0, 'shape': shape};

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

  },

  add(x, y, color){
    console.log('Adding a pixel and update');
    if (x >= 0 && y >= 0 && x < this.CANVAS_WIDTH && y < this.CANVAS_HEIGHT) {
            console.log("Drawing to pixel", x, y, color);
            this.pixelMap[x][y]['shape'].graphics.clear().beginFill(color).drawRect(x, y, 1, 1);
        }
    this.stage.update();
  },

  getX(){
    return this.stage.mouseX ;
  },

  getY(){
    return this.stage.mouseY ;
  },

  getCoordinates(x, y){
    var p = this.pixels.globalToLocal(x, y);
    return p;
  },

  isDrawing(){
    return this.isDrawing;
  },

  getCanvasColorsLength(){
    return this.CANVAS_COLORS.length;
  },

  getColor(){
    return this.drawColor;
  },

  setColor(index){
    this.drawColor = this.CANVAS_COLORS[index];
  },

  getPixels(){
    return this.pixels;
  },

  getMap(){
    return this.pixelMap;
  },




});
