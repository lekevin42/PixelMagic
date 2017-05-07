import Ember from 'ember';

export default Ember.Component.extend({

  stage: Ember.inject.service('canvas'),

  //tagName: 'canvas',
  //classNames: ['draggableItem'],

  //attributeBindings: ['draggable'],

  //draggable: 'true',

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
    index += 1
    if ((index >= 0) && (index < s.getCanvasColorsLength())){
      var p = s.getCoordinates(s.getX(), s.getY());
      s.setDrawing(true);
      s.setColor(index);
      s.visibleColor(p);
    }
  },

  click(event) {
    let s = this.get('stage');

    let p = s.getCoordinates();
    var color = s.getColor();
    if (color && s.getDrawing()){
      s.add(Math.floor(p.x), Math.floor(p.y), color);
      s.setDrawing(false);
    }
  },

  mouseMove(event){
    let s = this.get('stage');
    if(s.getDrawing()){
      var p = s.getCoordinates();
      s.moveShape(p);
    }
  },
});
