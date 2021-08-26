/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope public
 */

define([
  'N/ui/message',
  'N/currentRecord',
  'N/runtime',

  '../../constants'
], function (nMessage, nCurrentRecord, nRuntime, C) {
  const VALIDATION = C.EMAIL_FIELDS_SU.VALIDATION;

  var T = {
    'aef.cs.error.title': null,
    'aef.cs.error.message': null,
    'aef.cs.duplicate.title': null,
    'aef.cs.duplicate.message': null,
    'aef.cs.confirm.title': null,
    'aef.cs.confirm.message': null
  };

  var getURLParameter = function (name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
  };

  var loadTranslations = function () {
    T = JSON.parse(nCurrentRecord.get().getValue({fieldId: C.EMAIL_FIELDS_SU.FIELDS.TRANSLATIONS}));
  };

  return {
    pageInit: function () {
      var error = getURLParameter(C.EMAIL_FIELDS_SU.FIELD_VALID);
      loadTranslations();

      if (error === VALIDATION.NOT_VALID) {
        nMessage.create({
          title: T['aef.cs.error.title'],
          message: T['aef.cs.error.message'],
          type: nMessage.Type.ERROR
        }).show({
          duration: 5000
        });
      } else if (error === VALIDATION.VALID) {
        nMessage.create({
          title: T['aef.cs.confirm.title'],
          message: T['aef.cs.confirm.message'],
          type: nMessage.Type.CONFIRMATION
        }).show({
          duration: 5000
        });
      } else if (error === VALIDATION.DUPLICATE) {
        nMessage.create({
          title: T['aef.cs.duplicate.title'],
          message: T['aef.cs.duplicate.message'],
          type: nMessage.Type.WARNING
        }).show({
          duration: 5000
        });
      }
    }
  };
});
