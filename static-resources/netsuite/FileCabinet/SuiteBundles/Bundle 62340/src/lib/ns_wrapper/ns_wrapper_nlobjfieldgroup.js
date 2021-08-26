/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.FieldGroup = function SubList (nlFieldGroup, data) {
  var obj = {
    name: data.name,
    label: data.label,
    setCollapsible: setCollapsible,
    setLabel: setLabel,
    setShowBorder: setShowBorder,
    setSingleColumn: setSingleColumn
  };

  function setSingleColumn (column) {
    nlFieldGroup.setSingleColumn(column);
  }

  function setShowBorder (show) {
    nlFieldGroup.setShowBorder(show);
  }

  function setCollapsible (collapsible, hidden) {
    nlFieldGroup.setCollapsible(collapsible, hidden);
  }

  function setLabel (newLabel) {
    nlFieldGroup.setLabel(newLabel);
    data.label = newLabel;
    obj.label = newLabel;
  }

  function init () {
    setCollapsible(data.collapsible, data.hidden);
    setShowBorder(data.showBorder);
    setSingleColumn(data.singleColumn);
  }

  init();
  return obj;
};
