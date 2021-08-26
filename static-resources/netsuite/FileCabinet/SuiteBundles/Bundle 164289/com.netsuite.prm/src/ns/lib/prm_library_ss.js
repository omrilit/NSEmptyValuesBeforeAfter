/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) { psa_prm = {}; }
if (!psa_prm.serverlibrary) { psa_prm.serverlibrary = {}; }

psa_prm.serverlibrary.toJson = function (json) {
    try {
        if (json) {
            return JSON.parse(json);    
        }
    }
    catch(ex) {
        return json;
    }
};

psa_prm.serverlibrary.getStringLiterals = function getStringLiterals() {
      
    if (!this.stringLiterals) {
        this.stringLiterals = {
            'MAIN.FORM.TITLE' : 'Project Resource Management',
            'ERROR.FEATURE.NOT_ENABLED' : 'Resource Allocation feature not installed.',
            'ERROR.NO_RESULTS_FOUND' : 'No results found within limits of selected view.',
            'ERROR.NO_RESULTS_FOUND_SIMPLE' : 'No results found.',
            'FIELD.RESOURCE' : 'Resource',
            'FIELD.CUSTOMER' : 'Customer',
            'FIELD.CUSTOMER_PROJECT' : 'Customer:Project',
            'FIELD.PROJECT' : 'Project',
            'FIELD.START_DATE' : 'Start Date',
            'FIELD.END_DATE' : 'End Date',
            'FIELD.ALLOCATE' : 'Allocate',
            'FIELD.ALLOCATION_TYPE' : 'Allocation Type',
            'FIELD.APPROVAL_STATUS' : 'Approval Status',
            'FIELD.NEXT_APPROVER' : 'Next Approver',
            'FIELD.PROJECT_TASK' : 'Project Task',
            'FIELD.COMMENTS' : 'Comments',
            'FIELD.VIEW_NAME' : 'View Name',
            'FIELD.PROJECT_PROPERTIES' : 'Project Properties',
            'FIELD.TASK' : 'Task',
            'FIELD.PERCENTAGE' : 'Percentage',
            'FIELD.HOURS' : 'Hours',
            
            'FIELD.HOURS_ASSIGNED' : 'Hours Assigned',
            'FIELD.HOURS_WORKED' : 'Hours Worked',
            
            'TEXT.ALL-' : '-All-',
            'TEXT.PROJECT' : 'Project',
            'TEXT.SELECT_ONE' : 'Select One',
            'TEXT.TASK_ASSIGNMENT' : 'Task Assignment',
            'TEXT.RESOURCE_ALLOCATION' : 'Resource Allocation',
            'TEXT.DEFAULT' : '- Default -',
            /*
             * all button / link texts
             */
            'BUTTON.COLLAPSE_ALL' : 'Collapse All',
            'BUTTON.EXPAND_ALL' : 'Expand All',
            'BUTTON.PRESET_DAILY' : 'Daily',
            'BUTTON.PRESET_MONTHLY' : 'Monthly',
            'BUTTON.PRESET_WEEKLY' : 'Weekly',
            'BUTTON.SAVE' : 'Save',
            'BUTTON.CANCEL' : 'Cancel',
            /*
             * all tooltip texts
             */
            'TOOLTIP.EXPORT_TO_PDF' : 'Export to PDF',
            'TOOLTIP.PAN_LEFT' : 'Pan Left',
            'TOOLTIP.PAN_RIGHT' : 'Pan Right',
            'TOOLTIP.PRINT' : 'Print',
            'TOOLTIP.SETTINGS' : 'Settings',
            /*
             * ROW MENU ITEMS
             */
            'MENU.ADD_PROJECT' : 'Add Project',
            'MENU.HIDE_ALLOCATIONS' : 'Hide Resource Allocations',
            'MENU.SHOW_ALLOCATIONS' : 'Show Resource Allocations',
            'MENU.HIDE_TASKS' : 'Hide Task Assignments',
            'MENU.SHOW_TASKS' : 'Show Task Assignments',
            
            'MENU.ADD_RESOURCE' : 'Add Resource Allocation',
            'MENU.REMOVE_ALLOCATIONS' : 'Remove Allocations',
            'MENU.REMOVE_PROJECT' : 'Remove Resource Allocations and Task Assignments',
            'MENU.REMOVE_RESOURCE_FROM_PROJECT' : 'Remove Resource Allocations',
            'MENU.ASSIGN_RESOURCE' : 'Assign Resource',
            'MENU.ASSIGN_RESOURCE_TO_TASK' : 'Assign Resource to Task',
            'MENU.REASSIGN_RESOURCES' : 'Re-assign Resources',
            'MENU.REMOVE_TASK' : 'Remove Task Assignments',
            'MENU.EDIT_RESOURCE' : 'Edit Resource',
            'MENU.EDIT_TASK_ASSIGNMENT' : 'Edit Task Assignment',
            'MENU.REMOVE_TASK_RESOURCE' : 'Remove Task Assignment',
            /* all window title texts */
            'WINDOW.CUSTOMIZE_VIEW' : 'Customize View',
            'WINDOW.NEW_ALLOCATION' : 'New Allocation',
            'WINDOW.EDIT_ALLOCATION' : 'Edit Allocation'
        };
    }
    
    return this.stringLiterals;
};
    
