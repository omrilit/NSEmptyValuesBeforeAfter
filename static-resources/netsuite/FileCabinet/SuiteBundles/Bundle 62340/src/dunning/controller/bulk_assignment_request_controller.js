/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This controller handles the request for bulk assignment of a dunning procedure; whether to update
 * the customers or invoices directly or via the job engine.
 *
 * When assigning in bulk, if the number of customers or invoices to update is too many, the use
 * of the job engine might be needed; otherwise, proceed with updating them directly.
 *
 * The threshold when to use the job engine can be set in the Localization Variable: Bulk Assignment
 * Threshold
 */

var dunning = dunning || {};
dunning.controller = dunning.controller || {};

dunning.controller.BulkAssignmentRequestController = function BulkAssignmentRequestController (request) {
  var REQUEST_ADAPTER = 'dunning.app.BulkAssignmentRequestAdapter';

  var BULK_ASSIGNMENT_DIRECT_UPDATE_THRESHOLD = 'BULK_ASSIGNMENT_DIRECT_UPDATE_THRESHOLD';

  var CUSTOMER = 'customer';
  var INVOICE = 'invoice';

  var systemParameters;
  var appliesToType = {};
  var directUpdateThreshold;

  function loadL10nVars () {
    loadSystemParameters();
    loadAppliesToTypeIds();
  }

  function loadSystemParameters () {
    var SYSPAR_TYPE = 'syspar_type';
    if (!systemParameters) {
      systemParameters = new suite_l10n.variable.LocalizationVariableList(SYSPAR_TYPE);
    }
  }

  function loadAppliesToTypeIds () {
    var APPLIES_TO = 'dunning_source';

    var appliesToTypes = new suite_l10n.variable.LocalizationVariableList(APPLIES_TO);
    appliesToType[appliesToTypes.getIdByValue(CUSTOMER)] = CUSTOMER;
    appliesToType[appliesToTypes.getIdByValue(INVOICE)] = INVOICE;
  }

  function loadDirectUpdateThreshold () {
    loadL10nVars();
    directUpdateThreshold = Number(systemParameters
      .getValue(BULK_ASSIGNMENT_DIRECT_UPDATE_THRESHOLD));
  }

  this.selectBulkAssignmentMethod = function () {
    loadDirectUpdateThreshold();
    var params = getRecordSublistParams();
    var recsToUpdate = params.recordIdsToUpdate;
    var recordsToUpdateCount = recsToUpdate.length;

    // Do nothing when there are no records to update
    // TODO ADD COMPUTATION HERE IF THIS IS LOWER THAN THE DIRECT UPDATE THRESHOLD
    // TODO IF YES, CHECK ALSO IF THIS CAN BE DONE WITHOUT HITTING THE GOV LIMIT
    // TODO IF YES ALSO, PROCEED
    if (recordsToUpdateCount <= directUpdateThreshold && recordsToUpdateCount > 0) {
      // Do direct record update
      updateRecordsDirectly(params);
    } else if (recordsToUpdateCount > directUpdateThreshold) {
      // Use Job Engine
      updateViaJobEngine(params);
    }
  };

  function getRecordSublistParams () {
    var requestAdapterFactory = new suite_l10n.request.RequestAdapterFactory(REQUEST_ADAPTER);
    var requestAdapter = requestAdapterFactory.getRequestAdapter();

    return requestAdapter.extract(request, appliesToType);
  }

  function updateRecordsDirectly (params) {
    // TODO UPDATE 1 RECORD FIRST THEN CHECK FOR ACTUAL CURRENT [NLAPISUBMITFIELD_USG]
    // TODO IF DIFFERENT, UPDATE [NLAPISUBMITFIELD_USG]. ELSE, JUST PROCEED
    // TODO IF DIFFERENT, RECOMPUTE AGAIN THEN DECIDE IF FOR DIRECT UPDATE OR JOB ENGINE
    var bulkAssignerData = new dunning.view.BulkAssignerData();
    bulkAssignerData.recordIdsToUpdate = params.recordIdsToUpdate;
    bulkAssignerData.dunningProcedureId = params.dunningProcedureId;

    bulkAssignerData.dao = new dunning.view.BULK_ASSIGNMENT_CLASS_MAP[params.recordType]['dao']();
    bulkAssignerData.modelClass = dunning.view.BULK_ASSIGNMENT_CLASS_MAP[params.recordType]['model'];

    var directUpdater = new dunning.app.BulkAssigner(bulkAssignerData);
    directUpdater.bulkAssignDunningProcedure();
  }

  function updateViaJobEngine (params) {
    var jobGenerator = new infra.app.JobGenerator();
    var jobParams = createJobParameters(params);
    jobGenerator.runWithParameters(jobParams);
  }

  function createJobParameters (params) {
    var jobParam = new view.JobParameters();

    jobParam.addParameter(new view.Property('dunningProcedureId', Number(params.dunningProcedureId).toFixed()));
    jobParam.addParameter(new view.Property('recordIdsToUpdate', params.recordIdsToUpdate));
    jobParam.addParameter(new view.Property('recordType', params.recordType));

    jobParam.jobRule = getBulkAssignmentJobRuleId(params);

    return jobParam;
  }

  function getBulkAssignmentJobRuleId (params) {
    var PLUGIN_IMPL = 'custrecord_l10n_plugin_impl';
    var filterName = dunning.view.BULK_ASSIGNMENT_CLASS_MAP[params.recordType]['pluginImpl'];

    var jobRuleSearch = new ns_wrapper.Search('customrecord_l10n_job_rule');
    jobRuleSearch.addFilter(PLUGIN_IMPL, 'is', filterName);

    var iterator = jobRuleSearch.getIterator();
    var jobRule = iterator.next();
    return jobRule.getId();
  }
};
