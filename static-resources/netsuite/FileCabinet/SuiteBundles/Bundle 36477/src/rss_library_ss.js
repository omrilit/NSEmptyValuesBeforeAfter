/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 2.00     11 Mar 2013       pbtan            Added functions for ue_main (c/o pmiller) and skillform_ue
 * 3.00     26 Mar 2013       pbtan            Added filter for inactives in Skill Category search, removed extra white spaces
 * 4.00     02 Apr 2013       pbtan            Updated category id filter operator, added loggers.
 * 5.00     03 Apr 2013       pbtan            Reverted the filter operator - caused a showstopper.
 * 6.00     03 Apr 2013       pbtan            Made input of Skill unique
 * 7.00     04 Apr 2013       pbtan            Removed instances of weight. refactored getSkillsByCategory and getLevelsByCategory to getChildrenByCategory.
 * 8.00     30 Apr 2013       rwong            Change resume to portfolio.
 * 9.00     03 May 2013       rwong            Added project tab functionality.
 * 10.00    15 May 2013       pbtan            Added handling for Vendor implementation
 * 11.00    27 May 2013       pbtan            Moved main function for Resource Form to here.
 * 12.00    28 May 2013       pbtan            Fixed error with toLowerCase
 * 13.00    28 May 2013       pbtan            Fixed error with Editing and Editing as Resource Manager role.
 * 14.00    01 Jun 2013       pbtan            Added refresh button on the Portfolio sublist.
 * 15.00    04 Jun 2013       pbtan            Added checking for billingclass/subsidiary feature
 * 16.00    05 Jun 2013       pbtan            Moved website/linked in fields to here to reflect in both standard emp/vendor form and sl_resource_form
 * 17.00    21 Oct 2013       rwong            Updated code to support a separate view for My Skill Set and Resource Skills page.
 * 18.00    30 Apr 2014       pbtan            Added implem of translations
 * 19.00    05 May 2014       pbtan            Added implem of translations
 *                                             Fixed resource type to use the record's entity type.
 * 20.00    06 May 2014       pbtan            removed reference to type in employee form
 * 21.00    27 May 2014       pbtan            returned reference to type in employee form
 * 22.00    24 Jun 2014       pbtan            refactored code. combined employee skills form with resources skill form
 *                                             removed individual logger
 * 23.00    30 Jun 2014       pbtan            moved up the checking for isSelf from employee form
 *                                             rearranged code for readability and logical grouping
 *                                             removed excess loggers.
 *                                             todo... set value for genericresource.
 *
 */

//var onServerLog = true;
var onServerLog = false;

var psa_rss;
if (!psa_rss) {
	psa_rss = {};
}
if (!psa_rss.serverlibrary) {
	psa_rss.serverlibrary = {};
}

psa_rss.serverlibrary.isValidObject = function (objectToTest) {
	var isValidObject = false;
	isValidObject = (objectToTest != null && objectToTest != '' && objectToTest != undefined) ? true : false;
	return isValidObject;
};

/**
 * Trim leading and lagging white spaces.
 */
psa_rss.serverlibrary.trim = function (stringToTrim) {
	stringToTrim += '';
	if (onServerLog) {
		nlapiLogExecution('DEBUG', 'trim : ', 'stringToTrim: \n' + stringToTrim);
	}

	if (stringToTrim != null && stringToTrim != undefined && stringToTrim != '') {
		return stringToTrim.replace(/^\s+|\s+$/g, "");
	} else {
		return '' + stringToTrim;
	}
}; // end psa_rss.serverlibrary.trim

/**
 * Logging utility.
 */
