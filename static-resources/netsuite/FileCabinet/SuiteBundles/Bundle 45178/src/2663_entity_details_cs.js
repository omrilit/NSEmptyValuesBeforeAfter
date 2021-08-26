/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Client script for toggling the EFT bank details of an entity.
 * @author mmoya
 */


/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2013/07/15  245723		  2.00.10				  Add support for commission transactions
 * 2013/08/15  260072 		  2.00.23.2013.08.15.1    Updated logic for disabling EFT Payment field in Partner and Vendor records
 * 2013/08/29  261635 		  2.00.25.2013.08.29.1    EFT Payment field is always disabled for Partner if commission is not enabled
 * 2013/12/03   		  	  3.00.00                 Added field validation for Email Address for Payment Notification
 * 2013/12/04   		  	  3.00.01                 Transfered email validation from validateField to saveRecord
 * 2014/03/26  282458	  	  3.00.03                 Add function adminLookupField and replace nlapiLookupField with it
 * 													  Add try catch in function eligibleForCommissionPageInit
 */

/**
 *
 * @appliedtorecord Partner, Vendor
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function eligibleForCommissionPageInit(type){
	try {
		var commissionEnabled = isCommissionEnabled();
		var recordType = nlapiGetRecordType();
		if (commissionEnabled) {
			if (recordType == 'partner' && (type == 'edit' || type == 'create')) {
				var isEligibleForCommission = nlapiGetFieldValue('eligibleforcommission') == 'T';
				toggleEFTPaymentField(isEligibleForCommission);
			} else if (recordType == 'vendor' && type == 'edit') {
				//for vendors, look up otherrelationships and check eligibleforcommission from there
				var partnerID = nlapiGetFieldValue('otherrelationships');
				if (partnerID && partnerID != null) { 
					var eligForCommFieldVal = adminLookupField('partner', partnerID, 'eligibleforcommission');
					
					//if eligible for commission field is null or empty, the vendor is not related to a partner, so enable the EFT checkbox
					//if not eligible for commission, the vendor is disconnected from the partner, so enable the EFT checkbox
					var isEligibleForCommission = !eligForCommFieldVal || eligForCommFieldVal == 'F';
					toggleEFTPaymentField(isEligibleForCommission);
				}
			}
		} else if (!commissionEnabled && recordType == 'partner') {
			//always disable this for partner if commission is not enabled
			toggleEFTPaymentField(false);
		}
	} catch (ex) {
		var errorStr = '';
		if (ex instanceof nlobjError) {
			errorStr += ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace();
		} else if (ex && ex.toString) {
			errorStr += ex.toString();
		}
		if (errorStr) {
			alert(errorStr);	
		}
	}
}

/**
 * @appliedtorecord Partner
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function eligibleForCommissionFieldChanged(type, name, linenum){
	
	if (nlapiGetRecordType() == 'partner' && isCommissionEnabled() && name == 'eligibleforcommission') {
		var entityText = nlapiGetContext().getPreference('NAMING_PARTNER');
		var isEligibleForCommission = nlapiGetFieldValue('eligibleforcommission') == 'T';
		
		if (!isEligibleForCommission) {
			var msg = 'If you uncheck the Eligible for Commission field, you will no longer be able to pay commissions for this ' + entityText + ' using EFT.\n\n';
			
			var conf = confirm(msg);
			
			if (conf) {
				nlapiSetFieldValue('custentity_2663_payment_method', 'F', false);
			} else {
				nlapiSetFieldValue('eligibleforcommission', 'T', false);
				isEligibleForCommission = true;
			}
		}
		
		toggleEFTPaymentField(isEligibleForCommission);
	}
}

function isCommissionEnabled() {
	return nlapiGetContext().getFeature('PARTNERCOMMISSIONS');
}

function toggleEFTPaymentField(isEligibleForCommission) { 
	nlapiDisableField('custentity_2663_payment_method', !isEligibleForCommission);
}

function adminLookupField(recType, recId, fldName, isText) {
	var url = nlapiResolveURL('SUITELET', 'customscript_2663_admin_data_lookup_s', 'customdeploy_2663_admin_data_lookup_s');
	var params = {};
	params['custparam_2663_rec_type'] = recType;
	params['custparam_2663_rec_id'] = recId;
	params['custparam_2663_fld_name'] = fldName;
	params['custparam_2663_is_text'] = isText;
	var res = nlapiRequestURL(url, params);
	if (res && res.getBody) {
		return res.getBody();	
	}
	return '';
};

/**
 * Validate Field function for Notification
 * 
 */
function ep_SaveRecord() {
	var res = true;

	var val = nlapiGetFieldValue('custentity_2663_email_address_notif');
	
	if(val){
			
		var emailRec = val.trim();
		var testEmail = /[,\[\]\"\(\)\&]+/;
		if(testEmail.test(emailRec)){
			alert("Please use semicolon to separate emails.");
			return false;
		}
		
		if(emailRec.length > 0){
			var emailRecs = emailRec.split(';');
			var emails = [];
			
			for(var k = 0; k < emailRecs.length; k++){
				emails.push(emailRecs[k].trim());
			}
			
			for(var j = 0; j < emails.length; j++){
				res = checkemail(emails[j]);
				if(!res){
					return res;
				}
				
			}
		}
	}
    return res;
	
}