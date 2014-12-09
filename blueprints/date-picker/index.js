'use strict';

module.exports = {
  description: 'date-picker',

  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackageToProject('ember-spin-box');
  }
};
