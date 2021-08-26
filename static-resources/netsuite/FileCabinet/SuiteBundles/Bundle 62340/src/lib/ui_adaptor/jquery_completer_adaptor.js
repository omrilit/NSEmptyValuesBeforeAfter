/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ui_adaptor = ui_adaptor || {};

ui_adaptor.JqueryCompleterAdaptor = function JqueryCompleterAdaptor () {
  var completerFieldId;
  var completerTags = [];

  this.setCompleterFieldId = function setCompleterFieldId (inputFieldID) {
    completerFieldId = inputFieldID;
  };

  this.setCompleterTags = function setCompleterTags (tags) {
    completerTags = tags;
  };

  this.renderCompleter = function renderCompleter () {
    $('#' + completerFieldId).autocomplete({
      source: completerTags
    });
  };
};
