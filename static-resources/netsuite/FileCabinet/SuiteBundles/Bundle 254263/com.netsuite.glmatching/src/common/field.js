/**
 * @copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope SameAccount
 */
define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.createFieldAdder = void 0;

  var isEmpty = function isEmpty(x) {
    return typeof x === "string" && x !== "";
  };

  function addField(options, form) {
    var field = form.addField({
      container: options.container,
      id: options.id,
      label: options.label,
      source: options.source,
      type: options.type
    });

    if (options.help) {
      field.setHelpText({
        help: options.help
      });
    }

    if (Array.isArray(options.options)) {
      options.options.forEach(function (option) {
        return field.addSelectOption(option);
      });
    }

    if (isEmpty(options.defaultValue)) {
      field.defaultValue = String(options.defaultValue);
    }

    if (options.displayType) {
      field.updateDisplayType({
        displayType: options.displayType
      });
    }

    if (options.breakType) {
      field.updateBreakType({
        breakType: options.breakType
      });
    }

    if (options.layoutType) {
      field.updateLayoutType({
        layoutType: options.layoutType
      });
    }

    if (options.height !== undefined || options.width !== undefined) {
      field.updateDisplaySize({
        height: options.height || 1,
        width: options.width || 1
      });
    }

    field.isMandatory = Boolean(options.isMandatory);
    return field;
  }

  var createFieldAdder = function createFieldAdder(form) {
    return function (options) {
      return addField(options, form);
    };
  };

  _exports.createFieldAdder = createFieldAdder;
});