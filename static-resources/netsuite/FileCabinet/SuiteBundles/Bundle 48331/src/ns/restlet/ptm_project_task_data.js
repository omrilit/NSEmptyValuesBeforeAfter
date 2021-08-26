/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
 
/**
 * @param {Object} dataIn Parameter object
 * @returns {Object} Output object
 */

var onServerLog = true;
var MSG_TITLE = 'PTM_PROJECT_TASK_DATA';
var ptmServLib = psa_ptm.serverlibrary;
var logger = new ptmServLib.logger(MSG_TITLE, false);

if (onServerLog) {
    logger.enable();
}

function getRESTlet(dataIn) {
    var context = nlapiGetContext();
    try {
        
        MSG_TITLE = 'getRESTlet Start';
        
        /*
         * Variables
         */
        MSG_TITLE = 'getRESTlet Variables';
        
        var jsonInputData = ptmServLib.toJson(dataIn);
        var jsonReturnData = new Object();
        
        var isReplyInJSON;
        var isResource;
        var isPaging;
        
        var resourceLimit = 20;
        var resourceOffset = 0;
        
        var selectedResources;
        
        var showAllResources = false;
        var includeInactive = false; 
        
        var assigneesFilter;
        var projectsFilter;
        var tasksFilter;
        var parentsFilter;
        
        var taskDateOperator;
        var taskDateValue1;
        var taskDateValue2;
        
        var assignDateOperator;
        var assignDateValue1;
        var assignDateValue2;
        
        var resourceName;
        
        var isEditable = true;
        
        var resourceSearchFilters = [];
        var taskSearchFilters = [];
        
        /*
         * Parameters Set-up
         */
        MSG_TITLE = 'getRESTlet Parameters';
        if (jsonInputData) {
            isReplyInJSON = (jsonInputData.is_json && jsonInputData.is_json == 'F') ? false : true;
            isResource = (jsonInputData.isResource && jsonInputData.isResource == 'F' ) ? false : true;
            isPaging = (jsonInputData.isPaging && jsonInputData.isPaging == 'T' ) ? true : false;
            
            selectedResources = ptmServLib.isValidObject(jsonInputData.selectedResources) ? jsonInputData.selectedResources.split('~') : null;
            
            resourceLimit    = ptmServLib.isValidObject(jsonInputData.limit) ? parseInt(jsonInputData.limit) : resourceLimit;
            resourceOffset   = ptmServLib.isValidObject(jsonInputData.start) ? parseInt(jsonInputData.start) : 0;
            showAllResources = (ptmServLib.isValidObject(jsonInputData.showAllResources) && jsonInputData.showAllResources == 'T');
            includeInactive  = (ptmServLib.isValidObject(jsonInputData.includeInactive) && jsonInputData.includeInactive == 'T');
            
            assigneesFilter  = ptmServLib.isValidObject(jsonInputData.assigneesFilter) ? jsonInputData.assigneesFilter.split(',') : null;
            customersFilter  = ptmServLib.isValidObject(jsonInputData.customersFilter) ? jsonInputData.customersFilter.split(',') : null;
            projectsFilter   = ptmServLib.isValidObject(jsonInputData.projectsFilter) ? jsonInputData.projectsFilter.split(',') : null;
            tasksFilter      = ptmServLib.isValidObject(jsonInputData.tasksFilter) ? jsonInputData.tasksFilter.split(',') : null;
            parentsFilter    = ptmServLib.isValidObject(jsonInputData.parentsFilter) ? jsonInputData.parentsFilter.split(',') : null;
            
            taskDateOperator   = ptmServLib.isValidObject(jsonInputData.taskDateOperator) ? jsonInputData.taskDateOperator : 'onorafter';
            taskDateValue1     = ptmServLib.isValidObject(jsonInputData.taskDateValue1) ? jsonInputData.taskDateValue1 : null;
            taskDateValue2     = ptmServLib.isValidObject(jsonInputData.taskDateValue2) ? jsonInputData.taskDateValue2 : null;
            assignDateOperator = ptmServLib.isValidObject(jsonInputData.assignDateOperator) ? jsonInputData.assignDateOperator : 'onorafter';
            assignDateValue1   = ptmServLib.isValidObject(jsonInputData.assignDateValue1) ? jsonInputData.assignDateValue1 : null;
            assignDateValue2   = ptmServLib.isValidObject(jsonInputData.assignDateValue2) ? jsonInputData.assignDateValue2 : null;
            
            resourceName    = ptmServLib.isValidObject(jsonInputData.resourceSearch) ? jsonInputData.resourceSearch : null;
            
            isEditable    = ptmServLib.isValidObject(jsonInputData.editable) ? Boolean(jsonInputData.editable) : true;
        }
        
        logger.debug('getRESTlet Parameters',
            'getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n'
          + 'Language           : ' + context.getPreference('LANGUAGE') + '\r\n' 
          + 'is_json            : ' + isReplyInJSON + '\r\n' 
          + 'isResource         : ' + isResource + '\r\n'
          + 'isPaging           : ' + isPaging + '\r\n'
          + 'resourceLimit      : ' + resourceLimit + '\r\n' 
          + 'resourceOffset     : ' + resourceOffset + '\r\n'
          + 'showAllResources   : ' + showAllResources + '\r\n'
          + 'includeInactive    : ' + includeInactive + '\r\n' 
          + 'assigneesFilter    : ' + assigneesFilter + '\r\n'
          + 'customersFilter    : ' + customersFilter + '\r\n' 
          + 'projectsFilter     : ' + projectsFilter + '\r\n' 
          + 'tasksFilter        : ' + tasksFilter + '\r\n' 
          + 'parentsFilter      : ' + parentsFilter + '\r\n'
          + 'taskDateOperator   : ' + taskDateOperator + '\r\n' 
          + 'taskDateValue1     : ' + taskDateValue1 + '\r\n' 
          + 'taskDateValue2     : ' + taskDateValue2 + '\r\n' 
          + 'assignDateOperator : ' + assignDateOperator + '\r\n' 
          + 'assignDateValue1   : ' + assignDateValue1 + '\r\n' 
          + 'assignDateValue2   : ' + assignDateValue2 + '\r\n' 
          + 'resourceName       : ' + resourceName + '\r\n'
          + 'isEditable         : ' + isEditable + '\r\n' 
          + '************************' + '\r\n'
          + 'selectedResources  : ' + selectedResources + '\r\n' 
          + 'jsonInputData      : ' + JSON.stringify(jsonInputData) + '\r\n'
        );
        
        /*
         * Build filters
         */
        //  exclude closed projects
        taskSearchFilters.push(
            new nlobjSearchFilter('issummarytask', null, 'is', 'F'),
            new nlobjSearchFilter('status', 'job', 'noneof', 1) // 1 - closed, 2 - in progress, 3 - not awarded, 4 - pending, 5 - awarded
            );
        
        if (ptmServLib.isValidObject(assigneesFilter)) {
            var CURRENT = '-2';
            var HIERARCHY = '-3';
            var hierarchyArray = assigneesFilter;
            var curIndex = hierarchyArray.indexOf(CURRENT);
            var heiIndex = hierarchyArray.indexOf(HIERARCHY);
            
            assigneesFilter = hierarchyArray.filter(function(element, index, array){
                return (element != CURRENT) && (element != HIERARCHY);
            });
            
            if (curIndex > -1) {
                hierarchyArray[curIndex] = '@CURRENT@';
            }
            
            if (heiIndex > -1) {
                hierarchyArray[heiIndex] = '@HIERARCHY@';
            }
            
            resourceSearchFilters.push(new nlobjSearchFilter('internalid', null, 'anyof', hierarchyArray));
            
            taskSearchFilters.push(new nlobjSearchFilter('resource', 'projecttaskassignment', 'anyof', hierarchyArray));
        }
        
        if (ptmServLib.isValidObject(customersFilter)) {
            taskSearchFilters.push(new nlobjSearchFilter('customer', 'job', 'anyof', customersFilter));
        }
        
        if (ptmServLib.isValidObject(projectsFilter)) {
            taskSearchFilters.push(new nlobjSearchFilter('company', null, 'anyof', projectsFilter));
        }
        
        if (ptmServLib.isValidObject(tasksFilter)) {
            taskSearchFilters.push(new nlobjSearchFilter('internalid', null, 'anyof', tasksFilter));
        }
        
        if (ptmServLib.isValidObject(parentsFilter)) {
            taskSearchFilters.push(new nlobjSearchFilter('parent', null, 'anyof', parentsFilter));
        }
        
        if (!includeInactive) {
            taskSearchFilters.push(new nlobjSearchFilter('isinactive', 'job', 'is', 'F'));
        }
        
        if (ptmServLib.isValidObject(taskDateValue1)){
            if(ptmServLib.isValidObject(taskDateValue2)) { //date range
                taskSearchFilters.push(new nlobjSearchFilter('startdate', null, taskDateOperator, taskDateValue1, taskDateValue2));
            }
            else {
                taskSearchFilters.push(new nlobjSearchFilter('startdate', null, taskDateOperator, taskDateValue1));
            }
        }
        
        if (ptmServLib.isValidObject(assignDateValue1)){
            // join with projecttaskassignment
            if(ptmServLib.isValidObject(assignDateValue2)) { //date range
                taskSearchFilters.push(new nlobjSearchFilter('startdate', 'projecttaskassignment', assignDateOperator, assignDateValue1, assignDateValue2));
            }
            else {
                taskSearchFilters.push(new nlobjSearchFilter('startdate', 'projecttaskassignment', assignDateOperator, assignDateValue1));
            }
        }
        
        if (ptmServLib.isValidObject(resourceName) ) {
            taskSearchFilters.push(new nlobjSearchFilter('resourcename', 'projecttaskassignment', 'contains', resourceName));
            resourceSearchFilters.push(new nlobjSearchFilter('entityid', null, 'contains', resourceName));
        }
        
        /*
         * Main
         */
//        for ( var m = 0; m < taskSearchFilters.length; m++) {
//            logger.debug(MSG_TITLE, taskSearchFilters[m].getName() + ' - ' + taskSearchFilters[m].getJoin() + ' - ' + taskSearchFilters[m].getOperator());
//        }

        if (isResource && isPaging){           
            // Get values for page navigation dropdown field
            MSG_TITLE = 'getRESTlet Page Navigation';
            jsonReturnData = {
                  'success' : true
                , 'message' : 'Loaded Page Navigation Data'
                , 'data' : getPaginationDetails(showAllResources, resourceLimit, taskSearchFilters, resourceSearchFilters)
            };            
        }
        else if (!isResource) {
            /*
             * Get Resource Project Task Data (Right Pane)
             */
            MSG_TITLE = 'getRESTlet Project Task';
            jsonReturnData = {
                  'success' : true
                , 'message' : 'Loaded Project Task Data'
                , 'data' : getAllProjectTaskAsArray(selectedResources, taskSearchFilters, isEditable)
            };
        }
        else {
            /*
             * Get Resource Tree (Left Pane)
             */
            MSG_TITLE = 'getRESTlet Resources';
            jsonReturnData = {
                  'Id' : '0'
                , 'Name' : 'root'
                , 'details' : new Object()
                , 'children' : new Array()
            };
                  
            jsonReturnData.details = {
                  'type' : 'root'
                , 'success' : true
                , 'total' : 0
                , 'selectedResources' : null
            };

            MSG_TITLE = 'getRESTlet getTotalResources';
            jsonReturnData.details.total = showAllResources ? getTotalResources(resourceSearchFilters) : getTotalResourcesWithTasks(taskSearchFilters);
            
            MSG_TITLE = 'getRESTlet getProjectResourcesAsArray';
            var resources = showAllResources 
                ? getAllProjectResourcesAsArray(resourceLimit, resourceOffset, jsonReturnData.details.total, taskSearchFilters, resourceSearchFilters) 
                : getProjectResourcesAsArray(resourceLimit, resourceOffset, jsonReturnData.details.total, taskSearchFilters);
            
            MSG_TITLE = 'getRESTlet getSelectedResourcesAsString';
            jsonReturnData.details.selectedResources = resources.resourceIds;
            
            MSG_TITLE = 'getRESTlet root children';
            jsonReturnData.children = resources.resources;
            
            /*
             * if no results returned
             */
            if (jsonReturnData.details.total == '0' && ptmServLib.isValidObject(resourceName)) {
                jsonReturnData.children.push({
                    'Id' : '0'
                  , 'Name' : PTMTranslationManager.getString('SS.MESSAGE.NO_SEARCH_RESULTS_FOUND') //User message
                  , 'details' : {}
                  , 'children' : []
                });
            }
            else if (jsonReturnData.details.total == '0'){
                jsonReturnData.children.push({
                    'Id' : '0'
                  , 'Name' : PTMTranslationManager.getString('SS.MESSAGE.NO_RESULTS_FOUND') //User message
                  , 'details' : {}
                  , 'children' : []
                });
            }
        }

        /*
         * Return format: Json or String
         */
        MSG_TITLE = 'getRESTlet Return';
        logger.debug(MSG_TITLE,
              'getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n'
            + 'Language           : ' + context.getPreference('LANGUAGE') + '\r\n' 
            + '************************' + '\r\n'
            + 'isResource       : ' + isResource + '\r\n'
            + 'jsonInputData    : ' + JSON.stringify(jsonInputData) + '\r\n'
            + 'jsonReturnData   : ' + JSON.stringify(jsonReturnData) + '\r\n'
        );
        
    } catch (ex) {
        logger.enable();
        
        var body_message = 'params : ' + JSON.stringify(dataIn);
        if (ex instanceof nlobjError){
            body_message = body_message + '\nSystem Error: '+ex.getCode() + ': ' + ex.getDetails();
            logger.error(MSG_TITLE, body_message);
        }else {
            body_message = body_message + '\nUnexpected Error: '+ex;
            logger.error(MSG_TITLE, body_message);
        }
        jsonReturnData = ptmServLib.getFailMessage (body_message);
    }
    
    if (isReplyInJSON) return jsonReturnData;
    else return JSON.stringify(jsonReturnData);
}

