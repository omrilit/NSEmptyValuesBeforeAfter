/**
 * © 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var onServerLog = true;
//var onServerLog = false;

var psa_ra;
if (!psa_ra) { psa_ra = {}; }
if (!psa_ra.serverlibrary) { psa_ra.serverlibrary = {}; }

psa_ra.serverlibrary.isValidObject = function(objectToTest) {
    var isValidObject = false;
    isValidObject = (objectToTest!=null && objectToTest!='' && objectToTest!=undefined) ? true : false;
    return isValidObject;
};

/**
 * Trim leading and lagging white spaces.
 */
psa_ra.serverlibrary.trim = function (stringToTrim) {
    stringToTrim += '';
    if (onServerLog) {
        nlapiLogExecution('DEBUG', 'trim : ', 'stringToTrim: \n'+stringToTrim);
    }

   if(stringToTrim != null && stringToTrim!=undefined && stringToTrim!='') {
           return stringToTrim.replace(/^\s+|\s+$/g,"");
   } else {
           return ''+stringToTrim;
   }
}; // end psa_rss.serverlibrary.trim

/**
 * Logging utility.
 */
psa_ra.serverlibrary.logger = function(logTitle, isClientside, isEnabled) {
    // Logger Constants
    var startLogMessage     = '=====Start=====';
    var endLogMessage       = '======End======';

    this.setStartLogMessage  = function(newStartLogMessage) { startLogMessage = newStartLogMessage;  };
    this.setEndLogMessage    = function(newEndLogMessage)  { endLogMessage   = newEndLogMessage;    };
    this.getStartLogMessage = function() { return startLogMessage;  };
    this.getEndLogMessage   = function() { return endLogMessage;    };

    // logTitle manipulation
    var logTitle           = logTitle;
    this.setLogTitle       = function(newLogTitle) { logTitle = newLogTitle;  };
    this.getLogTitle       = function() { return logTitle;  };

    // Determines whether to print a log or display an alert message
    var isClientside       = (!isClientside) ? false : isClientside;
    var isForceClientside  = false;

    this.forceClientside   = function() { isForceClientside = true;  };          // Force Client Side logging via alerts
    this.unforceClientside = function() { isForceClientside = false; };          // Unforce Client Side logging via alerts

    // Defines the logLevel similar to that of log4j
    var ALL        = 0; // The ALL has the lowest possible rank and is intended to turn on all logging.
    var AUDIT      = 1; // The AUDIT Level designates finer-grained informational events than the DEBUG
    var DEBUG      = 2; // The DEBUG Level designates fine-grained informational events that are most useful to debug an application.
    var ERROR      = 3; // The ERROR level designates error events that might still allow the application to continue running.
    var EMERGENCY  = 4; // The EMERGENCY level designates very severe error events that will presumably lead the application to abort.
    var OFF        = 5; // The OFF has the highest possible rank and is intended to turn off logging.

    var LOG_LEVELS = new Array('ALL', 'AUDIT', 'DEBUG', 'ERROR', 'EMERGENCY', 'OFF');
    var logLevel   = OFF; // current log level - default is OFF

    // Convenience method to set log level to ALL, AUDIT, DEBUG, ERROR, EMERGENCY and OFF
    this.setLogLevelToAll       = function() { logLevel = ALL;       };
    this.setLogLevelToOff       = function() { logLevel = OFF;       };

    this.enable   = function() { this.setLogLevelToAll(); };                     // Enable the logging mechanism
    this.disable  = function() { this.setLogLevelToOff(); };                     // Disable the logging mechanism
    if (!isEnabled) {
        this.disable();
    } else {
        if (isEnabled == true) this.enable();
    }

    // Facility for pretty-fying the output of the logging mechanism
    var TAB             = '\t';                                                 // Tabs
    var SPC             = ' ';                                                  // Space
    var indentCharacter = SPC;                                                  // character to be used for indents:
    var indentations    = 0;                                                    // number of indents to be padded to message

    this.indent   = function() { indentations++; };
    this.unindent = function() { indentations--; };

    // Prints a log either as an alert for CSS or a server side log for SSS
    this.log = function (logType, newLogTitle, logMessage) {
        // Pop an alert window if isClientside or isForceClientside
        if ((isClientside) || (isForceClientside)) {
            alert(LOG_LEVELS[logType] + ' : ' + newLogTitle + ' : ' + logMessage);
        }

        // Prints a log message if !isClientside
        if (!isClientside) {
            for (var i = 0; i < indentations; i++) {
                logMessage = indentCharacter + logMessage;
            }
            logMessage = '<pre>' + logMessage + '</pre>';
            nlapiLogExecution(LOG_LEVELS[logType], newLogTitle, logMessage);
        }
    };

    // Validates the log parameter before calling tha actual log function
    this.validateParamsThenLog = function(logType, newLogTitle, logMessage) {
        if (logLevel > logType) return;                                         // current logLevel does not accomodate logType

        if (newLogTitle && !logMessage) {                                       // If newLogTitle exist and logMessage is undefined,
            logMessage  = newLogTitle;                                          // then the newLogTitle should be displayed as the logMessage
            newLogTitle = null;
        }

        if (!newLogTitle) newLogTitle = logTitle;
        this.log(logType, newLogTitle, logMessage);
    };

    // Convenience method to log a AUDIT, DEBUG, INFO, WARN, ERROR and EMERGENCY messages
    this.audit     = function(newLogTitle, logMessage) { this.validateParamsThenLog(AUDIT,     newLogTitle, logMessage); };
    this.debug     = function(newLogTitle, logMessage) { this.validateParamsThenLog(DEBUG,     newLogTitle, logMessage); };
    this.error     = function(newLogTitle, logMessage) { this.validateParamsThenLog(ERROR,     newLogTitle, logMessage); };
    this.emergency = function(newLogTitle, logMessage) { this.validateParamsThenLog(EMERGENCY, newLogTitle, logMessage); };
}; // end psa_rss.serverlibrary.logger

psa_ra.serverlibrary.isProjectTaskEnabled = function() {
    var MSG_TITLE     = 'psa_ra.serverlibrary.isProjectTaskEnabled',
        logger         = new psa_ra.serverlibrary.logger(MSG_TITLE, false),
        isEnabled = 'F';

    if (isServerLog) {
        logger.enable();
    }

    var result = psa_racg_searchLibrary.getSetting({});

    if (result) {
        isEnabled = result.getValue('custrecord_show_project_tasks');
    }

    return isEnabled === 'T';
};

