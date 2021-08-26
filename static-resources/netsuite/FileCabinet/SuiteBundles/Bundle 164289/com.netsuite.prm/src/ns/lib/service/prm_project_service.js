/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 18 Oct 2016 jcera
 * 
 * dependencies psa_prm.serverlibrary
 * 
 */
var PRM = PRM || {};
PRM.Service = PRM.Service || {};

PRM.Service.ProjectService = function(serverLib) {

    this.serverLib = serverLib;

    this.projectAllowsAllResourcesForTasks = function(projectId) {
        var allows = false;

        var filters = [ new nlobjSearchFilter('internalid', null, 'is', projectId) ];
        var columns = [ new nlobjSearchColumn('allowallresourcesfortasks') ];
        
        var searchResults = nlapiSearchRecord('job', null, filters, columns);

        for (var i = 0; i < searchResults.length; i++) {
            allows = searchResults[i].getValue('allowallresourcesfortasks') === 'T';
            break;
        }
        return allows;
    };

    this.getProjectResources = function(projectId) {
        var filters = [ new nlobjSearchFilter('internalid', 'job', 'is', projectId) ]; 
        var search = new this.serverLib.Search('resourceallocation', 'customsearch_prm_assign_resource_list', filters);
        var searchResults = search.getAllResults();
        
        if (searchResults) {
            return searchResults.map(function(searchResult) {
                return {
                    resourceId : searchResult.getValue('resource', null, 'group'),
                    resourceName : searchResult.getText('resource', null, 'group'),
                    resourceType : searchResult.getText('type', 'resource', 'group'),
                    laborCost : searchResult.getValue('formulacurrency', null, 'avg'),
                    billingClassId : searchResult.getValue(searchResult.getAllColumns()[2])
                };
            });
        }
        
        return [];
    };
};