function getAllProjectResourcesAsArray(resourceLimit, resourceOffset, totalResources, taskFilters, resourceSearchFilters) {
    var end          = ((resourceOffset + resourceLimit > totalResources) ? totalResources : (resourceOffset + resourceLimit));
    var results      = getProjectResources(resourceSearchFilters, resourceOffset, end);
    var resources    = [];
    var resourceIds  = [];

    var workCalendars = ptmServLib.getWorkCalendars();
    for (var i = 0, length = results.length; i < length; i++) {
        var searchResult = results[i];
        var resource        = {};
        var workcalendarId  = searchResult.getValue('internalid', 'workcalendar');
        var type            = searchResult.getValue('type');
        resource.Id         = searchResult.getValue('internalid');
        resource.Name       = searchResult.getValue('entityid');
        resource.children   = [];
        resource.details    = {};
        resource.details.type   = 'resource';
        resource.details.workcalendar = ptmServLib.getWorkCalendarPerResourceAsJson(workcalendarId, workCalendars);
        resource.details.laborcost = searchResult.getValue('laborcost', type);
        resourceIds.push(resource.Id);
        resources.push(resource);
    }
    taskFilters.push(new nlobjSearchFilter('resource', 'projecttaskassignment', 'anyof', resourceIds));
    return addProjectDetails(resources, taskFilters, resourceIds);
};

