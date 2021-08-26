/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @author alaurito
 */

/**
 * Revision History:
 * 
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/06/08  199331         1.00.2011.05.27.01      Bank details for DD file formats
 * 2011/06/30  200531         1.03.2011.07.01.02      Update setting of custom form to avoid
 *                                                    infinite loop when loading the page
 * 2011/10/19  207693         1.15.2011.10.20.1       Include CBI Collections in IBAN validation
 * 2011/10/26  208116         1.15.2011.10.20.1       Removed alert message when IBAN is invalid
 * 2011/10/27  208503         1.15.2011.10.27.4       Add US Market Requirements - AP (ACH - CCD/PPD)
 * 2011/11/03  208574         1.15.2011.10.27.4       Remove use of javascript array methods indexOf
 *                                                    and forEach
 * 2011/11/08  208793         1.15.2011.10.27.4       Fix unexpected error due to undefined variable
 * 2011/12/05  210254         1.16.2011.11.10.3       Set the hidden file format field value 
 * 2011/12/06  210602         1.17.2011.12.08.2       Add US Market Requirements - AP (ACH - CTX (Free Text))
 * 2011/12/19  210982         1.17.2011.12.08.3       Add DE Market Requirements - AP (DTAUS)
 *             211425         1.17.2011.12.08.3       Add DE Market Requirements - AR (DTAUS)
 * 2012/01/11  212325         1.19.2012.01.12.1       Perform checking of IBAN field for DTAUS format
 * 2012/01/17  212325         1.19.2012.01.12.1       Move checking of DTAUS fields to field validator
 * 2012/03/08  217041         GPM Beta - 1.19.2       Support edition control
 * 2012/07/17  225904         1.22.3       			  Add validation for Raiffeisen Domestic Transfer format
 * 2013/03/01  244881 		  2.00.10	  			  Add support for ANZ EFT
 * 2013/03/08  235816   	  2.00.3				  Add support for ASB EFT
 * 2013/03/27  235777         2.00.2				  Add support for ACH - PPD DD Format
 * 2013/05/14  251008         2.00.16.2013.00.00.0    Fix for ANZ account number validation
 * 2013/05/20  244071		  2.00.10				  Add validation for BR Registration Type and Registration Number
 * 2013/07/24  254155         2.00.17				  Updated SEPA Credit Transfer (ABN AMRO) based on FRD changes
 * 2013/07/24  245723		  2.00.10				  Add support for commission transactions
 * 2013/08/01  242348 	      2.00.8				  Add support for Westpac-Deskbank EFT format
 * 2013/08/05  240583 	      1.01.2012.11.29.1		  Add support for SEPA Credit Transfer (Germany) format
 * 2013/08/12  219495 		  1.22.1.2012.05.10.1  	  Add support for JP Morgan Freeform GMT
 * 2013/09/23  255091		  2.00.18				  Add support for SEPA Direct Debit (Germany)
 * 2013/09/25  264396		  3.00.2013.09.26.4		  Fix for Original Reference Mandate field not being disabled
 * 2013/12/12  256855 		  3.00.00     			  Add support for SEPA Direct Debit (CBI)
 * 2013/12/18  263344	      3.01.1.2013.12.24.1     Source country check code for SEPA CT Luxembourg  
 * 2014/01/15  275374	      3.01.1.2013.12.24.1     Remove entity country check field for SEPA CT Luxembourg
 * 2014/03/14  236313 		       			          Add support for ABO format
 * 2014/03/18  244069 		  3.01.1.2014.03.18.3     Add support for DTAZV format
 * 2014/03/20  283801 		  3.01.3.2014.03.11.2     Fix auto populate logic error on bank account number for ABO format 
 * 2014/03/25  283978 		  3.01.3.2014.03.11.2     Set payment description field to uppercase for ABO format 
 * 2014/07/18  288589 		  3.02.3				  Add Bank Account Number field for DTAZV format
 * 2014/09/18  309759 		  4.00.3     			  Toggle between account number and iban fields for Barclays MT103
 */


