/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope public
 */

define([
  'N/ui/serverWidget',
  'N/runtime'
],
function (ui_serverWidget, N_runtime) {
  'use strict';

  const Type = {
    ALERT: 'alert',
    INFORMATION: 'information'
  };

  return {
    /**
     * @constant
     */
    DEFAULT_NAME: 'flash_message',

    /**
     * @constant
     * @enum {string}
     */
    Type: Type,

    /**
     * @param {string} [name]
     * @returns {string}
     */
    defaultName: function (name) {
      return name || this.DEFAULT_NAME;
    },

    /**
     * @param {module:N/ui/serverWidget.Form} form
     * @param {string} [name]
     */
    attachToForm: function (form, name) {
      const _name = this.defaultName(name);
      const value = this.pop(name);

      if (value) {
        const field = form.addField({
          id: 'custpage_' + _name,
          type: ui_serverWidget.FieldType.LONGTEXT,
          label: _name
        });
        field.defaultValue = JSON.stringify(value);
        field.updateDisplayType({
          displayType: ui_serverWidget.FieldDisplayType.HIDDEN
        });
      }
    },

    /**
     * Reads and removes given flash message
     * @param {string} [name]
     * @returns {*}
     */
    pop: function (name) {
      const session = N_runtime.getCurrentSession();
      const value = session.get({
        name: this.defaultName(name)
      });
      var data = null;

      try {
        if (value) {
          data = JSON.parse(value);
        }
      } catch (e) {
        // JSON.parse exceptions are fine
      }

      this.remove(name);

      return data;
    },

    /**
     * @param {*} data
     * @param {string} [name]
     */
    put: function (data, name) {
      const session = N_runtime.getCurrentSession();
      session.set({
        name: this.defaultName(name),
        value: JSON.stringify(data)
      });
    },

    /**
     * @param {string} [name]
     */
    remove: function (name) {
      this.put(null, name);
    },

    /**
     * @param {string} title
     * @param {string} message
     * @param {string} [name]
     */
    alert: function (title, message, name) {
      const data = {
        flash: Type.ALERT,
        title: title,
        message: message
      };
      this.put(data, name);
    },

    /**
     * @param {string} title
     * @param {string} message
     * @param {string} [name]
     */
    information: function (title, message, name) {
      const data = {
        flash: Type.INFORMATION,
        title: title,
        message: message
      };
      this.put(data, name);
    }
  };
});
