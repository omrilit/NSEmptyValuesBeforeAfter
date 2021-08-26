/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * renamed from eft_lib.js
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/05/20  198389         1.00.2011.05.20.04      Add JSON processing
 * 2011/07/26  202307         1.05                    Remove replace of < and > symbols when
 *                                                    reading XML file
 * 2011/08/12  203530         1.07.2011.08.11.01      Fix for 1000 record limit
 * 2011/08/17  203853         1.07.2011.08.18.02      Parallel runs for payment scheduled script
 * 2011/08/25  204379         1.08.2011.08.25.02      Support for large volume processing
 * 2011/09/15  203845         1.07.2011.08.18.02      Search with markers to allow filter to reach
 *                                                    entities after the 1000 record index
 *             205014         1.10                    Set flags for making DCL fields mandatory
 * 2011/10/27  208503         1.15.2011.10.27.4       Add US Market Requirements - AP (ACH - CCD/PPD)
 * 2011/12/15  210788         1.17.2011.12.08.3       Modify searchRecordWithMarker to check for
 *                                                    API governance limits
 * 2012/02/20  215424         1.19.1                  Workaround for large data performance issue of
 *                                                    nlapiSearchRecord
 * 2012/03/30  218911         1.20                    Add Currency class
 * 2012/04/23  220361         1.21                    Add xml utility functions for XML Output support
 * 2012/07/05  225630         1.22                    Remove setting of location as mandatory when
 *                                                    Multi-location inventory is enabled
 * 2012/08/23  229386         1.22.3       			  Check for 'null' string values for XML attributes 
 * 													  encoding and standalone (optional attributes)		                                                    
 * 2012/08/10  227867         2.01.1                  Add support for DCL according to aggregation
 * 2012/09/12  230808		  1.22.3       			  Add VALID_COUNTRY_CODES
 * 2012/12/13  237873         2.00.3                  Use nlapiLoadRecord to get root currency
 * 2013/02/28  243925         2.00                    Update DCL utility functions to check if DCL is activated                         
 * 2013/03/04  244623         2.00                    Update DCL utility functions to check if DCL is activated
 * 2013/03/08  235816   	  2.00.3				  Add support for ASB EFT
 * 2013/03/12  239628 		  2.00.6				  Add bank account types for ACH file format
 * 2013/05/17  251637 		  2.00.15				  Add constant TERMINAL_DEPLOYMENT_STATUSES
 * 2013/05/30  252743 		  2.00.16				  Add constant REQUEUED	
 * 			   247323  
 * 2013/06/17  254204 		  2.00.18				  Add EP Process constants
 * 2013/07/18  257505 		  2.00.18				  Add error logging when governance or time limit is reached
 * 2013/07/15  245723		  2.00.10				  Add method for checking if commission is enabled
 * 2013/08/01  242348 		  2.00.8				  Changed ASB utility class to NZAccountNumber
 * 2013/08/29  250004   	  2.00.24				  Removed unused constants
 * 2013/08/29  261772 		  2.00.25.2013.08.29.3    Add method for checking for employee commission feature
 * 2013/09/23  255091		  2.00.18				  Add method to get an xml child node using an attribute
 * 2013/10/04  265150		  3.00.0.2013.10.03.6	  Add support for hiding fields which contain empty values 
 * 2013/10/11  265898		  3.00.0.2013.10.10.6	  Remove extra space and lines from removeTag and getChildNodeByAttribute
 */


// Payment Status's
var PAYQUEUED = 1;
var PAYMARKPAYMENTS = 5;
var PAYPROCESSING = 2;
var PAYCREATINGFILE = 3;
var PAYPROCESSED = 4;
var PAYREVERSAL = 6;
var PAYNOTIFICATION = 7;
var PAYERROR = 8;
var PAYFAILED = 9;
var PAYCANCELLED = 10;
var PAYDELETINGFILE = 11;
var REQUEUED = 12;

