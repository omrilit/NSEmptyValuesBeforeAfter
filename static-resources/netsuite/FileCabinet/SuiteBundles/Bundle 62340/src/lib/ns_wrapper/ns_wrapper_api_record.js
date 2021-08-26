/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This module wraps NetSuite Record APIs
 *
 * @author fkyao
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.api = ns_wrapper.api || {};
ns_wrapper.api.record = ns_wrapper.api.record || {};

ns_wrapper.api.record.getNewRecord = function getNewRecord () {
  return new ns_wrapper.Record(nlapiGetNewRecord());
};

ns_wrapper.api.record.getOldRecord = function getOldRecord () {
  var oldRecord = nlapiGetOldRecord();
  var recordObj;
  if (oldRecord) {
    recordObj = new ns_wrapper.Record(oldRecord);
  }
  return recordObj;
};

ns_wrapper.api.record.deleteRecord = function deleteRecord (type, id) {
  return nlapiDeleteRecord(type, id);
};

ns_wrapper.api.record.getRecordType = function getRecordType () {
  return nlapiGetRecordType();
};

ns_wrapper.api.record.attachRecord = function attachRecord (attachmentType, attachmentId, attachToType, attachToId, attributes) {
  try {
    nlapiAttachRecord(attachmentType, attachmentId, attachToType, attachToId, attributes);
  } catch (e) {
    var errorCode = 'DUNNING_REC_API_WRAPPER_ATTACHREC_ERROR';
    var errorDetails = 'An error has occurred in Record API Wrapper - ns_wrapper.api.record.attachRecord. Details: ' + JSON.stringify(e);

    nlapiLogExecution('ERROR', errorCode, errorDetails);
    throw nlapiCreateError(errorCode, e.errorDetails);
  }
  return true;
};

ns_wrapper.api.record.getRecordId = function getRecordId () {
  return nlapiGetRecordId();
};