psa_ra.serverlibrary.isAccountingPreferenceEnabled = function(preferenceId) {
    var MSG_TITLE     = 'psa_ra.serverlibrary.isAccountingPreferenceEnabled';
    var logger         = new psa_ra.serverlibrary.logger(MSG_TITLE, false);

    if (isServerLog) {
        logger.enable();
    }

    return nlapiLoadConfiguration('accountingpreferences').getFieldValue(preferenceId) === 'T';
};

psa_ra.serverlibrary.isFeatureEnabled = function(featureId) {
    // copied from PTM's rm_check_feature_lib.js then updated.
    var MSG_TITLE     = 'psa_ra.serverlibrary.isFeatureEnabled';
    var logger         = new psa_ra.serverlibrary.logger(MSG_TITLE, false);

    if (isServerLog) {
        logger.enable();
    }

    if(featureId == 'resourceskillsets'){
        var isInstalled = false;
        var searchContent = nlapiSearchGlobal('rss_bundle_identifier.txt');
        if (searchContent != null && searchContent.length > 0) {
            for ( var i = 0; i < searchContent.length; i++) {
                var searchresult = searchContent[i];
                var record = searchresult.getId();
                var rectype = searchresult.getRecordType();
                if (rectype == 'file') {
                    var objFile = nlapiLoadFile(record);
                    var fileContent = objFile.getValue();

//                  logger.debug('isInstalled 1', (fileContent == '9be79a64-837c-49ef-8f65-61c093ca1198'));
//                  logger.debug('isInstalled 2', (fileContent === '9be79a64-837c-49ef-8f65-61c093ca1198'));
//                  logger.debug('isInstalled 3', (fileContent.indexOf('9be79a64-837c-49ef-8f65-61c093ca1198')));
//                  logger.debug('isInstalled 4', (fileContent.indexOf('9be79a64-837c-49ef-8f65-61c093ca1198') > -1));

                    isInstalled = (fileContent.indexOf('9be79a64-837c-49ef-8f65-61c093ca1198') > -1);
                }
            }
        }
        return isInstalled;
    }
    else {
        return nlapiGetContext().getFeature(featureId);
    }
};

//[JRJ] Removed unused method getTotalForList

psa_ra.serverlibrary.getList = function (searchType, nameField, searchFilters, searchColumns, range) {
    var logger         = new psa_ra.serverlibrary.logger(searchType, false);

    if (isServerLog) {
        logger.enable();
    }

    var searchFilter = [],
        searchColumn = [];

    switch (searchType) {
        case 'job' :
            if (!range) {
                searchColumn.push(
                        new nlobjSearchColumn('internalid', null, 'group'),
                        new nlobjSearchColumn(nameField, null, 'group'),
                        new nlobjSearchColumn('companyname', 'customer', 'group'),
                        new nlobjSearchColumn('startdate', null, 'group'),
                        new nlobjSearchColumn('calculatedenddate', null, 'group'),
                        new nlobjSearchColumn('internalid', 'projecttask', 'count'));
            } else {
                searchColumn = [new nlobjSearchColumn(nameField, null, 'group')];
            }
            break;
        case 'projecttask' :
            if (!range) {
                searchColumn.push(
                        new nlobjSearchColumn('startdate'),
                        new nlobjSearchColumn('enddate'));
            }
            break;
        case 'vendor':
            searchColumn.push(
                new nlobjSearchColumn('laborcost'),
                new nlobjSearchColumn('workcalendar'));

            if (psa_ra.serverlibrary.isFeatureEnabled ('billingclasses')) {
                searchColumn.push(new nlobjSearchColumn('billingclass'));
            }

            break;
        case 'employee':
            searchColumn.push(
                new nlobjSearchColumn('laborcost'),
                new nlobjSearchColumn('workcalendar'));

            if (psa_ra.serverlibrary.isFeatureEnabled ('departments')) {
                searchColumn.push(new nlobjSearchColumn('department'));
            }

            if (psa_ra.serverlibrary.isFeatureEnabled ('classes')) {
                searchColumn.push(new nlobjSearchColumn('class'));
            }

            if (psa_ra.serverlibrary.isFeatureEnabled ('locations')) {
                searchColumn.push(new nlobjSearchColumn('location'));
            }

            if (psa_ra.serverlibrary.isFeatureEnabled ('billingclasses')) {
                searchColumn.push(new nlobjSearchColumn('billingclass'));
            }

            break;
        case 'projectresource':
            //retrieve only employee and vendor types
            //searchFilter.push(new nlobjSearchFilter('type', null, 'anyof', ['Employee','Vendor']));

            searchColumn.push(
                new nlobjSearchColumn('type'),
                new nlobjSearchColumn('name', 'workcalendar'),
                new nlobjSearchColumn('internalid', 'workcalendar'),
                new nlobjSearchColumn('supervisor', 'employee'));
            break;

        case 'genericresource':
            searchColumn.push(new nlobjSearchColumn('workcalendar'));
            break;
        case 'customrecord_rss_skill':
            searchColumn.push(
                new nlobjSearchColumn('custrecord_rss_skill_category'),
                new nlobjSearchColumn('custrecord_rss_skill_linenumber'));
            break;
        case 'customrecord_rss_skill_level':
            searchColumn.push(
                new nlobjSearchColumn('custrecord_rss_skill_level_category'),
                new nlobjSearchColumn('custrecord_rss_skill_level_linenumber'));
            break;
        case 'workcalendar':
            searchColumn.push(
                new nlobjSearchColumn('starthour'),
                new nlobjSearchColumn('workhoursperday'),
                new nlobjSearchColumn('sunday'),
                new nlobjSearchColumn('monday'),
                new nlobjSearchColumn('tuesday'),
                new nlobjSearchColumn('wednesday'),
                new nlobjSearchColumn('thursday'),
                new nlobjSearchColumn('friday'),
                new nlobjSearchColumn('saturday'),
                new nlobjSearchColumn('exceptiondate'),
                new nlobjSearchColumn('exceptiondescription'));
            break;
        case 'customrecord_ra_chart_filters' :
            searchColumn.push(
                new nlobjSearchColumn('owner'),
                new nlobjSearchColumn('isinactive'),
                new nlobjSearchColumn('custrecord_ra_public'),
                new nlobjSearchColumn('custrecord_ra_resource_type'),
                new nlobjSearchColumn('custrecord_ra_alloc_start_date'),
                new nlobjSearchColumn('custrecord_ra_resources'),
                new nlobjSearchColumn('custrecord_ra_vendor_type'),
                new nlobjSearchColumn('custrecord_ra_vendor_categories'));

            if (psa_ra.serverlibrary.isFeatureEnabled ('subsidiaries')) {
                searchColumn.push(
                    new nlobjSearchColumn('custrecord_ra_subsidiaries'),
                    new nlobjSearchColumn('custrecord_ra_child_subsidiary'));
            }

            if (psa_ra.serverlibrary.isFeatureEnabled ('departments')) {
                searchColumn.push(
                    new nlobjSearchColumn('custrecord_ra_departments'),
                    new nlobjSearchColumn('custrecord_ra_child_dept'));
            }

            if (psa_ra.serverlibrary.isFeatureEnabled ('classes')) {
                searchColumn.push(
                    new nlobjSearchColumn('custrecord_ra_classes'),
                    new nlobjSearchColumn('custrecord_ra_child_class'));
            }

            if (psa_ra.serverlibrary.isFeatureEnabled ('locations')) {
                searchColumn.push(
                    new nlobjSearchColumn('custrecord_ra_locations'),
                    new nlobjSearchColumn('custrecord_ra_child_location'));
            }

            if (psa_ra.serverlibrary.isFeatureEnabled ('billingclasses')) {
                searchColumn.push(new nlobjSearchColumn('custrecord_ra_billingclasses'));
            }

            break;
        case 'customrecord_racg_filter':
            searchColumn.push(
                new nlobjSearchColumn('owner'),
                new nlobjSearchColumn('isinactive'),
                new nlobjSearchColumn('custrecord_racg_filter_is_shared'),
                new nlobjSearchColumn('custrecord_racg_filter_record1'),
                new nlobjSearchColumn('custrecord_racg_filter_field1'),
                new nlobjSearchColumn('custrecord_racg_filter_record2'),
                new nlobjSearchColumn('custrecord_racg_filter_field2'),
                new nlobjSearchColumn('custrecord_racg_filter_record3'),
                new nlobjSearchColumn('custrecord_racg_filter_field3'),
                new nlobjSearchColumn('custrecord_racg_filter_record4'),
                new nlobjSearchColumn('custrecord_racg_filter_field4'),
                new nlobjSearchColumn('custrecord_racg_filter_record5'),
                new nlobjSearchColumn('custrecord_racg_filter_field5'),
                new nlobjSearchColumn('custrecord_racg_filter_record6'),
                new nlobjSearchColumn('custrecord_racg_filter_field6'),
                new nlobjSearchColumn('custrecord_racg_filter_record7'),
                new nlobjSearchColumn('custrecord_racg_filter_field7'),
                new nlobjSearchColumn('custrecord_racg_filter_record8'),
                new nlobjSearchColumn('custrecord_racg_filter_field8'),
                new nlobjSearchColumn('custrecord_racg_filter_view_by_type').setSort(),
                new nlobjSearchColumn('custrecord_racg_filter_is_default')
            );

            break;
        case 'customer':
            searchColumn.push(
                new nlobjSearchColumn('firstname'),
                new nlobjSearchColumn('lastname'),
                new nlobjSearchColumn('isperson')
            );
            break;
    }

    if (searchType != 'job') {
        searchColumn.push(
            new nlobjSearchColumn('internalid', null, null),
            new nlobjSearchColumn(nameField, null, null).setSort()
        );
    }

    if (searchFilters) {
        searchFilter = searchFilter.concat(searchFilters);
    }

    if (searchColumns) {
        searchColumn = searchColumn.concat(searchColumns);
    }

     var search = new psa_ra.serverlibrary.Search(searchType, null, searchFilter, searchColumn);
     return search;
};

