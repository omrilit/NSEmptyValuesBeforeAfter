/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Field = function Field (nsField, data) {
  var field = nsField;

  var obj = {
    name: data.name,
    label: data.label,
    type: data.type,

    setMandatory: setMandatory,
    setMaxLength: setMaxLength,
    setLabel: setLabel,
    setLinkText: setLinkText,
    setDisplaySize: setDisplaySize,
    setPadding: setPadding,
    setLayoutType: setLayoutType,
    setDisplayType: setDisplayType,
    addOptions: addOptions,
    setAlias: setAlias,
    setHelp: setHelp,
    setValue: setValue
  };

  function addOptions (options) {
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      field.addSelectOption(option.value, option.text, option.selected ? option.selected : false);
    }
  }

  function setLayoutType (layoutType, breakType) {
    if (layoutType && layoutType.length > 0) {
      field.setLayoutType(layoutType, breakType);
    } else if (breakType && breakType.langth > 0) {
      field.setBreakType(breakType);
    }
  }

  function setValue (value) {
    field.setDefaultValue(value);
  }

  function setHelp (help) {
    field.setHelpText(help.text, help.isInline);
  }

  function setDisplaySize (size) {
    if (size) {
      field.setDisplaySize(size.width, size.height);
    }
  }

  function setMandatory (isMandatory) {
    field.setMandatory(isMandatory);
  }

  function setMaxLength (maxLength) {
    field.setMaxLength(maxLength);
  }

  function setLabel (label) {
    field.setLabel(label);
  }

  function setDisplayType (displayType) {
    field.setDisplayType(displayType);
  }

  function setPadding (padding) {
    field.setPadding(padding);
  }

  function setLinkText (linkText) {
    field.setLinkText(linkText);
  }

  function setAlias (alias) {
    field.setAlias(alias);
  }

  // Constructor Calls
  if (data.displayType) {
    setDisplayType(data.displayType);
  }

  if (data.mandatory) {
    setMandatory(data.mandatory);
  }

  if (data.value) {
    setValue(data.value);
  }

  if (data.size) {
    setDisplaySize(data.size);
  }

  return obj;
};