var VALID_COUNTRY_CODES = [
	"AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE",
	"BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","KH","CM","CA","IC","CV","KY","CF",
	"EA","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","CI","HR","CU","CW","CY","CZ","DK","DJ","DM","DO",
	"TP","EC","EG","SV","GQ","ER","EE","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI",
	"GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE",
	"IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT",
	"LU","MO","MK","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA",
	"MZ","MM","NA","NR","NP","NL","AN","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG",
	"PY","PE","PH","PN","PL","PT","PR","QA","RE","RO","RU","RW","BL","SH","KN","LC","MF","VC","WS","SM","ST","SA",
	"SN","RS","CS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","PM","SD","SR","SJ","SZ","SE",
	"CH","SY","TW","TJ","TZ","TH","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UY","UM",
	"UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW"
];

var VALID_SCHEDULE_STATUSES = ['QUEUED', 'INQUEUE', 'INPROGRESS'];
var TERMINAL_DEPLOYMENT_STATUSES = ['COMPLETED', 'NOTSCHEDULED'];

// EP Processes
var EP_PROCESSPAYMENTS = '1';
var EP_REPROCESS = '2';
var EP_ROLLBACK = '3';
var EP_REVERSEPAYMENTS = '4';
var EP_EMAILNOTIFICATION = '5';
var EP_CREATEFILE = '6';

//bank account types
var BANK_ACCT_TYPE_CHECKING = 1;
var BANK_ACCT_TYPE_SAVINGS = 2;

/**
 * Is Null or Empty.
 *
 * @param {Object} strVal
 */
function isNullorEmpty(strVal){
    return (strVal == null || strVal == '');
}


/**
 * Establish whether Class is activated.
 */
function isClass(){
    return (nlapiGetContext().getSetting('FEATURE', 'CLASSES') == 'T');
}


/**
 * Establish whether Department is activated.
 */
function isDepartment(){
    return (nlapiGetContext().getSetting('FEATURE', 'DEPARTMENTS') == 'T');
}


/**
 * Establish whether Location is activated.
 */
function isLocation(){
    return (nlapiGetContext().getSetting('FEATURE', 'LOCATIONS') == 'T');
}

/**
 * Establish whether Class field is mandatory. 
 */
function isClassMandatory() {
	var context = nlapiGetContext();
    return (context.getSetting('FEATURE', 'CLASSES') == 'T' && context.getPreference('CLASSMANDATORY') == 'T');
}

/**
 * Establish whether Department field is mandatory. 
 */
function isDeptMandatory() {
	var context = nlapiGetContext();
    return (context.getSetting('FEATURE', 'DEPARTMENTS') == 'T' && context.getPreference('DEPTMANDATORY') == 'T');	
}

/**
 * Establish whether Location field is mandatory. 
 */
function isLocMandatory() {
	var context = nlapiGetContext();
    return (context.getSetting('FEATURE', 'LOCATIONS') == 'T' && context.getPreference('LOCMANDATORY') == 'T');	
}

/**
 * Establish whether Class field is per transaction line
 * @returns {Boolean}
 */
function isClassPerLine() {
	var context = nlapiGetContext();
    return (context.getSetting('FEATURE', 'CLASSES') == 'T' && context.getPreference('CLASSESPERLINE') == 'T');
}

/**
 * Establish whether Department field is per transaction line
 * @returns {Boolean}
 */
function isDeptPerLine() {
	var context = nlapiGetContext();
    return (context.getSetting('FEATURE', 'DEPARTMENTS') == 'T' && context.getPreference('DEPTSPERLINE') == 'T');
}

/**
 * Establish whether Location field is per transaction line
 * @returns {Boolean}
 */
function isLocPerLine() {
	var context = nlapiGetContext();
    return (context.getSetting('FEATURE', 'LOCATIONS') == 'T' && context.getPreference('LOCSPERLINE') == 'T');
}

/**
 * Establish whether Journal CDL fields are per transaction line
 * @returns {Boolean}
 */
function isJournalCDLPerLine() {
    return (nlapiGetContext().getPreference('CDLPERLINEONJE') == 'T');
}