psa_prm.serverlibrary.getNSDateFormat = function getNSDateFormat() {
    // convert NS format into DateJS notation.
    var dateFormat = 'yyyy/M/d';
    switch (nlapiGetContext().getPreference('dateformat')) {
        case 'M/D/YYYY':
        case 'MM/DD/YYYY':
            dateFormat = 'M/d/yyyy';
            break;
        case 'D/M/YYYY':
        case 'DD/MM/YYYY':
            dateFormat = 'd/M/yyyy';
            break;
        case 'DD-Mon-YYYY':
        case 'D-Mon-YYYY':
            dateFormat = 'd-MMM-yyyy';
            break;
        case 'DD.MM.YYYY':
        case 'D.M.YYYY':
            dateFormat = 'd.M.yyyy';
            break;
        case 'DD-MONTH-YYYY':
        case 'D-MONTH-YYYY':
            dateFormat = 'd-MMMM-yyyy';
            break;
        case 'DD MONTH, YYYY':
        case 'D MONTH, YYYY':
            dateFormat = 'd MMMM, yyyy';
            break;
        case 'YYYY/MM/DD':
        case 'YYYY/M/D':
            dateFormat = 'yyyy/M/d';
            break;
        case 'YYYY-MM-DD':
        case 'YYYY-M-D':
            dateFormat = 'yyyy-M-d';
            break;
        case 'YYYY M D':
        case 'YYYY MM DD':
            dateFormat = 'yyyy M d';
            break;
        case 'D. MMM YYYY':
        case 'DD. MMM YYYY':
        case 'D. MON YYYY':
            dateFormat = 'd. MMM yyyy';
            break;
    }
    return dateFormat;
};

psa_prm.serverlibrary.getNSDateFormatAsExtJS = function getNSDateFormat() {
    // convert NS format into ExtJs notation.
    var dateFormat = 'Y/m/d';
    switch (nlapiGetContext().getPreference('dateformat')) {
        case 'MM/DD/YYYY':
            dateFormat = 'm/d/Y';
            break;
        case 'DD/MM/YYYY':
            dateFormat = 'd/m/Y';
            break;
        case 'DD-Mon-YYYY':
            dateFormat = 'd-M-Y';
            break;
        case 'DD.MM.YYYY':
            dateFormat = 'd.m.Y';
            break;
        case 'DD-MONTH-YYYY':
            dateFormat = 'd-F-Y';
            break;
        case 'DD MONTH, YYYY':
            dateFormat = 'd F, Y';
            break;
        case 'YYYY/MM/DD':
            dateFormat = 'Y/m/d';
            break;
        case 'YYYY-MM-DD':
            dateFormat = 'Y-m-d';
            break;
        case 'M/D/YYYY':
            dateFormat = 'n/j/Y';
            break;
        case 'D/M/YYYY':
            dateFormat = 'j/n/Y';
            break;
        case 'D-Mon-YYYY':
            dateFormat = 'j-M-Y';
            break;
        case 'D.M.YYYY':
            dateFormat = 'j.n.Y';
            break;
        case 'D-MONTH-YYYY':
            dateFormat = 'j-F-Y';
            break;
        case 'D MONTH, YYYY':
            dateFormat = 'j F, Y';
            break;
        case 'YYYY/M/D':
            dateFormat = 'Y/n/j';
            break;
        case 'YYYY-M-D':
            dateFormat = 'Y-n-j';
            break;
        case 'YYYY M D':
            dateFormat = 'Y n j';
            break;
        case 'D. MMM YYYY':
            dateFormat = 'j. M Y';
            break;
        case 'D. MON YYYY':
            dateFormat = 'j. M Y';
            break;
    }

    return dateFormat;
};

