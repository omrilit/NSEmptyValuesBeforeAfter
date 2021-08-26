/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This is an XML Validator. Validates the given XML file against the given XSD file.
 * Returns a process result object containing the result and message
 *
 * @author mjaurigue
 */

var ns_wrapper = ns_wrapper || {};

ns_wrapper.XMLValidator = function XMLValidator (xsdId) {
  var xsdFileId = xsdId;
  var schemaFolderId;

  this.setSchemaFolderId = function setSchemaFolderId (id) {
    schemaFolderId = id;
  };

  this.validate = function validate (xmlFileId) {
    var result = new suite_l10n.process.ProcessResult();
    try {
      var xmlFile = nlapiLoadFile(xmlFileId);
      var xmlDocument = nlapiStringToXML(xmlFile.getValue());

      var xsdFile = nlapiLoadFile(xsdFileId);
      var xsdDocument = nlapiStringToXML(xsdFile.getValue());

      nlapiValidateXML(xmlDocument, xsdDocument, schemaFolderId);
      result.success = true; // This will not be reached when an exception is thrown
    } catch (e) {
      nlapiLogExecution('ERROR', 'XML Validation Failed: ' + e.getCode(), e.getDetails());
      result.message = e;
    }

    return result;
  };
};