function getProjectResourcesAsArray(resourceLimit, resourceOffset, totalResources, taskFilters) {
    var end          = ((resourceOffset + resourceLimit > totalResources) ? totalResources : (resourceOffset + resourceLimit));
    var resourceIds  = getProjectResourcesWithTasks(taskFilters, resourceOffset, end);
    
    if (resourceIds.length > 0) {
        var resourceSearchFilters = [new nlobjSearchFilter('internalid', null, 'anyof', resourceIds)];
        return getAllProjectResourcesAsArray(resourceLimit, 0, totalResources, taskFilters, resourceSearchFilters);
    }
    
    return {'resources' : [], 'resourceIds'  : '' };
};

function addProjectDetails(resources, taskFilters, resourceIds) {
    MSG_TITLE = 'getRESTlet addProjectDetails';
    var results    = getProjectTasksForResourceTree(taskFilters, resourceIds);
    var projectIds = [];

    for (var i = 0, length = results.length; i < length; i++) {
        var searchResult = results[i];
        var id        = searchResult.getValue('resource', 'projecttaskassignment'),
            projectId = searchResult.getValue('company'),
            resource  = resources.filter(function(element, index, array) {
                return (element.Id == id + '');
            })[0],
            project   = resource.children.filter(function(element, index, array) {
                return (element.Id == id + '~' + projectId);
            })[0];
        
        if (project == null) {
            var companyName = searchResult.getValue('companyname', 'job'); // TODO: try to search for a column that returns Project only, not Customer : Project
            var cnArr = companyName.split(' : ');
            
            project          = {
                Id : id + '~' + projectId,
                Name : searchResult.getText('company'),
                children : [],
                details : {
                    type : 'project',
                    resourceDetails : '', 
                    isProjectTemplate : searchResult.getValue('company') != searchResult.getValue('internalid', 'job'),
                    tip : {
                        name      : cnArr.length == 2 ? cnArr[1] : cnArr[0],
                        percent   : searchResult.getValue('percenttimecomplete', 'job'),
                        estimate  : searchResult.getValue('estimatedtimeoverride', 'job'),
                        actual    : searchResult.getValue('actualtime', 'job'),
                        remaining : searchResult.getValue('timeremaining', 'job'),
                        start     : searchResult.getValue('startdate', 'job'),
                        end       : searchResult.getValue('calculatedenddate', 'job')
                    }
                }
            };
            
            /*
             * round up to 1 decimal digit
             */
            project.details.tip.percent = Number(project.details.tip.percent.replace('%','')).toFixed(1) + '%';
            /*
             * convert to hh:mm format
             */
            var pad = function(num) {
                var s = "00" + num;
                return s.substr(s.length - 2);
            }
            var toHHMM = function(num) {
                return Math.floor(num) + ':' + pad(Math.round(60 * (num % 1)));
            }
            project.details.tip.estimate = toHHMM(project.details.tip.estimate);
            project.details.tip.actual = toHHMM(project.details.tip.actual);
            project.details.tip.remaining = toHHMM(project.details.tip.remaining);
            
            projectIds.push(projectId);
            resource.children.push(project);
        }
        
        project.children.push({
            Id : id + '~' + projectId + '~' + searchResult.getValue('internalid', 'projecttaskassignment'),
            Name : searchResult.getValue('title'),
            children : [],
            details : {
                type : 'projecttask',
                taskId : searchResult.getId()
            }
        });
    }

    if (projectIds.length > 0) {
        resources = assignProjectResourceDetails(resources, projectIds);
    }
    
    var recIds = (resourceIds.length > 0) ? resourceIds.toString().replace(/,/g, '~') : '';
    
    return { 'resources' : resources, 'resourceIds'  : recIds };
};