function saveRecord() {
    // check if there are primary and secondary details
    var paymentFileFormat = nlapiGetFieldText('custpage_2663_entity_file_format');
    var searchResultsPrimary;
    var parentRecType = getParentRecType();
    
    if (parentRecType) {
        var parentRecField = 'custrecord_2663_parent_' + parentRecType;
        var parentRec = nlapiGetFieldValue(parentRecField);
        if (parentRec) {
            var primaryFilters = [];
            primaryFilters.push(new nlobjSearchFilter(parentRecField, null, 'anyof', parentRec));
            primaryFilters.push(new nlobjSearchFilter('custrecord_2663_entity_bank_type', null, 'anyof', '1')); // primary type
            if (nlapiGetRecordId()) {
                primaryFilters.push(new nlobjSearchFilter('internalid', null, 'noneof', nlapiGetRecordId()));        // except this record
            }
            searchResultsPrimary = nlapiSearchRecord('customrecord_2663_entity_bank_details', null, primaryFilters);
        }
    }
    
    var entityDetailType = nlapiGetFieldValue('custrecord_2663_entity_bank_type');
    // display warning message if setting the type to primary
    if (searchResultsPrimary && entityDetailType == '1') {
        alert('Note: Setting this bank detail as primary will change other details to secondary.');
    }
    // display warning message if setting the type to secondary
    else if (!searchResultsPrimary && entityDetailType == '2') {
        alert('Note: There are no primary bank details for this entity. Please set one bank detail as primary to include this entity for EFT.');
    }
    
    // set the hidden file format field
    nlapiSetFieldValue('custrecord_2663_entity_file_format', nlapiGetFieldValue('custpage_2663_entity_file_format'));
    
    var errMsg = '';
    
    if (paymentFileFormat == 'Zengin') {
        saveRecord_Zengin();
    }
    
    if (paymentFileFormat == 'J.P. Morgan Freeform GMT') {
    	errMsg = saveRecord_JPMorganFreeformGMT();
    }
    
    if (paymentFileFormat == 'SEPA Direct Debit (Germany)' || paymentFileFormat == 'SEPA Direct Debit (CBI)') {
    	errMsg = saveRecord_SEPA_DD();
    }
    
    if (paymentFileFormat == 'DTAZV' || paymentFileFormat == 'Barclays MT103') {
        if(!nlapiGetFieldValue('custrecord_2663_entity_iban') && !nlapiGetFieldValue('custrecord_2663_entity_acct_no')){
        	errMsg = paymentFileFormat == 'Barclays MT103' ? 
    			'Please enter value for IBAN or Account Number.' :
				'Please enter value for IBAN or Bank Account Number.';	
        }
    }
    
    if (!isNullorEmpty(errMsg)) {
    	alert(errMsg);
    	return false;
    }

    return true;
}

function saveRecord_Zengin(){
    var ediFieldStr = nlapiGetFieldValue('custrecord_2663_edi');
    var ediValueStr = '';
    var custcodeStr = '';
    
    if (ediFieldStr == 'T') {
        ediValueStr = 'Y';
        custcodeStr = nlapiGetFieldValue('custrecord_2663_customer_code');
    }
    
    nlapiSetFieldValue('custrecord_2663_edi_value', ediValueStr);
    nlapiSetFieldValue('custrecord_2663_customer_code', custcodeStr);
}

function saveRecord_JPMorganFreeformGMT() {
	var errMsg = '';
	var bankCode = nlapiGetFieldValue('custrecord_2663_entity_bic');
	
    if (!isNullorEmpty(bankCode) && (bankCode.length == 8 || bankCode.length == 11)) {
    	var countryCode = bankCode.substring(4,6);
    	
    	if (countryCode == 'SA' || countryCode == 'LB') {
    		if (isNullorEmpty(nlapiGetFieldValue('custrecord_2663_entity_iban'))) {
    			errMsg = 'Please enter value(s) for: IBAN';
    		}
    	}
    }
    
    return errMsg;
}

