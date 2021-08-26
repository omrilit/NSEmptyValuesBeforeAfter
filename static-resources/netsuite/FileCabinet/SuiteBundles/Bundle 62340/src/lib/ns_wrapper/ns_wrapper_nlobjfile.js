/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.File = function File (fileId, file) {
  var nlFile = file || nlapiLoadFile(fileId);

  function loadFile () {
    if (!nlFile) { nlFile = nlapiLoadFile(fileId); }
  }

  this.getValue = function () {
    loadFile();
    return nlFile.getValue();
  };

  this.getFile = function () {
    loadFile();
    return nlFile;
  };
};