function assignProjectResourceDetails(resources, projectIds) {
    MSG_TITLE = 'getRESTlet assignProjectResourceDetails';
    var results = getProjectResourceDetails(projectIds);
    
    for (var k = 0; k < results.length; k++) {
        var project = results[k];
        for (var i = 0; i < resources.length; i++) {
            var subset = resources[i].children.filter(function(element, index, array) {
                return (element.Id.indexOf('~' + project.Id) > -1);
            });
            if (subset != null) {
                for (var j = 0; j < subset.length; j++) {
                    subset[j].details.resourceDetails = project.resourceIds.toString().replace(/,/g, '~'); // replace comma with tilde
                }
            }
        }
    }
    
    return resources;
};

function getProjectTasksForResourceTree(taskFilters, resourceId){
    MSG_TITLE = 'getRESTlet getProjectTasksForResourceTree';
    var searchColumn = [
                new nlobjSearchColumn('resource', 'projectTaskAssignment').setSort(),
                new nlobjSearchColumn('company').setSort(),
                new nlobjSearchColumn('id').setSort(),
                new nlobjSearchColumn('title'),
                new nlobjSearchColumn('internalid', 'projectTaskAssignment'),
                new nlobjSearchColumn('allowallresourcesfortasks', 'job'),
                // project tooltip details
                new nlobjSearchColumn('companyname', 'job'), // TODO: try to search for a column that returns Project only, not Customer : Project
                new nlobjSearchColumn('percenttimecomplete', 'job'),
                new nlobjSearchColumn('estimatedtimeoverride', 'job'),
                new nlobjSearchColumn('actualtime', 'job'),
                new nlobjSearchColumn('timeremaining', 'job'),
                new nlobjSearchColumn('startdate', 'job'),
                new nlobjSearchColumn('calculatedenddate', 'job'),
                new nlobjSearchColumn('internalid', 'job'),
            ],
        searchFilter = [];
    
    if(resourceId) {
        searchFilter.push(new nlobjSearchFilter('assignee', null, 'anyof', resourceId));
    }
    else {
        searchFilter.push(new nlobjSearchFilter('assignee', null, 'noneof', '-UNASSIGNED-'));
    }
    
    if (taskFilters && taskFilters.length > 0) {
        searchFilter = searchFilter.concat(taskFilters);
    } 
   
    var search = new ptmServLib.Search('projecttask', searchFilter, searchColumn);
    
    return search.getAllResults();
}

