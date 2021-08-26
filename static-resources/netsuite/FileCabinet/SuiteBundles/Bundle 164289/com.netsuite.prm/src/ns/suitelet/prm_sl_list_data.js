/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.ListSL = new function ListSL() {

    this.context; 
    this.lib;
    this.params;
    
    this.init = function(request) {
        this.context = nlapiGetContext();
        this.lib = psa_prm.serverlibrary;
        this.params = {
            range : request.getParameter('range') == 'T',
            startIndex : request.getParameter('startIndex'),
            endIndex : request.getParameter('endIndex'),
            searchType : request.getParameter('searchType'),
            projectId : request.getParameter('projectId'),
            displayAllResources : request.getParameter('displayAllResources'),
            nameContains : request.getParameter('nameContains'),
            excludeMilestones : request.getParameter('excludeMilestones')
        };
        nlapiLogExecution('DEBUG', 'request parameters: ', JSON.stringify(this.params));
    };
    
    this.suiteletEntry = function (request, response) {
        try {
            this.init(request);
            
            nlapiLogExecution('DEBUG', 'Governance start', this.context.getRemainingUsage());

            var params = this.params,
                searchId = 'customsearch_prm_' + params.searchType + '_list',
                search, resultSet,
                returnData = {
                    success : true,
                    message : params.searchType + ' Loaded',
                    total : 0,
                    data : []
                };
            
            if (request.getMethod() != 'GET'){
                throw new nlobjError('HTML Error','Request method is of an incorrect type: ' + request.getMethod());
            }
            
            if (params.searchType == 'calendar') {
                this.processCalendarList(returnData);
            }
            else {
                search = nlapiLoadSearch(null, searchId);
                search = this.addFiltersToSearch(search);
                resultSet = search.runSearch();
                
                switch (params.searchType) {
                    case 'resources' :
                        if (params.range) {
                            this.processRangeList(resultSet, returnData, 'entityid');
                        } else if (params.startIndex && params.endIndex) {
                            this.processResourcesList(resultSet, returnData, params.startIndex, params.endIndex);
                        } else {
                            this.processResourcesList(resultSet, returnData);
                            this.getSimpleTotal(search, returnData);
                        }
                        
                        break;
                    case 'projects' : 
                        if (params.range) {
                            this.processRangeList(resultSet, returnData, 'formulatext');
                        } else if (params.startIndex && params.endIndex) {
                            this.processProjectsList(resultSet, returnData, params.startIndex, params.endIndex);
                        } else {
                            this.processProjectsList(resultSet, returnData);
                            this.getSimpleTotal(search, returnData);
                        }
                        break;
                    case 'project_tasks' : 
                        if (params.range){
                            this.processRangeList(resultSet, returnData, 'title');
                        } else if (params.startIndex && params.endIndex) {
                            this.processProjectTasksList(resultSet, returnData, params.startIndex, params.endIndex);
                        } else {
                            this.processProjectTasksList(resultSet, returnData);
                            this.getSimpleTotal(search, returnData);
                        }
                        break;
                    case 'billing_classes' : 
                    case 'subsidiaries' : 
                        if (params.range) {
                            this.processRangeList(resultSet, returnData, 'name');
                        } 
                        else {
                            this.processSimpleList(resultSet, returnData, 'name', params.startIndex, params.endIndex);
                        }
                        break;
                    case 'service_items' : 
                        this.processSimpleList(resultSet, returnData, 'itemid');
                        this.getSimpleTotal(search, returnData);
                        break;
                    case 'approvers' :
                        if (params.range) {
                            this.processRangeList(resultSet, returnData, 'entityid');
                        } else if (params.startIndex && params.endIndex) {
                            this.processSimpleList(resultSet, returnData, 'entityid', params.startIndex, params.endIndex);
                        } else {
                            this.processSimpleList(resultSet, returnData, 'entityid');
                            this.getSimpleTotal(search, returnData);
                        }
                        break;
                    case 'customers' : 
                        if (params.range) {
                            this.processRangeList(resultSet, returnData, 'formulatext');
                        } 
                        else {
                            this.processListwithFormula(resultSet, returnData, 1, params.startIndex, params.endIndex);
                            this.getSimpleTotal(search, returnData);
                        }
                        break;
                    case 'project_no_ra_pta' :
                        // projects with no resource allocations and no project task assignments
                        this.processAssignableProjects(resultSet, returnData);
                        break;
                    case 'assign_resource' :
                        this.processAssignableResourceList(resultSet, returnData);
                        break;
                    default : 
                        throw new nlobjError('Parameter Error','Search type is not supported : ' + params.searchType);
                };
            }
            
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
                message : request.getParameter('searchType') + ' -- ' + errorCode + ' : '  + errorMessage
            }));
        }
    };
    
    this.addFiltersToSearch = function (search) {
        var params = this.params;
        switch (params.searchType){
            case 'billing_classes' : 
                if (params.nameContains) {
                    search.addFilter(new nlobjSearchFilter('name', null, 'contains', params.nameContains));
                }
                break;
            case 'resources':
                if (params.nameContains) {
                    search.addFilter(new nlobjSearchFilter('entityid', null, 'contains', params.nameContains));
                }            
                break;
            case 'project_tasks':
                if (params.nameContains) {
                    search.addFilter(new nlobjSearchFilter('title', null, 'contains', params.nameContains));
                }
                if (params.projectId) {
                    search.addFilter(new nlobjSearchFilter('project', null, 'is', params.projectId));
                }
                if (params.excludeMilestones) {
                	if (params.excludeMilestones == 'T') {
                		search.addFilter(new nlobjSearchFilter('ismilestone', null, 'is', false));
                	}
                }
                break;
            case 'customers' : 
            case 'projects':
                if (params.nameContains) {
                    search.addFilter(new nlobjSearchFilter('entityid', null, 'contains', params.nameContains));
                }
                break;
            case 'assign_resource':
                if (params.displayAllResources == 'T') {
                    params.searchType = 'resources';
                    // TODO: For refactor, determine search type (store) before AJAX call to avoid duplicate search
                    search = nlapiLoadSearch(null, 'customsearch_prm_resources_list');
                } else {
                    if (params.projectId){
                        search.addFilter(new nlobjSearchFilter('internalid', 'job', 'is', params.projectId));
                    }
                }
                break;
        }
        
        return search;
    };
    
    this.processAssignableResourceList = function (resultSet, returnData) {
        var columns = resultSet.getColumns();
        this.lib.iterateResultSet(resultSet, returnData, function(res) {
            returnData.data.push({
                //projectId : res.getValue(columns[0]),
                id : res.getValue('resource', null, 'group'),
                name : res.getText('resource', null, 'group'),
                workCalendar : res.getValue(columns[1]) 
            });
        });
    };
    
    this.processAssignableProjects = function (projectsWithNoAllocAndAssignmentResultSet, returnData) {
        var assignableProjectIds = [];
        this.lib.iterateResultSet(projectsWithNoAllocAndAssignmentResultSet, returnData, function(res) {
        	var columns = res.getAllColumns();
        	var milestonesCount = res.getValue(columns[columns.length - 1]);
        	var customer = res.getText('customer', null , 'group');
        		customer = customer == '- None -' ? '' : customer;
        	var internalId = res.getValue('internalid', null, 'group');
        	var estimatedWork = res.getValue('estimatedtimeoverride', null, 'group');
        	var hasMilestonesOnly = estimatedWork == 0 && milestonesCount > 0; 
        	if (!hasMilestonesOnly) {
        		returnData.data.push({
        			id : internalId,
        			name : (customer ? (customer + ' : ') : '') + res.getValue('formulatext', null, 'group'),
        			hrsEstimated : estimatedWork,
        			pctComplete : res.getValue('pctcomplete', null, 'group')
        		});
        		assignableProjectIds.push(internalId);
        	}
        });
        
        var projTempNoPTASearch= nlapiLoadSearch(null, 'customsearch_prm_projtemp_no_pta_list');
        var projTempNoPTAResultSet = projTempNoPTASearch.runSearch();
        
        var projTempWithAllocSearch= nlapiLoadSearch(null, 'customsearch_prm_projtemp_w_alloc_list');
        var projTempWitAllocResultSet = projTempWithAllocSearch.runSearch();
        
        var projTempNoPTAMap = this.lib.resultSetToHashMap(projTempNoPTAResultSet, 'internalid');
        
        this.lib.iterateResultSet(projTempWitAllocResultSet, undefined, function (res) {
            var internalid = res.getValue('internalid');
            //removes proj temp with allocation from proj temp with no task assignments
            if (internalid in projTempNoPTAMap) {
                delete projTempNoPTAMap[internalid];
            }
        });

        for (var key in projTempNoPTAMap) {
            var result = projTempNoPTAMap[key];
            returnData.data.push({
                id : result.getValue('internalid'),
                name : result.getValue('entityid'),
                hrsEstimated : result.getValue('estimatedtimeoverride'),
                pctComplete : '0'
            });
            assignableProjectIds.push(result.getValue('internalid'));
            returnData.total = returnData.total + 1;
        }
        
        var projTasks = this.lib.getProjectTasksByIds(assignableProjectIds);
        
        for (var i = 0, length = returnData.data.length; i < length; i++) {
            var proj = returnData.data[i];

            var projectTasks = projTasks.filter(function (e) {
                return (e.getValue('project') == proj.id);
            });
            
            returnData.data[i].children = projectTasks.map(function (projTask) {
                return { 
                    id : proj.id + '~' + projTask.id,
                    type: 'task',
                    name: projTask.getValue('title'),
                    hrsEstimated: projTask.getValue('estimatedwork'),
                    pctComplete: projTask.getValue('percentworkcomplete'),
                    taskStartDate: projTask.getValue('startdate'),
                    taskEndDate: projTask.getValue('enddate'),
                    leaf: true,
                    expanded: true,
                    children: []
                };
            });
        }
    },
    
    this.processCalendarList = function (returnData) {
        var workCalendars = this.lib.getWorkCalendars(),
            keys = Object.keys(workCalendars);
        
        returnData.total = keys.length;
        for (var i = 0; i < keys.length; i++) {
            returnData.data.push(workCalendars[keys[i]]);
        }
    },
    
    this.processRangeList = function (resultSet, returnData, nameField) {
        var start  = 0,
            limit  = 1000, 
            end    = start + limit,
            length = limit;
        
        while (length == limit && length > 0) {
            var results = resultSet.getResults(start, end),
                length = results.length;
                
            for (var i = 0; i < length; i+=limit) {
                returnData.data.push({
                    id : Math.floor(start / limit),
                    name : results[i].getValue(nameField) + ' - ' + results[length-1].getValue(nameField),
                    startIndex : start,
                    endIndex : end
                });
            }
                
            start = end;
            end = start + limit;
            returnData.total++;
            nlapiLogExecution('DEBUG', 'Governance processRangeList', this.context.getRemainingUsage());
        }
    };
    
    this.processResourcesList = function (resultSet, returnData, startIndex, endIndex) {
        var limit    = 1000,
            start    = startIndex || 0, 
            end      = endIndex || start + limit,
            length   = limit,
            workCals = this.lib.getWorkCalendars();
        
        nlapiLogExecution('DEBUG', 'workCals', JSON.stringify(workCals));
        
        while (length == limit) {
            var results = resultSet.getResults(start, end),
                length = results.length;
                
            //returnData.total = returnData.total + length;
            for (var i = 0; i < length; i++) {
                var result = results[i],
                    workCalendarId = result.getValue('internalid', 'workcalendar');
                
                returnData.data.push({
                    id : result.getValue('internalid'),
                    name : result.getValue('entityid'),
                    type : result.getValue('formulatext'),
                    //role : result.getValue('title', 'employee') || '-',
                    supervisor : result.getValue('supervisor', 'employee') || 0,
                    supervisorName : result.getText('supervisor', 'employee') || '',
                    laborCost : result.getValue('formulanumeric') || 0,
                    workCalendarId : workCalendarId,
                    billingClass : result.getValue('billingclass', 'employee') || 0,
                    email : result.getValue('email', 'employee') || ''
                });
            }
            
            nlapiLogExecution('DEBUG', 'Governance processResourcesList', this.context.getRemainingUsage());
            
            if (startIndex && endIndex) break;
            
            start = end;
            end = start + limit;
        };
    };
    
    this.processProjectsList = function(resultSet, returnData, startIndex, endIndex) {
        var limit  = 1000,
            start  = startIndex || 0,
            end    = endIndex || start + limit,
            length = limit;
    
        while (length == limit) {
            var results = resultSet.getResults(start, end),
                length = results.length;
                
            returnData.total = returnData.total + length;
            for (var i = 0; i < length; i++) {
                returnData.data.push({
                    id : results[i].getValue('internalid'),
                    name : results[i].getValue('formulatext'),
                    hrsEstimated : results[i].getValue('estimatedtimeoverride'),
                    pctComplete : results[i].getValue('percenttimecomplete'),
                    actualTime : results[i].getValue('actualtime'),
                    timeRemaining : results[i].getValue('timeremaining'),
                    startDate : results[i].getValue('startdate'),
                    calculatedEndDate : results[i].getValue('calculatedenddate')
                });
            }
            
            nlapiLogExecution('DEBUG', 'Governance processProjectsList', this.context.getRemainingUsage());
            
            if (startIndex && endIndex) break;
            
            start = end;
            end = start + limit;
        };
    };
    
    this.processProjectTasksList = function(resultSet, returnData, startIndex, endIndex) {
        var limit  = 1000,
            start  = startIndex || 0,
            end    = endIndex || start + limit,
            length = limit;
    
        while (length == limit) {
            var results = resultSet.getResults(start, end),
                length = results.length;
                
            returnData.total = returnData.total + length;
            for (var i = 0; i < length; i++) {
                returnData.data.push({
                    id : results[i].getValue('internalid'),
                    name : results[i].getValue('title')
                });
            }
            
            nlapiLogExecution('DEBUG', 'Governance processProjectTasksList', this.context.getRemainingUsage());
            
            if (startIndex && endIndex) break;
            
            start = end;
            end = start + limit;
        };
    };
    
    this.processSimpleList = function(resultSet, returnData, nameField, startIndex, endIndex) {
        var limit  = 1000,
            start  = startIndex || 0,
            end    = endIndex || start + limit,
            length = limit;
    
        while (length == limit) {
            var results = resultSet.getResults(start, end),
                length = results.length
                
            returnData.total = returnData.total + length;
            for (var i = 0; i < length; i++) {
                returnData.data.push({
                    id : results[i].getValue('internalid'),
                    name : results[i].getValue(nameField)
                });
            }
            
            if (startIndex && endIndex) break;
            
            start = end;
            end = start + limit;
        };
        
        nlapiLogExecution('DEBUG', 'Governance processSimpleList', this.context.getRemainingUsage());
    };
    
    this.processListwithFormula = function(resultSet, returnData, colIndex, startIndex, endIndex) {
        var limit  = 1000, 
            start  = startIndex || 0,
            end    = endIndex || start + limit,
            length = limit;
            columns = resultSet.getColumns();

        while (length == limit) {
            var results = resultSet.getResults(start, end),
                length = results.length;
                
            returnData.total = returnData.total + length;
            for (var i = 0; i < length; i++) {
                returnData.data.push({
                    id : results[i].getValue('internalid'),
                    name : results[i].getValue(columns[colIndex])
                });
            }
            
            if (startIndex && endIndex) break;
            
            start = end;
            end = start + limit;
        };
    };
    
    this.getSimpleTotal = function(search, returnData) {
        search.setColumns([new nlobjSearchColumn('internalid', null, 'count').setSort()]);
        
        var totalResultSet = search.runSearch(),
            result = totalResultSet.getResults(0, 1);
        
        returnData.total = result[0].getValue('internalid', null, 'count');
    } 
};