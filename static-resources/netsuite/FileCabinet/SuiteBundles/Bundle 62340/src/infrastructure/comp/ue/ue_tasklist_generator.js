/**
 * @license
 * Copyright © 2014, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * FIXME This should be changed to Job UE or whatever because this now does more than task list
 *
 * User event script for generating task lists from the created
 * Job record.
 *
 * @author cboydon
 */

var infra = infra || {};
infra.tasklist_generator = infra.tasklist_generator || {};

infra.tasklist_generator.afterJobSubmit = function afterJobSubmit (type) {
  var jobRec = nlapiGetNewRecord();
  var jobId = jobRec.getId();

  if (type == 'create') {
    // Call tasklist generator passing the job ID
    var tasklistGenerator = new infra.app.TaskListGenerator(jobId);
    tasklistGenerator.run();
  }
};
