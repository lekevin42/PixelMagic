import Ember from 'ember';

export default Ember.Component.extend({

  stage: Ember.inject.service('canvas'),

  didInsertElement(){
    this.$().attr('tabindex', 0);
    this.$().focus();
    let s = this.get('stage');
    s.start();

  },

  keyPress(event){
    let s = this.get('stage');
    let index = event.keyCode - 49;

    if ((index >= 0) && (index < s.getCanvasColorsLength())){
      s.setColor(index);
    }
  },

  click(event) {
    let s = this.get('stage');

    let p = s.getCoordinates(s.getX(), s.getY());
    var drawingShape = new createjs.Shape();
    var color = s.getColor();

    s.add(Math.floor(p.x), Math.floor(p.y), color);
  },

  mouseMove(event){
  },


});