psa_ra.serverlibrary.toJson = function (json) {
    try {
        if (json) {
            return JSON.parse(json);
        }
    }
    catch(ex) {
        return json;
    }
};

psa_ra.serverlibrary.isJson = function (json) {
    try {
        if (json) {
            JSON.parse(json);
        }

        return true;
    }
    catch(ex) {
        return false;
    }
};

psa_ra.serverlibrary.getFailMessage = function (message) {
    var err = new Object();
    err.success = false;
    err.message= message;
    return JSON.stringify(err);
};

psa_ra.serverlibrary.getWorkCalendars = function () {
    var cals = {};

    var search = psa_ra.serverlibrary.getList ('workcalendar', 'name');
    var results = search.getAllResults();

    if (results.length > 0) {
        var id;
        var prevId = -100; // random imposible id.

        var nonWork = new Array();

        for (var i = 0, ii = results.length; i < ii; i++){
            var searchResult = results[i];
            id = searchResult.getValue('internalid');
            if (id != prevId) {
                if (i-1 >= 0) {
                    cals[prevId].nonWork = nonWork;

                    nonWork = new Array();
                }

                prevId = id;

                cals[id] = {
                    id          : id,
                    name        : searchResult.getValue('name'),
                    starthour   : searchResult.getValue('starthour'),
                    hoursperday : searchResult.getValue('workhoursperday'),
                    sunday      : searchResult.getValue('sunday'),
                    monday      : searchResult.getValue('monday'),
                    tuesday     : searchResult.getValue('tuesday'),
                    wednesday   : searchResult.getValue('wednesday'),
                    thursday    : searchResult.getValue('thursday'),
                    friday      : searchResult.getValue('friday'),
                    saturday    : searchResult.getValue('saturday')
                };
            }

            if (searchResult.getValue('exceptiondate')) {
                nonWork.push({
                    'exceptiondate' : nlapiDateToString(nlapiStringToDate(searchResult.getValue('exceptiondate'))),
                    'exceptiondescription' : searchResult.getValue('exceptiondescription')
                });
            }

        }

        cals[id].nonWork = nonWork;
    }

    return cals;
};

psa_ra.serverlibrary.getTotalResources = function(searchFilters) {
    var total     = 0,
        searchFilter = [
                new nlobjSearchFilter('isinactive', null, 'is', 'F')
            ],
        searchColumn = [
                new nlobjSearchColumn('internalid', null, 'count')
            ];

    if (searchFilters && searchFilters.length > 0) {
        searchFilter = searchFilter.concat(searchFilters);
    }

    var results = nlapiSearchRecord('projectresource', null, searchFilter, searchColumn);

    if (results) {
        total = results[0].getValue('internalid', null, 'count');
    }

    return total;
};