function getProjectTasks(resourceId, searchFilters){
    var searchColumn = [
            new nlobjSearchColumn('id'),
            new nlobjSearchColumn('title'),
            new nlobjSearchColumn('company').setSort(),
            new nlobjSearchColumn('estimatedwork'),
            new nlobjSearchColumn('startdate'),
            new nlobjSearchColumn('enddate'),
            new nlobjSearchColumn('priority'),
            new nlobjSearchColumn('status'),
            new nlobjSearchColumn('percentworkcomplete'),
            new nlobjSearchColumn('constrainttype'),
            new nlobjSearchColumn('finishbydate'),
            new nlobjSearchColumn('issummarytask'),
            new nlobjSearchColumn('internalid', 'projectTaskAssignment'),
            new nlobjSearchColumn('resource', 'projectTaskAssignment'),
            new nlobjSearchColumn('startdate', 'projectTaskAssignment'),
            new nlobjSearchColumn('enddate', 'projectTaskAssignment'),
            new nlobjSearchColumn('serviceitem', 'projectTaskAssignment'),
            new nlobjSearchColumn('units', 'projectTaskAssignment'),
            new nlobjSearchColumn('unitcost', 'projectTaskAssignment'),
            new nlobjSearchColumn('unitprice', 'projectTaskAssignment'),
            new nlobjSearchColumn('estimatedwork', 'projectTaskAssignment'),
            new nlobjSearchColumn('actualwork', 'projectTaskAssignment'),
            new nlobjSearchColumn('allowallresourcesfortasks', 'job'),
            new nlobjSearchColumn('internalid', 'job')
        ],
        searchFilter = [];
    
    if(resourceId) {
        searchFilter.push(new nlobjSearchFilter('assignee', null, 'anyOf', resourceId));
    }
    else {
        searchFilter.push(new nlobjSearchFilter('assignee', null, 'noneof', '-UNASSIGNED-'));
    }
   
    if (searchFilters && searchFilters.length > 0) {
        searchFilter = searchFilter.concat(searchFilters);
    }
   
   var search = new ptmServLib.Search('projecttask', searchFilter, searchColumn);
   
   return search.getAllResults();

};

function getTotalResources(searchFilters) {
    var total = 0,
        results = nlapiSearchRecord('projectresource', null, searchFilters, [new nlobjSearchColumn('internalid', null, 'count')]);
    
    if (results) {
        total = results[0].getValue('internalid', null, 'count');
    }

    logger.debug('getTotalResources', total);
    
    return total;
};

function getTotalResourcesWithTasks(searchFilters) {
    var total = 0;
    var searchColumn = [new nlobjSearchColumn('resource', 'projecttaskassignment', 'count').setSort()];
    var results;
    
    results = nlapiSearchRecord('projecttask', null, searchFilters, searchColumn);
    
    if (results) {
        total = results[0].getValue('resource', 'projecttaskassignment', 'count');
    }
    
    logger.debug('getTotalResourcesWithTasks', total);
    
    return total;
};

function getProjectResources(searchFilters, start, end) {
    var searchColumn = [
            new nlobjSearchColumn('entityid').setSort(),
            new nlobjSearchColumn('internalid'),
            new nlobjSearchColumn('type'),
            new nlobjSearchColumn('internalid', 'workcalendar'),
            new nlobjSearchColumn('laborcost', 'employee'),
            new nlobjSearchColumn('laborcost', 'vendor')
        ],
        // perform search, default to all results if either start or end parameters are missing
        search = new ptmServLib.Search('projectresource', searchFilters, searchColumn),
        results = (start != null && end != null) ? search.getResults(start,end) : search.getAllResults();

    // manual ascend sort by resource since setSort in nlobjSearchColumn does not work at times for some reason
    var sortFunction = function(resultA, resultB) {
        var origA = resultA.getValue('entityid');
        var origB = resultB.getValue('entityid');
        var valueA = origA.toLowerCase();
        var valueB = origB.toLowerCase();
        if (valueA == valueB) return origA > origB;
        if (valueA > valueB) return 1;
        if (valueA < valueB) return -1;
    }    
    results.sort(sortFunction);
    
    return results;
};