psa_prm.serverlibrary.getResourceWorkCalendarId = function getResourceWorkCalendarId(resourceId) {
    return nlapiLookupField('employee', resourceId, 'workcalendar') ||
           nlapiLookupField('vendor', resourceId, 'workcalendar') ||
           nlapiLookupField('genericresource', resourceId, 'workcalendar');
};

psa_prm.serverlibrary.getWorkCalendars = function getWorkCalendars(filters) {
    var search = new psa_prm.serverlibrary.Search('workcalendar', 'customsearch_prm_work_calendar_list'),
        calendarObjects = {};
    
    if (filters) {
        search.addFilters(filters);
    }
    
    var calendars = search.getAllResults();
    
    for (i in calendars) {
        var calendar = calendars[i];
        
        if (!calendarObjects.hasOwnProperty(calendar.id)) {
            calendarObjects[calendar.id] = {
                id          : calendar.id,
                name        : calendar.getValue('name'),
                startHour   : calendar.getValue('starthour'),
                hoursPerDay : calendar.getValue('workhoursperday'),
                sunday      : calendar.getValue('sunday') == 'T',
                monday      : calendar.getValue('monday') == 'T',
                tuesday     : calendar.getValue('tuesday') == 'T',
                wednesday   : calendar.getValue('wednesday') == 'T',
                thursday    : calendar.getValue('thursday') == 'T',
                friday      : calendar.getValue('friday') == 'T',
                saturday    : calendar.getValue('saturday') == 'T',
                nonWork     : new Array()
            }
        }
        
        var exceptionDate = calendar.getValue('exceptiondate');
        if (exceptionDate) {
            calendarObjects[calendar.id].nonWork.push({
                exceptiondate        : calendar.getValue('exceptiondate'),
                exceptiondescription : calendar.getValue('exceptiondescription')
            });
        }
    }
    
    return calendarObjects;
};

psa_prm.serverlibrary.getWorkHoursInDateRange = function(workCalendar, startDate, endDate) {
    var dayMillis = 86400000,
        totalDays = ((endDate.getTime() - startDate.getTime()) / dayMillis) + 1,
        workWeeks = Math.floor(totalDays / 7),
        remainDays = totalDays % 7,
        workDays = [];
    
    if (workCalendar.sunday) workDays.push(0);
    if (workCalendar.monday) workDays.push(1);
    if (workCalendar.tuesday) workDays.push(2);
    if (workCalendar.wednesday) workDays.push(3);
    if (workCalendar.thursday) workDays.push(4);
    if (workCalendar.friday) workDays.push(5);
    if (workCalendar.saturday) workDays.push(6);
    
    var startDateIndex = startDate.getDay(),
        remainWorkDays = 0,
        exceptDays     = 0;
    
    for (var i = 0, j = startDateIndex; i < remainDays; i++, j = ++j % 7) {
        if (workDays.indexOf(j) != -1) remainWorkDays++;
    }
    
    for (var i = 0; i < workCalendar.nonWork.length; i++) {
        var exception = workCalendar.nonWork[i];
        if (exception.exceptiondate) {
            var date = new Date(exception.exceptiondate).getTime();
            if (startDate.getTime() <= date && endDate.getTime() >= date) exceptDays++;
        }
    }
    
    return Number(workCalendar.hoursPerDay) * ((workWeeks * workDays.length) + remainWorkDays - exceptDays);
};

psa_prm.serverlibrary.searchFile = function searchFile(fileName) {
    var searchFilter = [
        new nlobjSearchFilter('name', null, 'is', fileName)
    ];
    var searchColumn = [
        new nlobjSearchColumn('internalid'),
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('folder')
    ];
    var results = nlapiSearchRecord('file', null, searchFilter, searchColumn);
    
    return results;
};

