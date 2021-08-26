/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Oct 2016     jcera
 *
 */
/*
 * DEPENDENCIES: 
 *  - psa_prm.serverlibrary
 */
ProjectResourceService = (function() {

    var _CONSTANTS = {
        resourceTypeNames : {
            EMPLOYEE : 'Employee',
            GENERIC_RESOURCE : 'GenericRsrc',
            VENDOR : 'Vendor',
        }
    };

    /**
     * returns an array of filter expressions for employee, generic resource, vendor records
     * */
    var getResourceFilterExpression = function(filter) {
        var filterExpression = [],
            billingClasses   = '',
            subsidiaries     = '',
            toArray          = psa_prm.serverlibrary.splitStringToNumberArray;
        
        if (filter.billingClasses) {
            billingClasses = toArray(filter.billingClasses);
        }

        if (filter.subsidiaries) {
            subsidiaries = toArray(filter.subsidiaries);
            if (filter.includeSubSubsidiary) {
                subsidiaries = psa_prm.serverlibrary.getDescendants('subsidiary', subsidiaries);
            }
        }
        
        if (filter.resourceTypeEmployee) {
            var employeeFilter = [ [ 'type', 'anyof', _CONSTANTS.resourceTypeNames.EMPLOYEE ] ];
            if (filter.employees) {
                employeeFilter = employeeFilter.concat([ 'AND', [ 'internalid', 'anyof', toArray(filter.employees) ] ]);
            }
            if (billingClasses) {
                employeeFilter = employeeFilter.concat([ 'AND', [ 'employee.billingclass', 'anyof', billingClasses ] ]);
            }
            if (subsidiaries) {
                employeeFilter = employeeFilter.concat([ 'AND', [ 'employee.subsidiary', 'anyof', subsidiaries ] ]);
            }
            
            filterExpression.push(employeeFilter);
        }
        
        if (filter.resourceTypeGeneric) {
            var genericFilter = [ [ 'type', 'anyof', _CONSTANTS.resourceTypeNames.GENERIC_RESOURCE ] ];
            if (filter.genericResources) {
                genericFilter = genericFilter.concat([ 'AND', [ 'internalid', 'anyof', toArray(filter.genericResources) ] ]);
            }
            if (billingClasses) {
                genericFilter = genericFilter.concat([ 'AND', [ 'genericresource.billingclass', 'anyof', billingClasses ] ]);
            }
            if (subsidiaries) {
                genericFilter = genericFilter.concat([ 'AND', [ 'genericresource.subsidiary', 'anyof', subsidiaries ] ]);
            }
            
            if (filterExpression.length) {
                filterExpression.push('OR');
            }
            filterExpression.push(genericFilter);
        }
        
        if (filter.resourceTypeVendor) {
            var vendorFilter = [ [ 'type', 'anyof', _CONSTANTS.resourceTypeNames.VENDOR ] ];
            if (filter.vendors) {
                vendorFilter = vendorFilter.concat([ 'AND', [ 'internalid', 'anyof', toArray(filter.vendors) ] ]);
            }
            if (billingClasses) {
                vendorFilter = vendorFilter.concat([ 'AND', [ 'vendor.billingclass', 'anyof', billingClasses ] ]);
            }
            if (subsidiaries) {
                vendorFilter = vendorFilter.concat([ 'AND', [ 'vendor.subsidiary', 'anyof', subsidiaries ] ]);
            }
            
            if (filterExpression.length) {
                filterExpression.push('OR');
            }
            filterExpression.push(vendorFilter);
        }
        
        return filterExpression;
    };
    
    var getResourcesByFilter = function(filter, resultMapperFn, rsFilters, rsColumns) {
        if (!filter) {
            return [];
        }
        
        var search     = new psa_prm.serverlibrary.Search('projectresource', 'customsearch_prm_resource_view_data'),
            allFilters = [ search.getFilterExpression(), 'AND', getResourceFilterExpression(filter) ];
        
        if (rsFilters && rsFilters.length) {
            allFilters = allFilters.concat([ 'AND', rsFilters ]);
        }
        
        if (rsColumns && rsColumns.length) {
            search.addColumns(rsColumns);
        }
        
        search.setFilterExpression(allFilters);
        
        var projectResources = search.getAllResults(),
            returnObj        = [];
        
        if (resultMapperFn) {
            returnObj = resultMapperFn(projectResources);
        } else {
            var workCalendars = psa_prm.serverlibrary.getWorkCalendars();
            projectResources.forEach(function(resource) {
                var projectResourceObj = {
                    resourceId : resource.getValue('internalid'),
                    resourceName : resource.getValue('entityid'),
                    resourceType : resource.getText('type'),
                    workCalendar : workCalendars[resource.getValue('internalid', 'workcalendar')],
                    laborCost : resource.getValue('formulanumeric'),
                    billingClass : resource.getValue(resource.getAllColumns()[5]),
                    billingClassName : resource.getValue(resource.getAllColumns()[6]),
                    yearsOfExperience : resource.getValue('custentity_rss_yoe')
                };
                returnObj.push(projectResourceObj);
            });
        }
        
        return returnObj;
    };

    /**
     * returns an array of ProjectResource ids
     * */
    var getResourceIdsByFilter = function(filter) {
        var projectResourcesIds = [];
        getResourcesByFilter(filter, function(searchResult) {
            searchResult.forEach(function(resource) {
                var resourceId = resource.getValue('internalid');
                projectResourcesIds.push(parseInt(resourceId));
            });
        });
        return projectResourcesIds;
    };

    /**
     * Returns 'All' if the selected filter from the UI is default, else, it would apply filters to resources
     * and return an array of resource ids.
     * */
    var getViewableResources = function(filter) {
        
        if (!filter.billingClasses && !filter.subsidiaries && filter.resourceTypeEmployee && !filter.employees && filter.resourceTypeGeneric && !filter.genericResources && filter.resourceTypeVendor && !filter.vendors) {
            return 'All';
        }
        
        return getResourceIdsByFilter(filter);
    };
    
    var getAllActiveResources = function () {
        var filter = {
            resourceTypeAll : true
        };
        return getResourcesByFilter(filter);
    };
    
    var getAllGenericResources = function () {
        var filter = {
            resourceTypeGeneric : true
        };
        return getResourcesByFilter(filter);  
    };
    
    var getProjectResource = function (projectResourceId) {
        var search = null;
        var projectResources = null;
        search = new psa_prm.serverlibrary.Search('projectresource', 'customsearch_prm_resource_view_data', [new nlobjSearchFilter('internalid', null, 'is', projectResourceId)]);
        projectResources = search.getAllResults();
        var projectResource = null;
        var workCalendars = psa_prm.serverlibrary.getWorkCalendars();
        projectResources.forEach(function(resource) {
            projectResource = {
                    resourceId : resource.getValue('internalid'),
                    resourceName : resource.getValue('entityid'),
                    resourceType : resource.getText('type'),
                    workCalendar : workCalendars[resource.getValue('internalid', 'workcalendar')],
                    laborCost : resource.getValue('formulanumeric'),
                    billingClass : resource.getValue(resource.getAllColumns()[5]),
                    billingClassName : resource.getValue(resource.getAllColumns()[6])
            };
        });
        return projectResource;
    };
    
    return {
        getResourceFilterExpression : getResourceFilterExpression,
        getResourcesByFilter : getResourcesByFilter,
        getResourceIdsByFilter : getResourceIdsByFilter,
        getViewableResources : getViewableResources,
        getAllGenericResources : getAllGenericResources,
        getAllActiveResources : getAllActiveResources,
        getProjectResource : getProjectResource
    };

})();