psa_ra.serverlibrary.getTotalResourcesWithProjects = function(searchFilters) {
    var total     = 0,
        searchFilter = [
                new nlobjSearchFilter('status', 'job', 'noneof', 1), // 1 - closed, 2 - in progress, 3 - not awarded, 4 - pending, 5 - awarded
                new nlobjSearchFilter('isinactive', 'resource', 'is', 'F'),
                new nlobjSearchFilter('isinactive', 'job', 'is', 'F'),
                new nlobjSearchFilter('isinactive', 'projecttemplate', 'is', 'F')
            ],
        searchColumn = [
                new nlobjSearchColumn('resource', null, 'count')
            ];

    if (searchFilters && searchFilters.length > 0) {
        searchFilter = searchFilter.concat(searchFilters);
    }

    var results = nlapiSearchRecord('resourceallocation', null, searchFilter, searchColumn);

    if (results) {
        total = results[0].getValue('resource', null, 'count');
    }

    return total;
};

psa_ra.serverlibrary.getResourceWithProjects = function(searchFilters) {
    var CLOSED       = 1, // 1 - closed, 2 - in progress, 3 - not awarded, 4 - pending, 5 - awarded
        estimatedWorkId = psa_ra.serverlibrary.isFeatureEnabled('plannedwork') ? 'plannedwork' : 'estimatedtimeoverride',
        searchFilter = [
            new nlobjSearchFilter('status', 'job', 'noneof', 1),
            new nlobjSearchFilter('isinactive', 'resource', 'is', 'F'),
            new nlobjSearchFilter('isinactive', 'job', 'is', 'F'),
            new nlobjSearchFilter('isinactive', 'projecttemplate', 'is', 'F')
        ],
        searchColumn = [
            new nlobjSearchColumn('internalid', 'resource', 'group'),
            new nlobjSearchColumn('entityid', 'resource', 'group').setSort(),
            new nlobjSearchColumn('companyname', 'customer', 'group'),
            new nlobjSearchColumn('projecttask', null, 'group'),
            new nlobjSearchColumn('company', null, 'group'), // getValue = project/template id; getText = project/template name prefixed with id
            new nlobjSearchColumn('internalid', 'job', 'group'),
            new nlobjSearchColumn('companyname', 'job', 'group').setSort(),
            new nlobjSearchColumn('entitystatus', 'job', 'group'),
            new nlobjSearchColumn('internalid', 'projecttemplate', 'group'),
            new nlobjSearchColumn('entityid', 'projecttemplate', 'group').setSort(),

            new nlobjSearchColumn('percenttimecomplete', 'job', 'group'),
            new nlobjSearchColumn(estimatedWorkId, 'job', 'group'),
            new nlobjSearchColumn('actualtime', 'job', 'group'),
            new nlobjSearchColumn('timeremaining', 'job', 'group'),
            new nlobjSearchColumn('startdate', 'job', 'group'),
            new nlobjSearchColumn('calculatedenddate', 'job', 'group')
        ];

    if (searchFilters && searchFilters.length > 0) {
        searchFilter = searchFilter.concat(searchFilters);
    }

    var search = nlapiCreateSearch('resourceallocation', searchFilter, searchColumn),
        results = search.runSearch();

    return results;
};

psa_ra.serverlibrary.getResourceAllocations = function(searchFilters) {
    var CLOSED           = 1, // 1 - closed, 2 - in progress, 3 - not awarded, 4 - pending, 5 - awarded
        context          = nlapiGetContext(),
        isAppovalEnabled = (context.getPreference('CUSTOMAPPROVALRSRCALLOC') == 'T'),
        searchFilter = [
            new nlobjSearchFilter('status', 'job', 'noneof', CLOSED),
            new nlobjSearchFilter('isinactive', 'job', 'is', 'F'),
            new nlobjSearchFilter('isinactive', 'projecttemplate', 'is', 'F')
        ],
        searchColumn = [
            new nlobjSearchColumn('internalid'),
            new nlobjSearchColumn('resource').setSort(),
            new nlobjSearchColumn('customer').setSort(),
            new nlobjSearchColumn('company'),
            new nlobjSearchColumn('numberhours'),
            new nlobjSearchColumn('startdate').setSort(),
            new nlobjSearchColumn('percentoftime'),
            new nlobjSearchColumn('allocationunit'),
            new nlobjSearchColumn('enddate').setSort(),
            new nlobjSearchColumn('allocationtype'),
            new nlobjSearchColumn('notes'),

            new nlobjSearchColumn('internalid', 'job'),
            new nlobjSearchColumn('internalid', 'projecttemplate'),
            new nlobjSearchColumn('entityid', 'projecttemplate'),

            new nlobjSearchColumn('requestedby'),

            new nlobjSearchColumn('customer'),
            new nlobjSearchColumn('isperson', 'customer'),
            new nlobjSearchColumn('firstname', 'customer'),
            new nlobjSearchColumn('lastname', 'customer'),
            new nlobjSearchColumn('companyname', 'job'),
            new nlobjSearchColumn('companyname', 'customer'),
            new nlobjSearchColumn('projecttask'),


            new nlobjSearchColumn('frequency'),
            new nlobjSearchColumn('seriesstartdate'),
            new nlobjSearchColumn('endbydate'),
            new nlobjSearchColumn('period'),
            new nlobjSearchColumn('dow'),
            new nlobjSearchColumn('dowmask'),
            new nlobjSearchColumn('dowim')
        ];

    if (isAppovalEnabled) {
        searchColumn.push(
            new nlobjSearchColumn('approvalstatus'),
            new nlobjSearchColumn('nextapprover')
        );
    }

    if (searchFilters && searchFilters.length > 0) {
        searchFilter = searchFilter.concat(searchFilters);
    }

    var search = nlapiCreateSearch('resourceallocation', searchFilter, searchColumn),
        results = search.runSearch();

    return results;
};

