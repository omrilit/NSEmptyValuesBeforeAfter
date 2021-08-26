/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 10 Oct 2016 jcera
 * 
 */
var PRM = PRM || {};
PRM.Service = PRM.Service || {};

PRM.Service.ProjectTaskService = function(serverLib) {
    
    this.serverLib = serverLib;
    
    this.loadProjectTask = function(projectTaskId, isDynamic) {
        if (!projectTaskId) {
            throw nlapiCreateError('Null Argument Error',
                    '[ProjectTaskService.loadProjectTask] projectTaskId is required', true);
        }
        isDynamic = isDynamic || false;
        if (isDynamic) {
            return nlapiLoadRecord('projecttask', projectTaskId, {
                recordmode : 'dynamic'
            });
        } else {
            return nlapiLoadRecord('projecttask', projectTaskId);
        }
    };

    this.saveProjectTask = function(projectTask) {
        if (!projectTask) {
            throw nlapiCreateError('Null Argument Error',
                    '[ProjectTaskService.saveProjectTask] projectTask is required.', true);
        }
        return nlapiSubmitRecord(projectTask, null);
    };
    
    this.saveOrEditAssignment = function (assignment, projectTask) {
        
        if (typeof projectTask === 'string' || typeof projectTask === 'number') {
            projectTask = this.loadProjectTask(projectTask);
        } 
        
        var lineNum = this.serverLib.findAssignmentLineNumber(projectTask, assignment.previousResourceId);
        
        if (lineNum <= 0) {
            return this.saveAssignment(assignment, projectTask);
        }
        
        return this.editAssignment(assignment, projectTask, lineNum);
    };
    
    this.computeUnitPrice = function (unitPriceParam) {
        var projectTask = this.loadProjectTask(unitPriceParam.projectTaskId, true);
        
        var lineNum = this.serverLib.findAssignmentLineNumber(projectTask, unitPriceParam.previousResourceId);
        
        projectTask.selectLineItem('assignee', lineNum);
        
        projectTask.setCurrentLineItemValue('assignee', 'resource', unitPriceParam.resourceId);
        projectTask.setCurrentLineItemValue('assignee', 'unitcost', unitPriceParam.unitCost);
        
        projectTask.setCurrentLineItemValue('assignee', 'billingclass', unitPriceParam.billingClassId);
        projectTask.setCurrentLineItemValue('assignee', 'serviceitem', unitPriceParam.serviceItemId);

        if (!unitPriceParam.billingClassId && !unitPriceParam.serviceItemId) {
            projectTask.setCurrentLineItemValue('assignee', 'unitprice', '');
        }
        
        try {
            projectTask.commitLineItem('assignee');
        } catch (e) {
        }
        
        return projectTask.getLineItemValue('assignee', 'unitprice', lineNum);
    };
    
    this.editAssignment = function(assignment, projectTask, lineNum) {
        if (!assignment) {
            throw nlapiCreateError(
                    'Null Argument Error',
                    '[ProjectTaskService.saveProjectTask.editAssignment] assignment is required.',
                    true);
        }
        if (!projectTask) {
            throw nlapiCreateError(
                    'Null Argument Error',
                    '[ProjectTaskService.saveProjectTask.editAssignment] projectTask is required.',
                    true);
        }
        
        projectTask.setLineItemValue('assignee', 'resource', lineNum, assignment.resourceId);
        projectTask.setLineItemValue('assignee', 'units', lineNum, assignment.unitPercent);
        projectTask.setLineItemValue('assignee', 'unitcost', lineNum, assignment.unitCost);
        projectTask.setLineItemValue('assignee', 'estimatedwork', lineNum, assignment.estimatedWork);
        
        //optional fields
        if (assignment.billingClassId) {
            projectTask.setLineItemValue('assignee', 'billingclass', lineNum, assignment.billingClassId);
        }
        if (assignment.serviceItemId) {
            projectTask.setLineItemValue('assignee', 'serviceitem', lineNum, assignment.serviceItemId);
        }
        if (assignment.unitPrice) {
            projectTask.setLineItemValue('assignee', 'unitprice', lineNum, assignment.unitPrice || '');
        }

        projectTask.commitLineItem('assignee');

        return projectTask;
    };
    
    this.saveAssignment = function(assignment, projectTask) {
        if (!assignment) {
            throw nlapiCreateError(
                    'Null Argument Error',
                    '[ProjectTaskService.saveProjectTask.saveAssignment] assignment is required.',
                    true);
        }
        if (!projectTask) {
            throw nlapiCreateError(
                    'Null Argument Error',
                    '[ProjectTaskService.saveProjectTask.saveAssignment] projectTask is required.',
                    true);
        }

        nlapiLogExecution('DEBUG', 'saveAssignment', 'saveAssignment');
        
        projectTask.selectNewLineItem('assignee');
        /*
         * set required fields
         */
        projectTask.setCurrentLineItemValue('assignee', 'resource', assignment.resourceId);
        projectTask.setCurrentLineItemValue('assignee', 'units', assignment.unitPercent);
        projectTask.setCurrentLineItemValue('assignee', 'unitcost', assignment.unitCost);
        projectTask.setCurrentLineItemValue('assignee', 'estimatedwork', assignment.estimatedWork);
        /*
         * set optional fields
         */
        if (assignment.billingClassId) {
            projectTask.setCurrentLineItemValue('assignee', 'billingclass',
                    assignment.billingClassId);
        }
        if (assignment.serviceItemId) {
            projectTask
                    .setCurrentLineItemValue('assignee', 'serviceitem', assignment.serviceItemId);
        }

        projectTask.commitLineItem('assignee');

        return projectTask;
    };

    this.deleteAssignment = function (projectTask, resourceId) {
        
        if (typeof projectTask === 'string' || typeof projectTask === 'number') {
            projectTask = this.loadProjectTask(projectTask);
        }
        
        var lineNum = this.serverLib.findAssignmentLineNumber(projectTask, resourceId);
        
        projectTask.selectLineItem('assignee', lineNum);
        projectTask.removeLineItem('assignee', lineNum);
        
        if (projectTask.getLineItemCount('assignee') == 0) {
            projectTask.setFieldValue('ismilestone', 'T');
        }
        
        return projectTask;
    };
    
    this.getAssignmentData = function(projectId, projectTaskId, returnData) {
        var searchFilters = [ new nlobjSearchFilter('internalid', null, 'anyof', projectTaskId) ];
        var search = new this.serverLib.Search('projecttask', 'customsearch_prm_project_task_data', searchFilters);
        var projectTasks = search.getAllResults();

        /*
         * then return id's & data that may have different values after saving
         */
        var returnArr = [];
        for (var i = 0; i < projectTasks.length; i++) {
            var projectTask = projectTasks[i];
            if (projectTask.getValue('ismilestone') != 'T') {
                var gridId = projectId + '~' + projectTaskId + '~'
                + projectTask.getValue('internalid', 'projecttaskassignment') + '~'
                + projectTask.getValue('resource', 'projecttaskassignment');
            
                var workCalendarId = projectTask.getValue('workcalendar', 'projecttaskassignment');
                if (!workCalendarId) {
                    var resourceId = projectTask.getValue('resource', 'projecttaskassignment');
                    workCalendarId = nlapiLookupField('genericresource', resourceId, 'workcalendar');
                }
                
                var resourceTimeBills = TimeBillsService.getActualTimeEntries({
                    projectId : projectId,
                    projectTaskId : projectTaskId,
                    resourceId : projectTask.getValue('resource', 'projecttaskassignment')
                  });
                
                returnArr.push({
                    assignmentId : projectTask.getValue('internalid', 'projecttaskassignment'),
                    gridId : gridId,
                    projectName : projectTask.getText('company'),
                    taskName : projectTask.getText('title'),
                    resourceId : projectTask.getValue('resource', 'projecttaskassignment'),
                    resourceName : projectTask.getText('resource', 'projecttaskassignment'),
                    workCalendar : workCalendarId,
                    billingClassId : projectTask.getValue('billingclass', 'projecttaskassignment'),
                    unitCost : Number(projectTask.getValue('unitcost', 'projecttaskassignment')),
                    unitPrice : Number(projectTask.getValue('unitprice', 'projecttaskassignment')),
                    estimatedWork : projectTask.getValue('estimatedwork', 'projecttaskassignment'),
                    hrsEstimated : projectTask.getValue('estimatedwork', 'projecttaskassignment'),
                    hrsWorked : projectTask.getValue('actualwork', 'projecttaskassignment'),
                    serviceItemId : projectTask.getValue('serviceitem', 'projecttaskassignment'),
                    assignStartDate : projectTask.getValue('startdate', 'projecttaskassignment'),
                    assignEndDate : projectTask.getValue('enddate', 'projecttaskassignment'),
                    taskStartDate : projectTask.getValue('startdate'),
                    taskEndDate : projectTask.getValue('enddate'),
                    unitPct : projectTask.getValue('units', 'projecttaskassignment'),
                    timeBills : JSON.stringify(resourceTimeBills),
                    pctComplete : this.computePctComplete(projectTask.getValue('actualwork', 'projecttaskassignment'), projectTask.getValue('estimatedwork', 'projecttaskassignment'))
                });
            }
        }
        returnData.data = returnArr;

        if (projectTasks.length > 0) {
            var projectTask = projectTasks[0];
            returnData.updates = {
                project : {
                    timeBills : JSON.stringify(this.serverLib.getTimeEntriesByProject(projectId)),
                    hrsEstimated : Number(projectTask.getValue('estimatedtimeoverride', 'job')),
                    pctComplete : Number(projectTask.getValue('percenttimecomplete', 'job').split('%')[0])
                },
                task : {
                    hrsEstimated : projectTask.getValue('estimatedwork'),
                    pctComplete : projectTask.getValue('percentworkcomplete')
                }
            };
        }

        nlapiLogExecution('DEBUG', 'callback return', JSON.stringify(returnData));

        return returnData;
    };
    
    this.computePctComplete = function(hrsWorked, hrsEstimated) {
        if (hrsWorked && hrsEstimated) {
            return Number((hrsWorked / hrsEstimated) * 100).toFixed(1) + '%'; // should be 2, but core weirdly returns 1 decimal value for task percent complete (2 for project percent complete)
        }
        return '0.0%';
    };
    
    this.searchAllProjectTasksByProject = function (projectId) {
        if (projectId) {
            var filters = [new nlobjSearchFilter('internalid', 'job', 'is', projectId)];
            var search = new this.serverLib.Search('projecttask', 'customsearch_prm_proj_projtask_list', filters);
            return search.getAllResults();
        } 
        return [];
    };
};