'use strict';

import Ember from 'ember';

export default Ember.Component.extend({

  tagName: 'input',
  attributeBindings: ['type', 'value', 'readonly', 'placeholder'],
  classNames: ['datepicker-input'],
  type: 'text',
  readonly: true,
  placeholder: null,
  value: null,
  picker: false,

  setup: Ember.on('didInsertElement', function() {
    Ember.run.later(this, function() {
      var controlsCmp = Ember.View.views[this.get('controls')];
      this.$el = this.$();

      if(controlsCmp && typeof controlsCmp.openPicker === 'function') {
        this.set('picker', controlsCmp);
      }
    });
  }),

  click: function() {
    if(!this.get('picker')) { return; }
    this.get('picker').openPicker(this);
  },

  handleKeyDown: Ember.on('keyDown', function() {
    if(!this.get('picker')) return;
    if(e.keyCode == 27) {
      this.get('picker').closePicker();
      this.$el.blur();
    }
  })

});