psa_rss.serverlibrary.logger = function (logTitle, isClientside, isEnabled) {
	// Logger Constants
	var startLogMessage = '=====Start=====';
	var endLogMessage = '======End======';
	var setStartLogMessage = function (newStartLogMessage) {
		startLogMessage = newStartLogMessage;
	};
	var setEndLogMessage = function (newEndtLogMessage) {
		endLogMessage = newEndLogMessage;
	};

	this.getStartLogMessage = function () {
		return startLogMessage;
	};
	this.getEndLogMessage = function () {
		return endLogMessage;
	};

	// logTitle manipulation
	var logTitle = logTitle;
	this.setLogTitle = function (newLogTitle) {
		logTitle = newLogTitle;
	};
	this.getLogTitle = function () {
		return logTitle;
	};

	// Determines whether to print a log or display an alert message
	var isClientside = (!isClientside) ? false : isClientside;
	var isForceClientside = false;

	this.forceClientside = function () {
		isForceClientside = true;
	};          // Force Client Side logging via alerts
	this.unforceClientside = function () {
		isForceClientside = false;
	};          // Unforce Client Side logging via alerts

	// Defines the logLevel similar to that of log4j
	var ALL = 0; // The ALL has the lowest possible rank and is intended to turn on all logging.
	var AUDIT = 1; // The AUDIT Level designates finer-grained informational events than the DEBUG
	var DEBUG = 2; // The DEBUG Level designates fine-grained informational events that are most useful to debug an application.
	var ERROR = 3; // The ERROR level designates error events that might still allow the application to continue running.
	var EMERGENCY = 4; // The EMERGENCY level designates very severe error events that will presumably lead the application to abort.
	var OFF = 5; // The OFF has the highest possible rank and is intended to turn off logging.

	var LOG_LEVELS = new Array('ALL', 'AUDIT', 'DEBUG', 'ERROR', 'EMERGENCY', 'OFF');
	var logLevel = OFF; // current log level - default is OFF

	// Convenience method to set log level to ALL, AUDIT, DEBUG, ERROR, EMERGENCY and OFF
	this.setLogLevelToAll = function () {
		logLevel = ALL;
	};
	this.setLogLevelToAudit = function () {
		logLevel = AUDIT;
	};
	this.setLogLevelToDebug = function () {
		logLevel = DEBUG;
	};
	this.setLogLevelToError = function () {
		logLevel = ERROR;
	};
	this.setLogLevelToEmergency = function () {
		logLevel = EMERGENCY;
	};
	this.setLogLevelToOff = function () {
		logLevel = OFF;
	};

	this.enable = function () {
		this.setLogLevelToAll();
	};                     // Enable the logging mechanism
	this.disable = function () {
		this.setLogLevelToOff();
	};                     // Disable the logging mechanism
	if (!isEnabled) {
		this.disable();
	} else {
		if (isEnabled == true) this.enable();
	}

	// Facility for pretty-fying the output of the logging mechanism
	var TAB = '\t';                                                 // Tabs
	var SPC = ' ';                                                  // Space
	var indentCharacter = SPC;                                                  // character to be used for indents:
	var indentations = 0;                                                    // number of indents to be padded to message

	this.indent = function () {
		indentations++;
	};
	this.unindent = function () {
		indentations--;
	};

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
	this.validateParamsThenLog = function (logType, newLogTitle, logMessage) {
		if (!logType) logType = EMERGENCY;                                      // default logType to EMERGENCY - minimal log messages
		if (logLevel > logType) return;                                         // current logLevel does not accomodate logType

		if (newLogTitle && !logMessage) {                                       // If newLogTitle exist and logMessage is undefined,
			logMessage = newLogTitle;                                          // then the newLogTitle should be displayed as the logMessage
			newLogTitle = null;
		}

		if (!newLogTitle) newLogTitle = logTitle;
		this.log(logType, newLogTitle, logMessage);
	};

	// Convenience method to log a AUDIT, DEBUG, INFO, WARN, ERROR and EMERGENCY messages
	this.audit = function (newLogTitle, logMessage) {
		this.validateParamsThenLog(AUDIT, newLogTitle, logMessage);
	};
	this.debug = function (newLogTitle, logMessage) {
		this.validateParamsThenLog(DEBUG, newLogTitle, logMessage);
	};
	this.error = function (newLogTitle, logMessage) {
		this.validateParamsThenLog(ERROR, newLogTitle, logMessage);
	};
	this.emergency = function (newLogTitle, logMessage) {
		this.validateParamsThenLog(EMERGENCY, newLogTitle, logMessage);
	};
}; // end psa_rss.serverlibrary.logger

psa_rss.serverlibrary.getChildrenByCategory = function (categoryId, isSkillLevel) {
	var skilllevel = '';

	if (isSkillLevel) {
		skilllevel = '_level';
	}

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_rss_skill' + skilllevel + '_category', null, 'anyof', categoryId);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('name');
	columns[2] = new nlobjSearchColumn('custrecord_rss_skill' + skilllevel + '_linenumber');
	columns[2].setSort(); // empty/false - ascending; true - descending
	return nlapiSearchRecord('customrecord_rss_skill' + skilllevel, null, filters, columns);
};

psa_rss.serverlibrary.getAllCategories = function (excludeInactives) {
	var filter = null;

	if (excludeInactives) {
		filter = new nlobjSearchFilter('isinactive', null, 'is', 'F');
	}

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('name');

	return nlapiSearchRecord('customrecord_rss_category', null, filter, columns);
};