/**
 * Returns all DCL options
 */
function getDCLSettings() {
    var dclSettings = {};
    
    dclSettings.deptField = {
		isDisplayed: isDepartment(),
		isMandatory: isDeptMandatory()
	};
    dclSettings.classField = {
		isDisplayed: isClass(),
		isMandatory: isClassMandatory()
	};
    dclSettings.locField = {
		isDisplayed: isLocation(),
		isMandatory: isLocMandatory()
	};
    
    return dclSettings;
}

/**
 * Establish whether the account is One World.
 */
function isOneWorld(){
    return (nlapiGetContext().getSetting('FEATURE', 'SUBSIDIARIES') == 'T');
}

/**
 * Establish whether the account is using multicurrency.
 */
function isMultiCurrency(){
    return (nlapiGetContext().getSetting('FEATURE', 'MULTICURRENCY') == 'T');
}

/**
 * Establish whether the account is using multiple scheduled script queues.
 */
function isMultipleQueue() {
	return (nlapiGetContext().getSetting('FEATURE', 'serversidemultiq') == 'T');
}

/**
 * Checks if val is member of a given array
 * 
 * @param {String} val
 * @param {Array} arr
 */
function isInArray(val, arr) {
	var inArray = false;
	if (val && arr) {
		for (var i =0, ii = arr.length; i < ii; i++) {
			if (arr[i] == val) {
				inArray = true;
				break;
			}
		}
	}
	return inArray;
}

/**
 * Establish whether governance has been reached.
 *
 * @param {Object} strRestartTrigger (in units)
 */
function governanceReached(strRestartTrigger){
    var lReschedule = false;
    var context = nlapiGetContext();
    var usageRemaining = context.getRemainingUsage();
    
    // Default the restart trigger to 100 units.
    strRestartTrigger = isNullorEmpty(strRestartTrigger) ? 100 : strRestartTrigger;
    if (usageRemaining < strRestartTrigger) {
        lReschedule = true;
        nlapiLogExecution('debug', 'Schedule Governance', 'Governance Reached. Units remaining  : ' + usageRemaining);
    }
    return lReschedule;
}

/**
 * Establish whether the account has enabled Partner Commissions.
 */
function isCommissionEnabled(){
    return (nlapiGetContext().getFeature('PARTNERCOMMISSIONS'));
}

/**
 * Establish whether the account has enabled Commissions for Employees.
 */
function isEmployeeCommissionEnabled(){
    return (nlapiGetContext().getFeature('COMMISSIONS'));
}

/**
 * Workaround for search record limit
 * 
 * @param {Object} recordType
 * @param {Object} savedSearch
 * @param {Object} filters
 * @param {Object} columns
 * @param {Object} line
 */
function searchRecord(recordType, savedSearch, filters, columns, line, maxResultLength, startTime, maxTime) {
    var limitSearchResults = [];
	if (recordType) {
		var markerObj = {};
		markerObj.lastIndex = 1;
        var searchResults = searchRecordWithMarker(recordType, savedSearch, filters, columns, line, markerObj, maxResultLength, startTime, maxTime);
		while (searchResults) {
			// concatenate to results to return
            limitSearchResults = limitSearchResults.concat(searchResults);
			
			// search with marker
            searchResults = searchRecordWithMarker(recordType, savedSearch, filters, columns, line, markerObj, maxResultLength, startTime, maxTime);
		}
	}
    return limitSearchResults;
}

/**
 * Gets succeeding search results from the given internal id and line id (if line == true)
 * - Use the markerObj to store the state. For the initial search, set markerObj.lastIndex = 1.
 * - Calls to this function must handle the Script Execution Limit and Script API 
 *   Governance exceptions
 * 
 * @param {Object} recordType
 * @param {Object} savedSearch
 * @param {Object} filters
 * @param {Object} columns
 * @param {Object} line
 * @param {Object} markerObj
 */
