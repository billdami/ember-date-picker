(function(root) {
    var DatePickerColInputComponent = Ember.Component.extend({
        tagName: 'input',
        attributeBindings: ['type', 'value', 'readonly'],
        classNames: ['datepicker-col-input'],
        classNameBindings: ['datePropertyClass'],
        type: 'text',
        readonly: true,
        value: null,

        datePropertyClass: function() {
            return 'datepicker-col-input-' + this.get('dateProperty');
        }.property('dateProperty'),

        setup: function() {
            this.$el = this.$();
            //ember doesn't have built-in event handling for mousewheel/DOMMouseScroll 
            this.$el.on('mousewheel DOMMouseScroll', Em.run.bind(this, this.handleMouseWheel));
        }.on('didInsertElement'),

        teardown: function() {
            this.$el.off();
        }.on('willDestroyElement'),

        handleKeyDown: function(e) {
            if(e.keyCode != 38 && e.keyCode != 40) return;
            this.get('parentView').adjustProperty(this.get('dateProperty'), e.keyCode == 40 ? 'increment' : 'decrement');
        }.on('keyDown'),

        handleMouseEnter: function(e) {
            this.$el.focus();
        }.on('mouseEnter'),

        handleMouseWheel: function(e) {
            this.get('parentView').adjustProperty(this.get('dateProperty'), this.mouseWheelDirection(e));
            e.preventDefault();
        },

        mouseWheelDirection: function(event) {
            var evt = event.originalEvent;
            return (evt.wheelDelta > 0 || evt.detail < 0) ? 'decrement' : 'increment';
        }
    });
    
    Ember.Handlebars.helper('date-picker-col-input', DatePickerColInputComponent);
})(this);