psa_rss.serverlibrary.getSkillsetsByCategoryAndResource = function (categoryId, resourceId) {
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_rss_skill_category', 'custrecord_rss_skillset_skill', 'anyof', categoryId);
	filters[1] = new nlobjSearchFilter('internalid', 'custrecord_rss_skillset_resource', 'anyof', resourceId);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_rss_skillset_resource');
	columns[2] = new nlobjSearchColumn('custrecord_rss_skillset_skill');
	columns[3] = new nlobjSearchColumn('custrecord_rss_skillset_level');
	return nlapiSearchRecord('customrecord_rss_skillset', null, filters, columns);
};

psa_rss.serverlibrary.createSkillSublists = function (form, mode, resourceId, prevSkillsetIds) {
	var MSG_TITLE = 'createSkillSublists';
	var logger = new psa_rss.serverlibrary.logger(MSG_TITLE, false);

	var categories = psa_rss.serverlibrary.getAllCategories(true);
	if (categories) {

		// For each Skill Category
		for (var i = 0; i < categories.length; i++) {

			var categoryId = categories[i].id;
			var categoryName = categories[i].getValue('name');

			// Create a subtab & sublist
			form.addSubTab('custpage_rss_subtab_' + i, categoryName, 'custpage_skills_tab');
			var sublist = form.addSubList('custpage_rss_sublist_' + i, mode == 'Edit' ? 'inlineeditor' : 'staticlist', categoryName, 'custpage_rss_subtab_' + i);

			// Add hidden fields
			sublist.addField('rss_id_' + i, 'integer', 'Id').setDisplayType('hidden');
			sublist.addField('rss_resource_' + i, 'integer', TranslationManager.getString('COLUMN.RESOURCE')).setDisplayType('hidden');

			// Add dropdown fields
			var skillSelect = sublist.addField('rss_skill_' + i, mode == 'Edit' ? 'select' : 'text', TranslationManager.getString('COLUMN.SKILL')).setMandatory(true);
			var levelSelect = sublist.addField('rss_level_' + i, mode == 'Edit' ? 'select' : 'text', TranslationManager.getString('COLUMN.LEVEL')).setMandatory(true);

			if (mode == 'Edit') {

				sublist.setUniqueField('rss_skill_' + i);

				// Add dropdown options for Skills, by Skill Category
				var skillsList = psa_rss.serverlibrary.getChildrenByCategory(categoryId);
				skillSelect.addSelectOption('', '');
				if (skillsList) {
					for (var j = 0; j < skillsList.length; j++) {
						skillSelect.addSelectOption(skillsList[j].getValue('internalid'), skillsList[j].getValue('name'), false);
					}
				}

				// Add dropdown options for Skill Levels, by Skill Category
				var levelsList = psa_rss.serverlibrary.getChildrenByCategory(categoryId, true);
				levelSelect.addSelectOption('', '');
				if (levelsList) {
					for (var j = 0; j < levelsList.length; j++) {
						levelSelect.addSelectOption(levelsList[j].getValue('internalid'), levelsList[j].getValue('name'), false);
					}
				}
			}

			// Populate the sublist if resourceId is not null
			var skillsets = resourceId ? psa_rss.serverlibrary.getSkillsetsByCategoryAndResource(categoryId, resourceId) : null;
			if (skillsets) {

				for (var j = 0; j < skillsets.length; j++) {

					// Insert values
					sublist.setLineItemValue('rss_id_' + i, j + 1, skillsets[j].getValue('internalid'));
					sublist.setLineItemValue('rss_skill_' + i, j + 1, mode == 'Edit' ? skillsets[j].getValue('custrecord_rss_skillset_skill') : skillsets[j].getText('custrecord_rss_skillset_skill'));
					sublist.setLineItemValue('rss_level_' + i, j + 1, mode == 'Edit' ? skillsets[j].getValue('custrecord_rss_skillset_level') : skillsets[j].getText('custrecord_rss_skillset_level'));

					// Add Skill Set ID to custpage_rss_prev_skillset_ids (hidden field)
					prevSkillsetIds.push(skillsets[j].getValue('internalid'));
				}
			}
		}
	}
};

