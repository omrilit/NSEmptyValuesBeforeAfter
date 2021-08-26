/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @typedef {(string|number)} InternalId
 */

/**
 * @typedef {Object.<string, string>} StringMap
 */

/**
 * @typedef {Object} Variable
 * @property {InternalId} id
 * @property {string} name
 * @property {string} value
 * @property {InternalId} type
 */

/**
 * @callback EntryValidator
 * @param {*} value
 * @param {string} key
 * @returns {boolean}
 */

/**
 * @interface JobPlugin
 */

/**
 * @function JobPlugin#getJobDataSource
 * @param {Object.<string,view.JobProperty>} properties
 * @returns {*}
 */

/**
 * @function JobPlugin#getJobList
 * @param {view.JobParameters} parameters
 * @returns {Array.<view.Job>}
 */

/**
 * @function JobPlugin#executeTask
 * @param {view.Task} task
 * @returns {suite_l10n.process.ProcessResult}
 */

/**
 * @function JobPlugin#setupTaskList
 * @param {view.TaskList} taskList
 * @returns {view.TaskList}
 */

/**
 * @function JobPlugin#prepareTask
 * @param {view.Task} task
 * @param {view.TaskList} taskList
 * @returns {view.Task}
 */

/**
 * @function JobPlugin#postTaskExecution
 * @param {suite_l10n.process.ProcessResult} result
 * @returns {suite_l10n.process.ProcessResult}
 */

/**
 * @function JobPlugin#tearDownTaskList
 * @param {view.TaskList} taskList
 * @returns {void}
 */

/**
 * @function JobPlugin#postJobExecution
 * @param {view.Job} job
 * @returns {void}
 */
