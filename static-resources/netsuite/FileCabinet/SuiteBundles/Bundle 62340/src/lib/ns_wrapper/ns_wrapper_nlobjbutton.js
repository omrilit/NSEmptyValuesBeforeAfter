/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Button = function Button (nsButton, data) {
  var button = nsButton;

  this.name = data.name;
  this.label = data.label;
  this.script = data.script;
  this.setDisabled = setDisabled;
  this.setLabel = setLabel;
  this.setVisible = setVisible;

  function setDisabled (disabled) {
    button.setDisabled(disabled);
  }

  function setLabel (label) {
    button.setLabel(label);
  }

  function setVisible (visible) {
    button.setVisible(visible);
  }

  // Constructor calls
  setDisabled(data.isDisabled);
  setVisible(data.isVisible);
};