psa_rss.serverlibrary.initPortfolioSubTab = function (form, recordId, recordType) {
	MSG_TITLE = 'initportfolioSubTab';

	logger.debug(MSG_TITLE,
		'START : \n' +
		'nlapiGetContext().getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n' +
		'******************\r\n' +
		'recordId    : ' + recordId + '\r\n' +
		'recordType  : ' + recordType + '\r\n');

	function getPortfolioFolderIds(recordType, recordId) {
		var portfolioTypes = nlapiSearchRecord('customlist_rss_portfolio_type', null, null, new nlobjSearchColumn('name', null, null));
		var types = {};
		for (var i in portfolioTypes) {
			types[portfolioTypes[i].getValue('name')] = true;
		}

		var predecessorIdQuery = nlapiSearchRecord(
			'folder',
			null,
			new nlobjSearchFilter('name', null, 'is', recordType + '_' + recordId),
			new nlobjSearchColumn('internalid', null, null)
		);

		if (!predecessorIdQuery) {
			return null;
		}

		var predecessorId = predecessorIdQuery[0].getValue('internalid');

		var folderIdsQuery = nlapiSearchRecord(
			'folder',
			null,
			[
				new nlobjSearchFilter('predecessor', null, 'is', predecessorId),
				new nlobjSearchFilter('internalid', null, 'noneof', predecessorId)
			],
			[
				new nlobjSearchColumn('name', null, null),
				new nlobjSearchColumn('internalid', null, null),
			]
		)

		var folderIds = [];
		for (var j in folderIdsQuery) {
			if (types[folderIdsQuery[j].getValue('name')]) {
				folderIds.push(folderIdsQuery[j].getValue('internalid'));
			}
		}

		return folderIds;
	}

	var portfolioSubTab = form.addSubTab('custpage_skills_portfolio', TranslationManager.getString('TAB.PORTFOLIO'), 'custpage_skills_tab');
	var portfolioSubList = form.addSubList('custpage_portfolio_sublist', 'staticlist', TranslationManager.getString('TAB.PORTFOLIO'), 'custpage_skills_portfolio');

	form.addField('custpage_rss_linkedin', 'url', 'LinkedIn', null, 'custpage_skills_portfolio')
		.setDisplayType('normal')
		.setDefaultValue(nlapiGetFieldValue('custentity_rss_linkedin'));
	form.addField('custpage_rss_website', 'url', TranslationManager.getString('FIELD.WEBSITE'), null, 'custpage_skills_portfolio')
		.setDisplayType('normal')
		.setDefaultValue(nlapiGetFieldValue('custentity_rss_website'));

	portfolioSubList.addButton("custpage_upload_btn", TranslationManager.getString('BUTTON.UPLOAD'), "upload(" + recordId + ", '" + recordType + "')");
	portfolioSubList.addRefreshButton();
	portfolioSubList.addField('name', 'text', TranslationManager.getString('COLUMN.NAME'), null);
	portfolioSubList.addField('type', 'text', TranslationManager.getString('COLUMN.TYPE'), null);
	portfolioSubList.addField('created', 'text', TranslationManager.getString('COLUMN.CREATED'), null);
	portfolioSubList.addField('modified', 'text', TranslationManager.getString('COLUMN.MODIFIED'), null);
	portfolioSubList.addField('download', 'url', TranslationManager.getString('COLUMN.DOWNLOAD'), null).setLinkText(TranslationManager.getString('COLUMN.DOWNLOAD'));
	portfolioSubList.addField('remove', 'url', TranslationManager.getString('COLUMN.REMOVE'), null).setLinkText(TranslationManager.getString('COLUMN.REMOVE'));

	if (!recordId) {
		return null;
	}

	var filterExpression = [];

	filterExpression.push(['internalid', 'anyof', recordId]);
	var portfolioFolderIds = getPortfolioFolderIds(recordType, recordId);

	if (portfolioFolderIds) {
		filterExpression.push('and');
		filterExpression.push(['file.folder', 'anyof', portfolioFolderIds]);
	} else {
		return null;
	}

	var searchColumn = [];
	searchColumn.push(new nlobjSearchColumn('internalid', 'file', null));
	searchColumn.push(new nlobjSearchColumn('created', 'file', null));
	searchColumn.push(new nlobjSearchColumn('description', 'file', null));
	searchColumn.push(new nlobjSearchColumn('folder', 'file', null));
	searchColumn.push(new nlobjSearchColumn('modified', 'file', null));
	searchColumn.push(new nlobjSearchColumn('name', 'file', null));
	searchColumn.push(new nlobjSearchColumn('owner', 'file', null));
	searchColumn.push(new nlobjSearchColumn('documentsize', 'file', null));
	searchColumn.push(new nlobjSearchColumn('filetype', 'file', null));
	searchColumn.push(new nlobjSearchColumn('url', 'file', null));

	// search employee record & populate portfolio sublist
	var portfoliodata = nlapiSearchRecord(recordType, null, filterExpression, searchColumn);
	if (portfoliodata) {
		for (var i = 0; i < portfoliodata.length; i++) {
			var url = nlapiResolveURL("SUITELET", "customscript_rss_sl_cvdelete", "customdeploy_rss_sl_cvdelete");
			url += "&entity=" + nlapiGetRecordId();
			url += "&fileid=" + portfoliodata[i].getValue('internalid', 'file');
			url += "&filename=" + encodeURIComponent(portfoliodata[i].getValue('name', 'file'));

			logger.debug(MSG_TITLE, 'url = ' + url);

			if (psa_rss.serverlibrary.isValidObject(portfoliodata[i].getValue('name', 'file'))) {
				portfolioSubList.setLineItemValue('name', i + 1, portfoliodata[i].getValue('name', 'file'));
				portfolioSubList.setLineItemValue('type', i + 1, portfoliodata[i].getText('folder', 'file'));
				portfolioSubList.setLineItemValue('created', i + 1, portfoliodata[i].getValue('created', 'file'));
				portfolioSubList.setLineItemValue('modified', i + 1, portfoliodata[i].getValue('modified', 'file'));
				portfolioSubList.setLineItemValue('download', i + 1, portfoliodata[i].getValue('url', 'file'));
				portfolioSubList.setLineItemValue('remove', i + 1, url);
			}
		}
	}
};