function getProjectResourcesWithTasks(searchFilters, start, end) {
    MSG_TITLE = 'getRESTlet getProjectResourcesWithTasks';
    var resourceIds  = [],
        searchColumn = [ new nlobjSearchColumn('resource', 'projecttaskassignment', 'group').setSort() ],
        search = new ptmServLib.Search('projecttask', searchFilters, searchColumn);
        
    // get all results first since sorting will be manually done
    var results = search.getAllResults();

    // manual sort ascend of resource since setSort in nlobjSearchColumn does not work as intended since it uses getValue instead of getText
    var sortFunction = function(resultA, resultB) {
        var origA = resultA.getText('resource', 'projecttaskassignment', 'group');
        var origB = resultB.getText('resource', 'projecttaskassignment', 'group');
        var valueA = origA.toLowerCase();
        var valueB = origB.toLowerCase();
        if (valueA == valueB) return origA > origB;
        if (valueA > valueB) return 1;
        if (valueA < valueB) return -1;
    }    
    results.sort(sortFunction);

    // get result subset
    if (start != null && end != null){
        results = results.slice(start, end);
    }
        
    for (var i = 0, length = results.length; i < length; i++) {
        // order of resource IDs matter since this will be used when retrieving and displaying resource details 
        resourceIds.push(results[i].getValue('resource', 'projecttaskassignment', 'group'));
    }
    
    return resourceIds;
};

function getProjectResourceDetails(projectIds) {
    MSG_TITLE = 'getRESTlet getProjectResourceDetails';
    var projects = [],
        searchFilter = [new nlobjSearchFilter('company', null, 'anyof', projectIds)],
        searchColumn = [
            new nlobjSearchColumn('company', null, 'group').setSort(),
            new nlobjSearchColumn('jobresource', 'job', 'group').setSort()
        ],
        search = new ptmServLib.Search('projecttask', searchFilter, searchColumn),
        results = search.getAllResults();
    
    for (var i = 0, length = results.length; i < length; i++) {
        var searchResult = results[i],
            projectId = searchResult.getValue('company', null, 'group'),
            project   = projects.filter(function(element, index, array) {
                    return (element.Id == projectId + '');
                })[0];

        if (project == null) {
            project = {
                Id : projectId,
                resourceIds : []
            };
            projects.push(project);
        }
        
        project.resourceIds.push(searchResult.getValue('jobresource', 'job', 'group'));
    }
    
    return projects;
};

function postRESTlet (dataIn) {
    return processSaveData(dataIn, 'postRESTlet');
}

function putRESTlet (dataIn) {
    return processSaveData(dataIn, 'putRESTlet');
}

function deleteRESTlet(dataIn) {
    // does nothing but necessary. UI still calls delete when removing from the store.
    // NS restlet delete function params incompatible with standard restlet params.
}

