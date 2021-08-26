/**
 * Copyright © 2018, 2018, Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF || {};
TAF.ThresholdConfig = TAF.ThresholdConfig || {};

TAF.ThresholdConfig = function _ThresholdConfig() {
    
    this.Limits = { Governance      : 1000,
                    Runtime         : 30 * 60 * 1000,
                    SearchResults   : 1000};
    
};

TAF.ThresholdConfig.prototype.setLimits = function _GetLimits(reportId){
    if(!reportId){
        throw new Error('TAF.ThresholdConfig.setLimits - Report Id Missing');
    }
    
    var filter = [new nlobjSearchFilter('name', null, 'is', reportId)];
    var column = [new nlobjSearchColumn('internalId').setSort(false),
                  new nlobjSearchColumn('custrecord_threshold_governance'),
                  new nlobjSearchColumn('custrecord_threshold_runtime'),
                  new nlobjSearchColumn('custrecord_threshold_search')];
    var result = nlapiSearchRecord('customrecord_taf_report_threshold', null, filter, column);
    
    if(result){
        this.Limits.Governance = +result[0].getValue('custrecord_threshold_governance')||this.Limits.Governance;
        this.Limits.Runtime = +result[0].getValue('custrecord_threshold_runtime')||this.Limits.Runtime;
        this.Limits.SearchResults = +result[0].getValue('custrecord_threshold_search')||this.Limits.SearchResults;
    }
};