psa_ra.serverlibrary.getChildrenByCategory = function (categoryId, isSkillLevel){
    var skilllevel = '';

    if (isSkillLevel) {
        skilllevel = '_level';
    }

    var filters = [new nlobjSearchFilter('custrecord_rss_skill'+skilllevel+'_category', null, 'anyof', categoryId)],
        columns = [
            new nlobjSearchColumn('internalid'),
            new nlobjSearchColumn('name'),
            new nlobjSearchColumn('custrecord_rss_skill'+skilllevel+'_linenumber').setSort() // empty/false - ascending; true - descending
        ];

    return nlapiSearchRecord('customrecord_rss_skill'+skilllevel, null, filters, columns);
};

psa_ra.serverlibrary.getEmployeesAsJson = function(searchFilter, searchColumn) {
    var search   = psa_ra.serverlibrary.getList('employee', 'entityid', searchFilter, searchColumn);
    var results = search.getAllResults();
    var employees = {};

    if (results.length > 0) {
        var prevId   = -100;
        var skillset = [];

        for (var i = 0, ii = results.length; i < ii; i++){
            var searchResult = results[i];
            var id = searchResult.getValue('internalid');

            if (!searchColumn || id != prevId) {

                if (searchColumn) {
                    if (i-1 >= 0) {
                        employees[prevId].skillset = skillset;

                        skillset = [];
                    }

                    prevId = id;
                }

                employees[id] = {
                    entityid     : searchResult.getValue('entityid'),
                    laborcost    : searchResult.getValue('laborcost'),
                    workCalendar : searchResult.getValue('workCalendar'),
                    workCal      : searchResult.getText('workCalendar'),

                    department   : (searchResult.getValue('department')) ? searchResult.getValue('department') : "",
                    location     : (searchResult.getValue('location')) ? searchResult.getValue('location') : "",
                    class        : (searchResult.getValue('class')) ? searchResult.getValue('class') : "",
                    billingclass : (searchResult.getValue('billingclass')) ? searchResult.getValue('billingclass') : ""
                };
            }

            if (searchResult.getValue('custrecord_rss_skillset_skill', 'custrecord_rss_skillset_resource')) {
                skillset.push({
                    'skill' : searchResult.getText('custrecord_rss_skillset_skill', 'custrecord_rss_skillset_resource'),
                    'skillId' : searchResult.getValue('custrecord_rss_skillset_skill', 'custrecord_rss_skillset_resource'),
                    'level' : searchResult.getText('custrecord_rss_skillset_level', 'custrecord_rss_skillset_resource'),
                    'levelId' : searchResult.getValue('custrecord_rss_skillset_level', 'custrecord_rss_skillset_resource')
                });
            }
        }

    }

    return employees;
};

psa_ra.serverlibrary.getVendorsAsJson = function (searchFilter) {
    var search = psa_ra.serverlibrary.getList('vendor', 'entityid', searchFilter);
    var results = search.getAllResults();
    var vendors = {};

    if (results.length > 0) {
        for (var i = 0, ii = results.length; i < ii; i++){
            var searchResult = results[i];
            var id = searchResult.getValue('internalid');

            vendors[id] = {
                entityid     : searchResult.getValue('entityid'),
                laborcost    : searchResult.getValue('laborcost'),
                workCalendar : searchResult.getValue('workCalendar'),
                billingclass : (searchResult.getValue('billingclass')) ? searchResult.getValue('billingclass') : ""
            };
        }
    }

    return vendors;
};

psa_ra.serverlibrary.setResourceWorkCalendar = function (row, workCals) {
    if (row && row.workCal && workCals) {
        row.workCalendar    = workCals[row.workCal].name;
        row.startHour       = workCals[row.workCal].starthour;
        row.hrsPerDay       = workCals[row.workCal].hoursperday;
        row.workSunday      = workCals[row.workCal].sunday == 'T';
        row.workMonday      = workCals[row.workCal].monday == 'T';
        row.workTuesday     = workCals[row.workCal].tuesday == 'T';
        row.workWednesday   = workCals[row.workCal].wednesday == 'T';
        row.workThursday    = workCals[row.workCal].thursday == 'T';
        row.workFriday      = workCals[row.workCal].friday == 'T';
        row.workSaturday    = workCals[row.workCal].saturday == 'T';
        row.nonWork         = workCals[row.workCal].nonWork;
    }
};

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
psa_ra.serverlibrary.mergeOptions = function (obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
};

psa_ra.serverlibrary.computeAvailability = function(objResource){
    var totalWorkingTime = parseFloat(objResource.workingtime);
    var totalAllocatedTime = parseFloat((objResource.allocatedtime)) ? parseFloat(objResource.allocatedtime) : 0;
    var availabilityInHrs = totalWorkingTime - totalAllocatedTime;
    var availabilityInPercent = availabilityInHrs / totalWorkingTime * 100;
    if(availabilityInPercent < 0){
        return  0;
    }
    return availabilityInPercent;
};

psa_ra.serverlibrary.getTotalAvailableTimePerResource = function(objWorkCals, workCalId, resourceId, fromDate, toDate){
    var MSG_TITLE   = 'psa_ra.serverlibrary.getTotalAvailableTimePerResource';
    var logger    = new psa_ra.serverlibrary.logger(MSG_TITLE, false);

    if (isServerLog) {
        logger.enable();
    }

    var startDate = new Date(fromDate);
    var endDate = new Date(toDate);
    var workCal = objWorkCals[workCalId];
    var hrsPerDay = workCal.hoursperday;

    // Compute total days, total work weeks, and remaining days after the last work week
    var totalDays  = (Math.abs(startDate - endDate) / 86400000) + 1;
    var workWeeks  = Math.floor(totalDays / 7);
    var remainDays = totalDays % 7;

    // Compute total working days for the full weeks
    var workDays = new Array();

    if(workCal.sunday == 'T')    workDays.push(0);
    if(workCal.monday == 'T')    workDays.push(1);
    if(workCal.tuesday == 'T')   workDays.push(2);
    if(workCal.wednesday == 'T') workDays.push(3);
    if(workCal.thursday == 'T')  workDays.push(4);
    if(workCal.friday == 'T')    workDays.push(5);
    if(workCal.saturday == 'T')  workDays.push(6);

    var weekWorkDays = workWeeks * workDays.length;
    // Compute total working days for remaining days after last full week
    var remainWorkDays   = 0;
    var startDateIndex   = parseInt(startDate.getDay());

    for(var i = 0, j = startDateIndex; i < remainDays; i++, j = ++j % 7) {
           if(workDays.indexOf(j) != -1) remainWorkDays++;
    }

    // Count excepted days, check each exception date if between (inclusive) of start and end dates
    var exceptions       = workCal.nonWork;
    var exceptDays       = 0;

    for(var i = 0; i < exceptions.length; i++) {
           var exceptiondate = new Date(exceptions[i].exceptiondate);
           if(startDate.getTime() <= exceptiondate.getTime() && exceptiondate.getTime() <= endDate.getTime()){
               exceptDays++;
           }
    }

    // Compute total work days
    var totalWorkDays = weekWorkDays + remainWorkDays - exceptDays;
    logger.debug(MSG_TITLE,
            'resourceid :'      + resourceId                + '\r\n' +
            'startDate : '      + startDate                 + '\r\n' +
            'endDate : '        + endDate                   + '\r\n' +
            'totalDays : '      + totalDays                 + '\r\n' +
            'workWeeks : '      + workWeeks                 + '\r\n' +
            'remainDays : '     + remainDays                + '\r\n' +
            'weekWorkDays : '   + weekWorkDays              + '\r\n' +
            'workDays : '       + workDays.join(', ')       + '\r\n' +
            'startDateIndex : ' + startDateIndex            + '\r\n' +
            'remainWorkDays : ' + remainWorkDays            + '\r\n' +
            'exceptDays : ' +  exceptDays + '\r\n' +
            'totalWorkDays : ' +  totalWorkDays + '\r\n' +
            'totalWorkHours : ' + totalWorkDays * hrsPerDay + '\r\n'
    );

    return totalWorkDays * hrsPerDay;
};

