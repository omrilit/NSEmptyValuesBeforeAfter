/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/08/29  263190 		  3.00.00				  Initial version
 * 2013/09/25  263190 		  3.00.00				  Add governance and time limit handling on getAllResults method
 * 2013/09/26  263190 		  3.00.00				  Add getCurrencyPrecision && getConfigurationObject functions
 * 2013/11/20  270099 		  3.00.10				  Add getMap functions
 * 2013/11/20  269865 		  3.00.10				  Support workaround using nlapiSearchRecord
 * 2013/11/21  269865 		  3.00.10				  Replace while loop with do while loop
 * 2014/01/07  274281  		  3.00.00				  Add error logs on method getAllResults
 * 2013/11/26                 3.00.10				  Add method to determine domain url
 * 2014/01/07  274281  		  3.00.00				  Add error logs on method getAllResults
 * 2014/03/14  236313 		       			          Add string utility object
 * 2014/04/25  287659		  3.02.4				  Add function to get EP specific preferences
 * 2014/09/01  299074  		  4.00.2     			  Limit transaction search to increase efficiency
 * 2014/09/22  304354								  Support for term or early settlement discount for Bill Payment Processing
 */

var _2663 = _2663 || {};

_2663.Logger = function Logger(mainTitle) {
	mainTitle = mainTitle || 'Electronic Payments';
	var debugDisabled = false;
	var errorDisabled = false;

	function setTitle(title) {
		mainTitle = title;
	}
	
	function debug(details, enabled) {
		if (!debugDisabled || enabled) {
			nlapiLogExecution('DEBUG', mainTitle, details);	
		}
	}

	function error(details, ex, enabled) {
		if (!errorDisabled || enabled) {
			var errorMessage = details || '';
			if (ex) {
				errorMessage += errorMessage ? ': ' : '';
				errorMessage += stringifyException(ex);
			}
			nlapiLogExecution('ERROR', mainTitle, errorMessage);	
		}
	}
	
	function disable(type) {
		if (type == 'debug') {
			debugDisabled = true;
		} else if (type == 'error') {
			errorDisabled = true;
		}
	}

	function stringifyException(ex) {
		var exStr = '';
		if (ex) {
			if (ex instanceof nlobjError) {
				exStr += ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace();
			} else {
				exStr += ex.toString() + '\n' + ex.stack;
			}	
		}
		return exStr;
	}
	
	this.debug = debug;
	this.error = error;
	this.disable = disable;
	this.setTitle = setTitle;
	this.stringifyException = stringifyException;
};

