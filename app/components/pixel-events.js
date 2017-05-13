import Ember from 'ember';

export default Ember.Component.extend({

  stage: Ember.inject.service('canvas'),

  didInsertElement(){
    this._super(...arguments);
    this.get('stage');
    this.$().attr('tabindex', 0);
    this.$().focus();
    Ember.$(document).on('scroll.my-namespace', 'canvas', this.eventHandler);
  },

  keyPress(event){
    let s = this.get('stage');
    let index = event.keyCode - 49;
    index += 1;
    if ((index >= 0) && (index < s.getCanvasColorsLength())){
      var p = s.getCoordinates(s.getX(), s.getY());
      s.setDrawing(true);
      s.setColor(index);
      s.visibleColor(p);
    }
  },

  click() {
    let s = this.get('stage');

    let p = s.getCoordinates();
    var color = s.getColor();
    if (color && s.getDrawing()){
      s.add(Math.floor(p.x), Math.floor(p.y), color);
      s.setDrawing(false);
    }
  },

  mouseMove(){
    let s = this.get('stage');
    if(s.getDrawing()){
      var p = s.getCoordinates();
      s.moveShape(p);
    }
  },
});
