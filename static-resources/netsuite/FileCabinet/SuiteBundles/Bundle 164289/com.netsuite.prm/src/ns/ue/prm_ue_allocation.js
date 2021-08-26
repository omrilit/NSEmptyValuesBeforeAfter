/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.AllocationUE = new function AllocationUE() {
    
    this.ueBeforeLoad = function(type, form, request) {
        if (form && request) {
            var prmFlag = request.getParameter('prm_rand');
            
            if (prmFlag) {
                this.setDefaultValues(request);
                this.createPRMFlagField(form);
                this.createReallocateFlag(form, request.getParameter('id'));
            }
        }
    };
    
    this.setDefaultValues = function(request) {
        var projectId = request.getParameter('prm_project_id') || '';
        
        nlapiSetFieldValue('project', projectId);
    };
    
    this.createPRMFlagField = function(form) {
        var flag = form.addField('custpage_prm_flag', 'checkbox');
        
        flag.setDefaultValue('T');
        flag.setDisplayType('hidden');
    };
    
    this.createReallocateFlag = function(form, id) {
        var flag      = form.addField('custpage_prm_reallocate_flag', 'checkbox'),
            flagValue = 'T';
        
        if (id) {
            var allocation = nlapiLoadRecord('resourceallocation', id),
                resource   = allocation.getFieldValue('allocationresource'),
                project    = allocation.getFieldValue('project');
                
            if (psa_prm.serverlibrary.getResourceAllocationCount(resource, project) == 1 && nlapiLookupField('job', project, 'allowallresourcesfortasks') == 'F' && TimeBillsService.isResourceWithActualOrPlannedTimeInProject(resource, project)) {
                flagValue = 'F';
            }
        }

        flag.setDefaultValue(flagValue);
        flag.setDisplayType('hidden');
    };
    
    this.ueBeforeSubmitDelete = function() {
        var reallocateFlag =  nlapiGetFieldValue('custpage_prm_reallocate_flag');
        
        nlapiLogExecution('DEBUG', 'ueBeforeSubmitDelete : reallocateFlag', reallocateFlag);
        
        if (reallocateFlag == 'F') {
            throw nlapiCreateError('PRM_UNABLE_TO_DELETE', 'Unable to delete Resource Allocation due to dependent Task Assignments.', true);
        }
        
        return true;
    };
    
    this.ueBeforeSubmit = function(type) {
        var prmFlag = nlapiGetFieldValue('custpage_prm_flag');
        
        nlapiLogExecution('DEBUG', 'ueBeforeSubmit : prmFlag', prmFlag);
        
        if (prmFlag) {
            if (type == 'delete') {
                this.ueBeforeSubmitDelete();
            }
        }
    };
    
    this.ueAfterSubmit = function(type) {
        var prmFlag = nlapiGetFieldValue('custpage_prm_flag');
        
        if (prmFlag) {
            var recordId = type == 'create' || type == 'edit' ? nlapiGetRecordId() : null;
            
            nlapiSetRedirectURL('RECORD', nlapiGetRecordType(), recordId, true, {
                prm_event_type : type,
                l : 'T'
            });
        }
    };

}