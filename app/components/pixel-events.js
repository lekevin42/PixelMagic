import Ember from 'ember';

export default Ember.Component.extend({

  stage: Ember.inject.service('canvas'),

  didInsertElement(){
    this._super(...arguments);
    let s = this.get('stage');
    this.$().attr('tabindex', 0);
    this.$().focus();

    //s.start();

  },

  keyPress(event){
    let s = this.get('stage');
    let index = event.keyCode - 49;
    var drawingShape = new createjs.Shape();

    if ((index >= 0) && (index < s.getCanvasColorsLength())){
      var p = s.getCoordinates(s.getX(), s.getY());
      s.setColor(index + 1);
      s.visibleColor(p);
    }
  },

  click(event) {
    let s = this.get('stage');

    let p = s.getCoordinates();
    var drawingShape = new createjs.Shape();
    var color = s.getColor();

    s.add(Math.floor(p.x), Math.floor(p.y), color);
  },

  mouseMove(event){
    let s = this.get('stage');
    var p = s.getCoordinates();
    s.moveShape(p);

  },




});