_2663.Search = function Search(type) {
	var logTitle = 'Search';
	var logger = new _2663.Logger(logTitle);
	var filters = [];
	var columns = [];
	var savedSearch = '';
	
	function setSavedSearch(savedSearchId) {
		savedSearch = savedSearchId;
	}

	function addFilter(name, join, operator, value1, value2, summary, formula) {
		var filter = new nlobjSearchFilter(name, join, operator, value1, value2);
		filters.push(filter);
		if (summary) {
			filter.setSummaryType(summary);
		}
		if (formula) {
			filter.setFormula(formula);
		} 
	}
	
	function getFilters() {
		return filters;
	}
	
	function addFilters(arrFilters) {
		if (arrFilters && arrFilters.length > 0) {
			filters = filters.concat(arrFilters);
		}
	}

	function addColumn(name, join, summary) {
		columns.push(new nlobjSearchColumn(name, join, summary));
	}

	function getColumns() {
		return columns;
	}
	
	function addColumns(arrColumns) {
		if (arrColumns && arrColumns.length > 0) {
			columns = columns.concat(arrColumns);
		}
	}

	function setSort(index, order) {
		columns[index].setSort(order);
	}

	function removeLastFilter() {
		filters.pop();
	}

	function setOr(filterIndex, setOr) {
		filters[filterIndex].setOr(setOr);
	}

	function setLeftParens(filterIndex, numParens) {
		filters[filterIndex].setLeftParens(numParens);
	}

	function setRightParens(filterIndex, numParens) {
		filters[filterIndex].setRightParens(numParens);
	}
	
	function clearFilters() {
		filters = [];
	}
	
	function clearColumns() {
		columns = [];
	}

	function getResults() {
		if(type == ''){
			logger.error('Please set record type.');
			return null;
		}

		return nlapiSearchRecord(type, savedSearch, filters, columns) || [];
	}

	function getAllResults(restartTrigger, startTime, maxTime, useOldSearch, line, maxResultLength) {
		var allSearchResults = [];
		allSearchResults.errorFlag = false;
		if (useOldSearch) {
			var markerObj = {};
			markerObj.lastIndex = 1;
            var isWithinAllowedLength = true;
			do {
				try {
					// search with marker
					var searchResults = _2663.searchRecordWithMarker(type, savedSearch, filters, columns, line, markerObj, maxResultLength, restartTrigger, startTime, maxTime);
					// concatenate to results to return
	    	        if (searchResults) {
                        var potentialLength = allSearchResults.length + searchResults.length;
                        if (maxResultLength && maxResultLength <= potentialLength) {
                            // limit results to specified length
                            isWithinAllowedLength = false;
                            var remainingSpace = maxResultLength - (allSearchResults.length);
                            allSearchResults = allSearchResults.concat(searchResults.slice(0,remainingSpace));
                        }
                        else {
                            allSearchResults = allSearchResults.concat(searchResults);
                        }
	    	        }                    
	        	} catch (ex) {
	        		allSearchResults.errorFlag = true;
	        		logger.error('_2663.searchRecordWithMarker', ex);
	        		logger.error('total search results: ' + allSearchResults.length + '<br>' + 'elapsed time: ' + (new Date() - startTime));
	        		break;
	        	}
			} while (searchResults && searchResults.length > 0 && isWithinAllowedLength);
		} else {
			var search = savedSearch ? nlapiLoadSearch(type, savedSearch) : nlapiCreateSearch(type, filters, columns);
		    if (savedSearch) {
		    	if (filters) {
		    		search.addFilters(filters);
		    	}
		    	if (columns) {
		    		logger.debug('columns: ' + columns.length);
		    		search.addColumns(columns);
		    	}
		    }
		    var searchResultSet = search.runSearch();
		    var startIdx = 0;
            // max length for searchResultSet.getResults is 1000
		    var endIdx = 1000;
            var isWithinAllowedLength = true;
		    do {
	        	try {
	        		if (_2663.governanceReached(restartTrigger)) {
	                    throw nlapiCreateError('EP_GOVERNANCE_REACHED', 'Governance reached.', true);
	                }

	                if (_2663.hasTimedOut(startTime, maxTime)) {
	                    throw nlapiCreateError('EP_SEARCH_TIME_EXCEEDED', 'Search time exceeded.', true);
	                }
	                var searchResults = searchResultSet.getResults(startIdx, endIdx);
	    	        if (searchResults) {	
                        var potentialLength = allSearchResults.length + searchResults.length;
                        if (maxResultLength && maxResultLength <= potentialLength) {                            
                            // limit results to specified length
                            isWithinAllowedLength = false;
                            var remainingSpace = maxResultLength - (allSearchResults.length);
                            allSearchResults = allSearchResults.concat(searchResults.slice(0,remainingSpace));
                        }
                        else {
                            allSearchResults = allSearchResults.concat(searchResults);
                            // max length for searchResultSet.getResults is 1000
                            startIdx += 1000;
                            endIdx += 1000;
                        }
	    	        }
	        	} catch (ex) {
	        		allSearchResults.errorFlag = true;
	        		logger.error('getAllResults', ex);
	        		logger.error('total search results: ' + allSearchResults.length + '<br>' + 'elapsed time: ' + (new Date() - startTime));
	        		break;
	        	}
		    }
		    while(searchResults && searchResults.length > 0 && isWithinAllowedLength);
		}
		return allSearchResults;
	}
	
	this.setSavedSearch = setSavedSearch;
	this.addFilter = addFilter;
	this.addFilters = addFilters;
	this.addColumn = addColumn;
	this.addColumns = addColumns;
	this.setSort = setSort;
	this.setOr = setOr;
	this.setLeftParens = setLeftParens;
	this.setRightParens = setRightParens;
	this.clearFilters = clearFilters;
	this.clearColumns = clearColumns;
	this.getResults = getResults;
	this.getAllResults = getAllResults;
	this.getFilters = getFilters;
	this.getColumns = getColumns;
};

