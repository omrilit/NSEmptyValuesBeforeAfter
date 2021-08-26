/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/*
 * DEPENDENCIES: 
 *  - psa_prm.serverlibrary
 */
var TimeBillsService = (function() {

    var _CONST = {
        recordID : 'timebill',
        savedSearch : {
            ALL_TIME_BILLS : 'customsearch_prm_time_bills_per_resource'
        }
    };

    var _search = function(addedFilters, addedColumns) {
        return new psa_prm.serverlibrary.Search(_CONST.recordID, _CONST.savedSearch.ALL_TIME_BILLS);
    };

    var _computePercentAvailable = function(workCalendar, filterFromDate, filterToDate, durationDecimal) {
        if (!workCalendar) {
            return 0;
        }
        var totalWorkHours = psa_prm.serverlibrary.getWorkHoursInDateRange(workCalendar, filterFromDate, filterToDate);
        var percentAvailable = (totalWorkHours - durationDecimal) / totalWorkHours * 100;
        return percentAvailable < 0 ? 0 : percentAvailable;
    };

    var _getWorkCalendarId = function(nsResult) {
        var workCalendarId = nsResult.getValue('workcalendar', 'employee');
        if (!workCalendarId) workCalendarId = nsResult.getValue('workcalendar', 'vendor');
        if (!workCalendarId) workCalendarId = nsResult.getValue('workcalendar', 'genericresource');
        return workCalendarId;
    };
    
    var populateResourcesWithAllocatedTimeDetails = function(filter, resources) {
        var search = _search();

//        if (filter.billingClass) {
//            resources = resources.filter(function(resource) {
//                return resource.billingClass == filter.billingClass;
//            });
//        }
//
//        if (filter.maxLaborCost) {
//            resources = resources.filter(function(resource) {
//                return Number(resource.laborCost) <= Number(filter.maxLaborCost);
//            });
//        }

        var resourceIds = resources.map(function(e) {
            return e.resourceId;
        });
        
        var filterExpression = [['type', 'is', 'B']];
        
        if (resourceIds.length) {
            filterExpression = filterExpression.concat([ 'AND', [ 'employee', 'anyof', resourceIds ] ]);
        }
        
        if (filter.fromDate && filter.toDate) {
            filterExpression = filterExpression.concat([ 'AND', [ 'date', 'within', filter.fromDate, filter.toDate ] ]);
        }
        
        search.setFilterExpression(search.getFilterExpression().concat(filterExpression));

        var resultSet = search.getAllResults();
        var resourcesAsMap = psa_prm.serverlibrary.arrayAsMap(resources, 'resourceId');
        
        resultSet.forEach(function(e) {
            var id = e.getValue('employee', null, 'group');
            var durationDecimal = e.getValue('durationdecimal', null, 'sum');
            if (resourcesAsMap[id]) {
                var workCalendar = resourcesAsMap[id].workCalendar;
                var percentAvailable = _computePercentAvailable(workCalendar, filter.fromDate, filter.toDate, durationDecimal);
    
                resourcesAsMap[id].percentAvailable = percentAvailable;
                
                if (filter.percentAvailable) {
                    if (Math.round(percentAvailable) < filter.percentAvailable) {
                        delete resourcesAsMap[id];
                    }
                }
            }
        });

        var results = [];
        for ( var key in resourcesAsMap) {
            var r = resourcesAsMap[key];
            r.percentAvailable = r.hasOwnProperty('percentAvailable') ? Math.round(r.percentAvailable) + ' %' : '100 %';
            results.push(r);
        }

        return results;
    };

    var isResourceWithActualOrPlannedTimeInProject = function(resource, project) {
        var search = _search();
        
        search.setFilterExpression(search.getFilterExpression().concat([
            [
                [ 'type', 'is', 'A' ],
                'OR',
                [ 'type', 'is', 'P' ]
            ],
            'AND',
            [ 'employee', 'is', resource ],
            'AND',
            [ 'customer', 'is', project ]
        ]));
        
        var results = search.getAllResults();
        
        return results.length > 0;
    };

    this.getActualTimeEntries = function(filter) {
        var search            = new psa_prm.serverlibrary.Search('timebill', 'customsearch_prm_time_data'),
            actualTimeEntries = [];
        
        if (filter.projectId) {
            search.addFilter(new nlobjSearchFilter('customer', null, 'anyof', filter.projectId));// projects use 'customer' as id in time bill records
        }
        
        if (filter.projectTaskId) {
            search.addFilter(new nlobjSearchFilter('internalid', 'projecttask', 'anyof', filter.projectTaskId));
        }
        
        if (filter.resourceId) {
            search.addFilter(new nlobjSearchFilter('employee', null, 'anyof', filter.resourceId));
        }
        
        var searchResults = search.getAllResults();
        for (var i = 0; i < searchResults.length; i++) {
            var searchResult = searchResults[i];
            actualTimeEntries.push({ 
                projTaskAssignmentId : searchResult.getValue('internalid', 'projecttaskassignment') || 0,
                resourceId           : searchResult.getValue('employee'), // all resources use 'employee' as id in time bill records
                projectId            : searchResult.getValue('internalid','job'),
                projTaskId           : searchResult.getValue('internalid', 'projecttask'),
                projTaskStartDate    : searchResult.getValue('startdate', 'projecttask'),
                projTaskEndDate      : searchResult.getValue('enddate', 'projecttask'),
                resourceName         : searchResult.getText('employee'),
                date                 : searchResult.getValue('date'),
                duration             : searchResult.getValue('duration'),
                workCalendar         : _getWorkCalendarId(searchResult),
                type                 : 'A'
            });
        }
        
        return actualTimeEntries;
    };
    
    return {
        populateResourcesWithAllocatedTimeDetails : populateResourcesWithAllocatedTimeDetails,
        isResourceWithActualOrPlannedTimeInProject : isResourceWithActualOrPlannedTimeInProject,
        getActualTimeEntries : getActualTimeEntries,
    };

})();