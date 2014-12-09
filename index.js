/* jshint node: true */
'use strict';

var fs = require('fs');

module.exports = {
  name: 'ember-date-picker',

  included: function(app) {
    this.app = app;
    app.import('vendor/ember-date-picker.css');

    var spinBoxJsPath  = app.bowerDirectory + '/ember-spin-box/dist/ember-spin-box.min.js';
    var spinBoxCssPath = app.bowerDirectory + '/ember-spin-box/dist/ember-spin-box.min.css';

    if (!fs.existsSync(spinBoxJsPath) && !fs.existsSync(spinBoxCssPath)) {
      var msg = 'ember-date-picker: You need to run ember g date-picker to ';
      msg += 'install required dependencies before using this addon.';
      var err = new Error(msg);
      err.stack = null;
      throw err;
    }
    app.import(spinBoxJsPath);
    app.import(spinBoxCssPath);
  }
};
