/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/* Depreciation Period */
var DEPR_PERIOD_MONTHLY = '1';
var DEPR_PERIOD_ANNUALLY = '2';
var DEPR_PERIOD_FISCALPERIOD = '3';
var DEPR_PERIOD_FISCALYEAR = '4';

/**
 * [DEPRECATED] use FAM.Util_CS.fetchMessageObj
 * Accepts a hashmap of message id and fetch message from resource list
 * @param msgObj
 * @returns hashmap of message id and contents
 */
function FetchMessageObj(msgObj, screenName) {
    var returnArray = {};
    var DELIMITER = '$$';
    
    var messageId = [];
    for(id in msgObj) {
        messageId.push(msgObj[id]);
    }
    
    var SLparams = [];
    SLparams['custpage_messageid'] = messageId.join(DELIMITER);
    SLparams['custpage_delimiter'] = DELIMITER;
    
    if (screenName) {
        SLparams.custpage_pageid = screenName;
    }

    //Request for String translation for messages
    var languageURL = nlapiResolveURL('SUITELET','customscript_fam_language_resource','customdeploy_language_resource_deploy',false);
    var languageResp = nlapiRequestURL( languageURL, SLparams); // params now passed as custom headers
    
    //Store chain messages to array
    var l_msgtext = languageResp.getBody();
    var arrMessage = l_msgtext.split(DELIMITER);
    arrMessage.reverse();
    for(id in msgObj) {
        returnArray[id] = arrMessage.pop();
    }

    return returnArray;
}

/**
 * [DEPRECATED] Accepts an array of message id list and fetch message from resource list
 * @param messageId
 * @returns array of message contents
 */
function FetchMessageList(messageId, screenName) {
    var returnArray = {};
    var DELIMITER = '$$';
    //Setup parameters
    var joinedMsge = null;
    for(var s in messageId) {
        var l_message_id = messageId[s];
        if(joinedMsge == null)
            joinedMsge = l_message_id;
        else 
            joinedMsge = joinedMsge + DELIMITER + l_message_id;
    }
    
    var SLparams = new Array();
    SLparams['custpage_messageid'] = joinedMsge;
    SLparams['custpage_delimiter'] = DELIMITER;
    
    if (screenName) {
        SLparams.custpage_pageid = screenName;
    }
    
    //Request for String translation for messages
    var languageURL = nlapiResolveURL('SUITELET','customscript_fam_language_resource','customdeploy_language_resource_deploy',false);
    var languageResp = nlapiRequestURL( languageURL, SLparams); // params now passed as custom headers
    
    //Store chain messages to array
    var l_msgtext = languageResp.getBody();
    var arrMessage = l_msgtext.split(DELIMITER);
    for(var s in messageId) {
        var l_message_id = messageId[s];
        var messageContent = arrMessage[s];
        returnArray[l_message_id] = messageContent;
    }
    return returnArray;
}


/**
 * Replace message with blank value from parameter.
 * Blank value is difined by (number) - pattern, i.e. (0) will be replace with
 * first element in param, (1) from 2nd and so forth
 * 
 *  strVar -> The message
 *  param -> param values to be replaced on the message
 */
function InjectMessageParameter(strVar, param){
	var returnValue = strVar;

	// search pattern to find string to replace
	var paramPattern = /[(]\d[)]/g;


	//Return index of number inserted on string, also contains other non-numeric values
	var paramList = returnValue.match(paramPattern);
	
	//Replace the original string
	for(i in paramList){
		if (!isNaN(i) && param[i] != null){
			returnValue = returnValue.replace(paramList[i],param[i]);
		}
	}
	return returnValue;
}

/**
 * [DEPRECATED] use FAM_Utils_CS.js
 * Wrapper function for reloading page for stubbing purposes
**/
function reloadPage() {
    window.location.reload();
}