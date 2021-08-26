/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * Module Description
 * Utility class for handling record fields
 *
 * @author cboydon
 */

var suite_l10n = suite_l10n || {};
suite_l10n.field = suite_l10n.field || {};

suite_l10n.field.FieldToggler = function FieldToggler () {
  this.enableFields = function (fieldSet) {
    _fieldToggler(fieldSet.enabled, false);
  };

  this.disableFields = function (fieldSet) {
    _fieldToggler(fieldSet.disabled, true);
  };

  function _fieldToggler (fields, flag) {
    if (!fields.length || fields.length > 0) {
      for (var i = 0; i < fields.length; i++) {
        nlapiDisableField(fields[i], flag);
      }
    }
  }
};