psa_prm.serverlibrary.searchFolder = function searchFolder(folderId) {
    var searchFilter = [
        new nlobjSearchFilter('internalid', null, 'is', folderId)
    ];
    var searchColumn = [
        new nlobjSearchColumn('internalid'),
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('parent')
    ];
    var results = nlapiSearchRecord('folder', null, searchFilter, searchColumn);
    
    return results;
};

psa_prm.serverlibrary.getFileHtmlCode = function getFileHtmlCode(fileName) {
    var results = psa_prm.serverlibrary.searchFile(fileName);
    /*
     * evaluate results
     * if null, throw an error
     * if exactly one, return the html code 
     * if more than one, find the correct file by making sure it is under the correct bundle folder, then return the html code
     */
    if (results == null) {
        throw 'No results; File: ' + fileName;
    } else {
        var fileIdx = 0;
        /*
         * correct the fileIdx if more than 1 result
         */
        if (results.length > 1) {
            nlapiLogExecution('DEBUG', 'Duplicate Filename', 'Found multiple files with name ' + fileName);
            var suiteAppFolder = 'com.netsuite.prm';
            for ( var i in results) {
                var result = results[i];
                var parentId = result.getValue('folder');
                var parentName = null;
                do {
                    var _result = psa_prm.serverlibrary.searchFolder(parentId);
                    if (_result) {
                        parentName = _result[0].getValue('name');
                        if (parentName == suiteAppFolder) {
                            fileIdx = i;
                            parentId = '';
                            nlapiLogExecution('DEBUG', 'Duplicate Filename Resolved', 'Found file with correct parent folder "' + suiteAppFolder + '"');
                        } else {
                            parentId = _result[0].getValue('parent');
                        }
                    } else {
                        parentId = ''; // Handle inactive SuiteBundles folder. Note that any folder included in the file's path (except for SuiteBundles) CANNOT be inactive.
                    }
                } while (parentId != '');
            };
        }
        /*
         * resolve mediaitem URL
         */
        var fileId = results[fileIdx].getId();
        var url = nlapiResolveURL('mediaitem', fileId);
        /*
         * return corresponding html code
         */
        if (fileName.indexOf('.css') > -1) {
            return '<link type="text/css" rel="stylesheet" href="' + url + '" />';
        }
        if (fileName.indexOf('.js') > -1) {
            return '<script type="text/javascript" src="' + url + '"></script>';
        }
    }
};

psa_prm.serverlibrary.findAssignmentLineNumber = function findAssignmentLineNumber(projectTask, resourceId) {
    var totalLineItems = projectTask.getLineItemCount('assignee');
    for (var lineNum = 1; lineNum <= totalLineItems; lineNum++) {
        if (projectTask.getLineItemValue('assignee', 'resource', lineNum) == resourceId) return lineNum;
    }
    return -1;
};

psa_prm.serverlibrary.isProjectTaskUnderProject = function isProjectTaskUnderProject(projectTaskId, projectId) {
    var search = nlapiLoadSearch(null, 'customsearch_prm_project_tasks_list');
    search.addFilter(new nlobjSearchFilter('internalid', 'job', 'anyof', projectId));
    var results = search.runSearch().getResults(0, 1000);
    for (var i = 0; i < results.length; i++) {
        if (results[i].getValue('internalid') == projectTaskId) return true;
    }
    return false;
};

psa_prm.serverlibrary.iterateResultSet = function (resultSet, returnData, callBackFn) {
    var start  = 0,
        limit  = 1000, 
        end    = start + limit,
        length = limit;

    while (length == limit) {
        var results = resultSet.getResults(start, end),
            length = results.length;
        if (returnData) {
            returnData.total = returnData.total + length;
        }
        for (var i = 0; i < length; i++) {
            if (callBackFn) {
                callBackFn(results[i]);
            }
        }
        start = end;
        end = start + limit;
    };
};

psa_prm.serverlibrary.resultSetToHashMap = function (resultSet, keyStr) {
    var dict = {};
    psa_prm.serverlibrary.iterateResultSet(resultSet, undefined, function (res) {
        var key = res.getValue(keyStr);
        dict[key] = res;
    });
    return dict;
};

