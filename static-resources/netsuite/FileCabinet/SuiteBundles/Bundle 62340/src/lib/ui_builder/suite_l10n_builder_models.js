/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.ui_builder = suite_l10n.ui_builder || {};

suite_l10n.ui_builder.ButtonDefinition = function ButtonDefinition () {
  return {
    id: null,
    name: null
  };
};

suite_l10n.ui_builder.FieldDefinition = function FieldDefinition () {
  return {
    name: null,
    label: null,
    type: null,
    mandatory: false,
    maxLength: null,
    linkText: null,
    size: {
      width: null,
      height: null
    },
    padding: null,
    layoutType: null,
    breakType: null,
    displayType: null,
    options: [],
    alias: null,
    help: {
      text: null,
      isInline: false
    },
    value: null
  };
};
