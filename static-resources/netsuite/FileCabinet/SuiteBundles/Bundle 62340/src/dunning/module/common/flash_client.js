/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  'N/ui/dialog',
  'N/ui/message'
],
function (N_dialog, N_message) {
  'use strict';

  return {

    /**
     * @private
     * @constant
     */
    DEFAULT_NAME: 'flash_message',

    /**
     * @param {Object} data
     * @private
     */
    alert: function (data) {
      N_dialog.alert({
        title: data.title,
        message: data.message
      });
    },

    /**
     * @param {Object} data
     * @param {string} type
     * @private
     */
    message: function (data, type) {
      N_message.create({
        title: data.title,
        message: data.message,
        type: type
      }).show();
    },

    warning: function (data, duration) {
      N_message.create({
        title: data.title,
        message: data.message,
        type: N_message.Type.WARNING
      }).show({duration: duration || 0});
    },

    /**
     * @param {Element} document
     * @param {string} [name]
     */
    show: function (document, name) {
      name = name || this.DEFAULT_NAME;
      const input = document.querySelector('input[name="custpage_' + name + '"]');
      if (!input) {
        return;
      }

      var data = null;

      try {
        data = JSON.parse(input.value);
      } catch (e) {
        // JSON.parse exceptions are fine
        return;
      }

      /* istanbul ignore next: cant reach */
      if (!data || !data.flash) {
        return;
      }

      switch (data.flash) {
        case 'alert':
          this.alert(data);
          break;
        case 'information':
          this.message(data, N_message.Type.INFORMATION);
          break;
      }
    }
  };
});
