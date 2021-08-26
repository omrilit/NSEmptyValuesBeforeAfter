/**
 * � 2017 NetSuite Inc.
 * User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

define(["N/task"], famAdapterTask);

function famAdapterTask(task) {
    
    return {
        create : function(options) {
            return task.create(options);
        },
        
        getTaskType : function (param) {
            return param ? task.TaskType[param] : task.TaskType;
        }
    }
}