function processSaveData(dataIn, methodIn) {
    /*
     * Variables
     */
    var METHOD_MSG = methodIn;
    
    MSG_TITLE = METHOD_MSG + ' Variables';
    var jsonInputData = new Object();
    var jsonReturnData = new Object();
    var record = null;
    
    try {
        MSG_TITLE = METHOD_MSG + ' Start';
        
        /*
         * Parameter Set-up
         */
        MSG_TITLE = METHOD_MSG + ' Parameters';
        if (dataIn) {
            jsonInputData = ptmServLib.toJson(dataIn);
        }
        
        if (isNaN(parseInt(jsonInputData.Id))) {
            return {
                  success : true
                    , message : 'Id is not a number'
                    , data : [ jsonInputData ]
            };
        }
        
        var dataId = jsonInputData.Id;
        var dataResourceId = jsonInputData.ResourceId;
        var dataIsDelete = jsonInputData.isDelete;
        
        var arrResourceId = dataResourceId.split('~');
        var assigneeId = parseInt(arrResourceId[0]);
        var projectId = parseInt(arrResourceId[1]);
        var projectTaskId = parseInt(arrResourceId[2]);
        
        var dataUnits = jsonInputData.units;
        var dataServiceItem = jsonInputData.serviceItem;
        var dataEstimatedHours = jsonInputData.estimatedHours;
        var dataUnitCost = jsonInputData.unitCost;
        var dataUnitPrice = jsonInputData.unitPrice;
        var dataStartDate = jsonInputData.StartDate;
        
        var submittedId;
        
        logger.debug(METHOD_MSG + ' Parameters', 
                'getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n'
              + 'Language       : ' + nlapiGetContext().getPreference('LANGUAGE') + '\r\n' 
              + '********************' + '\r\n'
              + 'Id             : ' + dataId + '\r\n'
              + 'assigneeId     : ' + assigneeId + '\r\n'
              + 'projectId      : ' + projectId + '\r\n'
              + 'projectTaskId  : ' + projectTaskId + '\r\n'
              + 'units          : ' + dataUnits + '\r\n'
              + 'serviceItem    : ' + dataServiceItem + '\r\n'
              + 'estimatedHours : ' + dataEstimatedHours + '\r\n'
              + 'unitCost       : ' + dataUnitCost + '\r\n'
              + 'unitPrice      : ' + dataUnitPrice + '\r\n'     
              + 'dataStartDate  : ' + dataStartDate + '\r\n'
              + '********************' + '\r\n'
              + 'isDelete       : ' + dataIsDelete + '\r\n'
              + '********************' + '\r\n'
              + 'jsonInputData  : ' + JSON.stringify(jsonInputData) + '\r\n'
        );
        
        /*
         * Main
         */
        
        jsonReturnData = {
                success : true
              , message : ''
              , data : new Array()
        };
        
        var searchPT = nlapiSearchRecord('projecttask', null, [new nlobjSearchFilter('internalid', 'projectTaskAssignment', 'anyOf', dataId)], null);
        var searchId = searchPT[0].getId();
            
        record = nlapiLoadRecord('projecttask', searchId);
        var lineNum = record.findLineItemValue('assignee', 'id', dataId);
        
        if (dataIsDelete) {
            //delete
            MSG_TITLE = METHOD_MSG + ' Delete';
            jsonReturnData.message = 'Data Deleted';
            
            record.removeLineItem('assignee', lineNum);
            submittedId = nlapiSubmitRecord(record);
            
        } else {
            //update
            MSG_TITLE = METHOD_MSG + ' Update';
            jsonReturnData.message = 'Data Updated';
            
            if ((dataStartDate) && (record.getFieldValue('constrainttype') != 'ASAP')) {
                var strConvertedDate = ptmServLib.convertDateToFormat(dataStartDate, null, 'yyyy-MM-dd');
                logger.debug('strConvertedDate', strConvertedDate);
                record.setFieldValue('startdate', strConvertedDate);
            }
            
            var currUnitCost = record.getLineItemValue('assignee', 'unitcost', lineNum);
            var currUnitPrice = record.getLineItemValue('assignee', 'unitprice', lineNum);
            if(assigneeId) record.setLineItemValue('assignee', 'resource', lineNum, assigneeId);
            if(dataUnits) record.setLineItemValue('assignee', 'units', lineNum, dataUnits);
            if(dataServiceItem) {
                if (dataServiceItem != '- None -') {
                    var serviceItemSearch = nlapiSearchRecord('serviceitem', null, ['itemid', 'is', dataServiceItem], null);
                    if (serviceItemSearch) {
                        var serviceItemId = serviceItemSearch[0].getId();
                        record.setLineItemValue('assignee', 'serviceitem', lineNum, serviceItemId);
                    }
                } else {
                    record.setLineItemValue('assignee', 'serviceitem', lineNum, null);
                }
            }
            if((dataEstimatedHours !== null) && (dataEstimatedHours !== '')) record.setLineItemValue('assignee', 'estimatedwork', lineNum, dataEstimatedHours);
            if((dataUnitCost !== null) && (dataUnitCost !== '')) 
                record.setLineItemValue('assignee', 'unitcost', lineNum, dataUnitCost);
            else
                record.setLineItemValue('assignee', 'unitcost', lineNum, currUnitCost);
            if((dataUnitPrice !== null) && (dataUnitPrice !== ''))
                record.setLineItemValue('assignee', 'unitprice', lineNum, dataUnitPrice);
            else
                record.setLineItemValue('assignee', 'unitprice', lineNum, currUnitPrice);
            
            submittedId = nlapiSubmitRecord(record);
            
            //refresh data
            var sf = new Array();
            sf.push(new nlobjSearchFilter('internalid', 'projectTaskAssignment', 'anyOf', dataId));
            jsonReturnData.data = getAllProjectTaskAsArray(null, sf, true);
        }
      
        /*
         * Return
         */
        MSG_TITLE = METHOD_MSG + ' Return';
        logger.debug(MSG_TITLE,
              'getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n'
            + 'Language           : ' + nlapiGetContext().getPreference('LANGUAGE') + '\r\n' 
            + '************************' + '\r\n'
            + 'jsonInputData    : ' + JSON.stringify(jsonInputData) + '\r\n'
            + '************************' + '\r\n'
            + 'jsonReturnData   : ' + JSON.stringify(jsonReturnData) + '\r\n'
        );
        
    } catch (ex) {
        var body_message = '';
        if (ex instanceof nlobjError){
            body_message = 'System Error: '+ex.getCode() + ': ' + ex.getDetails();
            logger.error(MSG_TITLE, 'params : ' + JSON.stringify(dataIn) + '\n' + body_message);
        }else {
            body_message = 'Unexpected Error: '+ex;
            logger.error(MSG_TITLE, 'params : ' + JSON.stringify(dataIn) + '\n' + body_message);
        }
        jsonReturnData = ptmServLib.toJson(ptmServLib.getFailMessage (body_message));
    }
    
    return jsonReturnData;
}

function getAllProjectTaskAsArray(selectedResources, searchFilters, isEditable) {
    var results    = getProjectTasks(selectedResources, searchFilters),
        taskArray  = [],
        taskAssignmentIds = [];
        
    
    for (var i = 0, length = results.length; i < length; i++) {
        var searchResult = results[i];
    
        // skip summary tasks
        if (searchResult.getValue('issummarytask') == 'T') continue;
        
        var task = prepareTaskObject(searchResult, isEditable);
        taskAssignmentIds.push(task.Id);
        taskArray.push(task);
    }

    if (taskAssignmentIds.length > 0) {
        addLastActualDate(taskAssignmentIds, taskArray);
    }
    
    return taskArray;
};