function searchRecordWithMarker(recordType, savedSearch, filters, columns, line, markerObj, maxResultLength, startTime, maxTime) {
    var searchResults = [];

	if (governanceReached()) {
		nlapiLogExecution('error', 'searchRecordWithMarker', 'Governance reached.');
		return null;
	}

    if (startTime && maxTime) {
        var currentTime = (new Date()).getTime();
        var timeElapsed = currentTime - startTime;
        nlapiLogExecution('debug', 'Payment Module Processing', 'Time elapsed: ' + timeElapsed);
        if (timeElapsed >= maxTime) {
        	nlapiLogExecution('error', 'searchRecordWithMarker', 'Allowed search time exceeded.');
            return null;
        }
    }
	
    if (recordType && markerObj) {
        var lastIndex = 1;
        if (!columns) {
            columns = [];
        }
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
        if (tmpSearchResults) {
            var maxLength = (maxResultLength != null && maxResultLength < tmpSearchResults.length) ? maxResultLength : tmpSearchResults.length;
            for (var i = 0; i < maxLength; i++) {
                searchResults.push(tmpSearchResults[i]);
            }
        }
        else {
            searchResults = tmpSearchResults;
        }

        if (searchResults) {
            nlapiLogExecution('debug', 'Payment Module Processing', 'searchWithMarker results: ' + searchResults.length);
            markerObj.lastIndex = searchResults.length - 1;
            markerObj.lastInternalId = searchResults[markerObj.lastIndex].getId();
            if (line) {
                markerObj.lastLineNum = searchResults[markerObj.lastIndex].getValue('line');
            }
        }
        else {
            markerObj.lastIndex = 0;
        }
    }
    return searchResults;
}

/**
 * Schedules the script on the available deployments
 * 
 * @param {Object} scriptId
 * @param {Object} deployments
 * @param {Object} params
 */
function scheduleScript(scriptId, deployments, params) {
    var rtnSchedule;
	
    if (scriptId && deployments && deployments.length > 0) {
        // schedule the processing
        for (var i = 0; i < deployments.length; i++) {
            rtnSchedule = nlapiScheduleScript('customscript_2663_payment_processing_ss', deployments[i], params);
            if (rtnSchedule == 'QUEUED') {
                nlapiLogExecution('debug', 'Payment Module Processing', 'Deployed on : ' + deployments[i]);
                break;
            }
        }
    }
    
    return rtnSchedule;
}

// -----------------------
// XML Util

var _2663;

if (!_2663) 
    _2663 = {};

