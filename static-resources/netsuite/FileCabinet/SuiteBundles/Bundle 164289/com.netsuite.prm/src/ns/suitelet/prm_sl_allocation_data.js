/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.AllocationSl = new function AllocationSl() {
    
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
                message : errorCode + ' : '  + errorMessage
            }));
        }
    };
    
    this.processSaveData = function(params) {
        var PENDING_APPROVAL = 4,
            id               = params.allocationId,
            resourceId       = params.resourceId,
            projectId        = params.projectId,
            startDate        = params.startDate,
            endDate          = params.endDate,
            allocUnit        = params.unit, // == 'P' ? 'P' : 'H',
            allocType        = params.type, // == 'Hard' ? 1 : 2,
            isDelete         = params.isDelete,
            prevProjectId    = params.prevProjectId;
        
        var returnData = {
            success : true
        };
        
        nlapiLogExecution('DEBUG', 'returnData', JSON.stringify(params));
        
        if (id && isDelete) {
            // delete
            returnData.message = 'Data Deleted';
            
            nlapiDeleteRecord('resourceallocation', id);
        }
        else {
            var allocationRecord = null;
            
            if (id <= 0) {
                returnData.message = 'Data Added';
                allocationRecord   = nlapiCreateRecord('resourceallocation');
            }
            else {
                returnData.message = 'Data Updated';
                allocationRecord   = nlapiLoadRecord('resourceallocation', id);
            }
            
            nlapiLogExecution('DEBUG', 'returnData.message', returnData.message);
            
            allocationRecord.setFieldValue('allocationresource', resourceId);
            allocationRecord.setFieldValue('project', params.projectId);
            allocationRecord.setFieldValue('startdate', startDate);
            allocationRecord.setFieldValue('enddate', endDate);
            allocationRecord.setFieldValue('allocationamount', params.allocationNumber);
            allocationRecord.setFieldValue('allocationunit', allocUnit);
            allocationRecord.setFieldValue('allocationtype', allocType);
            allocationRecord.setFieldValue('notes', params.comment);
            
            if (this.approvalEnabled) {
                allocationRecord.setFieldValue('approvalstatus', PENDING_APPROVAL);
                
                if (params.nextApprover == -5 || params.nextApprover > 0) { // allow user -5
                    allocationRecord.setFieldValue('nextapprover', params.nextApprover);
                }
            }
            
            params.allocationId = nlapiSubmitRecord(allocationRecord, null, this.approvalEnabled); // get new allocationId in case of new // ignoreMandatory if approval enabled
            allocationRecord    = nlapiLoadRecord('resourceallocation', params.allocationId); //  load record to get the server autocomputed percent/hours
            params.percent      = allocationRecord.getFieldValue('percentoftime');
            params.hour         = allocationRecord.getFieldValue('numberhours');
        }
        
        returnData.data    = [params];
        
        returnData.updatedTimeBills = this.lib.getTimeEntriesByProject(projectId);
        
        if (Number(prevProjectId)) {
            returnData.prevUpdatedTimeBills = this.lib.getTimeEntriesByProject(prevProjectId);
        }
        
        return returnData;
    };
    
};