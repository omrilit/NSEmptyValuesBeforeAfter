/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Completer = function Completer () {
  var uiAdaptor;

  this.setUIAdaptor = function setUIAdaptor (adaptor) {
    uiAdaptor = adaptor;
  };

  this.setCompleterFieldId = function setCompleterFieldId (inputFieldID) {
    uiAdaptor.setCompleterFieldId(inputFieldID);
  };

  this.setCompleterTags = function setCompleterTags (tags) {
    uiAdaptor.setCompleterTags(tags);
  };

  this.renderCompleter = function renderCompleter () {
    uiAdaptor.renderCompleter();
  };
};
