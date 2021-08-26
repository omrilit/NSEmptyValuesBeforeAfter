/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This module wraps NetSuite SuiteFlow APIs
 *
 * @author cboydon
 */

var ns_wrapper = ns_wrapper || {};
ns_wrapper.api = ns_wrapper.api || {};
ns_wrapper.api.wf = ns_wrapper.api.wf || {};

ns_wrapper.api.wf.initiateWorkflow = function initiateWorkflow (recordtype, id, workflowid) {
  return nlapiInitiateWorkflow(recordtype, id, workflowid);
};

ns_wrapper.api.wf.triggerWorkflow = function triggerWorkflow (recordtype, id, workflowid, actionid) {
  return nlapiTriggerWorkflow(recordtype, id, workflowid, actionid);
};
