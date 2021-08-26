/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author ldimayuga
 */

var dunning = dunning || {};
dunning.app = dunning.app || {};

dunning.app.DunningQueueFilterManager = function DunningQueueFilterManager () {
  var DUNNING_QUEUE_FILTER_CUSTOMER = 'custpage_3805_dunning_qf_cust';
  var DUNNING_QUEUE_FILTER_RECIPIENT = 'custpage_3805_dunning_qf_recp';
  var DUNNING_QUEUE_FILTER_DP = 'custpage_3805_dunning_qf_dp';
  var DUNNING_QUEUE_FILTER_LEVEL = 'custpage_3805_dunning_qf_dp_lvl';
  var DUNNING_QUEUE_FILTER_APPLIES_TO = 'custpage_3805_dunning_qf_app_to';
  var DUNNING_QUEUE_FILTER_PRINT = 'custpage_3805_dunning_qf_allow_print';
  var DUNNING_QUEUE_FILTER_EMAIL = 'custpage_3805_dunning_qf_allow_email';
  var DUNNING_QUEUE_FILTER_LLS_TO = 'custpage_3805_dunning_qf_lls_to';
  var DUNNING_QUEUE_FILTER_LLS_FROM = 'custpage_3805_dunning_qf_lls_from';
  var DUNNING_QUEUE_FILTER_EVAL_TO = 'custpage_3805_dunning_qf_ev_date_to';
  var DUNNING_QUEUE_FILTER_EVAL_FROM = 'custpage_3805_dunning_qf_ev_date_from';
  var DUNNING_ROLE = 'custpage_3805_dunning_queue_dunning_role';

  /*
   * TODO: change into object with other properties such as "needsEncoding", "type", etc.
   */
  var filterIds = [{'id': DUNNING_QUEUE_FILTER_CUSTOMER, 'paramname': 'cust'},
    {'id': DUNNING_QUEUE_FILTER_RECIPIENT, 'paramname': 'recp'},
    {'id': DUNNING_QUEUE_FILTER_DP, 'paramname': 'dp'},
    {'id': DUNNING_QUEUE_FILTER_LEVEL, 'paramname': 'lvl'},
    {'id': DUNNING_QUEUE_FILTER_APPLIES_TO, 'paramname': 'app'},
    {'id': DUNNING_QUEUE_FILTER_PRINT, 'paramname': 'pr'},
    {'id': DUNNING_QUEUE_FILTER_EMAIL, 'paramname': 'em'},
    {'id': DUNNING_QUEUE_FILTER_LLS_TO, 'paramname': 'llst'},
    {'id': DUNNING_QUEUE_FILTER_LLS_FROM, 'paramname': 'llsf'},
    {'id': DUNNING_QUEUE_FILTER_EVAL_TO, 'paramname': 'evdt'},
    {'id': DUNNING_QUEUE_FILTER_EVAL_FROM, 'paramname': 'evdf'},
    {'id': DUNNING_ROLE, 'paramname': 'dr'}
  ];

  var SUITELET_TYPE = 'SUITELET';
  var SUITELET_ID = 'customscript_3805_dunning_queue';
  var DUNNING_QUEUE_DEPLOYMENT_ID = 'custpage_3805_dunning_queue_deploy';

  var StringFormatter = suite_l10n.string.StringFormatter;
  var FieldAPI = ns_wrapper.api.field;

  var formStateObj;

  /**
   * this function retrieves the formStateObject that will be used for api.url.resolveUrlWithParams
   * @returns object that contains all the needed parameters for api.url.resolveUrlWithParams
   */
  this.getFormStateObject = function getFormStateObject () {
    if (!formStateObj) {
      var parameters = getParametersFromFilters();

      formStateObj = {};
      formStateObj.type = SUITELET_TYPE;
      formStateObj.identifier = SUITELET_ID;
      formStateObj.id = FieldAPI.getFieldValue(DUNNING_QUEUE_DEPLOYMENT_ID);
      formStateObj.parameters = parameters;
    }

    return formStateObj;
  };

  /**
   * this function retrieves the values of the fields that are declared in the filterIds and
   * turns it into a parameter format that will be used in resolveURL
   * @returns an array of parameters to be used in resolveURL
   */
  function getParametersFromFilters () {
    var parameters = {};
    parameters.disp = 'T';

    for (var i = 0; i < filterIds.length; i++) {
      var value = getFilterValue(filterIds[i].id);
      if (value) {
        var obj = getFilterObject(filterIds[i].paramname, value);
        parameters[obj.name] = obj.value;
      }
    }

    return parameters;
  }

  /**
   * this function retrieves the value of the field id that is being passed
   * @param id - id of the field
   * @returns value of the field
   */
  function getFilterValue (id) {
    var value = FieldAPI.getFieldValue(id);

    switch (id) {
      case DUNNING_QUEUE_FILTER_LEVEL:
        if (value == 0) { value = undefined; }
        break;
      case DUNNING_QUEUE_FILTER_LLS_TO:
      case DUNNING_QUEUE_FILTER_LLS_FROM:
      case DUNNING_QUEUE_FILTER_EVAL_TO:
      case DUNNING_QUEUE_FILTER_EVAL_FROM:
        if (value) {
          var dateSf = new StringFormatter(value);
          value = dateSf.encodeURIComponent();
        }
        break;
    }
    return value;
  }

  /**
   * this function sets and returns an object with the passed parameters
   * @param name - name of object
   * @param value - value of object
   */
  function getFilterObject (name, value) {
    return {
      name: name,
      value: value
    };
  }
};
