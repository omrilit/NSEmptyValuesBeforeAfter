/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

/* eslint space-before-function-paren: ["error", {"named": "never"}] */
/* eslint no-unused-vars: 0 */
// @formatter:off

// Plugin Implementation and libraries cannot be placed under the same package(dunning)
// for some reason, the plugin overwrites the contents for its own packages
var dunningPL = dunningPL || {};
dunningPL.comp = dunningPL.comp || {};
dunningPL.comp.pl = dunningPL.comp.pl || {};

dunningPL.comp.pl.BulkAssignment = function () {
  this.getJobDataSource = function (properties) {};
  this.getJobList = function () {};
  this.executeTask = function (task) {};
  this.prepareTask = function (task, tasklist) {};
  this.postTaskExecution = function (task, result) {};
  this.setupTaskList = function (taskList) {};
};

function getJobDataSource(properties) {
  var bulkAssignmentPl = new dunningPL.comp.pl.BulkAssignment();
  return bulkAssignmentPl.getJobDataSource(properties);
}

function getJobList() {
  var bulkAssignmentPl = new dunningPL.comp.pl.BulkAssignment();
  return bulkAssignmentPl.getJobList();
}

function executeTask(task) {
  var bulkAssignmentPl = new dunningPL.comp.pl.BulkAssignment();
  return bulkAssignmentPl.executeTask(task);
}

function setupTaskList(tasklist) {
  var bulkAssignmentPl = new dunningPL.comp.pl.BulkAssignment();
  return bulkAssignmentPl.setupTaskList(tasklist);
}

function prepareTask(task, tasklist) {
  var bulkAssignmentPl = new dunningPL.comp.pl.BulkAssignment();
  return bulkAssignmentPl.prepareTask(task, tasklist);
}

function postTaskExecution(task, result) {
  var bulkAssignmentPl = new dunningPL.comp.pl.BulkAssignment();
  return bulkAssignmentPl.postTaskExecution(task, result);
}

function tearDownTaskList(tasklist) {
  return tasklist;
}

// @formatter:on