_2663.XmlUtil = function(){
    function createTag(name, value){
        return '&lt;' + name + '&gt;' + value + '&lt;/' + name + '&gt;';
    }

    function removeTag(name, source){
        var preName = source.substring(0,source.indexOf('{' + name + '}'));
        var tag = source.substring(preName.lastIndexOf('<') + 1,preName.lastIndexOf('>'));
        var startIndex = source.indexOf(tag) - 1;
        var endIndex = source.lastIndexOf(tag) + tag.length;
        var part1 = source.substring(0, startIndex);
        var part2 = source.substring(endIndex + 1);
        return (part1.trim() + part2);        
    }
  
    function loadXmlObject(xmlStr){
        var xmlObj;
        //xmlStr = xmlStr.replace(/\&lt;/g, '<');
        //xmlStr = xmlStr.replace(/\&gt;/g, '>');
        if (xmlStr) {
            xmlObj = nlapiStringToXML(xmlStr);
        }
        return xmlObj;
    }
    
    function getAttributeValue(node, attributeName){
        var attrName = '@' + attributeName;
        var attr = new String(nlapiSelectNode(node, attrName));
        if (attr.indexOf('=') != -1) {
            attr = attr.substring(attr.indexOf('=') + 2, attr.length - 1);
        }
        return attr;
    }
    
    function getNodeValue(parentNode, nodeName){
        var nodeText = '';
        if (nodeName) {
            nodeText = nodeName + '/';
        }
        nodeText += 'text()';
        var nodeVal = new String(nlapiSelectNode(parentNode, nodeText));
        if (nodeVal.indexOf(':') != -1) {
            nodeVal = nodeVal.substring(nodeVal.indexOf(':') + 2, nodeVal.length - 1);
        }
        return nodeVal;
    }
    
    function removeComments(xmlStr){
    	var re = /<!--[\s\S]*?-->/g;
    	if (xmlStr) {
    		return xmlStr.replace(re, '');
    	}
    	return xmlStr;
    }
    
    function getChildNode(xmlStr, parentNodeName){
    	var re = new RegExp('<' + parentNodeName +'[\\s\\S]*?>');
    	var matchStr = (xmlStr.match(re) || [])[0]; 
    	var startIndex = xmlStr.indexOf(matchStr) + matchStr.length;
    	var endIndex = xmlStr.indexOf('</' + parentNodeName + '>');
    	return xmlStr.slice(startIndex, endIndex);
    }
    
    function getChildNodeByAttribute(xmlStr, parentNodeName, attributeName, attributeValue){
    	var re = new RegExp('<' + parentNodeName + '[\\s\\S]*?' + attributeName + '[\\s\\S]*?' + '=' + '[\\\'|\\\"]' + attributeValue + '[\\\'|\\\"]' + '[\\s\\S]*?' + '>');
    	
    	var matchStr = (xmlStr.match(re) || [])[0]; 
    	
    	var startIndex = xmlStr.indexOf(matchStr) + matchStr.length;
    	var endIndex = xmlStr.indexOf('</' + parentNodeName + '>', startIndex);
    	var res = xmlStr.slice(startIndex, endIndex);
    	return res.trim();
    }
    
    function getStringNode(xmlStr, elementName) {
    	var startIndex = xmlStr.indexOf('<' + elementName);
    	var endIndex = xmlStr.indexOf('</' + elementName + '>') + elementName.length + 3;
    	return startIndex > -1 ? xmlStr.slice(startIndex, endIndex) : '';
    }
    
    function createDeclaration(version, encoding, standalone) {
    	//sample declaration:	
    	//<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    	var declaration = '';
    	
    	if (version && version != 'null') {
    		declaration = declaration.concat('<?xml version="', version, '"',
				(encoding && encoding != 'null' ? ' encoding="' + encoding + '"' : ''),
				(standalone && (standalone == 'yes' || standalone == 'no') ? ' standalone="' + standalone + '"' : ''),
				'?>'
			);
    	} else {
    		throw nlapiCreateError('IPM_XML_VERSION_MANDATORY', 'The XML attribute version is mandatory.', true);
    	}
    	return declaration;
    }
	
	this.CreateTag = createTag;
	this.RemoveTag = removeTag;
	this.LoadXmlObject = loadXmlObject;
	this.GetAttributeValue = getAttributeValue;
	this.GetNodeValue = getNodeValue;
	this.RemoveComments = removeComments;
	this.GetChildNode = getChildNode; 
	this.GetStringNode = getStringNode;
	this.CreateDeclaration = createDeclaration;
	this.GetChildNodeByAttribute = getChildNodeByAttribute;
};

