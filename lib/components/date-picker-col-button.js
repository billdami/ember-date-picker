(function(root) {
    var DatePickerColButtonComponent = Ember.Component.extend({
        tagName: 'button',
        attributeBindings: ['tabindex'],
        classNames: ['datepicker-col-btn'],
        tabindex: -1,

        handleMouseDown: function(e) {
            this.get('parentView').startAdjustment(this.get('dateProperty'), this.get('direction'));
        }.on('mouseDown'),

        handleTouchStart: function(e) {
            this.get('parentView').startAdjustment(this.get('dateProperty'), this.get('direction'));
            //prevent the mouseDown handler from also firing on touch devices
            e.preventDefault();
        }.on('touchStart')
    });

    Ember.Handlebars.helper('date-picker-col-button', DatePickerColButtonComponent);
})(this);