/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.ui_builder = suite_l10n.ui_builder || {};

suite_l10n.ui_builder.FieldBuilder = function FieldBuilder () {
  function setupValidators (field, data) {
    field.setMandatory(data.mandatory);

    if (data.maxlength) {
      field.setMaxLength(data.maxlength);
    }
  }

  function setupDisplay (field, data) {
    if (data.label) {
      field.setLabel(data.label);
    }

    if (data.setLinkText) {
      field.setLinkText(data.linkText);
    }

    if (data.size && data.size.length && data.size.width) {
      field.setDisplaySize(data.size);
    }

    if (data.padding) {
      field.setPadding(data.padding);
    }

    if (data.layoutType || data.breakType) {
      field.setLayoutType(data.layoutType, data.breakType);
    }

    if (data.displayType) {
      field.setDisplayType(data.displayType);
    }
  }

  function buildField (field, data) {
    setupValidators(field, data);
    setupDisplay(field, data);

    field.addOptions(data.options || []);
    field.setAlias(data.alias);
    field.setHelp(data.help);
    field.setValue(data.value);

    return field;
  }

  return {
    buildField: buildField
  };
};