_2663.StringUtil = function StringUtil(){
    /**
     * Applies padding to a string 
     *
     * @param   {String}    dir         - direction of padding ("left" or "right")
     * @param   {String}    pad         - padding to be inserted
     * @param   {String}    str         - original string value
     * @param   {Integer}   length      - length of the output string
     *
     * @return  {String}    -   resulting string (empty if checks fail)
     */
    function applyPadding(dir, pad, str, length) {        

        var res = '';

        // check parameters
        try {
            if (!dir){
                var error = 'applyPadding: no padding direction';
                nlapiCreateError('MISSING_PARAMETER', error, false);
                throw error;
            }
            if (dir && dir != 'left' && dir != 'right'){
                var error = 'applyPadding: invalid padding direction';
                nlapiCreateError('INVALID_PARAMETER', error, false);
                throw error;            
            }
            if (!pad){
                var error = 'applyPadding: no padding character';
                nlapiCreateError('MISSING_PARAMETER', error, false);
                throw error;
            }
            if (pad && pad.length > 1){
                var error = 'applyPadding: invalid pad character';
                nlapiCreateError('MISSING_PARAMETER', error, false);
                throw error;
            }            
            if (!length){
                var error = 'applyPadding: no length';
                nlapiCreateError('MISSING_PARAMETER', error, false);
                throw error;
            }
        }
        catch (ex){
            alert('ERROR: ' + ex + '. Returning blank value.');
            return '';
        }
        
        // proceed with apply padding
        for (var i = 1, ii = length - str.length; i <= ii; i++){
            res += pad;
        }        
        if (dir == 'left'){
            res = res + str;
        }
        else if (dir == 'right'){
            res = str + res;        
        }
        return res;
    } 
    
    this.applyPadding = applyPadding;
}

/**
 * Establish whether governance has been reached.
 *
 * @param {Object} strRestartTrigger (in units)
 */
_2663.governanceReached = function governanceReached(strRestartTrigger){
    var lReschedule = false;
    var context = nlapiGetContext();
    var usageRemaining = context.getRemainingUsage();
    
    // Default the restart trigger to 100 units.
    strRestartTrigger = strRestartTrigger || 100;
    if (usageRemaining < strRestartTrigger) {
        lReschedule = true;
        nlapiLogExecution('debug', 'Schedule Governance', 'Governance Reached. Units remaining  : ' + usageRemaining);
    }
    return lReschedule;
};

_2663.hasTimedOut = function hasTimedOut(startTime, maxTime) {
    var timeOutFlag = false;
    if (startTime && maxTime) {
        var currentTime = (new Date()).getTime();
        var timeElapsed = currentTime - startTime;
        if (timeElapsed >= maxTime) {
            timeOutFlag = true;
        }
    }
    return timeOutFlag;
};

_2663.isApprovalRoutingEnabled = function isApprovalRoutingEnabled() {
	var objPreference = _2663.getEPPreferences();
	if (objPreference && objPreference.eft_approval_routing) {
		return objPreference.eft_approval_routing;
	}
	return false;
};

_2663.getEPPreferences = function getEPPreferences() {
	var objPreference = {
		eft_approval_routing: false,
		include_name: false
	};
	
	var prefSearch = new _2663.Search('customrecord_ep_preference');
	prefSearch.addColumn('custrecord_ep_eft_approval_routing');
	prefSearch.addColumn('custrecord_ep_include_name');
	
	var preference = (prefSearch.getResults())[0];
	if (preference) {
		objPreference.eft_approval_routing =  preference.getValue('custrecord_ep_eft_approval_routing') == 'T'; 
		objPreference.include_name =  preference.getValue('custrecord_ep_include_name') == 'T';
	}
	return objPreference;
};

_2663.getCurrencyPrecision = function getCurrencyPrecision(currencyId) {
    var precision = 2;
    if (currencyId) {
        var currency = nlapiLoadRecord('currency', currencyId);
        if (currency) {
            precision = currency.getFieldValue('currencyprecision') || 2;
        }
    }
    return precision;
};

_2663.getConfigurationObject = function getConfigurationObject() {
	var logger = new _2663.Logger('[ep] Common: getConfigurationObject');
    var companyInfoConfigurationObject = {};
    try {
        var adminFieldsUrl = nlapiResolveURL('SUITELET', 'customscript_ep_admin_data_loader_s', 'customdeploy_ep_admin_data_loader_s', true);
        var params = {};
        params['custparam_ep_language'] = nlapiGetContext().getPreference('LANGUAGE');
        var adminFields = nlapiRequestURL(adminFieldsUrl, params);
        var adminFieldsResult = adminFields.getBody();
        companyInfoConfigurationObject = JSON.parse(adminFieldsResult);
    } catch(ex) {
    	logger.error('Error occurred while loading the configuration', ex);
    }
    return companyInfoConfigurationObject;
};