function saveRecord_SEPA_DD() {
	var errMsg = '';
	var missingFields = new Array();
	var refAmendment = nlapiGetFieldText('custrecord_2663_entity_ref_amended');
	
    if (!isNullorEmpty(refAmendment)) {
    	switch(refAmendment) {
	    	case 'Original Mandate Identification' :
	    		if (isNullorEmpty(nlapiGetFieldValue('custrecord_2663_entity_issuer_num'))) {
	    			missingFields.push('Original Reference Mandate');
	    		}
	    		break;
		    case 'Original Debtor Account' :
				if (isNullorEmpty(nlapiGetFieldValue('custrecord_2663_entity_acct_no'))) {
					missingFields.push('Original Debtor IBAN');
				}
				break;
		    case 'Original Creditor ID' :
		    	if (isNullorEmpty(nlapiGetFieldValue('custrecord_2663_entity_acct_name'))) {
					missingFields.push('Original Creditor Name');
				}
		    	if (isNullorEmpty(nlapiGetFieldValue('custrecord_2663_entity_bank_no'))) {
					missingFields.push('Original Creditor ID');
				}
		    	break;
	    }
    	
    	if (missingFields.length > 0) {
    		
    		errMsg = 'Please enter value(s) for: ' + missingFields[0];
    		
    		for (var i = 1; i < missingFields.length; i++) {
    			errMsg += ', ' + missingFields[i];
    		}
    	}
	}
    
    return errMsg;
}

