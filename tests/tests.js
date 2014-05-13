/**
 * initial component properties
 * value: "May 15, 2014"
 * dateFormat: "MM d, yy"
 */

module('Controls toggling', {
    setup: function() {
        App.reset();
        visit('/');
    }
});

test('focusing input shows the controls', function() {
    expect(1);
    openControls();

    andThen(function() {
        ok(find('div.datepicker-controls').is(':visible'), 'controls are visible');
    });
});

test('clicking elsewhere in the document hides the controls', function() {
    expect(1);
    openControls();
    click(document);

    andThen(function() {
        ok(find('div.datepicker-controls').is(':hidden'), 'controls are hidden');
    });
});

module('Date selection', {
    setup: function() {
        App.reset();
        visit('/');
        openControls();
    }
});

test('controls display the current date value', function() {
    expect(1);
    
    andThen(function() {
        equal(
            find('input.datepicker-col-input-month').val() + ' ' +
                find('input.datepicker-col-input-day').val() + ', ' +
                find('input.datepicker-col-input-year').val(), 
            'May 15, 2014'
        );
    });
});

test('clicking "Today" button sets current date as the selected date', function() {
    var monthNames = ["January", "February", "March", "April", "May", "June",  "July", "August", "September", "October", "November", "December"],
        date = new Date(),
        currentDate = monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

    expect(1);
    click('button.datepicker-btn-today');

    andThen(function() {
        equal(
            find('input.datepicker-col-input-month').val() + ' ' +
                find('input.datepicker-col-input-day').val() + ', ' +
                find('input.datepicker-col-input-year').val(), 
            currentDate
        );
    });
});

test('clicking month decrement button selects previous month', function() {
    expect(1);
    click('.datepicker-col-month button.datepicker-col-btn:eq(0)');

    andThen(function() {
        equal(find('input.datepicker-col-input-month').val(), 'April');
    });
});

test('clicking month increment button selects the next month', function() {
    expect(1);
    click('.datepicker-col-month button.datepicker-col-btn:eq(1)');

    andThen(function() {
        equal(find('input.datepicker-col-input-month').val(), 'June');
    });
});

test('pressing up arrow on month input selects previous month', function() {
    expect(1);
    keyEvent('input.datepicker-col-input-month', 'keydown', 38);

    andThen(function() {
        equal(find('input.datepicker-col-input-month').val(), 'April');
    });
});

test('pressing down arrow on month input selects next month', function() {
    expect(1);
    keyEvent('input.datepicker-col-input-month', 'keydown', 40);

    andThen(function() {
        equal(find('input.datepicker-col-input-month').val(), 'June');
    });
});

test('clicking day decrement button selects previous day', function() {
    expect(1);
    click('.datepicker-col-day button.datepicker-col-btn:eq(0)');

    andThen(function() {
        equal(find('input.datepicker-col-input-day').val(), '14');
    });
});

test('clicking day increment button selects the next day', function() {
    expect(1);
    click('.datepicker-col-day button.datepicker-col-btn:eq(1)');

    andThen(function() {
        equal(find('input.datepicker-col-input-day').val(), '16');
    });
});

test('pressing up arrow on day input selects previous day', function() {
    expect(1);
    keyEvent('input.datepicker-col-input-day', 'keydown', 38);

    andThen(function() {
        equal(find('input.datepicker-col-input-day').val(), '14');
    });
});

test('pressing down arrow on day input selects next day', function() {
    expect(1);
    keyEvent('input.datepicker-col-input-day', 'keydown', 40);

    andThen(function() {
        equal(find('input.datepicker-col-input-day').val(), '16');
    });
});

test('clicking year decrement button selects previous year', function() {
    expect(1);
    click('.datepicker-col-year button.datepicker-col-btn:eq(0)');

    andThen(function() {
        equal(find('input.datepicker-col-input-year').val(), '2013');
    });
});

test('clicking year increment button selects the next year', function() {
    expect(1);
    click('.datepicker-col-year button.datepicker-col-btn:eq(1)');

    andThen(function() {
        equal(find('input.datepicker-col-input-year').val(), '2015');
    });
});

test('pressing up arrow on year input selects previous year', function() {
    expect(1);
    keyEvent('input.datepicker-col-input-year', 'keydown', 38);

    andThen(function() {
        equal(find('input.datepicker-col-input-year').val(), '2013');
    });
});

test('pressing down arrow on year input selects next year', function() {
    expect(1);
    keyEvent('input.datepicker-col-input-year', 'keydown', 40);

    andThen(function() {
        equal(find('input.datepicker-col-input-year').val(), '2015');
    });
});

module('Date update', {
    setup: function() {
        App.reset();
        visit('/');
        openControls();
    }
});

test('clicking "Clear" button clears the input\'s value', function() {
    expect(1);
    click('button.datepicker-btn-clear');

    andThen(function() {
        equal(find('input.datepicker-input').val(), '');
    });
});

test('changing the selected date and clicking "Done" button updates the input\'s value', function() {
    expect(1);
    click('.datepicker-col-month button.datepicker-col-btn:eq(1)');
    click('.datepicker-col-day button.datepicker-col-btn:eq(1)');
    click('.datepicker-col-year button.datepicker-col-btn:eq(1)');
    click('button.datepicker-btn-done');

    andThen(function() {
        equal(find('input.datepicker-input').val(), 'June 16, 2015');
    });
});

function openControls() {
    triggerEvent('input.datepicker-input', 'focus');
}