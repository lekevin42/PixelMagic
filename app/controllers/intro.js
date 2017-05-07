import Ember from 'ember';

export default Ember.Controller.extend({
  loadPlugin: function(){
    Ember.$.getScript('assets/js/jquery.min.js');
    Ember.$.getScript('assets/js/jquery.scrollex.min.js');
    
    Ember.$.getScript('assets/js/skel.min.js');
    Ember.$.getScript('assets/js/util.js');
    Ember.$.getScript('assets/js/main.js');
    console.log('init');
  }.on('init')
});
