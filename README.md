ember-date-picker
=================

A lightweight, mobile-optimized, date picker component for ember.js applications.

**DISCLAIMER:** This is beta software and has yet to be battle tested in a wide range of environments. As such, it should be used with caution in production apps. If you encounter any bugs or browser-specific anomalies, please submit an issue or a pull request. Thanks!

Demo
----

http://billdami.github.io/ember-date-picker/

Features
--------

* Lightweight (~4k javascript / ~1k css, minified and gzipped)
* "Spinner" style UI for fast date selection
* Keyboard (up/down arrows) and mousewheel support
* Mobile-optimized slide-up panel UI on small screens (480px width and below)
* i18n/l10n support
* Handles many different date formats
* Works well with Bootstrap 3

Installation
------------

Add `dist/ember-date-picker.min.js` and `dist/ember-date-picker.min.css` to your application's javascript and css assets respectively.

Or if you use LESS, you can import `lib/styles/ember-date-picker.less`, especially if you intend to customize the component's styles.

Usage
-----

ember-date-picker is comprised of several sub-components, namely `{{date-picker-input}}` and `{{date-picker-controls}}`, for optimal efficiency and compatibility with a wide range of application structures, especially when a view contains multiple date pickers (the inputs may share a a single instance of `{{date-picker-controls}}`). With this in mind, the minimum required syntax for rendering a date picker is as follows:

```
{{date-picker-input controls="my-datepicker" value=myDate}}
{{date-picker-controls id="my-datepicker"}}
```

The `controls` parameter of the `{{date-picker-input}}` must reference the `id` of an existing `{{date-picker-controls}}` component. Note that the `id` given to the `{{date-picker-controls}}` is also used as its HTML id attribute value, so make sure that it is unique!

`{{date-picker-input}}` Parameters
-------

* **Any valid HTML text input element attribute**  
  Since `{{date-picker-input}}` renders a regular text input element, any valid HTML attribute (e.g. `value`,  `class`, `placeholder`, ect) may be provided.
* **controls** (string, required)  
  The `id` of the `{{date-picker-controls}}` component that the input is associated with.
* **dateFormat** (string, default: `"MM, d, yy"`)  
  The format for parsed and displayed dates (i.e. the `value` attribute's value). Note that if a non-blank `value` is provided to `{{date-picker-input}}` by your application, it **must** match `dateFormat`, or it will not be able to parse the provided value. See the "Date Formats" section below for a list of the possible format options.
* **minYear** (int|string|bool, default: `false`)  
  The minimum selectable year. When set to `false`, there is no minimum year. A string value may be provided to specify a year relative to the current date (e.g. `"-10"`, or `"+25"`).
* **maxYear** (int|string|bool, default: `false`)  
  The maximum selectable year. When set to `false`, there is no maximum year. A string value may be provided to specify a year relative to the current date (e.g. `"-10"`, or `"+25"`).
* **onUpdate** (string)  
  The name of an action to send when the input's value has been updated. The new value is sent as the action's only parameter.

`{{date-picker-controls}}` Parameters
-------

* **id** (string, required)  
  A unique identifier that `{{date-picker-input}}` uses to associate with the component via its `controls` parameter.
* **i18n** (object)  
  Localized text strings for the controls UI. If provided, this parameter must match exactly the structure of the default i18n object below:  
  
  ```
  {
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
  ```
* **dateFormat** (string, default: `"MM, d, yy"`)  
  The default date format for the `{{date-picker-controls}}` component. If an associated `{{date-picker-input}}` specifies its own `dateFormat`, it will override this setting while that input is active.
* **minYear** (int|string|bool, default: `false`)  
  The default minimum year for the `{{date-picker-controls}}` component. If an associated `{{date-picker-input}}` specifies its own `minYear`, it will override this setting while that input is active.
* **maxYear** (int|string|bool, default: `false`)  
  The default maximum year for the `{{date-picker-controls}}` component. If an associated `{{date-picker-input}}` specifies its own `maxYear`, it will override this setting while that input is active.



Date Formats
-----------
Internally, ember-date-picker uses [jQueryUI $.datepicker's](https://github.com/jquery/jquery-ui) date parsing and formatting functions, and as result supports the same format options. A `dateFormat` value may be a combination of the following:

String        | Description
------------- | -----------
d             | day of month (no leading zero)
dd            | day of month (two digit)
o             | day of year (no leading zeros)
oo            | day of year (three digit)
D             | day name short
DD            | day name long
m             | month of year (no leading zero)
mm            | month of year (two digit)
M             | month name short
MM            | month name long
y             | year (two digit)
yy            | year (four digit)
@             | Unix timestamp (ms since 01/01/1970)
!             | Windows ticks (100ns since 01/01/0001)
"..."         | literal text
''            | single quote
anything else | literal text