psa_ra.serverlibrary.getTotalAllocatedTimePerResource = function(arrResource, fromDate, toDate){
    var MSG_TITLE   = 'psa_ra.serverlibrary.getTotalAllocatedTimePerResource';
    var logger    = new psa_ra.serverlibrary.logger(MSG_TITLE, false);

    if (isServerLog) {
        logger.enable();
    }

    logger.debug(MSG_TITLE,
            'arrResource: ' + arrResource + '\r\n' +
            'fromDate: '    + fromDate    + '\r\n' +
            'toDate: '      + toDate      + '\r\n'
    );

    var allocatedTimePerResource = {},
        allocatedHours = 0,
        startDate = new Date(fromDate),
        endDate   = new Date(toDate),
        searchFilter = [
            new nlobjSearchFilter('resource', 'resourceallocation', 'anyof', arrResource),
            new nlobjSearchFilter('date', null, 'within', startDate, endDate),
            new nlobjSearchFilter('type', null, 'anyof', 'B')
        ],
        searchColumn = [
            new nlobjSearchColumn('employee').setSort(),
            new nlobjSearchColumn('date'),
            new nlobjSearchColumn('duration'),
            new nlobjSearchColumn('durationdecimal')
        ],
        result = nlapiSearchRecord('timebill', null, searchFilter, searchColumn);

    if(result) {
        var prevId = 0;
        for (var i = 0; i < result.length; i++){
            var id = result[i].getValue('employee');

            if(id != prevId){
                if (i-1 >= 0) {
                    allocatedTimePerResource[prevId] = {
                        allocatedtime : allocatedHours
                    };
                    allocatedHours = 0;
                }
                allocatedHours += parseFloat(result[i].getValue('durationdecimal'));
                prevId = id;
            } else {
                allocatedHours += parseFloat(result[i].getValue('durationdecimal'));
            }

            if(i == result.length - 1){
                allocatedTimePerResource[id] = {
                    allocatedtime : allocatedHours
                };
            }
        }
    }

    return allocatedTimePerResource;
};

psa_ra.serverlibrary.getSkillLevels = function(){
    var search = psa_ra.serverlibrary.getList('customrecord_rss_skill_level', 'name');
    var results = search.getAllResults();
    var skillLevels = {};

    if(results.length > 0){
        for (var i = 0, ii = results.length; i < ii; i++){
            var searchResult = results[i];
            var id = searchResult.getValue('internalid');
            skillLevels[id] = {
                name : searchResult.getValue('name'),
                category : searchResult.getValue('custrecord_rss_skill_level_category'),
                linenumber : searchResult.getValue('custrecord_rss_skill_level_linenumber')
            };
        }
    }
    return skillLevels;
};

psa_ra.serverlibrary.getResume = function(arrResources){
    var searchFilters = [new nlobjSearchFilter('internalid', null, 'anyof', arrResources)],
        searchColumns = [
            new nlobjSearchColumn('internalid'),
            new nlobjSearchColumn('folder', 'file'),
            new nlobjSearchColumn('url', 'file')
        ],
        results   = nlapiSearchRecord('entity', null, searchFilters, searchColumns),
        objResume = new Object();

    if(results){
        for(var i = 0; i < results.length; i++){
            if(results[i].getText('folder', 'file') == 'Resume'){
                var id = results[i].getValue('internalid');
                objResume[id] = {
                    url : results[i].getValue('url', 'file')
                };
            }
        }
    }

    return objResume;
};

psa_ra.serverlibrary.getSkillLevelsBySkills = function(arrSkills){
    var MSG_TITLE   = 'psa_ra.serverlibrary.getSkillLevelsBySkills';
    var logger    = new psa_ra.serverlibrary.logger(MSG_TITLE, false);

    if (isServerLog) {
        logger.enable();
    }

    var searchFilter = [new nlobjSearchFilter('internalid', 'custrecord_rss_skill_category', 'anyof', arrSkills)],
        searchColumn = [
            new nlobjSearchColumn('internalid', 'custrecord_rss_skill_category').setSort(),
            new nlobjSearchColumn('name', 'custrecord_rss_skill_category'),
            new nlobjSearchColumn('internalid', 'custrecord_rss_skill_level_category'),
            new nlobjSearchColumn('name', 'custrecord_rss_skill_level_category'),
            new nlobjSearchColumn('custrecord_rss_skill_level_linenumber', 'custrecord_rss_skill_level_category').setSort()
        ],
        result = nlapiSearchRecord('customrecord_rss_category', null, searchFilter, searchColumn),
        skillLevelsBySkills = new Object();

    if(result){
        var prevId = 0;
        var arrSkillLevels = [];
        var baseSkillSetScore = 0;
        for(var i = 0; i < result.length; i++){
            var id = result[i].getValue('internalid', 'custrecord_rss_skill_category');

            if(id != prevId){
                if (i-1 >= 0) {
                    skillLevelsBySkills[prevId] = {
                        name : name,
                        skilllevels : arrSkillLevels
                    };
                    arrSkillLevels = [];
                    baseSkillSetScore += parseInt(lineNumber);
                }
                prevId = id;
            }

            var name = result[i].getValue('name', 'custrecord_rss_skill_category');
            var skillLevelId = result[i].getValue('internalid', 'custrecord_rss_skill_level_category');
            var skillLevelName = result[i].getValue('name' , 'custrecord_rss_skill_level_category');
            var lineNumber = result[i].getValue('custrecord_rss_skill_level_linenumber', 'custrecord_rss_skill_level_category');

            arrSkillLevels.push({
                skilllevelid   : skillLevelId,
                skilllevelname : skillLevelName,
                linenumber     : lineNumber
            });

            if(i == result.length - 1){
                skillLevelsBySkills[id] = {
                    name : name,
                    skilllevels : arrSkillLevels
                };
                baseSkillSetScore += parseInt(lineNumber);
            }
        }
        skillLevelsBySkills['baseskillsetscore'] = baseSkillSetScore;
    }
    return skillLevelsBySkills;
};

