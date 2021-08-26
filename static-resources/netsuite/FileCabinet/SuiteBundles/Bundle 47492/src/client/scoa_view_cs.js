/**
 * Copyright 2014, 2019 Oracle and/or its affiliates. All rights reserved.
 */

var TAF = TAF ||{};
TAF.SCOA = TAF.SCOA || {};

TAF.SCOA.ViewClient = new function _ViewClient() {
    this.init = _Init;
	this.save = _Save;
	this.cancel = _Cancel;
	this.fieldChanged = _FieldChanged;
	
	var context = nlapiGetContext();
    var is_one_world = context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T';
	var strMsgs = {};
	
	
	function _Init() {
	    is_one_world ? nlapiSetFieldValue('custpage_subsidiary_orig', nlapiGetFieldValue('custpage_subsidiary')) : null;
	    nlapiSetFieldValue('custpage_account_type_orig', nlapiGetFieldValue('custpage_account_type'));
	    strMsgs = JSON.parse(nlapiGetFieldValue('custpage_cs_msgs'));
	}
	
	
	function _Save() {
		var action = nlapiGetFieldValue('custpage_action_type');
		if (action == 'view') {
			nlapiSetFieldValue('custpage_action_type', 'edit');
		} else if (action == 'edit') {
			nlapiSetFieldValue('custpage_action_type', 'save');
		}
		return true;
	}
	
	function _Cancel() {
	    if (!confirmReload()) {
	        setWindowChanged(window, true);
            return;
        }
	    
		var params = [];
		is_one_world ? params.push('&custpage_subsidiary=' + nlapiGetFieldValue('custpage_subsidiary')) : null;
		params.push('&custpage_account_type=' + nlapiGetFieldValue('custpage_account_type'));
		params.push('&custpage_action_type=view');
		
		if (!nlapiGetFieldValue('custpage_changed_accounts')) {
			setWindowChanged(window, false);
		}
		
		window.location = nlapiGetFieldValue('custpage_refresh_url') + params.join('');
	}

	function _FieldChanged(type, name, linenum){
	    if (name == 'custpage_subsidiary' || name == 'custpage_account_type') {
		    if (!confirmReload()) {
		        nlapiSetFieldValue(name, nlapiGetFieldValue(name + '_orig'), false);
		        setWindowChanged(window, true);
		        return;
		    }
		    
			var params = [];
			is_one_world ? params.push('&custpage_subsidiary=' + nlapiGetFieldValue('custpage_subsidiary')) : null;
			params.push('&custpage_account_type=' + nlapiGetFieldValue('custpage_account_type'));
			params.push('&custpage_action_type=' + nlapiGetFieldValue('custpage_action_type'));
			
			window.location = nlapiGetFieldValue('custpage_refresh_url') + params.join('');
		} else {
			var changed_accounts = JSON.parse(nlapiGetFieldValue('custpage_changed_accounts') || '{}');
			var account_id = nlapiGetLineItemValue('custpage_sublist', 'custpage_account_id', linenum);
			
			changed_accounts[account_id] = {
			    account_name:nlapiGetLineItemValue('custpage_sublist', 'custpage_account', linenum),
				scoa_id:nlapiGetLineItemValue('custpage_sublist', 'custpage_scoa_id', linenum),
				scoa_name:nlapiGetLineItemValue('custpage_sublist', 'custpage_name', linenum),
				scoa_number:nlapiGetLineItemValue('custpage_sublist', 'custpage_number', linenum)
			};
			
			if (is_one_world) {
			    changed_accounts[account_id].subsidiary = nlapiGetFieldValue('custpage_subsidiary');
			}
			
			nlapiSetFieldValue('custpage_changed_accounts', JSON.stringify(changed_accounts));
		}
	}
	
	
	function confirmReload() {
	    var confirmation = true;
	    
	    if (nlapiGetFieldValue('custpage_changed_accounts')) {
            confirmation = confirm(strMsgs["SCOA_RELOAD_WARNING_MESSAGE"]);
            if (confirmation) { setWindowChanged(window, false); }
            return confirmation;
        } else {
            setWindowChanged(window, false);
            return confirmation;
        }
	}
};