function prepareTaskObject(searchResult, isEditable) {
    var dataFormat = ptmServLib.getNSDateFormat(),
        resourceId     = searchResult.getValue('resource', 'projectTaskAssignment'),
        projectId      = searchResult.getValue('company'),
        projTaskAssId  = searchResult.getValue('internalid', 'projectTaskAssignment'),
        constraintType = searchResult.getValue('constrainttype'),
        actualHours    = parseInt(searchResult.getValue('actualwork', 'projectTaskAssignment')),
        dtStartDate    = searchResult.getValue('startdate', 'projectTaskAssignment'),
        dtEndDate      = searchResult.getValue('enddate', 'projectTaskAssignment'),
        dtFinishBy     = searchResult.getValue('finishbydate'),
        /*
         * Determine whether or not the start date and/or end date of this assignment can be modified
         */
        isResizable = isEditable ? ( (actualHours > 0 || constraintType == 'ASAP') ? 'end' : true ) : false,
        /*
         * Determine whether or not an assignment can be dragged to a different assignee and/or time frame (both start & end dates)
         */
        isDraggable = isEditable, // all assignments are currently draggable; this now serves as a place-holder in case of any changes in business rules
        isDateDraggable = isResizable, // horizontal dragging (updating start & end dates at the same time)
        /*
         * Create the return JSON object
         */
        task = {
            Id                : projTaskAssId,
            ResourceId        : resourceId + '~' + projectId + '~' + projTaskAssId,
            Name              : searchResult.getValue('title'),
            projectName       : searchResult.getText('company'),
            taskId            : searchResult.getId(),
            isDelete          : false,
            success           : true,
            serviceItem       : searchResult.getText('serviceitem', 'projectTaskAssignment'),
            units             : searchResult.getValue('units', 'projectTaskAssignment').replace('%', ''),
            unitCost          : searchResult.getValue('unitcost', 'projectTaskAssignment'),
            unitPrice         : searchResult.getValue('unitprice', 'projectTaskAssignment'),
            estimatedHours    : searchResult.getValue('estimatedwork', 'projectTaskAssignment'),
            actualHours       : searchResult.getValue('actualwork', 'projectTaskAssignment'),
            constraintType    : searchResult.getValue('constrainttype'),
            tipUnits          : searchResult.getValue('units', 'projectTaskAssignment'),
            Resizable         : isResizable,
            Draggable         : isDraggable,
            isDateDraggable   : isDateDraggable,
            isProjectTemplate : searchResult.getValue('company') != searchResult.getValue('internalid', 'job'),
            tipConstraintType : (constraintType == 'ASAP')? PTMTranslationManager.getString('TOOLTIP.ASAP') : PTMTranslationManager.getString('TOOLTIP.FIXED_START')
        };
    
    if (dtStartDate) {
        task.StartDate      = ptmServLib.convertDateToFormat(dtStartDate, 'yyyy/MM/dd');
        task.tipStartDate   = dtStartDate;
        task.lastActualDate = task.StartDate;
    }
    
    if (dtEndDate) {
        var endDate      = new Date(ptmServLib.convertDateToFormat(dtEndDate, 'yyyy/MM/dd')); 
        task.EndDate     = nlapiAddDays(endDate, 1).toString('yyyy/MM/dd');
        task.trueEndDate = ptmServLib.convertDateToFormat(dtEndDate, 'yyyy/MM/dd', dataFormat);
        task.tipEndDate  = dtEndDate;
    }
    
    if (dtFinishBy) {
        task.finishByDate    = ptmServLib.convertDateToFormat(dtFinishBy, 'yyyy/MM/dd');
        task.tipFinishByDate = ptmServLib.convertDateToFormat(dtFinishBy); // to NS Date
    }
    
    return task;
}

function addLastActualDate(taskAssignmentIds, taskArray){
    var results = getLastActualDate(taskAssignmentIds);        
    for (var i = 0, length = results.length; i < length; i++) {
        var searchResult = results[i];
        var projTaskId     = searchResult.getValue('internalid', 'projecttaskassignment', 'group'),
            lastActualDate = searchResult.getValue('date', null, 'max'),
            projectTask    = taskArray.filter(function(element, index, array) {
                return (element.Id == projTaskId + '');
            })[0];
        if (projectTask && lastActualDate) {
            projectTask.lastActualDate = ptmServLib.convertDateToFormat(lastActualDate, 'yyyy/MM/dd');
        }
    }
}

function getLastActualDate(projTaskIds) {
    var searchFilter = [
                new nlobjSearchFilter('internalid', 'projecttaskassignment', 'anyOf', projTaskIds),
                new nlobjSearchFilter('type', null, 'anyOf', 'A') //A for 'Actual'
            ],
        searchColumn = [
                new nlobjSearchColumn('internalid', 'projecttaskassignment', 'group'),
                new nlobjSearchColumn('date', null, 'max')
            ],
        search = new ptmServLib.Search('timebill', searchFilter, searchColumn);
    
    return search.getAllResults(); 
};

/**
 * getPaginationDetails
 *      - on PTM page load, used to show pages using a dropdown field
 */
function getPaginationDetails(showAllResources, resourceLimit, taskSearchFilters, resourceSearchFilters){
    // add filter if not all resources are to be shown
    if (!showAllResources){
        var resourceIds  = getProjectResourcesWithTasks(taskSearchFilters);
        resourceSearchFilters = [new nlobjSearchFilter('internalid', null, 'anyof', resourceIds)];
    }

    // retrieve resources and create page info from them
    var resources = getProjectResources(resourceSearchFilters);
    var pages = [];
    for (var i = 0, length = resources.length; i < length; i = i + resourceLimit) {
        // normal case
        var endIndex = i + resourceLimit - 1;
        
        // case for last set of resources
        if (endIndex > (length - 1)) endIndex = length-1;

        var name = resources[i].getValue('entityid') + ' - ' + resources[endIndex].getValue('entityid');
        var page = {
            id     : pages.length,
            name   : name,
            start  : i
        };
        pages.push(page);
    }

    return pages;
};