psa_rss.serverlibrary.initProjectSubTab = function (form, recordId) {
	MSG_TITLE = 'initProjectSubtab';
	var logger = new psa_rss.serverlibrary.logger(MSG_TITLE, false);
	logger.debug(MSG_TITLE,
		'START : \n' +
		'nlapiGetContext().getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n' +
		'******************\r\n' +
		'recordId    : ' + recordId + '\r\n');

	var PROJECT_LIST_MAX_LENGTH = 25;

	var projectSubTab = form.addSubTab('custpage_skills_project', TranslationManager.getString('TAB.PROJECT'), 'custpage_skills_tab');
	var projectSubList = form.addSubList('custpage_project_sublist', 'staticlist', TranslationManager.getString('TAB.PROJECT'), 'custpage_skills_project');

	projectSubList.addField('customerproject', 'text', TranslationManager.getString('COLUMN.CUSTOMER_PROJECT'), null);
	projectSubList.addField('projectrole', 'text', TranslationManager.getString('COLUMN.ROLE'), null);
	projectSubList.addField('projectmanager', 'text', TranslationManager.getString('COLUMN.PROJECT_MANAGER'), null);
	projectSubList.addField('projectmanageremail', 'text', TranslationManager.getString('COLUMN.PROJECT_MANAGER_EMAIL'), null);

	var searchFilter = new Array();
	searchFilter.push(new nlobjSearchFilter('jobresource', null, 'anyof', recordId));

	var searchColumn = new Array();
	searchColumn.push(new nlobjSearchColumn('internalid', null, null));
	searchColumn.push(new nlobjSearchColumn('companyname', null, null));
	searchColumn.push(new nlobjSearchColumn('jobresourcerole', null, null));

	// search project record & populate project sublist if recordId is not null
	var projectdata = recordId ? nlapiSearchRecord('job', null, searchFilter, searchColumn) : null;
	if (projectdata) {
		for (var i = 0; i < Math.min(projectdata.length, PROJECT_LIST_MAX_LENGTH); i++) {
			if (psa_rss.serverlibrary.isValidObject(projectdata[i].getValue('companyname', null))) {
				projectSubList.setLineItemValue('customerproject', i + 1, projectdata[i].getValue('companyname', null));
				projectSubList.setLineItemValue('projectrole', i + 1, projectdata[i].getText('jobresourcerole', null));

				var searchManagerFilter = new Array();
				searchManagerFilter.push(new nlobjSearchFilter('internalidnumber', null, 'equalto', projectdata[i].getValue('internalid', null)));
				searchManagerFilter.push(new nlobjSearchFilter('jobresourcerole', null, 'anyof', -2));

				var searchManagerColumn = new Array();
				searchManagerColumn.push(new nlobjSearchColumn('jobresource', null, null));

				var projectmanagerdata = projectdata[i].getValue('internalid', null) ? nlapiSearchRecord('job', null, searchManagerFilter, searchManagerColumn) : null;
				if (projectmanagerdata) {
					for (var j = 0; j < projectmanagerdata.length; j++) {
						if (psa_rss.serverlibrary.isValidObject(projectmanagerdata[j].getValue('jobresource', null))) {
							projectSubList.setLineItemValue('projectmanager', i + 1, projectmanagerdata[j].getText('jobresource', null));
							projectSubList.setLineItemValue('projectmanageremail', i + 1, nlapiLookupField('entity', projectmanagerdata[j].getValue('jobresource', null), 'email', false));
						}
					}
				}

			}
		}
	}

	if (projectdata && projectdata.length > PROJECT_LIST_MAX_LENGTH) {
		var url = '/app/accounting/project/projects.nl?searchtype=Job&Job_JOBRESOURCE=' + recordId;
		var linkhtml = TranslationManager.getString('MESSAGE.TOO_MANY_PROJECTS.HEAD')
					   + ' <a href=' + url + '>'
					   + TranslationManager.getString('MESSAGE.TOO_MANY_PROJECTS.LINK')
					   + '</a>.';
		form.addField('custpage_rss_projects_search', 'inlinehtml', null, null, 'custpage_skills_project')
			.setDisplayType('inline')
			.setDefaultValue(linkhtml);
	}
};

