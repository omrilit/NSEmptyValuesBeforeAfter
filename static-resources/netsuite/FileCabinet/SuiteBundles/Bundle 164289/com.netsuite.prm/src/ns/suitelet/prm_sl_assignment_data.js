/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.AssignmentSl = new function AssignmentSl() {
    
    this.init = function() {
        this.context = nlapiGetContext();
        this.lib = psa_prm.serverlibrary;
        this.dateFormat = this.lib.getNSDateFormat();
        this.approvalEnabled = this.context.getPreference('CUSTOMAPPROVALRSRCALLOC') == 'T';
    };
    
    this.suiteletEntry = function(request, response){
        this.init();
        
        nlapiLogExecution('DEBUG', 'Governance start', this.context.getRemainingUsage());
        
        try {
            if (request.getMethod() == 'GET'){
                throw new nlobjError('HTML Error','Request method is of an incorrect type: ' + request.getMethod());
            }
           
            var params = this.lib.toJson(request.getBody()),
                returnData = this.processSaveData(params);
        
            nlapiLogExecution('DEBUG', 'Governance end', this.context.getRemainingUsage());
            nlapiLogExecution('DEBUG', 'returnData', JSON.stringify(returnData));
            
            response.write(JSON.stringify(returnData));
        }
        catch(ex) {
            var errorCode = ex.name || ex.getCode(),
                errorMessage = ex.message || ex.getDetails();

            nlapiLogExecution('ERROR', errorCode, errorMessage);
            
            response.write(JSON.stringify({
                success : false,
                message : errorMessage
            }));
        }
    };
    
    this.processSaveData = function(params) {
        var returnData = {
                success : true,
            },
            assignmentId   = params.assignmentId,
            resourceId     = params.resourceId,
            prevResourceId = params.prevResourceId,
            projectId      = params.projectId,
            projectTaskId  = params.projectTaskId,
            isDelete       = params.isDelete || false,
            isLookup       = params.isLookup || false;
        
        
        nlapiLogExecution('DEBUG', 'parameters', JSON.stringify(params));

        /*
         * check if project task is under project
         */
        if(!psa_prm.serverlibrary.isProjectTaskUnderProject(projectTaskId, projectId)) {
            returnData.success = false; 
            returnData.message = 'ALERT.PROJECT_TASK_NOT_FOUND_IN_PROJECT';
            return returnData;
        }
        
        var projectTask = this.loadProjectTask(params);
        var lineNum = psa_prm.serverlibrary.findAssignmentLineNumber(projectTask, prevResourceId ? prevResourceId : resourceId);

        if (assignmentId <= 0) {
        	//add assignment
        	
        	this.addAssignment(projectTask, params);
            returnData.message = 'ALERT.ADD_ASSIGNMENT_SUCCESS';
        } else if (isLookup) {
        	//lookup for unit price.
        	
        	this.lookupAssignment(projectTask, params, lineNum);
        	returnData.message = 'ALERT.LOOKUP_ASSIGNMENT_SUCCESS';
            returnData.unitPrice = projectTask.getLineItemValue('assignee', 'unitprice', lineNum);
        } else if (isDelete) {
        	//delete assignment
            
        	this.deleteAssignment(projectTask, lineNum);
            returnData.message = 'ALERT.DELETE_ASSIGNMENT_SUCCESS';
        } else {
        	//edit assignment
        	
        	this.editAssignment(projectTask, params, lineNum);
        	returnData.message = 'ALERT.UPDATE_ASSIGNMENT_SUCCESS';
        }
        
        /*
         * submit
         */
        try {
            if (!isLookup) {
                /*
                 * save record...
                 */
                var newRecord     = nlapiSubmitRecord(projectTask, true),
                    searchFilters = [ new nlobjSearchFilter('internalid', null, 'anyof', newRecord) ],
                    search        = new psa_prm.serverlibrary.Search('projecttask', 'customsearch_prm_project_task_data', searchFilters),
                    projectTasks  = search.getAllResults();
                
                if (!isDelete) {
                    /*
                     * then return id's & data that may have different values after saving
                     */
                  var returnArr = [];
                  for (var i = 0; i < projectTasks.length; i++) {
                      var projectTask = projectTasks[i];
                      returnArr.push({
                          assignmentId    : projectTask.getValue('internalid', 'projecttaskassignment'),
                          resourceId      : projectTask.getValue('resource', 'projecttaskassignment'),
                          gridId          : params.projectId + '~' + params.projectTaskId + '~' + projectTask.getValue('internalid', 'projecttaskassignment') + '~' + projectTask.getValue('resource', 'projecttaskassignment'),
                          assignStartDate : projectTask.getValue('startdate', 'projecttaskassignment'),
                          assignEndDate   : projectTask.getValue('enddate', 'projecttaskassignment'),
                          unitPct         : projectTask.getValue('units', 'projecttaskassignment')
                      });
                  }
                  returnData.data = returnArr;
                }
                
                if (projectTasks.length > 0) {
                	var projectTask = projectTasks[0];
                	returnData.updates = {
                			project : {
                				timeBills    : this.lib.getTimeEntriesByProject(projectId),
                				hrsEstimated : Number(projectTask.getValue('estimatedtimeoverride', 'job')),
                				pctComplete  : Number(projectTask.getValue('percenttimecomplete', 'job').split('%')[0])
                			},
                			task : {
                				hrsEstimated : projectTask.getValue('estimatedwork'),
                				pctComplete  : projectTask.getValue('percentworkcomplete')
                			}
                	};
                }
                
                nlapiLogExecution('DEBUG', 'callback return', JSON.stringify(returnData));
            }
        } catch(err) {
            returnData.success = false;
            var errorCode = err.name || err.getCode(),
                errorMessage = err.message || err.getDetails();
            
            nlapiLogExecution('ERROR', 'errorMessage', errorMessage);
            if(errorMessage.match(/Resource must be unique/)) {
                returnData.message = 'ALERT.ASSIGNMENT_DUPLICATE';
            } else if(errorMessage.match(/Invalid resource reference key/)) {
                returnData.message = 'ALERT.ASSIGNMENT_NOT_ALLOCATED';
            } else if (errorMessage.match(/This record cannot be deleted, because it is referred to by other records/)) {
                returnData.message = 'ALERT.RECORD_REFERRED_TO_BY_OTHER_RECORDS';
            } else {
                returnData.message = 'ALERT.ASSIGNMENT_UNKNOWN_ERROR';
            }
        }
        
        return returnData;
    };
    
    this.loadProjectTask = function (request) {
    	var isLookup = request.isLookup || false;
    	if (isLookup) {
        	return nlapiLoadRecord('projecttask', request.projectTaskId, {recordmode: 'dynamic'});
        } 
    	return nlapiLoadRecord('projecttask', request.projectTaskId);
    };
    
    this.addAssignment = function (projectTask, request) {
    	projectTask.selectNewLineItem('assignee');
        /*
         * set required fields
         */
        projectTask.setCurrentLineItemValue('assignee', 'resource', request.resourceId);
        projectTask.setCurrentLineItemValue('assignee', 'units', request.unitPercent);
        projectTask.setCurrentLineItemValue('assignee', 'unitcost', request.unitCost);
        projectTask.setCurrentLineItemValue('assignee', 'estimatedwork', request.estimatedWork);
        /*
         * set optional fields
         */
        if (request.billingClassId) {
            projectTask.setCurrentLineItemValue('assignee', 'billingclass', request.billingClassId);
        }
        if (request.serviceItemId) {
            projectTask.setCurrentLineItemValue('assignee', 'serviceitem', request.serviceItemId);
        }
        
        projectTask.commitLineItem('assignee');
    };
    
    this.lookupAssignment = function (projectTask, request, lineNum) {
        
        projectTask.selectLineItem('assignee', lineNum);
        
        if (request.lookupType == 'resource') {
            projectTask.setCurrentLineItemValue('assignee', 'resource', request.resourceId);
            projectTask.setCurrentLineItemValue('assignee', 'unitcost', request.unitCost);
        } else if (request.lookupType == 'billingclass' || request.lookupType == 'serviceitem') {
            if (request.billingClassId) {
            	projectTask.setCurrentLineItemValue('assignee', 'billingclass', request.billingClassId);
            }
            if (request.serviceItemId) {
            	projectTask.setCurrentLineItemValue('assignee', 'serviceitem', request.serviceItemId);
            }    
                
            if (!request.billingClassId && !request.serviceItemId) {
            	projectTask.setCurrentLineItemValue('assignee', 'unitprice', '');
            } 
        }
        
        projectTask.commitLineItem('assignee');
    };
    
    this.deleteAssignment = function (projectTask, lineNum) {
    	projectTask.selectLineItem('assignee', lineNum);
        projectTask.removeLineItem('assignee', lineNum);
        
        if (projectTask.getLineItemCount('assignee') == 0) {
        	projectTask.setFieldValue('ismilestone', 'T');
        }
    };
    
    this.editAssignment = function (projectTask, request, lineNum) {
    	/*
    	 * set required fields
    	 */
    	projectTask.setLineItemValue('assignee', 'resource', lineNum, request.resourceId);
    	projectTask.setLineItemValue('assignee', 'units', lineNum, request.unitPercent);
    	projectTask.setLineItemValue('assignee', 'unitcost', lineNum, request.unitCost);
    	projectTask.setLineItemValue('assignee', 'estimatedwork', lineNum, request.estimatedWork);
    	/*
    	 * set optional fields
    	 */
    	projectTask.setLineItemValue('assignee', 'billingclass', lineNum, request.billingClassId || '');
    	projectTask.setLineItemValue('assignee', 'serviceitem', lineNum, request.serviceItemId || '');
    	projectTask.setLineItemValue('assignee', 'unitprice', lineNum, request.unitPrice || ''); // only in edit...
    	projectTask.commitLineItem('assignee');
    	/*
    	 * task fields
    	 */
    	if (request.startDate) {
    		projectTask.setFieldValue('startdate', request.startDate);
    	}
    };
    
};