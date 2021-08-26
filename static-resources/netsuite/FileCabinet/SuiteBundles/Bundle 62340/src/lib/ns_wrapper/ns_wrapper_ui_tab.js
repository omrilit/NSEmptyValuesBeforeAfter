/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Tab = function Tab () {
  var uiAdaptor;

  this.setUIAdaptor = function setUIAdaptor (adaptor) {
    uiAdaptor = adaptor;
  };

  this.setTabSource = function setTabSource (source) {
    uiAdaptor.setTabSource(source);
  };

  this.renderTabs = function renderTabs () {
    uiAdaptor.renderTabs();
  };
};