psa_prm.serverlibrary.getProjectTasksByIds = function (projectIds){
	if (projectIds && projectIds.length > 0) {
		var search = nlapiLoadSearch('projecttask', 'customsearch_prm_project_task_data_2');
		// projects use 'company' as id in project task records
		nlapiLogExecution('DEBUG', 'projectIds', projectIds);
		search.addFilter(new nlobjSearchFilter('internalid', 'job', 'anyof', projectIds));
		var results = search.runSearch();
		var projectTasks = results ? results.getResults(0, 1000) : [];
		return projectTasks;
	} 
	return [];
};

psa_prm.serverlibrary.Search = function Search(record, searchId, addedFilters, addedColumns){
    /** 
     * constructor
     *  - check that required parameters are present
     *  - store parameters as class data members
     */
    this.record = record;
    this.searchId = searchId;
    this.addedFilters = addedFilters || [];
    this.addedColumns = addedColumns || [];
    if (!this.searchId){
        nlapiLogExecution('error', 'PRM_MISSING_PARAM_ERROR', 'Missing parameter (searchId) in psa_prm.serverlibrary.search');
        throw nlapiCreateError('PRM_MISSING_PARAM_ERROR', 'Missing parameter (searchId) in psa_prm.serverlibrary.search', true);
    }

    // -- PUBLIC -- //
    /** 
     * isGovernanceLimitReached
     *  - check if NS governance limit for script run is already reached
     *
     *  @returns {Boolean} - flag for passing governance limit
     */    
    this.isGovernanceLimitReached = function isGovernanceLimitReached(){
        // set the minimum governance before declaring governance limit reached
        var minGovernance = 100;
        
        // check if limit is reached
        var context = nlapiGetContext();
        var usageRemaining = context.getRemainingUsage();
        var isLimitReached = (usageRemaining < minGovernance) ? true : false;

        // log if limit is reached
        if (isLimitReached){
            nlapiLogExecution("error", "psa_prm.serverlibrary.search", "Governance limit is already reached");
        }
        
        return isLimitReached;    
    };

    /** 
     * getResults
     *  - works like normal NS nlapiLoadSearch().runSearch().getResults
     *
     * @returns {Array} - result objects     
     */    
    this.getResults = function getResults(start, end){
        this.startSearchTimer();
        
        // proceed with search
        var returnData = [];
        var search = nlapiLoadSearch(this.record, this.searchId);
        this.applyFilterExpressions(search);
        this.applyFilters(search);
        this.applyColumns(search);
        var results = search.runSearch();
        var returnData = results ? results.getResults(start, end) : [];
        
        this.stopSearchTimer('Search.getResults', returnData.length);
        
        return returnData;
    };
    
    /** 
     * getAllResults
     *  - get all search results with respect to remaining governance
     *  - choice of optimization is decided here
     *
     * @param {Integer} - maxLength - limit of search results
     * @returns {Array} - result objects     
     */
    this.getAllResults = function getAllResults(maxLength){
        this.startSearchTimer();
        
        var returnData = [];
        try {
            var isWithinAllowedLength = true;
            var search = nlapiLoadSearch(this.record, this.searchId);
            this.applyFilterExpressions(search);
            this.applyFilters(search);
            this.applyColumns(search);
            
            var results = search.runSearch();
            
            // perform batch data retrievals until all results are retrieved or until governance limit is already reached
            if (results){
                var start = 0;
                var NS_LIMIT = 1000;
                var end = (maxLength && maxLength < NS_LIMIT) ? maxLength : NS_LIMIT;
                do {            
                    var searchResult = results.getResults(start, end) || [];
                    var isLastSetRetrieved = searchResult.length < NS_LIMIT;
                    var potentialLength = returnData.length + searchResult.length;
                    if (maxLength && potentialLength >= maxLength){
                        // limit results to specified length
                        isWithinAllowedLength = false;
                        var remainingSpace = maxLength - returnData.length;
                        returnData = returnData.concat(searchResult.slice(0,remainingSpace));
                    }
                    else {
                        returnData = returnData.concat(searchResult);
                    }
                    
                    start += NS_LIMIT;
                    end += NS_LIMIT;
                }
                while (isWithinAllowedLength && !this.isGovernanceLimitReached() && !isLastSetRetrieved);
            }
        
            this.stopSearchTimer('Search.getAllResults', returnData.length);
        }
        catch(ex){
            if (ex && ex.getCode && ex.getDetails){
                nlapiLogExecution("error", "psa_prm.serverlibrary.search.getAllResults", "ERROR: " +  ex.getCode() + "-" + ex.getDetails());
            }
            else{
                nlapiLogExecution("error", "psa_prm.serverlibrary.search.getAllResults", "ERROR: " +  ex);
            }
            
            throw nlapiCreateError('PRM_SEARCH_ERROR', 'Error in psa_prm.serverlibrary.search.getAllResults for searchId ' + this.searchId, true);
        }
        
        return returnData;
    };
    
    /** 
     * startSearchTimer
     *  - records the start date before running search
     */      
    this.searchStartTime = null;
    this.startSearchTimer = function startSearchTimer(){
        this.searchStartTime = new Date();
    };
    
    /** 
     * stopSearchTimer
     *  - calculates total search run time then logs it
     */          
    this.stopSearchTimer = function stopSearchTimer(title, dataLength){
        var runTime = (new Date()) - this.searchStartTime;
        // log run time
        nlapiLogExecution("debug", title, "Search time for " + title + " (" + dataLength + ") of " +  this.searchId + " is " + runTime + "ms");        
    };
    
    this.addFilter = function addFilter(filter){
        this.addedFilters.push(filter);
    };

    this.addFilters = function addFilters(filters){
        this.addedFilters = this.addedFilters.concat(filters);
    };

    this.addColumn = function addColumn(column){
        this.addedColumns.push(column);
    };

    this.addColumns = function addColumns(columns){
        this.addedColumns = this.addedColumns.concat(columns);
    };

    this.applyFilters = function applyFilters(search){
        if (this.addedFilters.length > 0){
            search.addFilters(this.addedFilters);
        }
    };

    this.applyColumns = function applyColumns(search){
        if (this.addedColumns.length > 0){
            search.addColumns(this.addedColumns);
        }
    };
    
    this.applyFilterExpressions = function applyFilterExpressions(search) {
        if (this.filterExpression) {
            search.setFilterExpression(this.filterExpression);
        }
    };
    
    this.getFilterExpression = function getFilterExpression() {
        var search = nlapiLoadSearch(this.record, this.searchId);
        return search.getFilterExpression();
    };
    
    this.setFilterExpression = function setFilterExpression(filterExpression) {
        this.filterExpression = filterExpression;
    };
};