function fieldChanged(type, name){
    var paymentFileFormat = nlapiGetFieldText('custpage_2663_entity_file_format');
    // set form depending on file format
    if (name == 'custpage_2663_entity_file_format') {
        var newURL = location.href;
        setWindowChanged(window, false);
        var paramIndex = newURL.indexOf('custparam_2663_init_file_format') - 1; 
        if (paramIndex > -1) {
            newURL = newURL.substring(0, paramIndex);
        }
        newURL += ['&custparam_2663_init_file_format=', nlapiGetFieldValue('custpage_2663_entity_file_format')].join('');
        location.assign(newURL);
    }
    
    if (paymentFileFormat == 'Zengin') {
        fieldChanged_Zengin(name);
    } else if ((paymentFileFormat == 'CNAB 240') && name.indexOf('custrecord_2663_customer_code') > -1) {
	
		// toggle pre-filling of Registration Number
	    if (nlapiGetFieldValue('custrecord_2663_customer_code') == '0') {
	    	nlapiSetFieldValue('custrecord_2663_entity_bban', '00000000000000');
	    }
    } else if ((paymentFileFormat == 'J.P. Morgan Freeform GMT') && name.indexOf('custrecord_2663_entity_bic') > -1) {
	
    	var bankCode = nlapiGetFieldValue('custrecord_2663_entity_bic');
    	
	    if (!isNullorEmpty(bankCode) && (bankCode.length == 8 || bankCode.length == 11)) {
	    	var countryCode = bankCode.substring(4,6);
	    	nlapiSetFieldValue('custrecord_2663_entity_country_code', countryCode);
	    	
	    	if (countryCode == 'SA' || countryCode == 'LB') {
	    		nlapiDisableField('custrecord_2663_entity_iban', false);
	    	} else {
	    		nlapiSetFieldValue('custrecord_2663_entity_iban', '', false, false);
	    		nlapiDisableField('custrecord_2663_entity_iban', true);
	    	}
	    }
    } else if ((paymentFileFormat == 'SEPA Direct Debit (Germany)' || paymentFileFormat == 'SEPA Direct Debit (CBI)') && name.indexOf('custrecord_2663_entity_ref_amended') > -1) {
    	fieldChanged_SEPA_DD(name);
    } else if (paymentFileFormat == 'ABO') {
        if (name == 'custrecord_2663_entity_acct_no'){
            var acctNo = nlapiGetFieldValue('custrecord_2663_entity_acct_no');
                        
            // parse two parts of account number
            var part1 = acctNo.indexOf('-') > -1 ? acctNo.substr(0,acctNo.indexOf('-')) : '';
            var part2 = acctNo.lastIndexOf('-') > -1 ? acctNo.substr(acctNo.lastIndexOf('-') + 1) : acctNo;
            
            // apply leading zeros
            var strUtil = new _2663.StringUtil();
            part1 = strUtil.applyPadding('left','0',part1,6);
            part2 = strUtil.applyPadding('left','0',part2,10);
            
            // update account number
            nlapiSetFieldValue('custrecord_2663_entity_acct_no', part1 + '-' + part2, false, true);
        }
        else if (name == 'custrecord_2663_entity_payment_desc'){
            // convert account name to upper case (except ʃ character)
            var paymentDesc = nlapiGetFieldValue('custrecord_2663_entity_payment_desc');
            var converted = '';
            for (var i = 0, ii = paymentDesc.length; i < ii; i++){
                var ch = paymentDesc.charAt(i);
                converted += (ch != 'ʃ') ? ch.toUpperCase() : ch;                 
            }
            nlapiSetFieldValue('custrecord_2663_entity_payment_desc', converted, false);
        }
    } else if (paymentFileFormat == 'DTAZV') {
    	if (name.indexOf('custrecord_2663_entity_acct_no') > -1) {
    		if(nlapiGetFieldValue('custrecord_2663_entity_acct_no') != ''){
    			nlapiSetFieldDisabled('custrecord_2663_entity_iban', true);
    			nlapiSetFieldDisabled('custrecord_2663_entity_country_code', false);
    		} else{
    			nlapiSetFieldDisabled('custrecord_2663_entity_iban', false);
    		}
    	} else if (name.indexOf('custrecord_2663_entity_iban') > -1) {
    		if(nlapiGetFieldValue('custrecord_2663_entity_iban') != ''){
    			nlapiSetFieldDisabled('custrecord_2663_entity_acct_no', true);
    			nlapiSetFieldDisabled('custrecord_2663_entity_country_code', true);
    		} else{
    			nlapiSetFieldDisabled('custrecord_2663_entity_acct_no', false);
    			nlapiSetFieldDisabled('custrecord_2663_entity_country_code', false);
    			nlapiSetFieldValue('custrecord_2663_entity_country_code', '', false);
    		}
    	}
    	
    	if(name.indexOf('custrecord_2663_entity_country_code') > -1){
    	    nlapiSetFieldValue('custrecord_2663_entity_country_code', (nlapiGetFieldValue('custrecord_2663_entity_country_code') || '').toUpperCase(), false);
    	}
    } else if (paymentFileFormat == 'Barclays MT103') {
    	if (name.indexOf('custrecord_2663_entity_acct_no') > -1) {
    		nlapiSetFieldDisabled('custrecord_2663_entity_iban', nlapiGetFieldValue('custrecord_2663_entity_acct_no') != '');
    	} else if (name.indexOf('custrecord_2663_entity_iban') > -1) {
    		var iban = nlapiGetFieldValue(name) || '';
    		nlapiSetFieldDisabled('custrecord_2663_entity_acct_no', iban != '');
    		nlapiSetFieldValue(name, iban.toUpperCase(), false);
    	}
    }
}

function initForm(){
    var paymentFileFormat = nlapiGetFieldText('custpage_2663_entity_file_format');
	if (paymentFileFormat == 'DTAZV' || paymentFileFormat == 'Barclays MT103') {
		var acctNum = nlapiGetFieldValue('custrecord_2663_entity_acct_no');
		var iban = nlapiGetFieldValue('custrecord_2663_entity_iban');
		
		nlapiSetFieldDisabled('custrecord_2663_entity_iban', acctNum && !iban);
		nlapiSetFieldDisabled('custrecord_2663_entity_acct_no', iban && !acctNum);
		
		if (paymentFileFormat == 'DTAZV') {
			nlapiSetFieldDisabled('custrecord_2663_entity_country_code', iban && !acctNum);	
		}
	}
}

