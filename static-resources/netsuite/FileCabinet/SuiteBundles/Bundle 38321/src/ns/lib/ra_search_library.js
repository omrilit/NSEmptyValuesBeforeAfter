/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */

var psa_racg_searchLibrary;
if (!psa_racg_searchLibrary) {
    psa_racg_searchLibrary = {
        SEARCH_LIMIT: 1000
    };
}

/*
 * searchParams.settingId {Integer|null} - internal id of setting record
 * searchParams.user {Integer|null} - internal id of user for own, if null, or another user's setting record
 * searchParams.filters {Array|null} - array of nlobjSearchFilter objects
 * searchParams.columns {Array|null} - array of nlobjSearchColumn objects
 */
psa_racg_searchLibrary.getSetting = function(searchParams) {
    var defaultFilters = [new nlobjSearchFilter('custrecord_entity_id', null, 'is', (searchParams.user ? searchParams.user : nlapiGetContext().getUser()))],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_setting_search'),
        setting = null;
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    var searchResults = customSearch.runSearch().getResults(0, psa_racg_searchLibrary.SEARCH_LIMIT);
    if (searchResults.length) {
        //saved search is sorted by date created, will return latest setting record
        setting = searchResults[searchResults.length-1];
    }
    return setting;
};

psa_racg_searchLibrary.getDefaultFilterId = function() {
    var filters = [new nlobjSearchFilter('custrecord_racg_filter_is_default', null, 'is', true)];
    var searchResults = psa_racg_searchLibrary.getAllFilters({filters: filters});
    var objId = {};
    var idMap = {1: 'allocation', 2: 'customer', 3: 'project'}; //convert viewtype id to text
    var viewType, id;
    for(var i = 0; i < searchResults.length; i++) {
        viewType = searchResults[i].getValue('custrecord_racg_filter_view_by_type');
        id = searchResults[i].getValue('internalid');
        objId[idMap[viewType]] = id;
    }
    return objId;
};

psa_racg_searchLibrary.getAllFilters = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_all_filters');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch()
    });
};

psa_racg_searchLibrary.getResourceAllocations = function(searchParams) {
    var defaultFilters = [],
        defaultColumns = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_resource_allocations');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    customSearch.addColumns(psa_racg_searchLibrary.combineColumns(defaultColumns, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};

psa_racg_searchLibrary.getResourceAllocationsByGroup = function(searchParams) {
    var defaultFilters = [],
        defaultColumns = [],
        customSearch = nlapiCreateSearch('resourceallocation');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    customSearch.addColumns(psa_racg_searchLibrary.combineColumns(defaultColumns, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};

psa_racg_searchLibrary.getWorkCalendars = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_work_calendars'),
        allResults = [],
        calendars = {},
        searchResult,
        searchResultId,
        searchResultExceptionDate;
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    allResults = psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch()
    });
    for (var i = 0; i < allResults.length; i++) {
        searchResult = allResults[i];
        searchResultId = searchResult.getValue('internalid');
        if (!calendars[searchResultId]) {
            calendars[searchResultId] = {
                id: searchResultId,
                name: searchResult.getValue('name'),
                starthour: searchResult.getValue('starthour'),
                hoursperday: searchResult.getValue('workhoursperday'),
                sunday: searchResult.getValue('sunday'),
                monday: searchResult.getValue('monday'),
                tuesday: searchResult.getValue('tuesday'),
                wednesday: searchResult.getValue('wednesday'),
                thursday: searchResult.getValue('thursday'),
                friday: searchResult.getValue('friday'),
                saturday: searchResult.getValue('saturday'),
                nonWork: []
            };
        }
        searchResultExceptionDate = searchResult.getValue('exceptiondate');
        if (searchResultExceptionDate) {
            calendars[searchResultId].nonWork.push({
                exceptiondate: nlapiStringToDate(searchResultExceptionDate).toString('yyyy/MM/dd'),
                exceptiondescription: searchResult.getValue('exceptiondescription')
            });
        }
    }
    return calendars;
};

psa_racg_searchLibrary.getProjectResources = function(searchParams) {
    var defaultFilters = [],
        defaultColumns = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_project_resources');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    customSearch.addColumns(psa_racg_searchLibrary.combineColumns(defaultColumns, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};

psa_racg_searchLibrary.getProjects = function(searchParams) {
    var defaultFilters = [],
        defaultColumns = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_projects');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    customSearch.addColumns(psa_racg_searchLibrary.combineColumns(defaultColumns, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch()
    });
};

