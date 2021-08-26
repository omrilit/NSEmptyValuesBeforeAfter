/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This user event monitors the state of the tasklist.
 * It will inform the Job of the state of the tasklist.
 *
 * @author mmoya
 */

/**
 * @appliedtorecord TaskList
 *
 * @param {string} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 */
var infra = infra || {};
infra.tasklist_state_handler = infra.tasklist_state_handler || {};

infra.tasklist_state_handler.afterSubmit = function afterSubmit (type) {
  if (type == 'edit') {
    var taskListStateHandler = new infra.app.TaskListStateHandler();
    taskListStateHandler.processTaskListState(nlapiGetNewRecord());
  }
};
