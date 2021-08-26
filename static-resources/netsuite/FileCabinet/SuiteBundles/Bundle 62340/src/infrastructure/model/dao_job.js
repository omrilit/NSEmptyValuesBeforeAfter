/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dao = dao || {};

dao.JobDAO = function JobDAO () {
  var statelist = new suite_l10n.variable.LocalizationVariableList('job_state');
  var recordId = 'customrecord_l10n_job';
  var fields = {
    'id': 'internalid',
    'name': 'name',
    'state': 'custrecord_l10n_job_state',
    'jobRuleId': 'custrecord_l10n_job_rule',
    'startDate': 'custrecord_l10n_job_start_date',
    'endDate': 'custrecord_l10n_job_end_date',
    'govUsagePerTask': 'custrecord_l10n_job_gov_usage',
    'totalDataCount': 'custrecord_l10n_data_count',
    'runNow': 'custrecord_l10n_job_run_now'

  };

  var jobPropertySublist = {};
  jobPropertySublist.id = 'recmachcustrecord_l10n_job_prop_parent';
  jobPropertySublist.fields = {
    'id': 'internalid',
    'name': 'name',
    'value': 'custrecord_l10n_job_prop_value',
    'isSysProp': 'custrecord_l10n_sys_prop',
    'isData': 'custrecord_l10n_is_data',
    'jobId': 'custrecord_l10n_job_prop_parent'
  };

  this.create = function create (job) {
    job.state = statelist.getIdByValue(model.JOB_STATE.JOB_NOT_STARTED);
    var initObj = _createFieldNVPairs(job);
    var rec = new ns_wrapper.Record(recordId);
    rec.setRecordFields(initObj);

    var jobProperties = job.getJobProperties();

    for (var i in jobProperties) {
      var jobProperty = jobProperties[i];
      jobProperty.setFieldMap(jobPropertySublist.fields);

      rec.addSublistRecordField(jobPropertySublist.id, jobProperty);
    }

    return rec.saveRecord();
  };

  this.retrieve = function retrieve (id) {
    var rec = new ns_wrapper.Record(recordId);
    var jobRec = rec.loadRecord(id);

    return _castAsJob(jobRec);
  };

  this.retrieveAll = function retrieveAll () {
    var search = new ns_wrapper.Search(recordId);
    for (var i in fields) {
      search.addColumn(fields[i]);
    }

    return _retrieveElements(search.getIterator());
  };

  this.retrieveQueuedJobs = function retrieveQueuedJobs () {
    var search = new ns_wrapper.Search(recordId);

    for (var i in fields) {
      search.addColumn(fields[i]);
    }

    search.addFilter('custrecord_l10n_job_state', 'noneof', [statelist.getId('Job Completed')]);

    var sortFields = [{name: 'custrecord_l10n_job_start_date'}, {name: 'internalid'}];
    search.setSort(sortFields);

    return _retrieveElements(search.getIterator());
  };

  this.update = function update (job) {
    var initObj = _createFieldNVPairs(job);
    var rec = new ns_wrapper.Record(recordId);
    return rec.updateRecord(initObj);
  };

  this.remove = function remove (job) {
    var rec = new ns_wrapper.Record(recordId);
    return rec.deleteRecord(job.id);
  };

  this.updateJobStatus = function updateJobStatus (jobID, jobStatus) {
    var fieldAPI = ns_wrapper.api.field;
    fieldAPI.submitField(recordId, jobID, fields.state, jobStatus, false);
  };

  function _createFieldNVPairs (obj) {
    var initObj = [];
    for (var i in obj) {
      initObj.push({'id': [fields[i]], 'value': obj[i]});
    }

    return initObj;
  }

  function _retrieveElements (iterator) {
    var elements = [];
    while (iterator.hasNext()) {
      elements.push(iterator.next());
    }

    return elements;
  }

  function _castAsJob (obj, isSearchResult) {
    if (!obj) {
      return null;
    }

    var job = new model.Job();

    for (var ifield in fields) {
      var fieldId = fields[ifield];

      job[ifield] = isSearchResult ? obj.getValue(fieldId) : obj.getFieldValue(fieldId);
    }

    if (!isSearchResult) {
      job.id = obj.getId();
    }

    // For getting the sublists. Move this to another method (not yet used on search results. I'm not sure yet how)
    if (!isSearchResult) {
      var lineItems = obj.getAllLineItems();

      if (lineItems || lineItems.length > 0) {
        var jobPropertyLength = obj.getLineItemCount(jobPropertySublist.id);
        if (jobPropertyLength > 0) {
          for (var i = 1; i <= jobPropertyLength; i++) {
            var jobProp = new view.JobProperty();

            for (var j in jobPropertySublist.fields) {
              var field = jobPropertySublist.fields[j];
              jobProp[j] = obj.getLineItemValue(jobPropertySublist.id, field, i);
            }

            job.addJobProperty(jobProp);
          }
        }
      }
    }

    return job;
  }
};
