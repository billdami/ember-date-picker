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
(function(root) {
    var DatePickerControlsComponent = Ember.Component.extend({
        classNames: ['datepicker-controls'],
        classNameBindings: ['_isOpen:shown', '_animate:animate'],
        layoutName: 'components/date-picker-controls',
        animateDuration: 300,
        repeatInterval: 150,
        repeatDelay: 500,

        _defaults: {
            minYear: false,
            maxYear: false,
            dateFormat: 'MM d, yy',
            i18n: {
                done: "Done",
                clear: "Clear",
                today: "Today",
                dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                monthNames: [
                    "January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"
                ],
                monthNamesShort: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ]
            }
        },

        _isOpen: false,
        _animate: false,
        _currentTarget: null,
        _currentMonth: null,
        _currentDay: null,
        _currentYear: null,
        _shortYearCutoff: '+10',
        _ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
            Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

        setConfig: function() {
            //sanity check provided settings/set defaults where necessary
            var config = {};
            if(Em.isEmpty(this.get('minYear'))) config.minYear = this.get('_defaults.minYear');
            if(Em.isEmpty(this.get('maxYear'))) config.maxYear = this.get('_defaults.maxYear');
            if(Em.isBlank(this.get('dateFormat'))) config.dateFormat = this.get('_defaults.dateFormat');
            if(Em.isEmpty(this.get('i18n'))) config.i18n = this.get('_defaults.i18n');

            //allow relative minYear/maxYear values to the current year (e.g. "-100", "+50")
            config.minYear = this.convertRelativeYear(this.get('minYear'));
            config.maxYear = this.convertRelativeYear(this.get('maxYear'));

            this.setProperties(config);
        }.on('init'),

        setup: function() {
            this.$el = this.$();
            Em.$(document).on('mouseup.date-picker-events', Em.run.bind(this, this.clearRepeatTimers));
            Em.$(document).on('touchend.date-picker-events', Em.run.bind(this, this.clearRepeatTimers));
            Em.$(document).on('click.date-picker-events', Em.run.bind(this, this.handleDocClick));
        }.on('didInsertElement'),

        teardown: function() {
            Em.$(document).off('.date-picker-events');
        }.on('willDestroyElement'),

        handleDocClick: function(e) {
            if(this.get('_currentTarget') && 
                e.target !== this.get('_currentTarget').$el.get(0) && 
                !Em.$.contains(this.$el.get(0), e.target)) {
                this.closePicker();
            }
        },

        handleKeyDown: function(e) {
            switch(e.keyCode) {
                //enter
                case 13:
                    this.updateValue();
                    this.closePicker();
                    break;
                //esc
                case 27:
                    this.closePicker();
                    break;
            }
        }.on('keyDown'),

        clearRepeatTimers: function() {
            if(this.repeatIntervalTimer) {
                clearInterval(this.repeatIntervalTimer);
                this.repeatIntervalTimer = null;
            }

            if(this.repeatDelayTimer) {
                Em.run.cancel(this.repeatDelayTimer);
                this.repeatDelayTimer = null;
            }
        },

        convertRelativeYear: function(relValue) {
            if(typeof relValue !== 'string') {
                return relValue;
            }

            relValue = parseInt(relValue, 10);
            return !isNaN(relValue) ? new Date().getFullYear() + relValue : false;
        },

        monthDisplay: function() {
            var month = this.get('_currentMonth');
            return (month >= 0 && month <= 11) ? this.get('i18n.monthNames')[month] : null;
        }.property('_currentMonth'),

        dayDisplay: function() {
            return this.get('_currentDay');
        }.property('_currentDay'),

        yearDisplay: function() {
            return this.get('_currentYear');
        }.property('_currentYear'),

        openPicker: function(target) {
            var date;
            if(!target) return;
            this.set('_currentTarget', target);

            //if the input component defines is own settings, use them instead of the control component's settings
            this.setProperties({
                inputMinYear: typeof target.get('minYear') !== 'undefined' ? this.convertRelativeYear(target.get('minYear')) : undefined,
                inputMaxYear: typeof target.get('maxYear') !== 'undefined' ? this.convertRelativeYear(target.get('maxYear')) : undefined,
                inputDateFormat : !Em.isBlank(target.get('dateFormat')) ? target.get('dateFormat') : undefined
            });

            try {
                date = this.parseDate(this.getConfig('dateFormat'), target.get('value'));
            } catch(e) {
                date = null;
            }

            this.setCurrentValue(date);
            this.positionPicker(target.$el);
            this.set('_isOpen', true);
            Em.run.next(this, function() {
                this.set('_animate', true);
            });
        },

        closePicker: function() {
            this.setProperties({
                _animate: false,
                _currentTarget: false
            });

            Em.run.later(this, function() {
                this.set('_isOpen', false);
            }, this.get('animateDuration'));
        },

        positionPicker: function(inputEl) {
            if(!inputEl) return;

            var offset = inputEl.position(),
                height = inputEl.outerHeight();

            this.$el.css({
                top: (offset.top + height) + 'px',
                left: offset.left + 'px'
            });
        },

        selectedDate: function() {
            return this.formatDate(
                this.getConfig('dateFormat'), 
                new Date(this.get('_currentYear'), this.get('_currentMonth'), this.get('_currentDay'))
            );
        }.property('dateFormat', 'inputDateFormat', '_currentMonth', '_currentDay', '_currentYear'),

        clearValue: function() {
            if(!this.get('_currentTarget')) return;
            this.get('_currentTarget').set('value', null);
            this.get('_currentTarget').sendAction('onUpdate', null);
        },

        updateValue: function() {
            if(!this.get('_currentTarget')) return;
            this.get('_currentTarget').set('value', this.get('selectedDate'));
            this.get('_currentTarget').sendAction('onUpdate', this.get('selectedDate'));
        },

        setCurrentValue: function(date) {
            //if a date is not provided or is invalid, default to the current date
            date = date || new Date();

            this.setProperties({
                _currentMonth: date.getMonth(),
                _currentDay: date.getDate(),
                _currentYear: date.getFullYear()
            });
        },

        startAdjustment: function(prop, dir) {
            this.adjustProperty(prop, dir);

            this.repeatDelayTimer = Em.run.later(this, function() {
                this.repeatIntervalTimer = setInterval(Em.run.bind(this, function() {
                    this.adjustProperty(prop, dir);
                }), this.get('repeatInterval'));
            }, this.get('repeatDelay'));
        },

        adjustProperty: function(prop, dir) {
            var curValue,
                curDay = this.get('_currentDay'),
                daysInMonth,
                newValues = {};

            switch(prop) {
                case 'month':
                    curValue = this.get('_currentMonth');
                    if(typeof curValue !== 'number') {
                        newValues._currentMonth = (dir === 'increment') ? 0 : 11;
                    } else {
                        newValues._currentMonth = (dir == 'increment') ? 
                                (curValue >= 11 ? 0 : ++curValue) : 
                                (curValue <= 0 ? 11 : --curValue);
                    }

                    //update _currentDay if it doesn't exist in the current month/year
                    daysInMonth = this.getDaysInMonth(this.get('_currentYear'), newValues._currentMonth);
                    if(curDay > daysInMonth) {
                        newValues._currentDay = daysInMonth;
                    }
                    break;
                case 'day':
                    daysInMonth = this.getDaysInMonth(this.get('_currentYear'), this.get('_currentMonth'));
                    if(typeof curDay !== 'number') {
                        newValues._currentDay = (dir === 'increment') ? 1 : daysInMonth;
                    } else {
                        newValues._currentDay = (dir == 'increment') ? 
                                (curDay >= daysInMonth ? 1 : ++curDay) : 
                                (curDay <= 1 ? daysInMonth : --curDay);
                    }
                    break;
                case 'year':
                    curValue = this.get('_currentYear');

                    if(typeof curValue !== 'number') {
                        newValues._currentYear = (dir === 'increment') ? 
                            (typeof this.getConfig('minYear') !== 'number' ? new Date().getFullYear() : this.getConfig('minYear')) : 
                            (typeof this.getConfig('maxYear') !== 'number' ? new Date().getFullYear() : this.getConfig('maxYear'));
                    } else {
                        if(dir == 'increment') {
                            if(typeof this.getConfig('maxYear') === 'number' && curValue >= this.getConfig('maxYear')) {
                                newValues._currentYear = typeof this.getConfig('minYear') !== 'number' ? curValue : this.getConfig('minYear');
                            } else {
                                newValues._currentYear = ++curValue;
                            }
                        } else {
                            if(typeof this.getConfig('minYear') === 'number' && curValue <= this.getConfig('minYear')) {
                                newValues._currentYear = typeof this.getConfig('maxYear') !== 'number' ? curValue : this.getConfig('maxYear');
                            } else {
                                newValues._currentYear = Math.max(1, --curValue);
                            }
                        }
                    }

                    //update _currentDay if it doesn't exist in the current month/year
                    daysInMonth = this.getDaysInMonth(newValues._currentYear, this.get('_currentMonth'));
                    if(curDay > daysInMonth) {
                        newValues._currentDay = daysInMonth;
                    }
                    break;
            }

            this.setProperties(newValues);
        },

        getConfig: function(prop) {
            var inputProp = 'input' + Em.String.capitalize(prop);
            return this.get(typeof this.get(inputProp) !== 'undefined' ? inputProp : prop);
        },

        /**  
         * Lovingly stolen from jqueryUI's $.datepicker
         * @link https://github.com/jquery/jquery-ui 
         *
         * Format a date object into a string value.
         * The format can be combinations of the following:
         * d  - day of month (no leading zero)
         * dd - day of month (two digit)
         * o  - day of year (no leading zeros)
         * oo - day of year (three digit)
         * D  - day name short
         * DD - day name long
         * m  - month of year (no leading zero)
         * mm - month of year (two digit)
         * M  - month name short
         * MM - month name long
         * y  - year (two digit)
         * yy - year (four digit)
         * @ - Unix timestamp (ms since 01/01/1970)
         * ! - Windows ticks (100ns since 01/01/0001)
         * "..." - literal text
         * '' - single quote
         */
        formatDate: function (format, date) {
            if(!date) {
                return "";
            }

            var iFormat,
                dayNamesShort = this.get('i18n.dayNamesShort'),
                dayNames = this.get('i18n.dayNames'),
                monthNamesShort = this.get('i18n.monthNamesShort'),
                monthNames = this.get('i18n.monthNames'),
                // Check whether a format character is doubled
                lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if(matches) {
                        iFormat++;
                    }
                    return matches;
                },
                // Format a number, with leading zero if necessary
                formatNumber = function(match, value, len) {
                    var num = "" + value;
                    if(lookAhead(match)) {
                        while (num.length < len) {
                            num = "0" + num;
                        }
                    }
                    return num;
                },
                // Format a name, short or long as requested
                formatName = function(match, value, shortNames, longNames) {
                    return (lookAhead(match) ? longNames[value] : shortNames[value]);
                },
                output = "",
                literal = false;

            if(date) {
                for(iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal) {
                        if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                            literal = false;
                        } else {
                            output += format.charAt(iFormat);
                        }
                    } else {
                        switch (format.charAt(iFormat)) {
                            case "d":
                                output += formatNumber("d", date.getDate(), 2);
                                break;
                            case "D":
                                output += formatName("D", date.getDay(), dayNamesShort, dayNames);
                                break;
                            case "o":
                                output += formatNumber("o",
                                    Math.round(
                                        (new Date(
                                            date.getFullYear(), 
                                            date.getMonth(),
                                            date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()
                                        ) / 86400000), 
                                        3
                                    );
                                break;
                            case "m":
                                output += formatNumber("m", date.getMonth() + 1, 2);
                                break;
                            case "M":
                                output += formatName("M", date.getMonth(), monthNamesShort, monthNames);
                                break;
                            case "y":
                                output += (lookAhead("y") ? date.getFullYear() :
                                    (date.getYear() % 100 < 10 ? "0" : "") + date.getYear() % 100);
                                break;
                            case "@":
                                output += date.getTime();
                                break;
                            case "!":
                                output += date.getTime() * 10000 + this._ticksTo1970;
                                break;
                            case "'":
                                if (lookAhead("'")) {
                                    output += "'";
                                } else {
                                    literal = true;
                                }
                                break;
                            default:
                                output += format.charAt(iFormat);
                        }
                    }
                }
            }
            return output;
        },

        /**  
         * Lovingly stolen from jqueryUI's $.datepicker
         * @link https://github.com/jquery/jquery-ui 
         *
         * Parse a string value into a date object. See formatDate for the possible formats.
         */
        parseDate: function (format, value) {
            if(format === null) {
                throw "Invalid arguments";
            }

            if(value === null) {
                return null;
            }

            value = (typeof value === "object" ? value.toString() : value + "");
            if(value === "") {
                return null;
            }

            var iFormat, dim, extra,
                iValue = 0,
                shortYearCutoffTemp = this.get('_shortYearCutoff'),
                shortYearCutoff = (typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp :
                    new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
                dayNamesShort = this.get('i18n.dayNamesShort'),
                dayNames = this.get('i18n.dayNames'),
                monthNamesShort = this.get('i18n.monthNamesShort'),
                monthNames = this.get('i18n.monthNames'),
                year = -1,
                month = -1,
                day = -1,
                doy = -1,
                literal = false,
                date,
                // Check whether a format character is doubled
                lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if(matches) {
                        iFormat++;
                    }
                    return matches;
                },
                // Extract a number from the string value
                getNumber = function(match) {
                    var isDoubled = lookAhead(match),
                        size = (match === "@" ? 14 : (match === "!" ? 20 :
                        (match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
                        digits = new RegExp("^\\d{1," + size + "}"),
                        num = value.substring(iValue).match(digits);
                    if(!num) {
                        throw "Missing number at position " + iValue;
                    }
                    iValue += num[0].length;
                    return parseInt(num[0], 10);
                },
                // Extract a name from the string value and convert to an index
                getName = function(match, shortNames, longNames) {
                    var index = -1,
                        names = Em.$.map(lookAhead(match) ? longNames : shortNames, function (v, k) {
                            return [ [k, v] ];
                        }).sort(function (a, b) {
                            return -(a[1].length - b[1].length);
                        });

                    Em.$.each(names, function (i, pair) {
                        var name = pair[1];
                        if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                            index = pair[0];
                            iValue += name.length;
                            return false;
                        }
                    });
                    if(index !== -1) {
                        return index + 1;
                    } else {
                        throw "Unknown name at position " + iValue;
                    }
                },
                // Confirm that a literal character matches the string value
                checkLiteral = function() {
                    if(value.charAt(iValue) !== format.charAt(iFormat)) {
                        throw "Unexpected literal at position " + iValue;
                    }
                    iValue++;
                };

            for(iFormat = 0; iFormat < format.length; iFormat++) {
                if(literal) {
                    if(format.charAt(iFormat) === "'" && !lookAhead("'")) {
                        literal = false;
                    } else {
                        checkLiteral();
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case "d":
                            day = getNumber("d");
                            break;
                        case "D":
                            getName("D", dayNamesShort, dayNames);
                            break;
                        case "o":
                            doy = getNumber("o");
                            break;
                        case "m":
                            month = getNumber("m");
                            break;
                        case "M":
                            month = getName("M", monthNamesShort, monthNames);
                            break;
                        case "y":
                            year = getNumber("y");
                            break;
                        case "@":
                            date = new Date(getNumber("@"));
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "!":
                            date = new Date((getNumber("!") - this._ticksTo1970) / 10000);
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "'":
                            if (lookAhead("'")){
                                checkLiteral();
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }

            if(iValue < value.length){
                extra = value.substr(iValue);
                if(!/^\s+/.test(extra)) {
                    throw "Extra/unparsed characters found in date: " + extra;
                }
            }

            if(year === -1) {
                year = new Date().getFullYear();
            } else if(year < 100) {
                year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                    (year <= shortYearCutoff ? 0 : -100);
            }

            if(doy > -1) {
                month = 1;
                day = doy;
                do {
                    dim = this.getDaysInMonth(year, month - 1);
                    if(day <= dim) {
                        break;
                    }
                    month++;
                    day -= dim;
                } while (true);
            }

            date = this.daylightSavingAdjust(new Date(year, month - 1, day));
            if(date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                throw "Invalid date"; // E.g. 31/02/00
            }

            return date;
        },

        getDaysInMonth: function(year, month) {
            return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
        },

        daylightSavingAdjust: function(date) {
            if(!date) {
                return null;
            }

            date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
            return date;
        },

        actions: {
            clear: function() {
                this.clearValue();
                this.closePicker();
            },

            done: function() {
                this.updateValue();
                this.closePicker();
            },

            today: function() {
                this.setCurrentValue();
            }
        }
    });

    Ember.Handlebars.helper('date-picker-controls', DatePickerControlsComponent);
})(this);
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
Ember.TEMPLATES["components/date-picker-controls"]=Ember.Handlebars.compile("<div class=\"datepicker-controls-inner\">\n    <div class=\"datepicker-toolbar datepicker-clearfix\">\n        <button class=\"btn btn-default datepicker-btn datepicker-btn-today datepicker-left\" {{action \"today\"}}>{{i18n.today}}</button>\n        <button class=\"btn btn-primary datepicker-btn datepicker-btn-done datepicker-right\" {{action \"done\"}}>{{i18n.done}}</button>\n        <button class=\"btn btn-default datepicker-btn datepicker-btn-clear datepicker-right\" {{action \"clear\"}}>{{i18n.clear}}</button>\n    </div>\n    <div class=\"datepicker-cols-ct\">\n        <div class=\"datepicker-cols datepicker-clearfix\">\n            <div class=\"datepicker-col datepicker-col-month\">\n                {{#date-picker-col-button dateProperty=\"month\" direction=\"decrement\"}}&#9650;{{/date-picker-col-button}}\n                {{date-picker-col-input dateProperty=\"month\" value=monthDisplay}}\n                {{#date-picker-col-button dateProperty=\"month\" direction=\"increment\"}}&#9660;{{/date-picker-col-button}}\n            </div>\n            <div class=\"datepicker-col datepicker-col-day\">\n                {{#date-picker-col-button dateProperty=\"day\" direction=\"decrement\"}}&#9650;{{/date-picker-col-button}}\n                {{date-picker-col-input dateProperty=\"day\" value=dayDisplay}}\n                {{#date-picker-col-button dateProperty=\"day\" direction=\"increment\"}}&#9660;{{/date-picker-col-button}}\n            </div>\n            <div class=\"datepicker-col datepicker-col-year\">\n                {{#date-picker-col-button dateProperty=\"year\" direction=\"decrement\"}}&#9650;{{/date-picker-col-button}}\n                {{date-picker-col-input dateProperty=\"year\" value=yearDisplay}}\n                {{#date-picker-col-button dateProperty=\"year\" direction=\"increment\"}}&#9660;{{/date-picker-col-button}}\n            </div>\n        </div>\n    </div>\n</div>");