psa_rss.serverlibrary.resourceSkillSetForm = function (request, response) {
	var context = nlapiGetContext();
	var environment = context.getEnvironment();
	var fSubsidiary = context.getFeature('subsidiaries');
	var resourceId = request.getParameter('custpage_resourceid') ? request.getParameter('custpage_resourceid') : context.getUser();
	var isSelf = resourceId == context.getUser();

	var searchFilters = [new nlobjSearchFilter('internalid', null, 'is', resourceId)];
	var searchColumns = [new nlobjSearchColumn('type'), new nlobjSearchColumn('laborcost', 'genericresource'), new nlobjSearchColumn('billingclass', 'genericresource')];

	if (fSubsidiary) {
		searchColumns.push(new nlobjSearchColumn('subsidiary', 'genericresource'));
	}
	;

	var result = nlapiSearchRecord('projectresource', null, searchFilters, searchColumns);

	var mode = request.getParameter('custpage_mode');                // View/Edit/submit
	var yearsOfExp = request.getParameter('custpage_rss_yoe');             // Submitted Years Of Experience
	var linkedin = request.getParameter('custpage_rss_linkedin');
	var website = request.getParameter('custpage_rss_website');
	var skillsets = JSON.parse(request.getParameter('custpage_rss_skillsets'));           // Array of Skill Sets for saving, of the form {id:skillsetId, skill:skillId, level:levelId}
	var prevSkillsetIds = JSON.parse(request.getParameter('custpage_rss_prev_skillset_ids'));   // Array of "original" Skill Set IDs, used during deletion

	var scriptId = 'customscript_rss_sl_resource_form';
	var deploymentId = 'customdeploy_rss_sl_resource_form';

	var resourceType = isSelf ? result[0].getValue('type') : request.getParameter('custpage_type');
	var resType = result[0].getText('type');

	var type = resourceType == 'GenericRsrc' ? 'genericresource' : resourceType.toLowerCase();

	logger.debug(MSG_TITLE,
		'START : \n' +
		'nlapiGetContext().getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n' +
		'******************\r\n' +
		'resourceId  : ' + resourceId + '\r\n' +
		'resourceType: ' + resourceType + '\r\n' +
		'isSelf      : ' + isSelf + '\r\n' +
		'environment : ' + environment + '\r\n' +
		'method      : ' + request.getMethod() + '\r\n' +
		'mode        : ' + mode + '\r\n' +
		'yearsOfExp  : ' + yearsOfExp + '\r\n' +
		'skillsets   : ' + skillsets + '\r\n' +
		'prevSkillIds: ' + prevSkillsetIds + '\r\n'
	);

	if (request.getMethod() == 'GET' && mode !== 'Submit') {
		logger.debug('GET', 'View and/or Edit');

		var prevSkillsetIds = new Array();                        // Used to set value for custpage_rss_prev_skillset_ids (hidden field)
		var resource = nlapiLoadRecord(type, resourceId);  // Employee Record corresponding to this resourceId

		// Create form & add fields
		var formTitle = isSelf ? TranslationManager.getString('WINDOW.MY_SKILLSET') : TranslationManager.getString('WINDOW.RESOURCE_SKILLS');

		var form = nlapiCreateForm(formTitle);

		var fields = {};
		fields['name'] = form.addField('custpage_name', 'text', TranslationManager.getString('COLUMN.NAME')).setDisplayType('inline');                                                  // Employee Name, i.e. Charles Xavier
		fields['mode'] = form.addField('custpage_mode', 'text', 'Mode').setDisplayType('hidden');
		fields['resourceId'] = form.addField('custpage_resourceid', 'text', 'Resource ID').setDisplayType('hidden');
		fields['type'] = form.addField('custpage_type', 'text', 'Entity Type').setDisplayType('hidden');
		if (!isSelf) {
			fields['laborcost'] = form.addField('custpage_laborcost', 'text', TranslationManager.getString('COLUMN.LABOR_COST')).setDisplayType('inline');
			fields['displayType'] = form.addField('custpage_display_type', 'text', TranslationManager.getString('FIELD.RESOURCE_TYPE')).setDisplayType('inline');
		}
		if (type !== 'genericresource') {
			fields['yearsOfExp'] = form.addField('custpage_rss_yoe', 'float', TranslationManager.getString('COLUMN.YOE')).setDisplayType(!mode || mode == 'View' ? 'inline' : 'normal');  // Years Of Experience
			fields['prevSkillsetIds'] = form.addField('custpage_rss_prev_skillset_ids', 'longtext', 'PreviousSkillset IDs').setDisplayType('hidden');                 // Array of Skill Set IDs on load (used for deletion)
			fields['skillsets'] = form.addField('custpage_rss_skillsets', 'text', 'Sublists Values').setDisplayType('hidden');                              // Array of Skill Sets (used for saving)
		}

		if (!isSelf) {
			var fBillingClass = context.getFeature('billingclasses');
			if (fBillingClass) {
				fields['billingclass'] = form.addField('custpage_billingclass', 'text', TranslationManager.getString('COLUMN.BILLING_CLASS')).setDisplayType('inline');
				fields.billingclass.setDefaultValue(resource.getFieldText('billingclass'));
			}
		}

		if (fSubsidiary) {
			fields['subsidiary'] = form.addField('custpage_subsidiary', 'text', TranslationManager.getString('COLUMN.SUBSIDIARY')).setDisplayType('inline');
			fields.subsidiary.setDefaultValue(resource.getFieldText('subsidiary'));
		}

		// Populate form fields w/values
		if (!isSelf) {
			fields.resourceId.setDefaultValue(resourceId);
			if (fields.displayType) fields.displayType.setDefaultValue(resType);
			if (fields.laborcost) fields.laborcost.setDefaultValue(resource.getFieldValue('laborcost'));
		}
		fields.type.setDefaultValue(resourceType);
		fields.name.setDefaultValue(resource.getFieldValue('entityid'));
		if (type !== 'genericresource') {
			fields.yearsOfExp.setDisplaySize(10);
			fields.yearsOfExp.setDefaultValue(resource.getFieldValue('custentity_rss_yoe'));
		}

		// Add buttons
		if (mode == 'Edit') {
			fields.mode.setDefaultValue('Submit');
			form.addSubmitButton(TranslationManager.getString('BUTTON.SUBMIT'));
			form.addButton('custpage_button_cancel', TranslationManager.getString('BUTTON.CANCEL'), 'window.history.back()');
		} else {
			fields.mode.setDefaultValue('Edit');
			form.addSubmitButton(TranslationManager.getString('BUTTON.EDIT'));
			form.addButton('custpage_button_back', TranslationManager.getString('BUTTON.BACK'), 'window.history.back()');
		}

		if (type == 'employee') {
			psa_rss.serverlibrary.createEducSublist(form, resource);
		}

		// Add Skill Category subtabs & sublists
		psa_rss.serverlibrary.createSkillSublists(form, mode, resourceId, prevSkillsetIds);

		if (type !== 'genericresource') {
			fields.prevSkillsetIds.setDefaultValue(JSON.stringify(prevSkillsetIds));
		}

		// Add Project subtab
		psa_rss.serverlibrary.initProjectSubTab(form, resourceId);

		// Add Portfolio subtab
		if (type !== 'genericresource') {
			psa_rss.serverlibrary.initPortfolioSubTab(form, resourceId, type);
			fields['linkedin'] = form.getField('custpage_rss_linkedin').setDisplayType(!mode || mode == 'View' ? 'inline' : 'normal');
			fields['website'] = form.getField('custpage_rss_website').setDisplayType(!mode || mode == 'View' ? 'inline' : 'normal');
			fields.linkedin.setDefaultValue(resource.getFieldValue('custentity_rss_linkedin'));
			fields.website.setDefaultValue(resource.getFieldValue('custentity_rss_website'));
		}

		// Import client script
		form.setScript('customscript_rss_cs_employee_form');

		// Write the form
		response.writePage(form);
	} else if (mode == 'Submit') {
		logger.debug('POST', 'Save record');
		var newSkillsetIds = new Array(); // Array of "remaining" Skill Set IDs, used during deletion

		// Save form fields
		if (psa_rss.serverlibrary.isValidObject(yearsOfExp)) {
			nlapiSubmitField(type, resourceId, 'custentity_rss_yoe', yearsOfExp);
		}

		if (psa_rss.serverlibrary.isValidObject(linkedin)) {
			nlapiSubmitField(type, resourceId, 'custentity_rss_linkedin', linkedin);
		}

		if (psa_rss.serverlibrary.isValidObject(website)) {
			nlapiSubmitField(type, resourceId, 'custentity_rss_website', website);
		}

		// Save Skill Sets
		for (var i = 0; i < skillsets.length; i++) {
			// Retrieve data
			var skillset = skillsets[i];
			logger.debug('SAVE RECORD', skillset.id + ':' + skillset.skill + ':' + skillset.level);

			// Create or update Skill Set record depending on ID value
			var skillsetRecord = skillset.id == '' ? nlapiCreateRecord('customrecord_rss_skillset') : nlapiLoadRecord('customrecord_rss_skillset', skillset.id);
			skillsetRecord.setFieldValue('custrecord_rss_skillset_resource', resourceId);
			skillsetRecord.setFieldValue('custrecord_rss_skillset_skill', skillset.skill);
			skillsetRecord.setFieldValue('custrecord_rss_skillset_level', skillset.level);
			nlapiSubmitRecord(skillsetRecord, true);

			// Add Skill Set ID to newSkillsetIds
			if (skillset.id && skillset.id != '') newSkillsetIds.push(skillset.id);

		}

		// Iterate through prevSkillsetIds (list of Skill Set IDs prior to saving)
		// If an ID from prevSkillsetIds is missing from newSkillsetIds, delete the corresponding Skill Set record
//        logger.debug('OLD SKILLSET IDS', prevSkillsetIds);
//        logger.debug('NEW SKILLSET IDS', newSkillsetIds);
		for (var i = 0; i < prevSkillsetIds.length; i++) {
			if (prevSkillsetIds[i] != '' && newSkillsetIds.indexOf(prevSkillsetIds[i]) == -1) {
				nlapiDeleteRecord('customrecord_rss_skillset', prevSkillsetIds[i]);
			}
		}

		// Redirect to View mode from process submitted data.
		response.sendRedirect('SUITELET', scriptId, deploymentId, false, {
			'custpage_resourceid': resourceId,
			'custpage_mode': 'View',
			'custpage_type': resourceType
		});
	} else {
		logger.debug('POST', 'Redirect to Edit');
		// redirect to Edit mode from View mode.
		response.sendRedirect('SUITELET', scriptId, deploymentId, false, {
			'custpage_resourceid': resourceId,
			'custpage_mode': 'Edit',
			'custpage_type': resourceType
		});
	}
};

