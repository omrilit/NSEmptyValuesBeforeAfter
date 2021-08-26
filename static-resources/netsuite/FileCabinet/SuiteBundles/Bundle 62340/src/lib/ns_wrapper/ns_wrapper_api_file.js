/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author fkyao
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.api = ns_wrapper.api || {};
ns_wrapper.api.file = ns_wrapper.api.file || {};

ns_wrapper.api.file.submitFile = function submitFile (file) {
  return nlapiSubmitFile(file);
};

ns_wrapper.api.file.createFile = function createFile (filename, fileType, fileContent) {
  var file = nlapiCreateFile(filename, fileType, fileContent);

  return new ns_wrapper.File(null, file);
};