psa_prm.serverlibrary.removeDuplicates = function (arr) {
    if (arr && Array.isArray(arr)) {
        return arr.sort().filter(function(elem, index, array) {
            return array.indexOf(elem) == index;
        });
    }
};

psa_prm.serverlibrary.getDescendants = function (recordType, selectedIds) {
    var ids = [];
    if (selectedIds) {
        if (Array.isArray(selectedIds)) {
            selectedIds.forEach(function (id) {
                ids.push.apply(ids, psa_prm.serverlibrary.getAllDescendants(recordType, id));
            });
            ids.push.apply(ids, selectedIds);
        } else {
            ids = psa_prm.serverlibrary.getAllDescendants(recordType, selectedIds);
            ids.push(selectedIds);
        }
        ids = psa_prm.serverlibrary.removeDuplicates(ids);
    }
    return ids;
};

psa_prm.serverlibrary.getAllDescendants = function (recordType, parentId) {
    var searchFilter = [
            new nlobjSearchFilter('isinactive', null, 'is', 'F'),
            new nlobjSearchFilter('parent', null, 'equalto', parentId)
        ],
        searchColumn = [new nlobjSearchColumn('internalid')],
        search = nlapiCreateSearch(recordType, searchFilter, searchColumn),
        results = search.runSearch(),
        idList = [],
        response = [],
        ids = null;
    
    results.forEachResult(function(searchResult) {
        idList.push(searchResult.getValue('internalid'));
        return true;
    });
    
    if (idList.length > 0) {
        idList.forEach(function (id) {
            if (id && id > 0) {
                ids = psa_prm.serverlibrary.getAllDescendants(recordType, id);
            }
            if (ids && ids.length > 0) {
                response.push.apply(response, ids);
            } 
        });
        response.push.apply(response, idList);
    }
    return response;
};