_2663.getMap = function getMap(type, name) {
	var map = {};
	if (type) {
		name = name || 'name';
		var search = new _2663.Search(type);
		search.addColumn(name);
		var searchResults = search.getResults();
		for (var i = 0, ii = searchResults.length; i < ii; i++) {
			var searchResult = searchResults[i];
			map[searchResult.getId()] = searchResult.getValue(name);
		}
	}
	return map;
};

/**
 * Get the internet domain used
 *
 * @returns {String}
 */
_2663.getDomainUrl = function getDomainUrl(){
    //determine domain url by resolving an existing suitelet
    var domainUrl = nlapiResolveURL('SUITELET','customscript_2663_payment_selection_s','customdeploy_2663_payment_selection_s',true);
    domainUrl = domainUrl.split('/app')[0];
    domainUrl = domainUrl.replace('forms','system');
    return domainUrl;
};

/**
 * Gets succeeding search results from the given internal id and line id (if line == true)
 * - Use the markerObj to store the state. For the initial search, set markerObj.lastIndex = 1.
 * - Calls to this function must handle the Script Execution Limit and Script API 
 *   Governance exceptions
 * 
 * @param {String} recordType
 * @param {String} savedSearch
 * @param {Object} filters
 * @param {Object} columns
 * @param {Integer} line
 * @param {Object} markerObj
 * @param {Integer} maxResultLength
 * @param {Integer} restartTrigger
 * @param {Date} startTime
 * @param {Integer} maxTime
 */
_2663.searchRecordWithMarker = function searchRecordWithMarker(recordType, savedSearch, filters, columns, line, markerObj, maxResultLength, restartTrigger, startTime, maxTime) {
    var searchResults = [];

	if (_2663.governanceReached(restartTrigger)) {
        throw nlapiCreateError('EP_GOVERNANCE_REACHED', 'Governance reached.', true);
    }

    if (_2663.hasTimedOut(startTime, maxTime)) {
        throw nlapiCreateError('EP_SEARCH_TIME_EXCEEDED', 'Search time exceeded.', true);
    }
	
    if (recordType && markerObj) {
    	columns = columns || [];
        columns.push(new nlobjSearchColumn('internalid').setSort());
        if (line) {
            columns.push(new nlobjSearchColumn('line').setSort());
        }
        var limitFilters = [];
        limitFilters = limitFilters.concat(filters);
        if (markerObj.lastInternalId) {
            limitFilters.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthanorequalto', markerObj.lastInternalId));
            var formula = 'CASE WHEN {internalid} = ' + markerObj.lastInternalId;
            if (line) {
                formula += ' AND {line} <= ' + markerObj.lastLineNum;
            }
            formula += ' THEN 0 ELSE 1 END';
            limitFilters.push(new nlobjSearchFilter('formulanumeric', null, 'equalto', 1).setFormula(formula));
        }
        var tmpSearchResults = nlapiSearchRecord(recordType, savedSearch, limitFilters, columns);
        if (tmpSearchResults && maxResultLength && maxResultLength < tmpSearchResults.length) {
            for (var i = 0; i < maxResultLength; i++) {
                searchResults.push(tmpSearchResults[i]);
            }
        } else {
            searchResults = tmpSearchResults;
        }

        if (searchResults) {
            nlapiLogExecution('debug', 'Payment Module Processing', 'searchWithMarker results: ' + searchResults.length);
            markerObj.lastIndex = searchResults.length - 1;
            markerObj.lastInternalId = searchResults[markerObj.lastIndex].getId();
            if (line) {
                markerObj.lastLineNum = searchResults[markerObj.lastIndex].getValue('line');
            }
        } else {
            markerObj.lastIndex = 0;
        }
    }
    return searchResults;
};


/**
 * Compute the discout amount based on the terms selected
 * 
 * @param {Object} res
 * @param {String} terms
 * @param {float} amt
 * @returns {float}
 */
_2663.computeDiscountAmount = function computeDiscountAmount(discValue, amt) {
	var discAmt = 0.00;

	if(discValue && amt){
	    discAmt = amt * (discValue / 100);
	}
	return discAmt.toFixed(2);
};

/**
 * Compute the discout date based on the terms selected
 * 
 * @param {Object} res
 * @param {String} terms
 * @param {String} date
 * @returns {String}
 */
_2663.computeDiscountDate = function computeDiscountDate(dateValue, date) {
	var discDate = "";

	if(dateValue && date){
	    if(dateValue > 0){
	    	discDate = nlapiDateToString(nlapiAddDays(nlapiStringToDate(date),dateValue));
	    }
	}
	return discDate;
	
};