//-----------------------
//ACH Util
//-- used by ACH - CCD/PPD (EFT)
_2663.ACH = function(routingNumber){
	routingNumber = new String(routingNumber);
	
	this.isValidRoutingNumber = function() {
		var isValid = false;
		if (routingNumber && routingNumber.length == 9) {
			if (this.getCheckDigit() == routingNumber.charAt(8)) {
				isValid = true;
			}
		}
		return isValid;
	};
	
	this.getFederalReserveRoutingSymbol = function() {
		var federalReserveRoutingSymbol = '';
		if (routingNumber && routingNumber.length == 9 && !isNaN(routingNumber)) {
			federalReserveRoutingSymbol = routingNumber.substring(0, 4);
		}
		return federalReserveRoutingSymbol;
	};
	
	this.getABAInstitutionIdentifier = function() {
		var abaInstitutionIdentifier = '';
		if (routingNumber && routingNumber.length == 9 && !isNaN(routingNumber)) {
			abaInstitutionIdentifier = routingNumber.substring(4, 8);
		}
		return abaInstitutionIdentifier;
	};
	
	this.getCheckDigit = function() {
		var checkDigit = '';
		if (routingNumber && routingNumber.length == 9 && !isNaN(routingNumber)) {
			var checkDigitCompVal = (7 * (parseInt(routingNumber.charAt(0), 10) + parseInt(routingNumber.charAt(3), 10) + parseInt(routingNumber.charAt(6), 10)) + 
			3 * (parseInt(routingNumber.charAt(1), 10) + parseInt(routingNumber.charAt(4), 10) + parseInt(routingNumber.charAt(7), 10)) +
			9 * (parseInt(routingNumber.charAt(2), 10) + parseInt(routingNumber.charAt(5), 10))) % 10;
			checkDigit = new String(checkDigitCompVal);
		}
		return checkDigit;
	};
};

//Currency class
_2663.Currency = function() {
	var multiCurrencyOn = isMultiCurrency();
	var baseCurrencyId = '1';
	var currencies = {};
	
    // Only when Multiple Currencies is enabled are the ff. possible:
    // - nlapiSearchRecord('currency')
    // - nlapiLoadConfiguration('companyinformation').getFieldValue('basecurrency')
    if (multiCurrencyOn) {
        var columns = [new nlobjSearchColumn('symbol'), new nlobjSearchColumn('name')];
        (nlapiSearchRecord('currency', null, null, columns) || []).forEach(function(res){
        	if (!currencies[res.getId()]) {
        		currencies[res.getId()] = {};
        		currencies[res.getId()].symbol = res.getValue('symbol');
        		currencies[res.getId()].name = res.getValue('name');
        	}
        });
    } else {
    	var baseCurrency = nlapiLoadRecord('currency', baseCurrencyId);
    	if (!currencies[baseCurrencyId]) {
    		currencies[baseCurrencyId] = {};
    		currencies[baseCurrencyId].symbol = baseCurrency.getFieldValue('symbol');
    		currencies[baseCurrencyId].name = baseCurrency.getFieldValue('name');
    	}
    }
    
    //Defaults to currency based on locale (Company Information) if not multi-currency
    this.getValue = function(id, fldName) {
    	if (!multiCurrencyOn) {
    		id = baseCurrencyId;
        }
    	return currencies[id] && currencies[id][fldName];
    };
};

//-----------------------
//NZAccountNumber Util
//-- used by ASB (EFT), Westpac - Deskbank
_2663.NZAccountNumber = function(accountNumber){
	accountNumber = new String(accountNumber);
	
	var isNZAccountNumber = (accountNumber.length == 15 || accountNumber.length == 16);
	
	this.getBankNumber = function() {
		var bankNumber = '';
		if (accountNumber && isNZAccountNumber && !isNaN(accountNumber)) {
			bankNumber = accountNumber.substring(0, 2);
		}
		return bankNumber;
	};
	
	this.getBranchNumber = function() {
		var branchNumber = '';
		if (accountNumber && isNZAccountNumber && !isNaN(accountNumber)) {
			branchNumber = accountNumber.substring(2, 6);
		}
		return branchNumber;
	};
	
	this.getUniqueAccountNumber = function() {
		var uniqueAccountNumber = '';
		if (accountNumber && isNZAccountNumber && !isNaN(accountNumber)) {
			uniqueAccountNumber = accountNumber.substring(6, 13);
		}
		return uniqueAccountNumber;
	};
	
	this.getBankAccountSuffix = function() {
		var bankAccountSuffix = '';
		if (accountNumber && isNZAccountNumber && !isNaN(accountNumber)) {
			bankAccountSuffix = accountNumber.substring(13);
		}
		return bankAccountSuffix;
	};
};

//--------------------------

/*
    http://www.JSON.org/json2.js
    2011-01-18

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());