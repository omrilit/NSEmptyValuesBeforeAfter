/**
 * Copyright © 2014, 2019, Oracle and/or its affiliates. All rights reserved.
 */

var vatvalns = vatvalns || {};
vatvalns.Class = {};

var _clientSideObject;

function pageInit(type) {
	try {
		_clientSideObject = new vatvalns.Class.MainApp();
		setFieldVisibility();
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		nlapiLogExecution("ERROR", "pageInit", errorMsg);
	}
}

function validateField(type, name, linenum) {
	try {
		if (_clientSideObject == null) {
			return true;
		}
		return (_clientSideObject.validateField(type, name, linenum));
	} catch (ex) {
		var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
		alert(errorMsg);
		nlapiLogExecution("ERROR", "validateField", errorMsg);
	}
}


function onFieldChanged(type, name, linenum) {
    if (name == 'subsidiary') {
    	setFieldVisibility();
    }
}

function setFieldVisibility() {
	var context = nlapiGetContext();
	this.isOneWorld = (context.getSetting('FEATURE', 'SUBSIDIARIES') === 'T');
	this.isUi = (context.getExecutionContext() === 'userinterface');
	this.SUBSIDIARY_CACHE = 'custpage_itr_subsidiarycache';
	this.DIC_FIELD_NAME = 'custentity_dic';
	this.ICO_FIELD_NAME = 'custentity_ico';
	this.SUPPORTED_FIELDS_BY_COUNTRY = {		
			'SK': [this.DIC_FIELD_NAME, this.ICO_FIELD_NAME],
	};
	
	var viewBag = new ITR.ViewBag();
	this.subCache = viewBag.GetValue(this.SUBSIDIARY_CACHE);
	
    if (!canUpdateVisibility()) {
        return;
    }

    var country = getCountry();
    nlapiSetFieldDisplay(this.DIC_FIELD_NAME, isFieldSupported(country, this.DIC_FIELD_NAME));
    nlapiSetFieldDisplay(this.ICO_FIELD_NAME, isFieldSupported(country, this.ICO_FIELD_NAME));
}

function canUpdateVisibility(nsForm, nsType) {
	return (this.isOneWorld && this.isUi) ? true: false;
}

function getCountry(subCache) {
	try {
		var subId = nlapiGetFieldValue('subsidiary');
	    if(!this.subCache) {
	    	return '';
	    }
	    return this.subCache[subId] || '';
	}
	catch(ex) {
		nlapiLogExecution('ERROR', 'getCountry', ex.toString());
		return '';
	}
}

function isFieldSupported(country, fieldName){
	if(this.SUPPORTED_FIELDS_BY_COUNTRY) {
		var fieldsByCountry = this.SUPPORTED_FIELDS_BY_COUNTRY[country];
		if (fieldsByCountry && fieldsByCountry instanceof Array &&  
			fieldsByCountry.indexOf(fieldName) !== -1)
			return true;
	}
	return false;
};

vatvalns.Class.MainApp = function() {
	this.validateField = function(type, name, linenum) {
		try {
			if (name == 'vatregnumber') {
				// check for a default billing address's country.
				var addressesCtr = nlapiGetLineItemCount('addressbook');
				var countryCode = "";
				for (var i = 0; i < addressesCtr; i++) {
					var defaultBillingAddressTag = nlapiGetLineItemValue('addressbook', 'defaultbilling', i + 1);
					if (defaultBillingAddressTag != 'T') {
						continue;
					}
					nlapiSelectLineItem('addressbook', i + 1);
					countryCode = nlapiGetCurrentLineItemValue('addressbook', 'country');
					break;
				}

				// if countryCode at this point is still empty...rely on the vatregno format to get country...
				var vatprefix = '';
				var regno = trim(nlapiGetFieldValue(name));
				if (regno != null && regno != "") {
					
					//check if the regno starts with any of the countries that can have letters
					//as the 1st character of the registration number (FR, ES, AT)
					//if this is true, then prefixLength will always be 2
					var countryExp = /^(FR|AT|ES)/i;
					var isStartWithChar = countryExp.test(regno);
					
					//find the 1st numeric character in the regno
					var prefixLength = isStartWithChar ? 2 : regno.search(/[0-9]/);	
					
					//find the prefix for the regno, and use it as the country code
					vatprefix = trim(regno.substr(0, prefixLength)).toUpperCase();
					if (countryCode == "" || countryCode != vatprefix) {
						countryCode = vatprefix;
					}

					// must depend on the vatregnumber format expected by the field. 
					// it is assume that the customer followed the suggestion of netsuite in the proper format of vatregnumber
					//
					/*
					 * NOTE: The line below is a default netsuite notice for the vatregnumber format. after providing the said message, netsuite still allow
					 * the user to move to the next field even if the vatregno is NOT valid.
						The VAT registration number you have entered is invalid. 
						Please make sure you have entered a valid VAT registration number beginning with your country prefix.
					*/

					if (VAT.Constants.EUNexuses[countryCode]) {
						var vatno = trim(regno.substr(2));	//for EU countries, prefix length is 2
						var url = ['http://ec.europa.eu/taxation_customs/vies/vatResponse.html?memberStateCode='];
						url.push(countryCode);
						url.push('&number=' + vatno);
						url.push('&traderName=&traderStreet=&traderPostalCode=&traderCity=&requesterMemberStateCode=&requesterNumber=&action=check&check=Verify');

						var taxsiteurl = url.join("");
						//"http://isvat.appspot.com/"+countryCode+"/"+vatno+"/";

						var respObject = nlapiRequestURL(taxsiteurl);
						var response = respObject.getBody();

						if (response.indexOf('invalidStyle') > -1) {
						    var strMsgs = JSON.parse(nlapiGetFieldValue('custpage_cs_msgs'));
							alert(strMsgs['ERR_INVALID_VATREGNO'].replace('{0}', regno));
						}
					}
				}
			}

			return true;
		} catch (ex) {
			var errorMsg = ex.getCode != null ? ex.getCode() + ': ' + ex.getDetails() : 'Error: ' + (ex.message != null ? ex.message : ex);
			nlapiLogExecution("ERROR", "vatvalns.Class.MainApp.validateField", errorMsg);
		}
	}
}