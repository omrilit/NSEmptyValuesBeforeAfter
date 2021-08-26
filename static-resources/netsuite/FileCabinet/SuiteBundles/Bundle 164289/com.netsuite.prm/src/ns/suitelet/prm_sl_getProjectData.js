/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.GetProjectDataSL = new function GetProjectDataSL() {

    this.idSeparator = '~';
    
    //========== MAIN FUNCTIONS ==========//
    
    /**
     * Suitelet entry point. Writes the result as a JSON string on the response object.
     * 
     * @param {nlobjRequest} request
     * @param {nlobjResponse} response
     * 
     * @returns {void}
     */
    this.suiteletEntry = function(request, response) {
        var success    = true,
            returnData = {};
        
        try {
            this.startDateTypeMap = psa_prm.serverlibrary.getStartDateTypeMap();
            returnData = this.buildReturnData(this.getConfig(request));
        } catch (err) {
            success = false;
            nlapiLogExecution('DEBUG', 'ERROR: suiteletEntry', err.message);
        }
        
        returnData.success = success;
        var jsonString = JSON.stringify(returnData);
        nlapiLogExecution('DEBUG', 'jsonString', jsonString);
        response.write(jsonString);
    };
    
    /**
     * Creates a JSON object containing all request parameters.
     * 
     * @param {nlobjRequest} request
     * 
     * @returns {void}
     */
    this.getConfig = function(request) {
        var config = {
            nodeId               : this.getLastId(request.getParameter('nodeId')),
            nodeName             : request.getParameter('nodeName') || 'Root',
            nodeType             : request.getParameter('nodeType') || 'root',
            currentPage          : Number(request.getParameter('currentPage')),
            projectsPerPage      : Number(request.getParameter('projectsPerPage')),
            startDateType        : request.getParameter('startDateType'),
            startDate            : request.getParameter('startDate'),
            projectSearch        : request.getParameter('projectSearch'),
            /*
             * boolean values
             */
            isPageList           : request.getParameter('isPageList') == 'T',
            includeAllProjects   : request.getParameter('includeAllProjects') == 'true',
            showRejected         : request.getParameter('showRejectedAllocations') == 'true',
            showAllocations      : request.getParameter('showAllocations') == 'true',
            showAssignments      : request.getParameter('showAssignments') == 'true',
            includeSubSubsidiary : request.getParameter('includeSubSubsidiary') == 'true',
            resourceTypeEmployee : request.getParameter('resourceTypeEmployee') == 'true',
            resourceTypeGeneric  : request.getParameter('resourceTypeGeneric') == 'true',
            resourceTypeVendor   : request.getParameter('resourceTypeVendor') == 'true',
            /*
             * lists/arrays
             */
            billingClasses       : request.getParameter('billingClasses'),
            employees            : request.getParameter('employees'),
            vendors              : request.getParameter('vendors'),
            genericResources     : request.getParameter('genericResources'),
            subsidiaries         : request.getParameter('subsidiaries'),
            customers            : request.getParameter('customers'),
            projects             : request.getParameter('projects'),
            tasks                : request.getParameter('tasks')
        };
        
        if (!config.startDateType) {
            // set default start date type to Project
            config.startDateType = this.startDateTypeMap.PROJECT;
            // set default start date to 1 year ago
            config.startDate = new Date();
            config.startDate = psa_prm.serverlibrary.addYearToDate(config.startDate, -1);
        }
        
        config.viewableResources = ProjectResourceService.getViewableResources(config);
        
        nlapiLogExecution('DEBUG', 'config', JSON.stringify(config));
        
        return config;
    };
    
    /**
     * Determines what kind of data is being requested.
     * There are 3 possible results:
     *    1) isPageList=T     : list of pages according to filters
     *    2) nodeType=root    : list of projects according to filters
     *    3) nodeType=project : list of resources summaries and tasks under a given project
     * 
     * @returns {void}
     */
    this.buildReturnData = function(config) {
        if (config.isPageList) {
            return this.buildPages(config);
        } else {
            switch (config.nodeType) {
                case 'root':
                    return this.buildRootData(config);
                case 'project':
                    return this.buildProjectData(config);
                default:
                    nlapiLogExecution('DEBUG', 'UNKNOWN NODE TYPE: ' + config.nodeType);
                    return {};
            }
        }
    };
    
    /**
     * Builds the list of pages according to the selected filters.
     * 
     * @returns {void}
     */
    this.buildPages = function(config) {
        var search     = new psa_prm.serverlibrary.Search('job', 'customsearch_prm_project_data'),
            returnData = {
                message       : 'Page List Loaded',
                totalProjects : 0,
                totalPages    : 1,
                data          : []
            };
        
        if (this.hasViewableResources(config)) {
            this.applyFilters(config, search);
            
            var results = search.getAllResults();
            /*
             * set totals
             */
            returnData.totalProjects = results.length;
            returnData.totalPages = Math.ceil(returnData.totalProjects / config.projectsPerPage);
            /*
             * set pages
             */
            for (var i = 1, startIndex = 0, endIndex = startIndex + config.projectsPerPage; i <= returnData.totalPages; i++, startIndex += config.projectsPerPage, endIndex += config.projectsPerPage) {
                var page = results.slice(startIndex, endIndex);
                returnData.data.push({
                    id : i,
                    name : page[0].getValue('formulatext') + ' — ' + page[page.length - 1].getValue('formulatext')
                });
            }
        }
        
        return returnData;
    };
    
    /**
     * Builds the list of projects according to filters.
     * 
     * @returns {void}
     */
    this.buildRootData = function(config) {
        var projects       = this.getProjects(config),
            allTimeEntries = this.getAllTimeEntries(config, projects),
            returnData     = {};
        
        if (projects.length) {
            for (var i = 0; i < projects.length; i++) {
                this.addChild(returnData, this.createProjectNode(projects[i], allTimeEntries));
            }
        } else {
            this.addChild(returnData, this.createNoResultsNode(config.projectSearch ? true : false));
        }
        
        return returnData;
    };
    
    /**
     * Builds data related to the project node being loaded.
     * The following sections are loaded:
     *    1) Resource Summaries : sums all allocations and assignments per resource
     *    2) Tasks              : sums all assignments per task
     * 
     * @returns {void}
     */
    this.buildProjectData = function(config) {
        var calendars           = psa_prm.serverlibrary.getWorkCalendars(),
            allocations         = this.getAllocations(config),
            assignments         = this.getAssignments(config),
            actualTimeEntries   = this.getActualTimeEntries(config),
            jobResourceRoles    = this.getJobResourceRoles(config),
            resourceMap         = this.getResourceMap(calendars, allocations, assignments),
            resourceSummaryData = this.getResourceSummaryData(config, calendars, allocations, assignments, jobResourceRoles, this.sortResourceSummary(resourceMap)),
            taskData            = this.getTaskData(config, calendars, assignments, actualTimeEntries, resourceMap),
            returnData          = {};
        
        for (var i = 0; i < resourceSummaryData.length; i++) {
            this.addChild(returnData, resourceSummaryData[i]);
        }
        
        for (var i = 0; i < taskData.length; i++) {
            this.addChild(returnData, taskData[i]);
        }
        
        return returnData;
    };
    
    this.getResourceSummaryData = function(config, calendars, allocations, assignments, jobResourceRoles, resourceMap) {
        var resourceSummaryData = [];
        
        if (config.showAllocations) {
            // append resources to parent project node
            if (resourceMap) {
                for (var i = 0; i < resourceMap.length; i++) {
                    var resource = resourceMap[i];
                    // proceed with adding resource summary node if it is viewable based on custom view filters
                    if (this.isResourceViewable(config, resource.resourceId)) {
                        resourceSummaryData.push(this.createResourceSummaryNode(config, resource, jobResourceRoles));
                    }
                }
            }
        }
        
        return resourceSummaryData;
    };

    this.getResourceMap = function(calendars, allocations, assignments) {
        // create resource detail map using resourceId as key (merge data from allocations and project tasks)
        var resourceMap = {};
        
        // add resources from project allocations
        for (var i = 0; i < allocations.length; i++) {
            var allocation = allocations[i];
            var resourceId = allocation.resourceId;
            if (!resourceMap[resourceId]){
                // create new resource object for new resource
                resourceMap[resourceId] = {
                    resourceId         : resourceId,
                    resourceName       : allocation.resourceName,
                    //role             : allocation.role,
                    isResourceInactive : allocation.isResourceInactive == 'T',
                    workCalendar       : allocation.workCalendar,
                    calendar           : calendars[allocation.workCalendar],
                    allocations        : allocations.filter(function(e) { return (e.resourceId == resourceId); }),
                    withAllocations    : true,
                };
            }
        }
        
        // add resources from project tasks if not yet included
        for (var i = 0; i < assignments.length; i++) {
            var assignment = assignments[i];
            var resourceId = assignment.getValue('resource', 'projecttaskassignment');
            if (resourceId) {
                if (resourceMap[resourceId]) {
                    resourceMap[resourceId].withAssignments = true;
                } else if (!resourceMap[resourceId]) {
                    var calendarId = assignment.getValue('workcalendar', 'projecttaskassignment');
                    if (!calendarId) {
                        // handle core issue, missing work calendar when resource type is generic resource
                        var resourceId = assignment.getValue('resource', 'projecttaskassignment');
                        calendarId = nlapiLookupField('genericresource', resourceId, 'workcalendar');
                    }            
                    resourceMap[resourceId] = {
                        resourceId      : resourceId,
                        resourceName    : assignment.getText('resource', 'projecttaskassignment'),
                        //role          : nlapiLookupField('employee', resourceId, 'title') || '',
                        workCalendar    : calendarId,
                        calendar        : calendars[calendarId],
                        allocations     : [],
                        withAssignments : true
                    };
                }
            }
        }
        
        return resourceMap;
    };

    this.sortResourceSummary = function(resourceMap) {
        // convert resource map to array, to be able to sort later
        var arrResources = [];
        for (var id in resourceMap){
            arrResources.push(resourceMap[id]);
        }
        
        // sort resources by name
        arrResources.sort(function(a,b){
            // sort ascending
            if (a.resourceName.toLowerCase() > b.resourceName.toLowerCase()) return 1;
            if (a.resourceName.toLowerCase() < b.resourceName.toLowerCase()) return -1;
            return 0;
        });
        
        return arrResources;
    };
    
    this.isMilestone = function(task) {
        return task.getValue('ismilestone') == 'T';
    };
    
    this.getTaskData = function(config, calendars, assignments, actualTimeEntries, resourceMap) {
        var uniqueChecker = [],
            taskData      = [];
        
        if (config.showAssignments) {
            for (var i = 0; i < assignments.length; i++) {
                if(!this.isMilestone(assignments[i])) {
                    var task = this.createTaskNode(config, assignments[i]);
                    if (uniqueChecker.indexOf(task.id) == -1) {
                        var assignmentData = this.getAssignmentData(config, calendars, assignments, actualTimeEntries, task, resourceMap);
                        for (var j = 0; j < assignmentData.length; j++) {
                            this.addChild(task, assignmentData[j]);
                        }
                        
                        task.leaf = (task.children && task.children.length == 0);
                        taskData.push(task);
                        uniqueChecker.push(task.id);
                    }
                }
            }
        }
        
        return taskData;
    };
    
    this.getAssignmentData = function(config, calendars, assignments, actualTimeEntries, task, resourceMap) {
        var assignedHours  = this.getAssignedHours(config, calendars, assignments, actualTimeEntries, task, resourceMap),
            actualHours    = this.getActualHours(config, calendars, actualTimeEntries, task, resourceMap);
        
        return this.mergeAndSortByName(assignedHours, actualHours);
    };
    
    this.getAssignedHours = function(config, calendars, assignments, actualTimeEntries, task, resourceMap) {
        var assignedHours = [],
            taskId        = this.getLastId(task.id);

        var taskAssignments = assignments.filter(function(e) {
            var isUnderCurrentTask = (e.id == taskId),
                hasAssignmentId    = (e.getValue('internalid', 'projecttaskassignment') || 0);
            
            return (isUnderCurrentTask && hasAssignmentId);
        });
        
        for (var i = 0; i < taskAssignments.length; i++) {
            var taskAssignment   = taskAssignments[i],
                taskAssignmentId = taskAssignment.getValue('internalid', 'projecttaskassignment'),
                resourceId       = taskAssignment.getValue('resource', 'projecttaskassignment'),
                resourceTime     = actualTimeEntries.filter(function(e) { return (e.projTaskAssignmentId == taskAssignmentId); }),
                hrsWorked        = this.computeHrsWorked(resourceTime);

            // proceed with adding resource node if it is viewable based on custom view filters
            if (this.isResourceViewable(config, resourceId)) {
                // work calendar
                var resourceCalendarId = taskAssignment.getValue('workcalendar', 'projecttaskassignment');
                if (!resourceCalendarId) {
                    // handle core issue, missing work calendar when resource type is generic resource
                    resourceCalendarId = nlapiLookupField('genericresource', resourceId, 'workcalendar');
                }
                
                var resourceCalendar = calendars[resourceCalendarId],
                    hrsEstimated     = taskAssignment.getValue('estimatedwork', 'projecttaskassignment'),
                    pctComplete      = this.computePctComplete(hrsWorked, hrsEstimated);
                
                /*** Resource Level Return Data ***/
                assignedHours.push({
                    id              : [config.nodeId, taskId, taskAssignmentId, resourceId].join(this.idSeparator),
                    type            : 'resource',
                    name            : taskAssignment.getText('resource', 'projecttaskassignment'),
                    projectName     : config.nodeName,
                    taskName        : task.name,
                    hrsEstimated    : hrsEstimated,
                    hrsWorked       : taskAssignment.getValue('actualwork', 'projecttaskassignment'),
                    pctComplete     : pctComplete,
                    timeBills       : JSON.stringify(resourceTime),
                    workCalendar    : JSON.stringify(resourceCalendar),
                    taskStartDate   : taskAssignment.getValue('startdate'),
                    taskEndDate     : taskAssignment.getValue('enddate'),
                    assignStartDate : taskAssignment.getValue('startdate', 'projecttaskassignment'),
                    assignEndDate   : taskAssignment.getValue('enddate', 'projecttaskassignment'),
                    unitPct         : taskAssignment.getValue('units', 'projecttaskassignment'),
                    billingClassId  : taskAssignment.getValue('billingclass', 'projecttaskassignment'),
                    unitCost        : Number(taskAssignment.getValue('unitcost', 'projecttaskassignment')),
                    unitPrice       : taskAssignment.getValue('unitprice', 'projecttaskassignment'),
                    serviceItemId   : taskAssignment.getValue('serviceitem', 'projecttaskassignment'),
                    isResourceInactive : resourceMap[resourceId] ? resourceMap[resourceId].isResourceInactive : false,
                    leaf            : true,
                    expanded        : true
                });
            }
        }
        
        return assignedHours;
    };
    
    this.getActualHours = function(config, calendars, actualTimeEntries, task, resourceMap){
        var addedResources = [],
            actualHours    = [],
            taskId         = this.getLastId(task.id);
            
        var taskTimeBills = actualTimeEntries.filter(function(e) {
            return (e.projTaskId == taskId);
        });
        
        for (var i = 0; i < taskTimeBills.length; i++) {
            var taskTimeBill     = taskTimeBills[i],
                resourceId       = taskTimeBill.resourceId,
                taskAssignmentId = taskTimeBill.projTaskAssignmentId || 0;
            
            // add only if 1) not added yet 2) viewable based on custom view filters 3) without task assignment
            if (addedResources.indexOf(resourceId) == -1 && this.isResourceViewable(config, resourceId) && !taskAssignmentId) {
                var resourceCalendarId = taskTimeBill.workCalendar,
                    resourceCalendar   = calendars[resourceCalendarId],
                    resourceTimeBills  = taskTimeBills.filter(function(e) { return (e.resourceId == resourceId); }),
                    hrsWorked          = this.computeHrsWorked(resourceTimeBills);
                
                /*** Resource Level Return Data ***/
                addedResources.push(resourceId);
                actualHours.push({
                    id              : [config.nodeId, taskId, taskAssignmentId, resourceId].join(this.idSeparator),
                    type            : 'resource',
                    name            : taskTimeBill.resourceName,
                    projectName     : config.nodeName,
                    taskName        : task.name,
                    hrsEstimated    : hrsWorked,
                    hrsWorked       : hrsWorked,
                    pctComplete     : '100.00%',
                    timeBills       : JSON.stringify(resourceTimeBills),
                    workCalendar    : JSON.stringify(resourceCalendar),
                    taskStartDate   : taskTimeBill.projTaskStartDate,
                    taskEndDate     : taskTimeBill.projTaskEndDate,
                    assignStartDate : null,
                    assignEndDate   : null,
                    unitPct         : null,
                    billingClassId  : null,
                    unitCost        : null,
                    unitPrice       : null,
                    serviceItemId   : null,
                    isResourceInactive : resourceMap[resourceId] ? resourceMap[resourceId].isResourceInactive : false,
                    leaf            : true,
                    expanded        : true
                });
            }
        }
        
        return actualHours;
    };
    
    
    //========== NETSUITE SEARCHES ==========//
    
    this.getProjects = function(config) {
        var endIndex   = config.currentPage * config.projectsPerPage,
            startIndex = endIndex - config.projectsPerPage,
            search     = nlapiLoadSearch('job', 'customsearch_prm_project_data'),
            projects   = [];
        
        if (this.hasViewableResources(config)) {
            this.applyFilters(config, search);
            var results = search.runSearch();
            projects = results ? results.getResults(startIndex, endIndex) : [];
        }
        
        return projects;
    };
    
    this.applyFilters = function(config, search) {
        // if Include All Projects is turned off, select projects only if they have time bills (B - allocated, P - planned, A - actual)
        if (!config.includeAllProjects) {
            /*
             * Create filter expression for:
             * 1) projects with planned & actual time bills
             * 2) projects with allocated time bills
             */
            var taFilter = ['time.type', 'anyof', 'P', 'A'],
                raFilter = ['time.type', 'anyof', 'B'];
            
            // if Show Rejected Allocations is turned off, add an extra filter (to allocated time bills only), where approval status is not 6 (Rejected)
            if (!config.showRejected) {
                raFilter = [raFilter, 'AND', ['resourceallocation.approvalstatus', 'noneof', '6']];
            }
            
            // load the saved search's default filter, then 'AND' with the above filters
            var defaultFilter = search.getFilterExpression(),
                extraFilter   = [taFilter, 'OR', raFilter],
                newFilter     = [defaultFilter, 'AND', extraFilter];
            search.setFilterExpression(newFilter);
        }
        
        // Date Filter
        if (config.startDateType && (config.startDateType == this.startDateTypeMap.ALL || config.startDateType == this.startDateTypeMap.PROJECT)) {
            search.addFilter(new nlobjSearchFilter('startdate', null, 'onorafter', config.startDate));
        }
        
        // Resource Properties Filters
        if (config.viewableResources != 'All' && config.viewableResources.length > 0){
            search.addFilter(new nlobjSearchFilter('internalid', 'projectresource', 'anyof', config.viewableResources));
        }
        
        // Project Properties Filters       
        if (config.customers)
            search.addFilter(new nlobjSearchFilter('customer', null, 'anyof', psa_prm.serverlibrary.splitStringToNumberArray(config.customers)));
        if (config.projects)
            search.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', psa_prm.serverlibrary.splitStringToNumberArray(config.projects)));
        if (config.tasks)
            search.addFilter(new nlobjSearchFilter('internalid', 'projecttask', 'anyof', psa_prm.serverlibrary.splitStringToNumberArray(config.tasks)));
        
        if (config.projectSearch) {
        	var formulaFilter = new nlobjSearchFilter('formulatext', null, 'contains', config.projectSearch);
        	formulaFilter.setFormula("CASE WHEN {customer} is not null THEN (CASE WHEN {customer.isperson} = 'T' THEN ({customer.firstname} || (CASE WHEN {customer.middlename} is not null THEN ' ' || SUBSTR({customer.middlename}, 0, 1) END) || ' ' || {customer.lastname}) ELSE {customer.companyname} END) || ' : ' || {jobname} ELSE {jobname} END");
        	search.addFilter(formulaFilter);
        }
    };
    
    this.hasViewableResources = function(config) {
        return config.viewableResources == 'All' || config.viewableResources.length > 0;
    };
    
    this.getAllocations = function(config) {
        var search      = new psa_prm.serverlibrary.Search('resourceallocation', 'customsearch_prm_allocation_data'),
            allocations = [];

        search.addFilter(new nlobjSearchFilter('project', null, 'is', config.nodeId));
        
        if (config.startDateType && (config.startDateType == this.startDateTypeMap.ALL || config.startDateType == this.startDateTypeMap.RESOURCE_ALLOCATION)) {
            search.addFilter(new nlobjSearchFilter('startdate', null, 'onorafter', config.startDate));
        }
        
        if (!config.showRejected) {
            search.addFilter(new nlobjSearchFilter('approvalstatus', null, 'noneof', 6));
        }

        var searchResults = search.getAllResults();
        for (var i = 0; i < searchResults.length; i++) {
            var searchResult = searchResults[i];
            var allocation = { 
                    id                 : searchResult.id,
                    resourceId         : searchResult.getValue('resource'),
                    resourceName       : searchResult.getText('resource'),
                    projectId          : searchResult.getValue('project'),
                    projectName        : searchResult.getText('project'),
                    //role             : searchResult.getValue('title', 'employee') ? searchResult.getValue('title', 'employee') : '-',
                    workCalendar       : this.getWorkCalendarId(searchResult),
                    isResourceInactive : searchResult.getValue('formulatext'),
                    hrsAllocated       : searchResult.getValue('numberhours'),
                    pctComplete        : searchResult.getValue('percentoftime'),
                    startDate          : searchResult.getValue('startDate'),
                    endDate            : searchResult.getValue('endDate'),
                    allocationType     : searchResult.getValue('allocationtype'),
                    approver           : searchResult.getValue('nextapprover'),
                    approverName       : searchResult.getText('nextapprover'),
                    approvalStatus     : searchResult.getValue('approvalstatus'),
                    notes              : searchResult.getValue('notes'),
                    frequency          : searchResult.getValue('frequency'),
                    period             : searchResult.getValue('period'),
                    dayOfWeek          : searchResult.getValue('dow'),
                    dayOfWeekMask      : searchResult.getValue('dowmask'),
                    dayOfWeekInMonth   : searchResult.getValue('dowim'),
                    seriesStartDate    : searchResult.getValue('seriesstartdate'),
                    seriesEndDate      : searchResult.getValue('endbydate')
            };
            
            allocations.push(allocation);
        }
        
        return allocations;
    };
    
    this.getAllTimeEntries = function(config, projects) {
        var search         = new psa_prm.serverlibrary.Search('timebill', 'customsearch_prm_all_time_bills'),
            allTimeEntries = [],
            projectIds     = [],
            filters        = [];
        
        if (projects.length) {
            for (var i = 0; i < projects.length; i++) {
                projectIds.push(projects[i].id);
            }
            filters.push(['customer', 'anyof', projectIds]);
        }

        nlapiLogExecution('DEBUG', 'projectIds', JSON.stringify(projectIds));
        
        if (config.viewableResources != 'All' && config.viewableResources.length > 0) {
            if (filters.length) filters.push('AND');
            filters.push(['employee', 'anyof', config.viewableResources]);
        }
        
        switch (config.startDateType) {
            case this.startDateTypeMap.ALL:
            case this.startDateTypeMap.PROJECT:
                if (filters.length) filters.push('AND');
                filters.push([ 'date', 'onorafter', config.startDate ]);
                break;
            case this.startDateTypeMap.PROJECT_TASK:
            case this.startDateTypeMap.TASK_ASSIGNMENT:
                if (filters.length) filters.push('AND');
                filters.push([ [ 'type', 'is', 'B' ], 'OR', [ 'date', 'onorafter', config.startDate ] ]);
                break;
            case this.startDateTypeMap.RESOURCE_ALLOCATION:
                if (filters.length) filters.push('AND');
                filters.push([ [ 'type', 'is', 'P' ], 'OR', [ 'type', 'is', 'A' ], 'OR', [ 'date', 'onorafter', config.startDate ] ]);
                break;
        }
        
        nlapiLogExecution('DEBUG', 'filters', JSON.stringify(filters));
        
        search.setFilterExpression([search.getFilterExpression(), 'AND', filters]);
        
        nlapiLogExecution('DEBUG', 'viewableResources', JSON.stringify(config.viewableResources));
        
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
    
    this.getActualTimeEntries = function(config) {
        var search            = new psa_prm.serverlibrary.Search('timebill', 'customsearch_prm_time_data'),
            actualTimeEntries = [];
        
        search.addFilter(new nlobjSearchFilter('customer', null, 'anyof', config.nodeId));// projects use 'customer' as id in time bill records
        
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
                //role                 : searchResult.getValue('title', 'employee') || '-',
                workCalendar         : this.getWorkCalendarId(searchResult),
                type                 : 'A'
            });
        }
        
        return actualTimeEntries;
    };
    
    this.getAssignments = function(config) {
        var search = new psa_prm.serverlibrary.Search('projecttask', 'customsearch_prm_project_task_data');
        if (config.nodeType == 'project') {
            search.addFilter(new nlobjSearchFilter('company', null, 'is', config.nodeId));// projects use 'company' as id in project task records
        } else if (config.nodeType == 'task') {
            search.addFilter(new nlobjSearchFilter('internalid', null, 'is', config.nodeId));
        }
        
        if (config.startDateType == this.startDateTypeMap.ALL || config.startDateType == this.startDateTypeMap.PROJECT_TASK) {
            search.addFilter(new nlobjSearchFilter('startdate', null, 'onorafter', config.startDate));
        } else if (config.startDateType == this.startDateTypeMap.TASK_ASSIGNMENT) {
            search.setFilterExpression([
                search.getFilterExpression(),
                'AND',
                [
                    ['projecttaskassignment.startdate', 'isempty', ''],
                    'OR',
                    ['projecttaskassignment.startdate', 'onorafter', config.startDate]
                ]
            ]);
        }

        if (config.tasks) {
            search.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', psa_prm.serverlibrary.splitStringToNumberArray(config.tasks)));
        }

        return search.getAllResults();
    };
    
    //========== TREE NODE CREATION FUNCTIONS ==========//
    
    this.createNoResultsNode = function(isProjectSearch) {
        this.stringLiterals = psa_prm.serverlibrary.getStringLiterals();
        
        return {
            id       : 0,
            name     : this.stringLiterals[isProjectSearch ? 'ERROR.NO_RESULTS_FOUND_SIMPLE' : 'ERROR.NO_RESULTS_FOUND'],
            children : []
        };
    };
    
    this.createProjectNode = function(project, allTimeEntries) {
        return {
            id                  : project.id,
            type                : 'project',
            name                : project.getValue('formulatext'),
            hrsEstimated        : project.getValue('estimatedtimeoverride'), //projectTask ? projectTask.getValue('estimatedtimeoverride', 'job') : '';
            pctComplete         : project.getValue('percenttimecomplete'),
            actualTime          : project.getValue('actualtime'),
            timeRemaining       : project.getValue('timeremaining'),
            startDate           : project.getValue('startdate'),
            calculatedEndDate   : project.getValue('calculatedenddate'),
            displayAllResources : project.getValue('allowallresourcesfortasks') == 'T',
            taskStartDate       : null,
            taskEndDate         : null,
            timeBills           : JSON.stringify(allTimeEntries.filter(function(e) { return (e.projectId == project.id); })),
            leaf                : false,
            expanded            : false
        };
    };
    
    this.getJobResourceRoles = function (projectId) {
        var columns = [ new nlobjSearchColumn('jobresourcerole'), new nlobjSearchColumn('jobresource') ], 
            searchResult = nlapiSearchRecord('job', null, null, columns),
            map = {};

        var key = '', value = '';
        for(var i = 0 ; i < searchResult.length; i++) {
            key = searchResult[i].id + '_' + searchResult[i].getValue('jobresource');
            value = searchResult[i].getText('jobresourcerole');
            map[key] = value;
        }
        
         return map;
    };
    
    this.createResourceSummaryNode = function(config, resource, jobResourceRoles) {
        return {
            id                 : [config.nodeId, 0, 0, resource.resourceId].join(this.idSeparator),
            type               : 'resource-summary',
            name               : resource.resourceName,
            role               : jobResourceRoles[config.nodeId + '_' + resource.resourceId],
            workCalendar       : JSON.stringify(resource.calendar),
            allocations        : JSON.stringify(resource.allocations),
            timeBills          : '[]',
            taskStartDate      : null,
            taskEndDate        : null,
            hover              : '',
            leaf               : true,
            withAllocations    : resource.withAllocations,
            withAssignments    : resource.withAssignments,
            isResourceInactive : resource.isResourceInactive
                
        };
    };
    
    this.createTaskNode = function(config, task) {
        return { 
            id             : [config.nodeId, task.id].join(this.idSeparator),
            type           : 'task',
            name           : task.getValue('title'),
            projectName    : config.nodeName,
            hrsEstimated   : task.getValue('estimatedwork'),
            pctComplete    : task.getValue('percentworkcomplete'),
            taskStartDate  : task.getValue('startdate'),
            taskEndDate    : task.getValue('enddate'),
            constraintType : task.getValue('constrainttype'),
            leaf           : false,
            expanded       : false,
            children       : []
        };
    };
    
    //========== UTILITY FUNCTIONS ==========//
    
    this.getWorkCalendarId = function(nsResult) {
        var workCalendarId = nsResult.getValue('workcalendar', 'employee');
        if (!workCalendarId) workCalendarId = nsResult.getValue('workcalendar', 'vendor');
        if (!workCalendarId) workCalendarId = nsResult.getValue('workcalendar', 'genericresource');
        return workCalendarId;
    };
    
    this.computeHrsWorked = function(timeBills) {
        var totalHrsWorked = 0;
        timeBills.forEach(function(timeBill){
            var duration = timeBill.duration,
                hours = parseInt(duration.substring(0,duration.indexOf(':'))),
                minutes = parseInt(duration.substring(duration.indexOf(':') + 1)),
                totalHours = hours + (minutes / 60);
            totalHrsWorked += totalHours;
        });
        return totalHrsWorked;
    };
    
    this.computePctComplete = function(hrsWorked, hrsEstimated) {
        if (hrsWorked && hrsEstimated) {
            return Number((hrsWorked / hrsEstimated) * 100).toFixed(1) + '%'; // should be 2, but core weirdly returns 1 decimal value for task percent complete (2 for project percent complete)
        }
        return '0.0%';
    };
    
    this.isResourceViewable = function(config, resourceId) {
        if (config.viewableResources == 'All') {
            return true;
        } else {
            return config.viewableResources.indexOf(parseInt(resourceId)) > -1;
        }
    };
    
    this.mergeAndSortByName = function(a, b) {
        var r = a.concat(b);
        r.sort(function(x, y){
            if (x.name > y.name) 
                return 1;
            return -1;
        });
        return r;
    };
    
    this.addChild = function(parentNode, childNode) {
        if (!parentNode.children) {
            parentNode.children = [];
        }
        parentNode.children.push(childNode);
    };
    
    this.getLastId = function(id) {
        if (id) {
            var ids = id.split(this.idSeparator);
            return ids[ids.length - 1];
        }
        return 'root';
    };
};