psa_racg_searchLibrary.getProjectsWithResources = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_projects_with_res');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};

psa_racg_searchLibrary.getCustomers = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_customers');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};

psa_racg_searchLibrary.getProjectTemplates = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_project_templates');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};

psa_racg_searchLibrary.getUserNotes = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_user_notes');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch()
    });
};

psa_racg_searchLibrary.getResourcesWithProjects = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_ra_with_projects');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch()
    });
};

psa_racg_searchLibrary.getResourceAllocationResources = function(searchParams) {
    var defaultFilters = [],
        defaultColumns = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_ra_resources');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    customSearch.addColumns(psa_racg_searchLibrary.combineColumns(defaultColumns, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};
psa_racg_searchLibrary.getResourceAllocationResourcesForCustomerNode = function(searchParams) {
    var defaultFilters = [],
        defaultColumns = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_ra_resources_cust_node');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    customSearch.addColumns(psa_racg_searchLibrary.combineColumns(defaultColumns, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};
psa_racg_searchLibrary.getResourceAllocationResourcesForProjectNode = function(searchParams) {
    var defaultFilters = [],
    defaultColumns = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_ra_resources_proj_node');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    customSearch.addColumns(psa_racg_searchLibrary.combineColumns(defaultColumns, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};
psa_racg_searchLibrary.getResourceAllocationCustomers = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_ra_customers');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};
psa_racg_searchLibrary.getResourceAllocationProjects = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_ra_projects');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};
psa_racg_searchLibrary.getResourceAllocationProjectsForProjectNode = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_ra_projects_proj_node');
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    return psa_racg_searchLibrary.getAllResults({
        resultSet: customSearch.runSearch(),
        start: searchParams.start,
        limit: searchParams.limit,
        total: searchParams.total
    });
};

//START - count functions
psa_racg_searchLibrary.getProjectResourcesCount = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_count_project_resource'),
        count = 0;
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    var searchResults = customSearch.runSearch().getResults(0, 1);
    if (searchResults) {
        count = searchResults[0].getValue('internalid', null, 'count');
    }
    return count;
};

psa_racg_searchLibrary.getResourceAllocationResourcesCount = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_count_ra_resources'),
        count = 0;
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    var searchResults = customSearch.runSearch().getResults(0, 1);
    if (searchResults) {
        count = searchResults[0].getValue('resource', null, 'count');
    }
    return count;
};

psa_racg_searchLibrary.getResourceAllocationCustomersCount = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_count_ra_customers'),
        count = 0;
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    var searchResults = customSearch.runSearch().getResults(0, 1);
    if (searchResults) {
        count = searchResults[0].getValue('customer', null, 'count');
    }
    return count;
};

psa_racg_searchLibrary.getResourceAllocationProjectsCount = function(searchParams) {
    var defaultFilters = [],
        customSearch = nlapiLoadSearch(null, 'customsearch_racg_count_ra_projects'),
        count = 0;
    customSearch.addFilters(psa_racg_searchLibrary.combineFilters(defaultFilters, searchParams));
    var searchResults = customSearch.runSearch().getResults(0, 1);
    if (searchResults) {
        count = searchResults[0].getValue('project', null, 'count');
    }
    return count;
};
//END - count functions

//START - convenience functions
psa_racg_searchLibrary.combineFilters = function(defaultFilters, params) {
    if (params.filters) {
        defaultFilters = defaultFilters.concat(params.filters);
    }
    return defaultFilters;
};

psa_racg_searchLibrary.combineColumns = function(defaultColumns, params) {
    if (params.columns) {
        defaultColumns = defaultColumns.concat(params.columns);
    }
    return defaultColumns;
};

psa_racg_searchLibrary.getAllResults = function(params) {
    var resultLimit = +params.limit, //Blank = No Limits
        limit = +params.limit || 1000,
        start = +params.start || 0,
        total = +params.total || (start + limit),
        searchResult = ['dummy'], //content to be replace on 1st search
        retArray = [],
        end = ((start + limit > total) ? total : (start + limit));


    while ((!resultLimit || retArray.length < resultLimit) && searchResult.length > 0) {
        searchResult = params.resultSet.getResults(start, end);

        for (var i = 0; i < searchResult.length; i++) {
            if (!resultLimit || retArray.length < resultLimit) {
                retArray.push(searchResult[i]);
            } else {
                break;
            }
        }

        start = end;
        end = start + limit;
    }

    return retArray;
};
//END - convenience functions