function validateField(type, name) {
    var paymentFileFormat = nlapiGetFieldText('custpage_2663_entity_file_format');
    if (paymentFileFormat == 'CBI Payments' || paymentFileFormat == 'AEB - Norma 34' || paymentFileFormat == 'CBI Collections' ||
		paymentFileFormat == 'SEPA Credit Transfer (ABN AMRO)' || paymentFileFormat == 'SEPA Credit Transfer (Germany)' || paymentFileFormat == 'DTAZV'){
    	validateField_IBAN(name, paymentFileFormat);
    }
	else if (paymentFileFormat == 'ACH - CCD/PPD' || paymentFileFormat == 'ACH - CTX (Free Text)' || paymentFileFormat == 'ACH - PPD') {
		validateField_ACH(name);
    }
	else if (paymentFileFormat == 'DTAUS') {
		validateField_DTAUS(name);
    } 
	else if (paymentFileFormat == 'Raiffeisen Domestic Transfer') {
    	validateField_BBAN(name);
    } else if (paymentFileFormat == 'ANZ') {
    	if (name.indexOf('custrecord_2663_entity_bban') > -1) {
    		//pad the account number suffix if length is less than 16
        	var accountNum = nlapiGetFieldValue('custrecord_2663_entity_bban');
        	if (!isNullorEmpty(accountNum) && (accountNum.length == 15)) {
        		var newAccountNum = accountNum.substring(0, 13) + '0' + accountNum.substring(13);
        		nlapiSetFieldValue('custrecord_2663_entity_bban', newAccountNum, false, false);
        	} 
    	}
    } else if (paymentFileFormat == 'ASB' || paymentFileFormat == 'Westpac - Deskbank') {
    	validateField_NZAccountNumber(paymentFileFormat, name);
    }
    
    return true;
}

function validateField_IBAN(name, paymentFileFormat){
    if (name == 'custrecord_2663_entity_iban') {
    	var ibanString = nlapiGetFieldValue(name);
		
    	if (paymentFileFormat == 'SEPA Credit Transfer (ABN AMRO)' || paymentFileFormat == 'SEPA Credit Transfer (Germany)') {
    		if (/[a-z]/.test(ibanString)) {
    			ibanString = ibanString.toUpperCase();
       		 	nlapiSetFieldValue(name, ibanString, false);
       	 	}
    	}
    	
        var iban = new _2663.IBAN(ibanString);
        if (iban.getValue() && iban.isValid()) {
        	var countryCode = paymentFileFormat == 'DTAZV' ? iban.getCountryCode().toUpperCase() : iban.getCountryCode();
            nlapiSetFieldValue('custrecord_2663_entity_country_code', countryCode, false);
            if(paymentFileFormat != 'DTAZV'){
		        nlapiSetFieldValue('custrecord_2663_entity_iban_check', iban.getCheckDigits(), false);
		        //Set derived values
		        if (paymentFileFormat == 'CBI Payments' || paymentFileFormat == 'CBI Collections') {
		            nlapiSetFieldValue('custrecord_2663_entity_country_check', iban.getDerivedValue(1), false);
		            nlapiSetFieldValue('custrecord_2663_entity_bank_no', iban.getDerivedValue(2), false);
		            nlapiSetFieldValue('custrecord_2663_entity_branch_no', iban.getDerivedValue(3), false);
		            nlapiSetFieldValue('custrecord_2663_entity_acct_no', iban.getDerivedValue(4), false);
		        }
		        else if (paymentFileFormat == 'AEB - Norma 34') {
		            nlapiSetFieldValue('custrecord_2663_entity_bank_no', iban.getDerivedValue(1), false);
		            nlapiSetFieldValue('custrecord_2663_entity_branch_no', iban.getDerivedValue(2), false);
		            nlapiSetFieldValue('custrecord_2663_entity_country_check', iban.getDerivedValue(3), false);
		            nlapiSetFieldValue('custrecord_2663_entity_acct_no', iban.getDerivedValue(4), false);
		        }
            }
        }
    }
}

