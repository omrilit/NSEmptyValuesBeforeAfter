/**
 * Copyright © 2018, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ReportConfig = TAF.ReportConfig || {};

TAF.ReportConfig = function _ReportConfig(subId) {
	if(!subId){
        throw new Error('TAF.ReportConfig - Subsidiary Id Missing');
    }
	this.SubsidiaryConfig = {
			SubId : subId,
			IsNewEngine : false,
			};
	
	this.GetConfig(subId);
};

TAF.ReportConfig.prototype.GetConfig = function _GetConfig(subId){
    if(!subId){
        throw new Error('TAF.ReportConfig.GetConfig - Report Id Missing');
    }
    
    try {
		var filter = [
	    	new nlobjSearchFilter('custrecord_taf_sub_id', null, 'is', subId)];
	    var column = [
	    	new nlobjSearchColumn('internalId').setSort(true),
	    	new nlobjSearchColumn('custrecord_taf_sub_id'),
			new nlobjSearchColumn('custrecord_taf_is_engine2'),
			];
	    var result = nlapiSearchRecord('customrecord_taf_rep_config', null, filter, column);
    } catch (ex) {
    	this.SubsidiaryConfig.IsNewEngine = false;    	
    }
	   
    if(result){        
        this.SubsidiaryConfig.IsNewEngine = result[0].getValue('custrecord_taf_is_engine2') == 'T';       
    }
};



