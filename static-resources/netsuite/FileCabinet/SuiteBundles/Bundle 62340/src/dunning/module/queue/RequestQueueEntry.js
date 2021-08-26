/**
 * @license
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 * @module RequestQueueEntry
 */

define([
  'N/task',
  'N/runtime',
  'N/record',
  '../../constants'
],
function (N_task, N_runtime, N_record, C) {
  const FIELDS = C.FIELD.QUEUE_REQUEST;

  /**
   * @param {Object} options
   * @param {number} options.id
   * @param {number} options.script
   * @param {string} options.deployment
   * @param {*} options.data
   * @public
   * @constructor
   */
  const RequestQueueEntry = function (options) {
    /**
     * @type {number}
     */
    this.id = options.id;
    /**
     * @type {number}
     */
    this.script = options.script;
    /**
     * @type {string}
     */
    this.deployment = options.deployment;
    /**
     * @type {*}
     */
    this.data = options.data;
  };

  RequestQueueEntry.prototype.markAsDone = function () {
    const values = {};
    values[FIELDS.STATUS] = C.REQUEST_QUEUE_STATUS.DONE;

    N_record.submitFields({
      type: C.TYPE.QUEUE_REQUEST,
      id: this.id,
      values: values
    });
  };

  /**
   * @returns {boolean} True means success
   */
  RequestQueueEntry.prototype.tryExecute = function () {
    const task = N_task.create({
      taskType: N_task.TaskType.MAP_REDUCE,
      scriptId: this.script,
      deploymentId: this.deployment,
      params: this.data
    });
    const taskId = task.submit();
    const taskStatus = N_task.checkStatus(taskId);

    if (taskStatus.status != N_task.TaskStatus.FAILED) {
      this.markAsDone();
      return true;
    }

    return false;
  };

  /**
   * @static
   * @param {module:N/search.Result} result
   * @returns {RequestQueueEntry}
   */
  RequestQueueEntry.fromResult = function (result) {
    return new RequestQueueEntry({
      id: result.id,
      script: result.getValue({name: FIELDS.SCRIPT}),
      deployment: result.getValue({name: FIELDS.DEPLOYMENT}),
      data: JSON.parse(result.getValue({name: FIELDS.DATA}))
    });
  };

  /**
   * @static
   * @param {module:N/record.Record} record
   * @returns {RequestQueueEntry}
   */
  RequestQueueEntry.fromRecord = function (record) {
    return new RequestQueueEntry({
      id: record.id,
      script: record.getValue({fieldId: FIELDS.SCRIPT}),
      deployment: record.getValue({fieldId: FIELDS.DEPLOYMENT}),
      data: JSON.parse(record.getValue({fieldId: FIELDS.DATA}))
    });
  };

  /**
   * @static
   * @param {number} id
   * @returns {RequestQueueEntry}
   * @throws {module:N/error.SuiteScriptError}
   */
  RequestQueueEntry.load = function (id) {
    return RequestQueueEntry.fromRecord(N_record.load({
      type: C.TYPE.QUEUE_REQUEST,
      id: id
    }));
  };

  /**
   * @static
   * @param {number} script
   * @param {number} deployment
   * @param {*} data
   * @returns {RequestQueueEntry}
   * @throws {module:N/error.SuiteScriptError}
   */
  RequestQueueEntry.create = function (script, deployment, data) {
    const record = N_record.create({
      type: C.TYPE.QUEUE_REQUEST
    });

    record.setValue({
      fieldId: C.FIELD.QUEUE_REQUEST.SCRIPT,
      value: script
    });
    record.setValue({
      fieldId: C.FIELD.QUEUE_REQUEST.DEPLOYMENT,
      value: deployment
    });
    record.setValue({
      fieldId: C.FIELD.QUEUE_REQUEST.STATUS,
      value: C.REQUEST_QUEUE_STATUS.PENDING
    });
    record.setValue({
      fieldId: C.FIELD.QUEUE_REQUEST.DATA,
      value: JSON.stringify(data)
    });

    return new RequestQueueEntry({
      id: record.save(),
      script: script,
      deployment: deployment
    });
  };

  RequestQueueEntry.scheduleQueueHandler = function () {
    try {
      const task = N_task.create({
        taskType: N_task.TaskType.SCHEDULED_SCRIPT,
        scriptId: C.REQUEST_QUEUE.SCRIPT,
        deploymentId: C.REQUEST_QUEUE.DEPLOYMENT
      });
      task.submit();
    } catch (e) {
      log.error({
        title: 'Request Queue Handler',
        details: JSON.stringify(e)
      });
    }
  };

  return RequestQueueEntry;
});