function validateField_BBAN(name){
    if (name == 'custrecord_2663_entity_bban') {
        var bban = new _2663.BBAN('HU', nlapiGetFieldValue(name));
        if (bban.getValue() && bban.isValid()) {
            //Set derived values
        	nlapiSetFieldValue('custrecord_2663_entity_bank_no', bban.getDerivedValue('bank_number'), false);
            nlapiSetFieldValue('custrecord_2663_entity_branch_no', bban.getDerivedValue('branch_number'), false);
            nlapiSetFieldValue('custrecord_2663_entity_acct_no', bban.getDerivedValue('account_number'), false);
        }
    }
}

function validateField_ACH(name){
    if (name == 'custrecord_2663_entity_bank_no') {
        var ach = new _2663.ACH(nlapiGetFieldValue(name));
        if (ach.isValidRoutingNumber()) {
            nlapiSetFieldValue('custrecord_2663_entity_processor_code', ach.getFederalReserveRoutingSymbol());
            nlapiSetFieldValue('custrecord_2663_entity_bank_code', ach.getABAInstitutionIdentifier());
            nlapiSetFieldValue('custrecord_2663_entity_country_check', ach.getCheckDigit());
        }
        else {
            nlapiSetFieldValue('custrecord_2663_entity_processor_code', '');
            nlapiSetFieldValue('custrecord_2663_entity_bank_code', '');
            nlapiSetFieldValue('custrecord_2663_entity_country_check', '');
        }
    }
}

function validateField_DTAUS(name){
    if (name == 'custrecord_2663_entity_bank_no' || name == 'custrecord_2663_entity_acct_no') {
        var bankNumber = nlapiGetFieldValue('custrecord_2663_entity_bank_no');
        var accountNumber = nlapiGetFieldValue('custrecord_2663_entity_acct_no');
        
        var iban = '';
        if (bankNumber && accountNumber) {
            var ibanGen = new _2663.IBANGenerator();
            iban = ibanGen.GenerateFromBankAndAccountNum(bankNumber, accountNumber, 'DE');
        }
        nlapiSetFieldValue('custrecord_2663_entity_iban', iban);
    }
}

function validateField_NZAccountNumber(fileFormat, name){
	var prefix = 'custrecord_2663_entity_';

	if (name ==  prefix + 'bban') {
    	//pad the account number suffix if length is less than 16
    	var accountNum = nlapiGetFieldValue(prefix + 'bban');
    	
    	if (!isNullorEmpty(accountNum)) {
    		//populate other fields
        	var nzAcctNo = new _2663.NZAccountNumber(accountNum);
    		nlapiSetFieldValue(prefix + 'bank_no', nzAcctNo.getBankNumber());
    		nlapiSetFieldValue(prefix + 'branch_no', nzAcctNo.getBranchNumber());
    		nlapiSetFieldValue(prefix + 'acct_no', nzAcctNo.getUniqueAccountNumber());
    		nlapiSetFieldValue(prefix + 'acct_suffix', nzAcctNo.getBankAccountSuffix());
    	}
    }
}

function fieldChanged_Zengin(name){
    if (name == 'custrecord_2663_edi') {
        if (nlapiGetFieldValue('custrecord_2663_edi') == 'F') {
            nlapiSetFieldValue('custrecord_2663_customer_code', '');
        }
        
        var isCustCodeDisabled = nlapiGetFieldValue('custrecord_2663_edi') == 'F' ? true : false;
        nlapiSetFieldDisabled('custrecord_2663_customer_code', isCustCodeDisabled);
    }
}

