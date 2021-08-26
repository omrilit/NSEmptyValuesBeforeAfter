/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @author aalcabasa
 */

var suite_l10n = suite_l10n || {};
suite_l10n.services = suite_l10n.services || {};
suite_l10n.services.app = suite_l10n.services.app || {};

suite_l10n.services.app.Scheduler = function Scheduler () {
  var NSScheduler = ns_wrapper.Scheduler;
  var Search = ns_wrapper.Search;
  var Record = ns_wrapper.Record;

  var SCRIPT_FIELD = 'custscript_suite_l10n_scheduler_scriptid';
  var DEPLOYMENT_FIELD = 'custscript_suite_l10n_scheduler_deployid';
  var DATE_FIELD = 'custscript_suite_l10n_scheduler_date';
  var TIME_FIELD = 'custscript_suite_l10n_scheduler_time';
  var RERUNS_FIELD = 'custscript_suite_l10n_scheduler_reruns';
  var RUN_STATUS = 'hiddendeprecatedstatus';
  var RECORD_TYPE = 'scriptdeployment';

  var fieldMap = {
    'custscript_suite_l10n_scheduler_scriptid': 'scriptId',
    'custscript_suite_l10n_scheduler_deployid': 'deploymentId',
    'custscript_suite_l10n_scheduler_date': 'startDate',
    'custscript_suite_l10n_scheduler_time': 'startTime',
    'custscript_suite_l10n_scheduler_reruns': 'rerunCount'
  };

  var obj = {
    runScheduler: runScheduler,
    requestReschedule: requestReschedule,
    runScheduledScript: runScheduledScript,

    rescheduleScripts: rescheduleScripts,
    runRequestScheduler: runRequestScheduler,
    getRescheduleParams: getRescheduleParams,
    convertToParams: convertToParams,
    setFilters: setFilters,
    getScheduleParams: getScheduleParams,
    rescheduleScript: rescheduleScript,
    getUpdateList: getUpdateList

  };
  var scheduler;

  function getNSScheduler () {
    scheduler = scheduler || new NSScheduler();
    return scheduler;
  }

  function runScheduledScript (scriptId, deploymentId, params) {
    getNSScheduler().scheduleScript(scriptId, deploymentId, params);
  }

  function convertToParams (view) {
    var params = {};

    for (var i in fieldMap) {
      params[i] = view[fieldMap[i]];
    }
    return params;
  }

  function requestReschedule (view) {
    obj.runRequestScheduler(convertToParams(view));
  }

  function runRequestScheduler (params) {
    getNSScheduler()
      .scheduleScript('customscript_suite_l10n_script_scheduler', 'customdeploy_suite_l10n_script_scheduler', params);
  }

  function setFilters (search, scriptId, deploymentId) {
    if (scriptId && (scriptId.length > 0)) {
      search.addFilter('script', 'anyof', scriptId);
    }

    if (deploymentId && (deploymentId.length > 0)) {
      search.addFilter('internalid', 'anyof', deploymentId);
    }
  }

  function rescheduleScript (result, params, scriptId) {
    var isScheduled = false;
    try {
      var deploymentRecord = new Record(RECORD_TYPE, result.getId());

      var runStatus = deploymentRecord.getFieldValue(RUN_STATUS);
      if (runStatus !== 'INPROGRESS' && runStatus !== 'INQUEUE') {
        deploymentRecord.setRecordFieldMap(params);
        deploymentRecord.saveRecord();
        isScheduled = true;
      }
    } catch (e) {
      var nsLog = new ns_wrapper.Log();
      nsLog.error('rescheduleScript - error', e);
    }

    return isScheduled;
  }

  function getScheduleParams (context) {
    var params = {};

    params['startdate'] = context.getScriptSetting(DATE_FIELD);
    params['starttime'] = context.getScriptSetting(TIME_FIELD);
    params['status'] = 'SCHEDULED';

    return params;
  }

  /**
   * @param {ns_wrapper.Context} context
   * @returns {Object|null}
   */
  function getRescheduleParams (context) {
    var params = {};

    params[SCRIPT_FIELD] = context.getScriptSetting(SCRIPT_FIELD);
    params[DEPLOYMENT_FIELD] = context.getScriptSetting(DEPLOYMENT_FIELD);
    params[DATE_FIELD] = context.getScriptSetting(DATE_FIELD);
    params[TIME_FIELD] = context.getScriptSetting(TIME_FIELD);
    params[RERUNS_FIELD] = Number(context.getScriptSetting(RERUNS_FIELD)) - 1;

    var nsLog = new ns_wrapper.Log();
    nsLog.error('Remaining Runs', params[RERUNS_FIELD]);

    return params;
  }

  function getUpdateList (scriptId, deploymentId) {
    var search = new Search(RECORD_TYPE);

    search.addColumn('scriptid');
    search.addJoinColumn('scriptid', 'script');
    setFilters(search, scriptId, deploymentId);

    if (search.getFilters().length === 0) {
      return null;
    }

    return search.getIterator();
  }

  /**
   * @param {ns_wrapper.Context} context
   * @returns {boolean}
   */
  function rescheduleScripts (context) {
    var scriptId = context.getScriptSetting(SCRIPT_FIELD);
    var deploymentId = context.getScriptSetting(DEPLOYMENT_FIELD);
    var updateList = obj.getUpdateList(scriptId, deploymentId);
    var rescheduleParams = getScheduleParams(context);
    var success = true;

    if (updateList) {
      while (updateList.hasNext()) {
        var res = updateList.next();
        success = success && rescheduleScript(res, rescheduleParams);
      }
    }

    return success;
  }

  function runScheduler () {
    var context = ns_wrapper.context();
    var success = obj.rescheduleScripts(context);

    var remainingRuns = Number(context.getScriptSetting(RERUNS_FIELD)) || 0;

    if (!success && (remainingRuns > 0)) {
      obj.runRequestScheduler(obj.getRescheduleParams(context));
    }
  }

  return obj;
};
