/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.Editor = function Editor () {
  var uiAdaptor;

  this.setUIAdaptor = function setUIAdaptor (adaptor) {
    uiAdaptor = adaptor;
  };

  this.setSource = function setSource (sourceId) {
    uiAdaptor.setSource(sourceId);
  };

  this.renderEditor = function renderEditor () {
    uiAdaptor.renderEditor();
  };
};
