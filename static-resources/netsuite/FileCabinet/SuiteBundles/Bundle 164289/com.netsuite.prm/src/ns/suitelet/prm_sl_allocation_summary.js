/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.AllocSummarySl = new function AllocSummarySl() {

    this.suiteletEntry = function(request, response) {

        var _response = {
            success        : true,
            message        : 'Successfully loaded Allocation Summary',
            totalResources : 0,
            data           : []
        };
        
        try {
            
            var params = {
                startDate : request.getParameter('startDate'),
                endDate   : request.getParameter('endDate'),
                pageNum   : Number(request.getParameter('pageNum'))
            };
            
            nlapiLogExecution('DEBUG', 'Allocation Summary Parameters', JSON.stringify(params));
            
            var timeSearch = new psa_prm.serverlibrary.Search('timebill', 'customsearch_prm_allocated_time_summary', [ new nlobjSearchFilter('date', null, 'within', params.startDate, params.endDate) ]),
                timeResult = timeSearch.getAllResults(),
                timeMap    = this.buildTimeMap(timeResult);
            
            var resourceSearch = new psa_prm.serverlibrary.Search(null, 'customsearch_prm_resources_list'),
                resourceResult = resourceSearch.getAllResults(),
                workCalendars  = psa_prm.serverlibrary.getWorkCalendars(),
                allSummaries   = this.buildAllSummaries(params, timeMap, resourceResult, workCalendars);
            
            this.sortSummariesByPercentage(allSummaries);
            
            _response.totalResources = allSummaries.length;
            _response.data = this.getPage(allSummaries, 10, params.pageNum);
            
        } catch(ex) {
            
            _response.success = false;
            _response.message = 'Failed to load Allocation Summary';

            nlapiLogExecution('ERROR', ex.name || ex.getCode(), ex.message || ex.getDetails());
        }
        
        response.write(JSON.stringify(_response));
    };
    
    this.buildTimeMap = function(allTimeEntries) {
        var timeMap = {};
        
        for (i in allTimeEntries) {
            timeMap[allTimeEntries[i].getValue('employee', null, 'group')] = {
                hours : allTimeEntries[i].getValue('durationdecimal', null, 'sum')
            };
        }
        
        return timeMap;
    };
    
    this.buildAllSummaries = function(params, timeMap, allResources, workCalendars) {
        var allSummaries = [];
        
        for (i in allResources) {
            var summary = {
                resourceId   : allResources[i].getValue('internalid'),
                resourceName : allResources[i].getValue('entityid'),
                workCalendar : workCalendars[allResources[i].getValue('internalid', 'workcalendar')]
            };
            
            if (timeMap.hasOwnProperty(summary.resourceId)) {
                var totalWorkHours = psa_prm.serverlibrary.getWorkHoursInDateRange(summary.workCalendar, nlapiStringToDate(params.startDate), nlapiStringToDate(params.endDate));
                
                summary.hours = timeMap[summary.resourceId].hours;
                summary.percent = Number(((summary.hours / totalWorkHours) * 100).toFixed(4)) + '%';
                
            } else {
                summary.hours = 0;
                summary.percent = '0%';
            }
            
            allSummaries.push(summary);
        }
        
        return allSummaries;
    };
    
    this.sortSummariesByPercentage = function(allSummaries) {
        allSummaries.sort(function(a, b) {
            var _a = Number(a.percent.split('%')[0]),
                _b = Number(b.percent.split('%')[0]);
            if (_a < _b) { // sort by percent DESC
                return 1;
            } else if (_a == _b && a.hours < b.hours) { // then sort by hours DESC
                return 1;
            } else if (_a == _b && a.hours == b.hours && a.resourceName > b.resourceName) { // then sort by resourceName ASC
                return 1;
            }
            return -1;
        });
    };
    
    this.getPage = function(allSummaries, resourcePerPage, pageNumber) {
        var min = (pageNumber - 1) * resourcePerPage,
            max = pageNumber * resourcePerPage;
        
        return allSummaries.slice(min, max);
    };
    
};