psa_ra.serverlibrary.convertTimeToHHMM = function (num) {
    function pad (num) {
        var s = "00" + num;
        return s.substr(s.length - 2);
    };
    return Math.floor(num) + ':' + pad(Math.round(60 * (num % 1)));
};

psa_ra.serverlibrary.getDecendants = function (recordType, selectedIds) {
    var ids = [];
    if (selectedIds) {
        for (var i = 0; i < selectedIds.length; i++) {
            ids = ids.concat(psa_ra.serverlibrary.getAllDecendants(recordType, selectedIds[i]));
        }

        ids = ids.concat(selectedIds).sort().filter(function(elem, pos, self) {
            return self.indexOf(elem) == pos;
        });
    }

    return ids;
};

psa_ra.serverlibrary.getAllDecendants = function (recordType, parentId) {
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
        for (var i = 0; i < idList.length; i++) {
            var id = idList[i]
            if (id && id > 0) {
                ids = psa_ra.serverlibrary.getAllDecendants(recordType, id);
            }

            if (ids && ids.length > 0) {
                response = response.concat(ids);
            }
        }

        response = response.concat(idList);
    }

    return response;
};

/**
 * Checks if object is empty.
 * @param obj
 * @returns true if obj is empty otherwise false
 */
psa_ra.serverlibrary.isEmptyObject = function (obj){
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
};

psa_ra.serverlibrary.getAllProjectComments = function(projectIds) {
    var filters = [
                new nlobjSearchFilter('internalid', 'entity', 'anyof', projectIds)
            ],
        columns = [
                new nlobjSearchColumn('internalid', 'entity').setSort(),
                new nlobjSearchColumn('notedate').setSort(true),
                new nlobjSearchColumn('note')
            ],
        search  = nlapiCreateSearch('note', filters, columns),
        results = search.runSearch();

    return results;
};

psa_ra.serverlibrary.updateProjectComment = function(projectId, comment) {
    if(projectId){
        var filters = [
            new nlobjSearchFilter('internalid', 'entity', 'is', projectId)
        ];

        var columns = [
            new nlobjSearchColumn('internalid'),
            new nlobjSearchColumn('note'),
            new nlobjSearchColumn('notedate').setSort(true)
        ];

        var userNotes = nlapiSearchRecord('note', null, filters, columns);
        if(userNotes){
            var noteId = userNotes[0].getId();
            nlapiSubmitField('note', noteId, 'note', comment);
        }
        else{
            var rec = nlapiCreateRecord('note');
            rec.setFieldValue('author', nlapiGetUser());
            rec.setFieldValue('note', comment);
            rec.setFieldValue('title', 'Resource Allocation Note');
            rec.setFieldText('notetype', 'Note');
            rec.setFieldValue('entity', projectId); // a Project's internal ID
            nlapiSubmitRecord(rec);
        }
    }
};