psa_prm.serverlibrary.isFeatureEnabled = function (featureId) {
    var context = nlapiGetContext();
    return context.getFeature(featureId);
};

psa_prm.serverlibrary.getStartDateTypeMap = function() {
    var map = {
        ALL                 : 1,
        PROJECT             : 2,
        PROJECT_TASK        : 3,
        TASK_ASSIGNMENT     : 4,
        RESOURCE_ALLOCATION : 5
    };
    
    try {
        var startDateTypes = nlapiSearchRecord('customlist_prm_start_date_type', null, null, new nlobjSearchColumn('name'));
        
        for (i in startDateTypes) {
            var name = startDateTypes[i].getValue('name').split(' ').join('_').toUpperCase();
            map[name] = startDateTypes[i].id;
        }
    } catch(err) {
    }
    
    nlapiLogExecution('DEBUG', 'startDateTypeMap', JSON.stringify(map));
    
    return map;
};

psa_prm.serverlibrary.getLastUsedFilterId = function() {
    try {
        var currentUser    = nlapiGetContext().getUser(),
            settingsRecord = nlapiSearchRecord('customrecord_prm_settings', null, new nlobjSearchFilter('owner', null, 'is', currentUser), new nlobjSearchColumn('custrecord_prm_last_used_filter'))[0];
    
        return Number(settingsRecord.getValue('custrecord_prm_last_used_filter'));
    } catch(err) {
        return 0;
    }
};

psa_prm.serverlibrary.loadLastUsedFilter = function() {
    try {
        var filter = nlapiLoadRecord('customrecord_prm_filters', psa_prm.serverlibrary.getLastUsedFilterId());
    
        return {
            startDateType        : filter.getFieldValue('custrecord_prm_filter_start_date_type'),
            startDate            : filter.getFieldValue('custrecord_prm_filter_start_date'),
            resourceTypeEmployee : filter.getFieldValue('custrecord_prm_filter_restype_employee'),
            employees            : filter.getFieldValues('custrecord_prm_filter_employee'),
            resourceTypeVendor   : filter.getFieldValue('custrecord_prm_filter_restype_vendor'),
            vendors              : filter.getFieldValues('custrecord_prm_filter_vendor'),
            resourceTypeGeneric  : filter.getFieldValue('custrecord_prm_filter_restype_generic'),
            genericResources     : filter.getFieldValues('custrecord_prm_filter_generic_resource'),
            billingClasses       : filter.getFieldValue('custrecord_prm_filter_billing_class'),
            subsidiaries         : filter.getFieldValue('custrecord_prm_filter_subsidiary'),
            includeSubSubsidiary : filter.getFieldValue('custrecord_prm_filter_sub_subsidiary'),
            customers            : filter.getFieldValue('custrecord_prm_filter_customer'),
            projects             : filter.getFieldValue('custrecord_prm_filter_project'),
            tasks                : filter.getFieldValue('custrecord_prm_filter_task')
        };
    } catch(err) {
        return {};
    }
};

