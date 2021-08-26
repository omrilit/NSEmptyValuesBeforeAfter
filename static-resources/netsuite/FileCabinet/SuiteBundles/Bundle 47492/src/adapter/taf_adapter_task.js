/**
 * Copyright © 2017, 2017, Oracle and/or its affiliates. All rights reserved.
 * @NModuleScope Public
 */

define(['N/task'],
    adapterTask);

function adapterTask(task) {
    return {
        create: function(options) {
            return task.create(options);
        },
        checkStatus: function(options){
            return task.checkStatus(options);
        },
        getTaskType: function(param) {
            return param ? task.TaskType[param] : task.TaskType;
        },
        getTaskStatus: function(param) {
            return param ? task.TaskStatus[param] : task.TaskStatus;
        }
    };
}