function fieldChanged_SEPA_DD(name){
    if (name == 'custrecord_2663_entity_ref_amended') {
    	var refAmendment = nlapiGetFieldText(name);
	    	switch (refAmendment) {
		    	case 'Original Mandate Identification': {
                    nlapiSetFieldDisabled('custrecord_2663_entity_acct_name', true);		            
		            nlapiSetFieldDisabled('custrecord_2663_entity_acct_no', true);                    
		            nlapiSetFieldDisabled('custrecord_2663_entity_bank_no', true);
		            nlapiSetFieldDisabled('custrecord_2663_entity_issuer_num', false);
                    
                    nlapiSetFieldValue('custrecord_2663_entity_acct_name', '');
                    nlapiSetFieldValue('custrecord_2663_entity_acct_no', '');
                    nlapiSetFieldValue('custrecord_2663_entity_bank_no', '');                    
		            break;
		    	}
		    	case 'Original Debtor Account' : {
		            nlapiSetFieldDisabled('custrecord_2663_entity_acct_name', true);
		            nlapiSetFieldDisabled('custrecord_2663_entity_acct_no', false);
		            nlapiSetFieldDisabled('custrecord_2663_entity_bank_no', true);
		            nlapiSetFieldDisabled('custrecord_2663_entity_issuer_num', true);

                    nlapiSetFieldValue('custrecord_2663_entity_acct_name', '');                    
                    nlapiSetFieldValue('custrecord_2663_entity_bank_no', '');
                    nlapiSetFieldValue('custrecord_2663_entity_issuer_num', '');		            
		    		break;
		    	}
		    	case 'Original Creditor ID' : {
		    		nlapiSetFieldDisabled('custrecord_2663_entity_acct_name', false);
		    		nlapiSetFieldDisabled('custrecord_2663_entity_acct_no', true);
		    		nlapiSetFieldDisabled('custrecord_2663_entity_bank_no', false);		    		
		            nlapiSetFieldDisabled('custrecord_2663_entity_issuer_num', true);
                    
                    nlapiSetFieldValue('custrecord_2663_entity_acct_no', '');                    
                    nlapiSetFieldValue('custrecord_2663_entity_issuer_num', '');			            
		    		break;
		    	}
		    	default : {
		    		nlapiSetFieldDisabled('custrecord_2663_entity_acct_name', true);
		            nlapiSetFieldDisabled('custrecord_2663_entity_acct_no', true);
		            nlapiSetFieldDisabled('custrecord_2663_entity_bank_no', true);
		            nlapiSetFieldDisabled('custrecord_2663_entity_issuer_num', true);

                    nlapiSetFieldValue('custrecord_2663_entity_acct_name', '');
                    nlapiSetFieldValue('custrecord_2663_entity_acct_no', '');
                    nlapiSetFieldValue('custrecord_2663_entity_bank_no', '');
                    nlapiSetFieldValue('custrecord_2663_entity_issuer_num', '');			            
		    		break;
		    	}

	    }
    }
}

function getParentRecType() {
    var parentRecType = '';
    if (nlapiGetContext().getFeature('PARTNERCOMMISSIONS') && nlapiGetFieldValue('custrecord_2663_parent_partner')) {
        parentRecType = 'partner';
    }
    else if (nlapiGetFieldValue('custrecord_2663_parent_employee')) {
        parentRecType = 'employee';
    }
    else if (nlapiGetFieldValue('custrecord_2663_parent_customer')) {
        parentRecType = 'customer';
    }
    else if (nlapiGetFieldValue('custrecord_2663_parent_cust_ref')) {
        parentRecType = 'cust_ref';
    }
    else if (nlapiGetFieldValue('custrecord_2663_parent_vendor')) {
        parentRecType = 'vendor';
    }
    return parentRecType;
}