psa_ra.serverlibrary.searchFile = function searchFile(fileName) {
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

psa_ra.serverlibrary.searchFolder = function searchFile(folderId) {
    var searchFilter = [
        new nlobjSearchFilter('isinactive', null, 'is', 'F'),
        new nlobjSearchFilter('internalid', null, 'is', folderId)
    ];
    var searchColumn = [
        new nlobjSearchColumn('internalid'),
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('parent'),
        new nlobjSearchColumn('lastmodifieddate').setSort(true)
    ];
    var results = nlapiSearchRecord('folder', null, searchFilter, searchColumn);
    nlapiLogExecution('DEBUG', 'psa_ra.serverlibrary.searchFolder', JSON.stringify(results));
    return results;
};

psa_ra.serverlibrary.getFileHtmlCode = function getFileHtmlCode(fileName, bundleID) {
    var results = psa_ra.serverlibrary.searchFile(fileName);
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
            var bundleFolder = 'Bundle ' + bundleID;
            for ( var i in results) {
                var result = results[i];
                var parentId = result.getValue('folder');
                var parentName = null;
                do {
                    var _result = psa_ra.serverlibrary.searchFolder(parentId);
                    if (_result) {
                        parentName = _result[0].getValue('name');
                        if (parentName == bundleFolder) {
                            fileIdx = i;
                            parentId = '';
                            nlapiLogExecution('DEBUG', 'Duplicate Filename Resolved', 'Found file with correct parent folder "' + bundleFolder + '"');
                        } else {
                            parentId = _result[0].getValue('parent');
                        }
                    } else {
                        parentId = '';
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
            return '<script type="text/javascript" filename="' + fileName + '" src="' + url + '"></script>';
        }
    }
};

psa_ra.serverlibrary.Search = function Search(record, searchId, filters, columns){
    /**
     * constructor
     *  - check that required parameters are present
     *  - store parameters as class data members
     *  - ensure that filters and columns are stored as arrays if with values
     */
    this.record = record;
    this.searchId = searchId;
    this.filters = (filters && !filters.sort) ? [filters] : filters;
    this.columns = (columns && !columns.sort) ? [columns] : columns;
    if (!this.record){
        nlapiLogExecution('error', 'RA_MISSING_PARAM_ERROR', 'Missing parameter (record) in psa_ra.serverlibrary.search');
        throw nlapiCreateError('RA_MISSING_PARAM_ERROR', 'Missing parameter (record) in psa_ra.serverlibrary.search', true);
    }

    /**
     * getResults
     *  - works like normal NS nlapiCreateSearch.getResults
     *
     * @returns {Array} - result objects
     */
    this.getResults = function getResults(start, end) {
        this.startSearchTimer();

        // proceed with search
        var returnData = [],
            results = [];
        if (this.searchId) {
            results = nlapiLoadSearch(null, this.searchId);
            if (this.filters) {
                results.setFilters(results.getFilters().concat(this.filters));
             }
            if (this.columns) {
                results.setColumns(results.getColumns().concat(this.columns));
             }
            returnData = results.runSearch().getResults(start, end);
        } else {
            results = nlapiCreateSearch(this.record, this.filters, this.columns).runSearch();
            if (results) {
                returnData = results.getResults(start, end);
            }
        }

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
    this.getAllResults = function getAllResults(maxLength) {
        this.startSearchTimer();

        // select search method to use
        var returnData = []
        try {

            returnData = this.runResults(maxLength);
            this.stopSearchTimer('Search.getAllResults', returnData.length);
        }
        catch (ex) {
            if (ex && ex.getCode && ex.getDetails) {
                nlapiLogExecution("error", "psa_ra.serverlibrary.search.getAllResults", "ERROR: " + ex.getCode() + "-" + ex.getDetails());
            }
            else {
                nlapiLogExecution("error", "psa_ra.serverlibrary.search.getAllResults", "ERROR: " + ex);
            }

            throw nlapiCreateError('RA_SEARCH_ERROR', 'Error in psa_ra.serverlibrary.search.getAllResults for record ' + this.record, true);
        }

        return returnData;
    };

    /**
     * Run Search Results
     *  - use default (no optimization) search when getting all results
     *
     * @param {Integer} - maxLength - limit of search results
     * @returns {Array} - result objects
     */
    this.runResults = function runResults(maxLength) {
        var returnData = [],
            searchResults = null;

        if (this.searchId) {
            searchResults = nlapiLoadSearch(null, this.searchId);
            if (this.filters) {
                searchResults.setFilters(searchResults.getFilters().concat(this.filters));
            }
            if (this.columns) {
                searchResults.setColumns(searchResults.getColumns().concat(this.columns));
            }
        } else {
            searchResults = nlapiCreateSearch(this.record, this.filters, this.columns);
        }

        // check if limit is reached
        var context = nlapiGetContext();
        var minGovernance = 100;
        var resultSet = searchResults.runSearch();

        var searchResult = ['override'];
        var start = 0,end = start + 1000;
        while (searchResult.length > 0) {
            searchResult = resultSet.getResults(start, end);

            for (var i = 0; i < searchResult.length; i++) {
                if(maxLength && returnData.length >= maxLength) {
                    nlapiLogExecution('AUDIT', 'getAllResults', 'Result length reached at max length ' + maxLength);
                    return returnData;
                }
                else {
                    returnData.push(searchResult[i]);
                }
            }

            start = end;
            end = start + 1000;

            if (context.getRemainingUsage() < minGovernance) {
                nlapiLogExecution('AUDIT', 'getAllResults', 'Governance Limit reached.');
                break;
            }
        }
        nlapiLogExecution('DEBUG', 'LENGTH END', returnData.length);
        return returnData;
    }

    /**
     * sortResults
     *  - sort the results based on the saved column sort states
     *
     * @param results {Array}
     */
    this.sortResults = function sortResults(results){
        nlapiLogExecution('DEBUG', 'sortResults', 'sortResults')
        if (results && results.length > 0){
            var sortBy = this.buildSortArray();
            var sortFunction = this.buildSortFunction(sortBy);
            if (sortFunction){
                results.sort(sortFunction);
            }
        }
    };

    /**
     * buildSortArray
     *  - build sorting array by priority
     *
     * @returns {Array} - objects containing sort details (name, join, order)
     */
    this.buildSortArray = function buildSortArray(){
        var sortBy = [];
        for (var i = 0, ii = this.columns.length; i < ii; i++){
            var column = this.columns[i];
            var sorting = column.getSort();
            if (sorting){
                sortBy.push({
                    name    : column.getName(),
                    join    : column.getJoin(),
                    order   : sorting   //can be 'ASC' or 'DESC'
                })
            }
        }
        return sortBy;
    };

    /**
     * buildSortFunction
     *  - build sort function to be used by the array of results
     *
     * @returns {Object} - sort function to be used by result data array
     */
    this.buildSortFunction = function buildSortFunction(sortBy){
        var sortFunction = null;
        if (sortBy.length > 0){
            sortFunction = function(resultA, resultB){
                var comparisonValues = [];
                for (var i = 0, ii = sortBy.length; i < ii; i++){
                    var valueA = resultA.getValue(sortBy[i].name, sortBy[i].join);
                    var valueB = resultB.getValue(sortBy[i].name, sortBy[i].join);
                    comparisonValues.push([valueA, valueB]);
                }
                for (var i = 0, ii = comparisonValues.length; i < ii; i++){
                    var origA = comparisonValues[i][0];
                    var origB = comparisonValues[i][1];
                    var valueA = origA.toLowerCase();
                    var valueB = origB.toLowerCase();
                    if (sortBy[i].order == 'ASC'){
                        if (valueA == valueB) return origA < origB;
                        if (valueA > valueB) return 1;
                        if (valueA < valueB) return -1;
                    }
                    else if (sortBy[i].order == 'DESC'){
                        if (valueA == valueB) return origA > origB;
                        if (valueA < valueB) return 1;
                        if (valueA > valueB) return -1;
                    }
                }
                return 0;
            };
        }
        return sortFunction;
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
        nlapiLogExecution("debug", title, "Search time for " + title + " (" + dataLength + ") of " +  this.record + " is " + runTime + "ms");
    }

};

//Removes the {id} part when entity value has a pattern of "{id} ParentName1 : {id} ParentName2 : EntityName"
psa_ra.serverlibrary.parseEntityId = function(entityId) {
    if (!entityId) {
        return null;
    }

    var strColon = ' : ';
    var arrRet = [];
    var arrEntityId = entityId.split(strColon).reverse();
    var temp = null;

    while(arrEntityId.length) {
        temp = arrEntityId.pop();
        if (!arrEntityId.length) {
            arrRet.push(temp);
        }
        else {
            //Remove {id} for parent elements
            arrRet.push(temp.replace(/^\d+\s/, ""));
        }

    }
    return arrRet.join(strColon);
}