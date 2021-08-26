/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ui_adaptor = ui_adaptor || {};

ui_adaptor.CKEditor_Adaptor = function Editor_Adaptor () {
  var sourceId;

  this.setSource = function setSource (source) {
    sourceId = source;
  };

  this.renderEditor = function renderEditor () {
    CKEDITOR.replace(sourceId);
  };
};