/**
 *
 * @param {nlobjForm} form
 * @param {nlobjRecord} employee
 */
psa_rss.serverlibrary.createEducSublist = function (form, employee) {
	var sublistId = 'hreducation';
	var sublistCount = employee.getLineItemCount(sublistId);

	MSG_TITLE = 'createEducSublist';
	var logger = new psa_rss.serverlibrary.logger(MSG_TITLE, false);

	logger.debug(MSG_TITLE,
		'nlapiGetContext().getRemainingUsage(): ' + nlapiGetContext().getRemainingUsage() + '\r\n' +
		'sublist id  : ' + sublistId + '\r\n' +
		'sublist cnt : ' + sublistCount + '\r\n');

	var subtab = form.addSubTab('custpage_' + sublistId, TranslationManager.getString('TAB.EDUCATION'), 'custpage_skills_tab');
	var sublist = form.addSubList('custpage_' + sublistId + '_sublist', 'staticlist', TranslationManager.getString('TAB.EDUCATION'), 'custpage_' + sublistId);

	sublist.addField('rss_education', 'text', TranslationManager.getString('COLUMN.LEVEL_OF_EDUCATION'));
	sublist.addField('rss_educ_degree', 'text', TranslationManager.getString('COLUMN.DEGREE'));
	sublist.addField('rss_educ_degreedate', 'text', TranslationManager.getString('COLUMN.DATE_CONFERRED'));

	if (sublistCount > 0) {
		for (var i = 0; i < sublistCount; i++) {
			sublist.setLineItemValue('rss_education', i + 1, employee.getLineItemText(sublistId, 'education', i + 1));
			sublist.setLineItemValue('rss_educ_degree', i + 1, employee.getLineItemValue(sublistId, 'degree', i + 1));
			sublist.setLineItemValue('rss_educ_degreedate', i + 1, employee.getLineItemValue(sublistId, 'degreedate', i + 1));
		}
	}
};