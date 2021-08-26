/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ui_adaptor = ui_adaptor || {};

ui_adaptor.JqueryTabAdaptor = function JqueryTabAdaptor () {
  var tabSource;

  /* TABS */
  this.setTabSource = function setTabSource (source) {
    tabSource = source;
  };

  this.renderTabs = function renderTabs () {
    $('#' + tabSource).tabs();
  };
};
