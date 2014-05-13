(function(root) {
    var DatePickerInputComponent = Ember.Component.extend({
        tagName: 'input',
        attributeBindings: ['type', 'value', 'readonly', 'placeholder'],
        classNames: ['datepicker-input'],
        type: 'text',
        readonly: true,
        placeholder: null,
        value: null,
        picker: false,

        setup: function() {
            var controlsCmp = Ember.View.views[this.get('controls')];
            this.$el = this.$();

            if(controlsCmp && typeof controlsCmp.openPicker === 'function') {
                this.set('picker', controlsCmp);
            }
        }.on('didInsertElement'),

        handleFocusIn: function(e) {
            if(!this.get('picker')) return;
            this.get('picker').openPicker(this);
        }.on('focusIn'),

        handleKeyDown: function(e) {
            if(!this.get('picker')) return;
            if(e.keyCode == 27) {
                this.get('picker').closePicker();
                this.$el.blur();
            }
        }.on('keyDown')
    });

    Ember.Handlebars.helper('date-picker-input', DatePickerInputComponent);
})(this);