psa_prm.serverlibrary.getTimeEntriesByProject = function(projectId) {
    var search            = new psa_prm.serverlibrary.Search('timebill', 'customsearch_prm_all_time_bills'),
        allTimeEntries    = [],
        lastUsedFilter    = psa_prm.serverlibrary.loadLastUsedFilter(),
        viewableResources = ProjectResourceService.getViewableResources(lastUsedFilter),
        startDateTypeMap  = psa_prm.serverlibrary.getStartDateTypeMap(),
        filterExpression = [ 'AND', [ 'customer', 'is', projectId ] ];
    
    // adjust startdate
    if (!lastUsedFilter.startDateType) {
        lastUsedFilter.startDateType = startDateTypeMap.PROJECT;
        lastUsedFilter.startDate = new Date();
        lastUsedFilter.startDate = psa_prm.serverlibrary.addYearToDate(lastUsedFilter.startDate, -1);
    }
    
    switch (lastUsedFilter.startDateType) {
        case startDateTypeMap.ALL:
        case startDateTypeMap.PROJECT:
            filterExpression = filterExpression.concat([ 'AND', [ 'date', 'onorafter', lastUsedFilter.startDate ] ]);
            break;
        case startDateTypeMap.PROJECT_TASK:
        case startDateTypeMap.TASK_ASSIGNMENT:
            filterExpression = filterExpression.concat([ 'AND', [ [ 'type', 'is', 'B' ], 'OR', [ 'date', 'onorafter', lastUsedFilter.startDate ] ] ]);
            break;
        case startDateTypeMap.RESOURCE_ALLOCATION:
            filterExpression = filterExpression.concat([ 'AND', [ [ 'type', 'is', 'P' ], 'OR', [ 'type', 'is', 'A' ], 'OR', [ 'date', 'onorafter', lastUsedFilter.startDate ] ] ]);
            break;
    }
    
    if (viewableResources != 'All') {
        filterExpression = filterExpression.concat([ 'AND', [ 'employee', 'anyof', viewableResources ] ]);
    }
    
    nlapiLogExecution('DEBUG', 'filterExpression', JSON.stringify(filterExpression));
    
    search.setFilterExpression([search.getFilterExpression()].concat(filterExpression));
    
    var searchResults = search.getAllResults();
    for (var i = 0; i < searchResults.length; i++) {
        var searchResult = searchResults[i];
        allTimeEntries.push({
            projectId  : searchResult.getValue('customer', null, 'group'),
            date       : searchResult.getValue('date', null, 'group'),
            type       : searchResult.getValue('type', null, 'group'),
            duration   : searchResult.getValue('durationdecimal', null, 'sum')
        });
    }
    nlapiLogExecution('DEBUG', 'getAllTimeEntries', JSON.stringify(allTimeEntries));
    return allTimeEntries;
};

/**
 * converts a comma separated string of numbers to array of numbers
 * if the input does not have a comma, it will return an empty string
 * if the input is a single digit number it will return that number in Number format
 * '1,2,3,4' to [1,2,3,4]
 * '1' to 1
 * */
psa_prm.serverlibrary.splitStringToNumberArray = function(someString) {
    if (someString) {
        
        if (someString instanceof Array) {
            return someString;
        }
        
        var isCommaSeparated = someString.indexOf(',') > 0; 
        return isCommaSeparated ? someString.split(',').map(Number) : parseInt(someString);
    }
    return '';
};


/**
 * 
 * converts an array of objects to an associative map
 * assumes that the key passed as argument exists in every single object
 * */
psa_prm.serverlibrary.arrayAsMap = function(array, key) {
	return array.reduce(function(prev, current) {
		prev[current[key]] = current;
		return prev;
	}, {});
};


psa_prm.serverlibrary.addYearToDate = function(date, year) {
    var clone = new Date(date);
    
    clone.setFullYear(clone.getFullYear() + year);
    
    return clone;
};

psa_prm.serverlibrary.padSpacesBetweenCommaSeparatedStrings = function(str) {
    return str.split(',').join(', ');
};

psa_prm.serverlibrary.getResourceAllocationCount = function(resource, project) {
    var search = new psa_prm.serverlibrary.Search('resourceallocation', 'customsearch_prm_allocation_data');

    if (resource) {
        search.addFilter(new nlobjSearchFilter('resource', null, 'anyof', resource));
    }
    
    if (project) {
        search.addFilter(new nlobjSearchFilter('project', null, 'anyof', project));
    }
    
    return search.getAllResults().length;
};

psa_prm.serverlibrary.ScriptSearch = function ScriptSearch(record, filters, columns) {
    
    this.record = record;
    this.filters = filters || null;
    this.columns = columns || null;
    
    this.getAllResults = function() {
        try {
            var search     = nlapiCreateSearch(this.record, this.filters, this.columns),
                results    = search.runSearch(),
                resultSet  = null,
                setSize    = 1000,
                startIndex = 0,
                endIndex   = startIndex + setSize,
                allResults = [];
            
            do {
                resultSet = results.getResults(startIndex, endIndex);
                
                if (resultSet) {
                    allResults = allResults.concat(resultSet);
                    startIndex += setSize;
                    endIndex += setSize;
                }
            } while(resultSet && resultSet.length);
            
            return allResults;
        } catch(ex) {
            var errorCode    = ex.name || ex.getCode(),
                errorMessage = ex.message || ex.getDetails();
      
            nlapiLogExecution('ERROR', errorCode, errorMessage);
            
            return [];
        }
    };
};