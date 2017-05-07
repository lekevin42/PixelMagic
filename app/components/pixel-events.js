  import Ember from 'ember';

export default Ember.Component.extend({

  stage: Ember.inject.service('canvas'),

  didInsertElement(){
    this._super(...arguments);
    let s = this.get('stage');
    this.$().attr('tabindex', 0);
    this.$().focus();
    Ember.$(document).on('scroll.my-namespace', 'canvas', this.eventHandler);
    //s.start();

  },

  keyPress(event){
    let s = this.get('stage');
    let index = event.keyCode - 49;
    var drawingShape = new createjs.Shape();
    index += 1
    if ((index >= 0) && (index < s.getCanvasColorsLength())){
      var p = s.getCoordinates(s.getX(), s.getY());
      console.log(index);
      s.setColor(index);
      s.visibleColor(p);
    }
  },

  click(event) {
    let s = this.get('stage');

    let p = s.getCoordinates();
    var drawingShape = new createjs.Shape();
    var color = s.getColor();
    if (color){
      s.add(Math.floor(p.x), Math.floor(p.y), color);
    }
  },

  mouseMove(event){
    let s = this.get('stage');
    var p = s.getCoordinates();
    s.moveShape(p);
  },

  eventHandler(ev) {
      console.log('scrolling');
  }
});
