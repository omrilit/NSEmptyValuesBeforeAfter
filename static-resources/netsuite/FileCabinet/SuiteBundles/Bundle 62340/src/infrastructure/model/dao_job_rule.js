/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dao = dao || {};

dao.JobRuleDAO = function () {
  var RECORD_TYPE = 'customrecord_l10n_job_rule';
  var fields = {
    'id': 'internalid',
    'name': 'name',
    'pluginImpl': 'custrecord_l10n_plugin_impl',
    'govUsagePerTask': 'custrecord_l10n_job_rule_gov_usage',
    'jobConsumerClass': 'custrecord_l10n_job_consumer',
    'jobProducerClass': 'custrecord_l10n_job_producer',
    'taskListConsumerClass': 'custrecord_l10n_task_list_consumer',
    'taskListProducerClass': 'custrecord_l10n_task_list_producer',
    'dataSourceClass': 'custrecord_l10n_data_source',
    'govUsageLimit': 'custrecord_l10n_gov_limit',
    'pluginTypeClass': 'custrecord_plugin_type_class',
    'pluginTypeClassSrc': 'custrecord_plugin_type_class_src'
  };

  function _castAsJobRule (obj, isSearchResult) {
    if (!obj) {
      return null;
    }

    var jobRule = new model.JobRule();

    for (var ifield in fields) {
      var fieldId = fields[ifield];

      jobRule[ifield] = isSearchResult ? obj.getValue(fieldId) : obj.getFieldValue(fieldId);
    }

    if (!isSearchResult) {
      jobRule.id = obj.getId();
    }

    return jobRule;
  }

  function _createFieldNVPairs (obj) {
    var initObj = [];
    for (var i in obj) {
      initObj.push({'id': [fields[i]], 'value': obj[i]});
    }
  }

  function _retrieveElements (iterator) {
    var elements = [];
    while (iterator.hasNext()) {
      elements.push(_castAsJobRule(iterator.next(), true));
    }
    return elements;
  }

  /**
   * @param {string} implementation Plug-In implementation name
   * @returns {Array.<model.JobRule>} IDs of records
   */
  this.getByImplementation = function (implementation) {
    var filters = [
      new nlobjSearchFilter('isinactive', null, 'is', 'F'),
      new nlobjSearchFilter('custrecord_l10n_plugin_impl', null, 'is', implementation)
    ];
    var results = nlapiSearchRecord(RECORD_TYPE, null, filters);

    return (results || []).map(function (result) {
      return this.retrieve(result.getId());
    }.bind(this));
  };

  this.create = function (jobRule) {
    var initObj = _createFieldNVPairs(jobRule);
    var rec = new ns_wrapper.Record(RECORD_TYPE);
    return rec.createRecord(initObj);
  };

  /**
   * @param {string|number} id
   * @returns {model.JobRule|null}
   */
  this.retrieve = function (id) {
    var rec = new ns_wrapper.Record(RECORD_TYPE);
    var jobRuleRec = rec.loadRecord(id);
    return _castAsJobRule(jobRuleRec);
  };

  /**
   * @returns {Array.<model.JobRule>}
   */
  this.retrieveAll = function () {
    var search = new ns_wrapper.Search(RECORD_TYPE);

    search.addFilter('isinactive', 'is', 'F');
    for (var i in fields) {
      search.addColumn(fields[i]);
    }

    return _retrieveElements(search.getIterator());
  };

  /**
   * @param {model.JobRule} jobRule
   * @returns {nlobjRecord}
   */
  this.update = function (jobRule) {
    var initObj = _createFieldNVPairs(jobRule);
    var rec = new ns_wrapper.Record(RECORD_TYPE);
    return rec.updateRecord(initObj);
  };

  /**
   * @param {model.JobRule} jobRule
   */
  this.remove = function (jobRule) {
    var rec = new ns_wrapper.Record(RECORD_TYPE);
    rec.deleteRecord(jobRule.id);
  };
};
