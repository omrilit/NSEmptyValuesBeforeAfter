/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 07 Sep 2016 jcera
 * 
 */

var psa_prm = psa_prm || {};
psa_prm.TaskAssignment = {};

psa_prm.TaskAssignmentSl = {};

psa_prm.TaskAssignmentSl = {
        
    MODE : {
        COMPUTE_UNIT_PRICE : 'computeUnitPrice',
        FORM : 'form'
    },

    handleRequest : function(request, response) {
        var method = request.getMethod();
        if ('GET' == method) {
            this.get(request, response);
        } else if ('POST' == request.getMethod()) {
            this.post(request, response);
        } else {
            throw "Invalid request type";
        }
    },

    get : function(request, response) {
        response.writePage(this.createForm(request));
    },

    post : function(request, response) {
        var returnData;
        this.ProjectTaskService = new PRM.Service.ProjectTaskService(psa_prm.serverlibrary);
        
        if (this.MODE.COMPUTE_UNIT_PRICE == request.getParameter('mode')) {
            var computedUnitPrice = this.ProjectTaskService.computeUnitPrice(JSON.parse(request.getParameter('unitPriceParam')));
            response.write(computedUnitPrice);
        } else {
            var projectTask;
            var isDelete = Boolean(parseInt(request.getParameter('isdelete')));
            if (isDelete) {
                returnData = {
                        success : true,
                        message : 'ALERT.DELETE_ASSIGNMENT_SUCCESS'
                };
                
                var projectTaskId = request.getParameter('projecttask');
                var resourceId = request.getParameter('resource');
                
                projectTask = this.ProjectTaskService.deleteAssignment(projectTaskId, resourceId);
            } else {
                var isEdit = request.getParameter('previousresource') ? true : false;
                returnData = {
                        success : true,
                        message : isEdit ? 'ALERT.UPDATE_ASSIGNMENT_SUCCESS' : 'ALERT.ADD_ASSIGNMENT_SUCCESS'
                };
                var assignment = this.mapRequestAsAssignmentObject(request);
                projectTask = this.ProjectTaskService.saveOrEditAssignment(assignment, request.getParameter('projecttask'));
            }
            
            try {
                this.ProjectTaskService.saveProjectTask(projectTask);
            } catch (err) {
                nlapiLogExecution('ERROR', 'errorMessage', err.message || err.getDetails());
                returnData = this.updateReturnDataOnSaveError(returnData, err);
            }
            
            if (returnData.success) {
                returnData = this.updateReturnDataOnSaveSuccess(returnData, request);
                response.write(this.getResponseOnSuccess(returnData));
            } else {
                response.writePage(this.createForm(request, returnData.message));
            }
        }
    },

    createForm : function(request, errorMessage) {
        var form = new psa_prm.TaskAssignmentForm();
        form.setRequest(request);
        if (errorMessage) {
            form = form.setErrorMsg(errorMessage);
            return form.createForm();
        }
        return form.createForm();
    },

    getResponseOnSuccess : function(returnData) {
        return '<script>' + 'window.alert(window.opener.PRM.Translation.getText("' + returnData.message
                + '"));window.close();' + 'window.opener.PRM.App.Forms.taskAssignment.afterSave('
                + JSON.stringify(returnData) + ');' + '</script>';
    },

    updateReturnDataOnSaveError : function(returnData, errorObj) {
        returnData.success = false;
        returnData.message = this.createErrorMessage(errorObj.message || errorObj.getDetails());
        return returnData;
    },

    updateReturnDataOnSaveSuccess : function(returnData, request) {
        returnData.projectId = request.getParameter('project');
        returnData.projectTaskId = request.getParameter('projecttask');
        returnData.resourceId = request.getParameter('resource');
        returnData.previousResourceId = request.getParameter('previousresource');
        returnData.isDelete = Boolean(parseInt(request.getParameter('isdelete')));
        returnData.gridId = request.getParameter('gridid');
        
        return this.ProjectTaskService.getAssignmentData(returnData.projectId, returnData.projectTaskId, returnData);
    },

    createErrorMessage : function(errorMessage) {
        if (errorMessage.match(/Resource must be unique/)) {
            return 'ALERT.ASSIGNMENT_DUPLICATE';
        } else if (errorMessage.match(/Invalid resource reference key/)) {
            return 'ALERT.ASSIGNMENT_NOT_ALLOCATED';
        } else if (errorMessage.match(/Invalid serviceitem reference/)) {
            return 'ALERT.INVALID_SERVICE_ITEM';
        } else {
            return 'ALERT.ASSIGNMENT_UNKNOWN_ERROR';
        }
    },

    mapRequestAsAssignmentObject : function(request) {
        return {
            previousResourceId : request.getParameter('previousresource'),
            resourceId : request.getParameter('resource'),
            unitPercent : request.getParameter('unitpercent'),
            unitCost : request.getParameter('unitcost'),
            estimatedWork : request.getParameter('estimatedwork'),
            billingClassId : request.getParameter('billingclass'),
            serviceItemId : request.getParameter('serviceitem'),
            projectId : request.getParameter('project')
        };
    }

};
