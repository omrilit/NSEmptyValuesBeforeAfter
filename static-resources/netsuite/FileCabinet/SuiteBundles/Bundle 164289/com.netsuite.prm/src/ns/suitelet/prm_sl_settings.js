/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.SettingSl = new function SettingSl() {
    this.init = function() {
        this.context = nlapiGetContext();
        this.lib = psa_prm.serverlibrary;
    };
    
    this.suiteletEntry = function(request, response){
        this.init();
        
        var returnData = {
                success : true
            },
            dataIn = this.lib.toJson(request.getBody());
        
        try {
            if (request.getMethod() == 'GET') {
                returnData.message = 'Settings Loaded';
                returnData.data = [this.getSettings()];
            }
            else {
                returnData.message = 'Settings Saved';
                returnData.data = [this.saveSettings(dataIn)];
            }
            
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
        
        nlapiLogExecution('DEBUG', 'Governance start', this.context.getRemainingUsage());
    };
    
    this.getSettings = function() {
        var currentUser = this.context.getUser(),
            search = nlapiLoadSearch(null, 'customsearch_prm_settings_data'),
            searchFilter = new nlobjSearchFilter('owner', null, 'is', currentUser),
            settings = {
                id  : 0,
                owner : currentUser,
                lastUsedFilter : 0,
                projectsPerPage : 10, // density
                currentPage : 1,
                showRejectedAllocations : true,
                includeAllProjects : false,
                showHovers : true,
                checkNonWorkingDays : true,
                checkOverlap : true,
                showAllocations : true,
                showAssignments : true
            };
        
        search.setFilters([searchFilter]);
        
        var result    = search.runSearch(),
            resultSet = result.getResults(0, 1000);
        
        for (var i = 0; i < resultSet.length; i++) {
            var result = resultSet[i];
            settings.id                      = result.getValue('internalid');
            settings.settingsId              = result.getValue('internalid');
            settings.lastUsedFilter          = result.getValue('custrecord_prm_last_used_filter');
            settings.projectsPerPage         = result.getValue('custrecord_prm_density');
            settings.showRejectedAllocations = result.getValue('custrecord_prm_show_rejected_allocations') == 'T';
            settings.includeAllProjects      = result.getValue('custrecord_prm_include_all_projects') == 'T';
            settings.showHovers              = result.getValue('custrecord_prm_show_hovers') == 'T';
            settings.checkNonWorkingDays     = result.getValue('custrecord_prm_check_non_working_days') == 'T';
            settings.checkOverlap            = result.getValue('custrecord_prm_check_overlaps') == 'T';
            settings.showAllocations         = result.getValue('custrecord_prm_show_resource_allocations') == 'T';
            settings.showAssignments         = result.getValue('custrecord_prm_show_task_assignments') == 'T';
            break;
        }
        
        return settings;
    };
    
    this.saveSettings = function(params) {
        nlapiLogExecution('DEBUG', 'save params', JSON.stringify(params));
        
        var internalId = params.settingsId, 
            record  = (internalId && internalId > 0) ? nlapiLoadRecord('customrecord_prm_settings', internalId) : nlapiCreateRecord('customrecord_prm_settings');
        
        nlapiLogExecution('DEBUG', 'internalId', internalId);
        record.setFieldValue('custrecord_prm_last_used_filter', params.lastUsedFilter || null);
        record.setFieldValue('custrecord_prm_density', params.projectsPerPage);
        record.setFieldValue('custrecord_prm_show_rejected_allocations',  this.isTorF(params.showRejectedAllocations));
        record.setFieldValue('custrecord_prm_include_all_projects',  this.isTorF(params.includeAllProjects));
        record.setFieldValue('custrecord_prm_show_hovers',  this.isTorF(params.showHovers));
        record.setFieldValue('custrecord_prm_check_non_working_days',  this.isTorF(params.checkNonWorkingDays));
        record.setFieldValue('custrecord_prm_check_overlaps',  this.isTorF(params.checkOverlap));
        record.setFieldValue('custrecord_prm_show_resource_allocations',  this.isTorF(params.showAllocations));
        record.setFieldValue('custrecord_prm_show_task_assignments',  this.isTorF(params.showAssignments));
        
        params.settingsId = nlapiSubmitRecord(record);
        
        return params;
    };
    
    this.isTorF = function (booleanParam) {
        return booleanParam ? 'T' : 'F'
    }
}
