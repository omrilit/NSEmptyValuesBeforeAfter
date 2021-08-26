/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

var dao = dao || {};
var model = model || {};

/**
 * @constructor
 */
dao.TaskListDAO = function () {
  var statelist = new suite_l10n.variable.LocalizationVariableList('task_state');

  var recordId = 'customrecord_task_list';
  var fields = {
    'id': 'internalid',
    'name': 'name',
    'parentJob': 'custrecord_l10n_task_list_parent',
    'state': 'custrecord_l10n_task_list_state',
    'startIndex': 'custrecord_l10n_task_list_start_index',
    'endIndex': 'custrecord_l10n_task_list_end_index',
    'lastRanIndex': 'custrecord_l10n_task_list_last_ran_index',
    'startDate': 'custrecord_l10n_task_list_start_date',
    'endDate': 'custrecord_l10n_task_list_end_date',
    'dataCount': 'custrecord_l10n_tasklist_data_count',
    'processedDataCount': 'custrecord_l10n_processed_count'
  };

  var taskListPropertyId = 'recmachcustrecord_l10n_task_list_prop_parent';
  var taskListProperty = {
    'name': 'name',
    'id': 'internalid',
    'value': 'custrecord_l10n_task_list_prop_value',
    'parentId': 'custrecord_l10n_task_list_prop_parent'
  };

  function _createFieldNVPairs (obj) {
    var initObj = [];
    for (var i in obj) {
      // TODO figure out how to update startDate and endDate
      if (i === 'endDate') {
        continue;
      }
      initObj.push({id: [fields[i]], value: obj[i]});
    }

    return initObj;
  }

  this.create = function (taskList) {
    taskList.state = statelist.getIdByValue(model.TASKLIST_STATE.TASK_NOT_STARTED);
    var initObj = _createFieldNVPairs(taskList);
    var rec = new ns_wrapper.Record(recordId);

    rec.setRecordFields(initObj);

    var taskListProperties = taskList.getTaskListProperties();

    for (var i in taskListProperties) {
      var taskListProp = taskListProperties[i];
      taskListProp.setFieldMap(taskListProperty);

      rec.addSublistRecordField(taskListPropertyId, taskListProp);
    }

    return rec.saveRecord();
  };

  /**
   * @param {number} taskId
   * @returns {model.TaskList}
   */
  this.retrieve = function (taskId) {
    var record = new ns_wrapper.Record(recordId, taskId);
    var taskListModel = this.castAsTaskList(record);
    var properties = record.getLineItems(taskListPropertyId);

    properties.forEach(function (item) {
      var property = new model.Property();
      property.name = item.name;
      property.id = item.internalid;
      property.value = item.custrecord_l10n_task_list_prop_value;
      property.parentId = item.custrecord_l10n_task_list_prop_parent;
      taskListModel.addTaskListProperty(property);
    });

    return taskListModel;
  };

  /**
   * @returns {model.TaskList|null}
   */
  this.retrieveNextUnstartedTask = function () {
    var taskStateId = statelist.getIdByValue(model.TASKLIST_STATE.TASK_NOT_STARTED);
    var search = new ns_wrapper.Search(recordId);
    search.addFilter(fields.state, 'is', taskStateId);
    var results = search.head();
    return results.length > 0
      ? this.retrieve(results[0].getId())
      : null;
  };

  /**
   * @param {number} jobId
   * @returns {Array.<model.TaskList>}
   */
  this.retrieveByParentJobId = function (jobId) {
    var search = new ns_wrapper.Search(recordId);
    search.addFilter(fields.parentJob, 'is', jobId);
    for (var i in fields) {
      search.addColumn(fields[i]);
    }

    return search.map(function (result) {
      return this.castAsTaskList(result, true);
    }.bind(this));
  };

  /**
   * @returns {Array.<model.TaskList>}
   */
  this.retrieveAll = function retrieveAll () {
    var search = new ns_wrapper.Search(recordId);
    for (var i in fields) {
      search.addColumn(fields[i]);
    }

    return search.map(function (result) {
      return this.castAsTaskList(result, true);
    }.bind(this));
  };

  /**
   * @param {model.TaskList} taskList
   */
  this.update = function (taskList) {
    taskList.state = statelist.getIdByValue(taskList.state);
    var initObj = _createFieldNVPairs(taskList);
    var rec = new ns_wrapper.Record(recordId, taskList.id);

    rec.setRecordFields(initObj);
    return rec.saveRecord();
  };

  this.remove = function (task) {
    var rec = new ns_wrapper.Record(recordId);
    return rec.deleteRecord(task.id);
  };

  /**
   * @param {nlobjSearchResult|nlobjRecord|ns_wrapper.Record} object
   * @param {boolean} isSearchResult
   * @returns {model.TaskList|null}
   */
  this.castAsTaskList = function (object, isSearchResult) {
    if (!object) {
      return null;
    }

    var tasklist = new model.TaskList();

    if (isSearchResult) {
      Object.keys(fields).forEach(function (key) {
        tasklist[key] = object.getValue(fields[key]);
      });
    } else {
      Object.keys(fields).forEach(function (key) {
        tasklist[key] = object.getFieldValue(fields[key]);
      });
      tasklist.id = object.getId();
    }

    if (tasklist.state) {
      tasklist.state = statelist.getValueById(tasklist.state);
    }

    return tasklist;
  };
};
