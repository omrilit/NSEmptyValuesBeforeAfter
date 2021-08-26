/**
 * Copyright 2014, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF ||{};
TAF.ReportPref = TAF.ReportPref || {};

TAF.ReportPref.ViewClient = new function _ViewClient() {
    this.init = _Init;
	this.fieldChanged = _FieldChanged;
	
	var context = nlapiGetContext();
    var is_one_world = context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
	
	
	function _Init() {
	   is_one_world ? nlapiSetFieldValue('custpage_subsidiary_orig', nlapiGetFieldValue('custpage_subsidiary')) : null;
       is_one_world ? nlapiSetFieldValue('custpage_bs_closing_orig', nlapiGetLineItemValue('custpage_report_filters', 'custpage_bs_closing', 1)) : null;
       is_one_world ? nlapiSetFieldValue('custpage_bs_opening_orig', nlapiGetLineItemValue('custpage_report_filters', 'custpage_bs_opening', 1)) : null;
       is_one_world ? nlapiSetFieldValue('custpage_is_closing_orig', nlapiGetLineItemValue('custpage_report_filters', 'custpage_is_closing', 1)) : null;
    }
	

    //Function get called when there is a field change in Report Preference
	function _FieldChanged(type, name, linenum){

        var params = [];    
        if(name == 'custpage_bs_closing' || name == 'custpage_bs_opening' || name == 'custpage_is_closing' ){
            params.push('&custpage_bs_closing=' + nlapiGetLineItemValue('custpage_report_filters', 'custpage_bs_closing', linenum));
            params.push('&custpage_bs_opening=' + nlapiGetLineItemValue('custpage_report_filters', 'custpage_bs_opening', linenum));
            params.push('&custpage_is_closing=' + nlapiGetLineItemValue('custpage_report_filters', 'custpage_is_closing', linenum));
        } 
	    if(name == 'custpage_subsidiary') {	  
          var sub = nlapiGetFieldValue('custpage_subsidiary');
          var subsidiaryRecord = nlapiLoadRecord('subsidiary', sub);
          var country = subsidiaryRecord.getFieldValue('country');
           
			     is_one_world ? params.push('&custpage_subsidiary=' + nlapiGetFieldValue('custpage_subsidiary')) : null;
			    window.location = nlapiGetFieldValue('custpage_refresh_url') + params.join('');
      } 
        
        if(name == 'france_fec' || name == 'mexico_trial_balance' || name == 'mexico_complementary_trial_balance' || name == 'mexico_auxiliary_report') {
          
            var value = nlapiGetFieldValue(name);
            if(value == 'T'){
                var pejEnabled = context.getFeature('PERIODENDJOURNALENTRIES');
                var sub = nlapiGetFieldValue('custpage_subsidiary');
                var subsidiaryRecord = nlapiLoadRecord('subsidiary', sub);
                var subsidiarySetting = nlapiLoadRecord("subsidiarysettings", sub);
                var allowperiodendjournalentries = subsidiarySetting.getFieldValue('allowperiodendjournalentries');
                var createbscloseandopenjournals = subsidiarySetting.getFieldValue('createbscloseandopenjournals');
                var subsidiaryName = subsidiaryRecord.getFieldValue('name');
                if(pejEnabled == false){
                    nlapiSetFieldValue(name, false);
                    alert('The Period End Journal Entries feature is required to enable this option. Enable this feature and select the Create Balance Sheet Closing and Opening Journals checkbox in the Period End Journal Entries preferences of your subsidiary: ' + subsidiaryName);
                }
                else if(allowperiodendjournalentries == 'F' || createbscloseandopenjournals == 'F'){
                    nlapiSetFieldValue(name, false);
                    alert('The Period End Journal Entries feature is required to enable this option. Enable this feature and select the Create Balance Sheet Closing and Opening Journals checkbox in the Period End Journal Entries preferences of your subsidiary: ' + subsidiaryName);
                }
            }
        }
	}
}
