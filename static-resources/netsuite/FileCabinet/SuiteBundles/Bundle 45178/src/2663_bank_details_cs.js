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
 * 2011/05/20  198389         1.00.2011.05.20.04      Change loading of validation to AJAX call
 * 2011/06/08  199331         1.00.2011.05.27.01      Bank details for DD file formats
 *             198195         1.00.2011.05.20.04      Field for company name in e-mail subject
 * 2011/08/18  203913         1.07.2011.08.18.02      France CFONB support (set ")1" value if SIRET
 *                                                    has a value)
 * 2011/09/12  205257         1.11.2011.09.15.01      Restrict subsidiary view based on user's
 *                                                    permissions
 * 2011/09/13  205327         1.12.2011.09.15.01      Set correct field display types
 * 2011/09/16  205520         1.12.2011.09.15.02      CBI Payments Processing
 * 2011/09/19  205014         1.10                    Set flags for making DCL fields mandatory
 * 2011/09/20  205014         1.10                    Set mandatory option in non-OW accounts
 * 2011/09/21  205833         1.14.2011.09.22.1       Remove use of map to prevent error in IE
 *             205911         1.14.2011.09.22.2       Remove error for DCL when creating new record;
 *                                                    Use correct error message for mandatory fields
 * 2011/10/19  207693         1.15.2011.10.20.1       Include CBI Collections in IBAN validation                                                    
 * 2011/10/26  208116         1.15.2011.10.20.1       Removed alert message when IBAN is invalid
 * 2011/10/27  208503         1.15.2011.10.27.4       Add US Market Requirements - AP (ACH - CCD/PPD)
 * 2011/11/03  208574         1.15.2011.10.27.4       Remove use of javascript array methods indexOf
 * 													  and forEach
 * 2011/12/06  210602         1.17.2011.12.08.2       Add US Market Requirements - AP (ACH - CTX (Free Text))
 * 2011/12/19  210982         1.17.2011.12.08.3       Add DE Market Requirements - AP (DTAUS)
 *             211425         1.17.2011.12.08.3       Add DE Market Requirements - AR (DTAUS)
 * 2012/01/11  212325         1.19.2012.01.12.1       Perform checking of IBAN field for DTAUS format
 * 2012/01/17  212325         1.19.2012.01.12.1       Move checking of DTAUS fields to field validator
 * 2012/01/31  213961         1.19.2012.01.12.1       Rollback Positive Pay code
 * 2012/02/02  212974         1.19.2012.01.19.1       Support for Positive Pay file option
 * 2012/02/07  214577         1.19.2012.01.19.1       Replace folder id field with folder list
 * 2012/03/08  217041         GPM Beta - 1.19.2       Support edition control
 * 2012/07/17  225904         1.22.3       			  Add validation/value derivation for Raiffeisen Domestic Transfer format
 * 2012/08/01  227868         2.00.1       			  Add Batch processing related validation and Batch schedule fields display toggling
 * 2012/08/13  227868         2.00.1       			  Remove previous schedule fields display toggling and add close batch button and
 * 													  validation for Process Bills Automatically flag
 * 2012/08/14  227868         2.01.1                  Add redirect to bank detail record after closing batches	
 * 2012/08/28  228840         2.01.1                  Add confirm msg before saving template selected
 * 2012/08/30  229817         2.01.1                  Do not allow EFT template update if there are unprocessed batches
 * 2012/09/10  227868         2.01.1                  Add event handling to enable/disable Show Summarized field 
 * 2012/09/14  231030         2.01.1                  Check if nlapiGetRecordId() has value
 * 2012/09/25  231741         2.01.1                  Set fields custrecord_2663_eft_batch and custrecord_2663_summarized to F
 * 													  during creation
 * 2012/10/25  233946         2.01.1                  Set auto ap when process bills automatically is checked;
 *                                                    add checking for duplicate setting of sub + format + ap when bills
 *                                                    are processed automatically
 * 2012/11/19  235656         2.01.1                  Remove summarized field as filter when checking for duplicate batch processing
 * 													  settings
 * 2012/11/19  235566         2.01.1                  Add alert message when changing AP on the batch processing settings
 * 2012/11/20  237873         2.00.3                  Add confirmation message before setting to a multicurrency format
 * 2012/12/17  237861         2.00.3                  Use custrecord_2663_eft_batch in validation instead of custpage_2663_eft_batch
 * 2012/12/19  238476         2.00.5                  Add validation in save record instead of validateField
 * 2013/01/08  239643         2.00.6                  Add checking on Include All Currencies field of Payment File Format record
 * 2013/01/10  239812         2.00.6                  Add template to multicurrency formats array only if Include All Currencies field is checked 
 * 2013/02/07  238616		  2.00.8				  Add logic for checking HSBC/SAGE or Service User Number for BACS formats
 * 2013/03/01  244881 		  2.00.10	  			  Add support for ANZ EFT
 * 2013/03/07  235824  		  2.00.3				  Support 999 block padding for ACH formats	
 * 2013/03/08  235816   	  2.00.3				  Add support for ASB EFT
 * 2013/03/19  235824   	  2.00.3				  Block padding checkbox was moved to format details instead.
 * 2013/04/15  248888   	  2.00.12				  Add validateLine function to validate Batch Detail lines
 * 2013/04/17  249106   	  2.00.13				  Check if entered Batch Detail Name is already in use
 * 2013/04/17  249106   	  2.00.13				  Limit active batch details to 10
 * 2013/04/23  235777         2.00.2				  Add support for ACH - PPD DD Format
 * 2013/05/06  250624		  2.00.13				  Remove validation for Batch Detail priority	
 * 2013/05/10  249631		  2.00.13				  Add validation for unique Saved search on Batch Details
 * 2013/05/10  250515		  2.00.13				  Add validation to disallow inactivating Main Batch detail
 * 2013/05/14  251008         2.00.16.2013.00.00.0    Fix for ANZ account number validation
 * 2013/05/20  244071		  2.00.10				  Add validation for BR Registration Type and Registration Number
 * 2013/07/23  235778 		  2.00.2				  Add support for BACS DD
 * 2013/07/24  254155         2.00.17				  Updated SEPA Credit Transfer (ABN AMRO) based on FRD changes  
 * 2013/08/01  242348 	      2.00.8				  Add support for Westpac-Deskbank EFT format
 * 2013/08/05  240583 	      1.01.2012.11.29.1		  Add support for SEPA Credit Transfer (Germany) format
 * 2013/08/12  219495 		  1.22.1.2012.05.10.1  	  Add support for JP Morgan Freeform GMT
 * 2013/09/19  263190 		  3.00.00				  Add validation for Approval Routing
 * 2013/09/26  263190 		  3.00.00				  Fix limit validations
 * 2013/10/05  265406 		  3.00.00				  Refactor code to use Payment File Administration record instead of Payment Batch 
 * 2013/10/22  266637 		  3.00.0.2013.10.24.1     Update approvalLevels checking when saving record
 * 2013/12/12  256853 		  3.00.00     			  Add support for SEPA Credit Transfer (CBI)
 * 2013/12/12  256855 		  3.00.00     			  Add support for SEPA Direct Debit (CBI)
 * 2013/12/17  263344	      3.01.1.2013.12.24.1     Source country check code for SEPA CT Luxembourg 
 * 2014/03/14  236313 		       			          Add support for ABO format
 * 2014/03/20  283801 		  3.01.3.2014.03.11.2     Fix auto populate logic error on bank account number for ABO format
 * 2014/03/21  229156 		       			          Add support for HSBC ISO 20022 (Singapore) format - set default value of country
 * 2014/03/25  283978 		  3.01.3.2014.03.11.2     Set account name field to uppercase for ABO format  
 * 2014/03/25  273472 		  3.00.3     			  Allow setting of Main batch detail to inactive
 * 2014/04/10  282812 		  3.01.3     			  Check if Payment Limit is less than or equal to zero
 * 2014/04/10  282815 		  3.01.3     			  Require next Approval Level setup when Payment Limit is set
 * 2014/04/10  282817 		  3.01.3     			  Check if higher Approval Levels have limit greater than lower ones
 * 2014/04/10  282818 		  3.01.3     			  Require at least Level 1 Approval to be setup
 * 2014/05/06  286826 		  3.01.3     			  Check approval routing levels only during edit mode
 * 2014/08/11  282817 		  3.01.3     			  Check if approval limit is greater that payment limit when record is saved
 * 2014/09/12  304869 		  4.00.3     			  Refactor function fieldChanged for format specific changes
 * 													  Extract country code from iban for SEPA Credit Transfer (HSBC)
 * 2014/09/18  309759 		  4.00.3     			  Toggle between account number and iban fields for Barclays MT103
 * 2014/09/18  310630  		  4.00.3     			  Add alert message when account number and iban fields for Barclays MT103 are both empty
 * 2014/10/08  312765                                 Set BIC to uppercase (HSBC Hong Kong)
 */

var _2663;

if (!_2663) 
    _2663 = {};

/**
 * Load the resources according to language preference
 * 
 * @param {Object} type
 */
function pageInit(type) {
	if (type == 'create' || type == 'edit') {
		if (!_2663.ResourceMgr) {
		    // set language preference
		    var lang = nlapiGetContext().getPreference('LANGUAGE');
			
			// load resource file and set ajax call flag to true
			_2663.ResourceMgr = new _2663.Resources.ClientResourceLoader();
			
			// place resource names to be retrieved delimited by '|' ; blank if all resources
			var resourceNames = 'err_bank_name_exists';
			
			// load resources
			_2663.ResourceMgr.LoadResources(lang, resourceNames);
		}
    
	    // set the print company name
	    if (isNullorEmpty(nlapiGetFieldValue('custrecord_2663_print_company_name'))) {
	        nlapiSetFieldValue('custrecord_2663_print_company_name', nlapiGetFieldValue('custrecord_2663_legal_name'));
	    }

	    // show summarized checkbox
        if (nlapiGetFieldValue('custrecord_2663_trans_marked') == 'T' && nlapiGetFieldValue('custpage_2663_eft_batch') == 'T') {
            nlapiDisableField('custpage_2663_summarized', false);
        }
        else {
            nlapiDisableField('custpage_2663_summarized', true);
        }
        
        // toggle enable of auto ap drop down
        nlapiDisableField('custpage_2663_auto_ap', nlapiGetFieldValue('custpage_2663_eft_batch') != 'T');
        
		if (type == 'edit') {
			// format specific changes
			// EFT
			var templateName = nlapiGetFieldText('custpage_2663_eft_template');
			var prefix = 'custpage_eft_custrecord_2663_';
			
			//toggle enable/disable of HSBC/SAGE and Service User Number fields for EFT
			if (templateName == 'BACS') {
				var bankCode = nlapiGetFieldValue(prefix + 'bank_code'); 
				var bankNum = nlapiGetFieldValue(prefix + 'bank_num');
				nlapiDisableField(prefix + 'bank_code', bankNum && !bankCode);
				nlapiDisableField(prefix + 'bank_num', bankCode && !bankNum);
			}
			
			// set default value for country field during initial setup
			if (templateName == 'HSBC ISO 20022 (Singapore)') {
                // initial setup = empty mandatory free-form text fields
				if (!nlapiGetFieldValue(prefix + 'acct_num')
                    && !nlapiGetFieldValue(prefix + 'bic')
                    && !nlapiGetFieldValue(prefix + 'bank_comp_id')
                    && !nlapiGetFieldValue(prefix + 'statement_name')                    
					&& !nlapiGetFieldValue(prefix + 'processor_code')					
                    ) {                    
                    nlapiSetFieldText(prefix + 'bank_country','Singapore');
				}
			}
			if (templateName == 'HSBC ISO 20022 (Hong Kong)') {
                // initial setup = empty mandatory free-form text fields
				if (!nlapiGetFieldValue(prefix + 'acct_num')
                    && !nlapiGetFieldValue(prefix + 'bic')
                    && !nlapiGetFieldValue(prefix + 'bank_code')
                    && !nlapiGetFieldValue(prefix + 'bank_comp_id')
                    && !nlapiGetFieldValue(prefix + 'statement_name')
					&& !nlapiGetFieldValue(prefix + 'processor_code')					
                    ) {                    
                    nlapiSetFieldText(prefix + 'bank_country','Hong Kong');
				}
			}
			
			//toggle enable/disable of Account Number adn IBAN fields for Barclays MT103
			if (templateName == 'Barclays MT103') {
				var acctNum = nlapiGetFieldValue(prefix + 'acct_num');
				var iban = nlapiGetFieldValue(prefix + 'iban');
				nlapiDisableField(prefix + 'acct_num', iban && !acctNum);
				nlapiDisableField(prefix + 'iban', acctNum && !iban);
			}

			//DD
			templateName = nlapiGetFieldText('custpage_2663_dd_template');
			prefix = 'custpage_dd_custrecord_2663_';
			//toggle enable/disable of HSBC/SAGE and Service User Number fields for DD
			if (templateName == 'BACS') {
				var bankCode = nlapiGetFieldValue(prefix + 'bank_code'); 
				var bankNum = nlapiGetFieldValue(prefix + 'bank_num');
				nlapiDisableField(prefix + 'bank_code', bankNum && !bankCode);
				nlapiDisableField(prefix + 'bank_num', bankCode && !bankNum);
			}
		}
	}
}

/**
 * Default the Subsidiary field value on the bank gl account entered.
 *
 * @param {Object} type
 * @param {Object} name
 * @param {Object} line
 */
function fieldChanged(type, name, line){

	// Default both the subsidiary and currency.
    if (name == 'custpage_2663_gl_bank_account') {
        if (isOneWorld()) {
	        // set to the hidden field (to be saved)
	        var strGLAccount = nlapiGetFieldValue('custpage_2663_gl_bank_account');
			
			if (strGLAccount) {
				nlapiSetFieldValue('custrecord_2663_gl_bank_account', strGLAccount, false);
				
				// parse account-sub map object
				var acctSubMap = JSON.parse(nlapiGetFieldValue('custpage_2663_acct_sub'));
				
				// get the subsidiary and legal name
				if (acctSubMap) {
					var strSubsidiary = acctSubMap[strGLAccount];
					if (strSubsidiary) {
						// set to the sub field
						nlapiSetFieldValue('custrecord_2663_subsidiary', strSubsidiary, false);
						
						// parse legal names map object
						var subLegalNamesMap = JSON.parse(nlapiGetFieldValue('custpage_2663_sub_legalnames'));
						if (subLegalNamesMap) {
							var strLegalName = subLegalNamesMap[strSubsidiary];
							if (strLegalName) {
								// set to the legal names field
								nlapiSetFieldValue('custrecord_2663_legal_name', strLegalName, false);
								nlapiSetFieldValue('custrecord_2663_print_company_name', strLegalName, false);
							}
						}
					}
				}
			}
			else {
				nlapiSetFieldValue('custrecord_2663_subsidiary', '', false);
                nlapiSetFieldValue('custrecord_2663_legal_name', '', false);
                nlapiSetFieldValue('custrecord_2663_print_company_name', '', false);
                nlapiSetFieldValue('custrecord_2663_currency', '', false);
			}
        }
    }
	else if (name == 'custpage_2663_bank_department') {
		nlapiSetFieldValue('custrecord_2663_bank_department', nlapiGetFieldValue('custpage_2663_bank_department'), false);
	}
    else if (name == 'custpage_2663_bank_class') {
        nlapiSetFieldValue('custrecord_2663_bank_class', nlapiGetFieldValue('custpage_2663_bank_class'), false);
    }
    else if (name == 'custpage_2663_bank_location') {
        nlapiSetFieldValue('custrecord_2663_bank_location', nlapiGetFieldValue('custpage_2663_bank_location'), false);
    }
	
    // set the record fields when the dummy template fields are changed
    if (name == 'custpage_2663_eft_template') {
        nlapiSetFieldValue('custrecord_2663_eft_template', nlapiGetFieldValue('custpage_2663_eft_template'), false);
    }
    else if (name == 'custpage_2663_dd_template') {
        nlapiSetFieldValue('custrecord_2663_dd_template', nlapiGetFieldValue('custpage_2663_dd_template'), false);
    }
    else if (name == 'custpage_2663_pp_template') {
        nlapiSetFieldValue('custrecord_2663_pp_template', nlapiGetFieldValue('custpage_2663_pp_template'), false);
    } 
    else if (name == 'custpage_2663_eft_batch') {
        if (nlapiGetFieldValue(name) == 'T') {
            nlapiSetFieldValue('custrecord_2663_trans_marked', 'T', false);
            nlapiDisableField('custpage_2663_summarized', false);
            nlapiDisableField('custpage_2663_auto_ap', false);
        }
        else {
            nlapiDisableField('custpage_2663_summarized', true);
            nlapiSetFieldValue('custpage_2663_summarized', 'F', false);
            nlapiDisableField('custpage_2663_auto_ap', true);
        }
    } 
    else if (name == 'custrecord_2663_trans_marked') {
        if (nlapiGetFieldValue(name) == 'T' && nlapiGetFieldValue('custpage_2663_eft_batch') == 'T') {
            nlapiDisableField('custpage_2663_summarized', false);
        }
        else {
            nlapiDisableField('custpage_2663_summarized', true);
            nlapiSetFieldValue('custpage_2663_summarized', 'F', false);
        }
    }
    // format specific changes
    else {
    	var prefix = '';
    	var templateName  = ''; 
    	if (name.indexOf('custpage_eft_custrecord_2663_') > -1) {
    		templateName = nlapiGetFieldText('custpage_2663_eft_template');
    		prefix = 'custpage_eft_custrecord_2663_';
    	}
    	else if (name.indexOf('custpage_dd_custrecord_2663_') > -1) {
    		templateName  = nlapiGetFieldText('custpage_2663_dd_template');
    		prefix = 'custpage_dd_custrecord_2663_';
    	}
    	
    	if (templateName) {
    		if (templateName == 'BACS') {
            	if (name.indexOf('custrecord_2663_bank_num') > -1) {
					var bankNum = nlapiGetFieldValue(prefix + 'bank_num');
					
					if (bankNum) {
						nlapiSetFieldValue(prefix + 'bank_code', '');
						nlapiDisableField(prefix + 'bank_code', true);
					} else {
						nlapiDisableField(prefix + 'bank_code', false);
					}
				}
				else if (name.indexOf('custrecord_2663_bank_code') > -1) {
					var bankCode = nlapiGetFieldValue(prefix + 'bank_code');
					
					if (bankCode) {
						nlapiSetFieldValue(prefix + 'bank_num', '');
						nlapiDisableField(prefix + 'bank_num', true);
					} else {
						nlapiDisableField(prefix + 'bank_num', false);
					}
				}
        	}
            else if ((templateName == 'J.P. Morgan Freeform GMT') && name.indexOf('custrecord_2663_bic') > -1) {
            	var bankCode = nlapiGetFieldValue(prefix + 'bic');
            	
            	if (bankCode && (bankCode.length == 8 || bankCode.length == 11)) {
        			var countryCode = bankCode.substring(4,6);
        			nlapiSetFieldValue(prefix + 'country_code', countryCode);
        		} else {
        			nlapiSetFieldValue(prefix + 'country_code', '');
        		} 
        	}
			else if ((templateName == 'HSBC ISO 20022 (Hong Kong)') && name.indexOf('custrecord_2663_bic') > -1) {
            	var swiftBICCode = nlapiGetFieldValue(prefix + 'bic');            	
            		if (/[a-z]/.test(swiftBICCode)) {
        			swiftBICCode = swiftBICCode.toUpperCase();
           		 	nlapiSetFieldValue(name, swiftBICCode, false);
           	 	}
        	}	       	
            else if ((templateName == 'SEPA Credit Transfer (Luxembourg)' || templateName == 'SEPA Credit Transfer (HSBC)') && name.indexOf('custrecord_2663_iban') > -1) {    	
                // source country check field from IBAN
            	var ibanString = nlapiGetFieldValue(prefix + 'iban');
                var iban = new _2663.IBAN(ibanString);
                
            	if (iban.getValue() && iban.isValid()) {
                    var countryCheck = iban.getCountryCode();
                    nlapiSetFieldValue(prefix + 'country_check', countryCheck);
        		} 
                else {
                    nlapiSetFieldValue(prefix + 'country_check', '');			
        		} 
        	} 
            else if ((templateName == 'ABO')){
                if (name.indexOf('custrecord_2663_acct_num') > -1){            
                    var acctNo = nlapiGetFieldValue(prefix + 'acct_num');            
                
                    // parse two parts of account number
                    var part1 = acctNo.indexOf('-') > -1 ? acctNo.substr(0,acctNo.indexOf('-')) : '';
                    var part2 = acctNo.lastIndexOf('-') > -1 ? acctNo.substr(acctNo.lastIndexOf('-') + 1) : acctNo;            
                    
                    // apply leading zeros
                    var strUtil = new _2663.StringUtil();
                    part1 = strUtil.applyPadding('left','0',part1,6);            
                    part2 = strUtil.applyPadding('left','0',part2,10);            

                    // update account number
                    nlapiSetFieldValue(prefix + 'acct_num', part1 + '-' + part2, false, true);
                }
                else if (name.indexOf('custrecord_2663_statement_name') > -1){            
                    // convert account name to upper case (except ? character)
                    var acctName = nlapiGetFieldValue(prefix + 'statement_name');
                    var converted = '';
                    for (var i = 0, ii = acctName.length; i < ii; i++){
                        var ch = acctName.charAt(i);
                        converted += (ch != 'ʃ') ? ch.toUpperCase() : ch;                 
                    }
                    nlapiSetFieldValue(prefix + 'statement_name', converted, false);
                }
            } else if (templateName == 'Barclays MT103') {
            	if (name.indexOf('custrecord_2663_acct_num') > -1) {
					var acctNum = nlapiGetFieldValue(prefix + 'acct_num');
					
					if (acctNum) {
						nlapiSetFieldValue(prefix + 'iban', '');
						nlapiDisableField(prefix + 'iban', true);
					} else {
						nlapiDisableField(prefix + 'iban', false);
					}
				}
				else if (name.indexOf('custrecord_2663_iban') > -1) {
					var iban = nlapiGetFieldValue(prefix + 'iban');
					
					if (iban) {
						nlapiSetFieldValue(prefix + 'acct_num', '');
						nlapiDisableField(prefix + 'acct_num', true);
						nlapiSetFieldValue(prefix + 'iban', iban.toUpperCase(), false);
					} else {
						nlapiDisableField(prefix + 'acct_num', false);
					}
				}
        	}
    	}
    }
}

/**
 * Validate IBAN code and update inline fields.
 *
 * @param {Object} type
 * @param {Object} name
 */
function validateField(type, name){
    var paymentFileFormat = nlapiGetFieldText(name.indexOf('_eft_') > -1 ? 'custrecord_2663_eft_template' : 'custrecord_2663_dd_template');
    var prefix = name.indexOf('_eft_') > -1 ? 'custpage_eft_custrecord_2663_' : 'custpage_dd_custrecord_2663_';
    var fldValue = nlapiGetFieldValue(name);
    
    // perform file format template updates only during edit
    var recId = nlapiGetRecordId();
	if (recId) {
		if (name == 'custpage_2663_eft_template') {
			if (nlapiGetFieldValue('custrecord_2663_eft_batch') == 'T') {
				alert('Batch processing is enabled. Please uncheck Process Bills Automatically flag and save the record before updating the EFT template.');
				return false;	
			}
        	if (batchesExist(recId, [1, 2, 3])) {	//Check if there are batches with status Open, Updating or Closed
        		alert('There are still unprocessed Batches. EFT template cannot be updated.');
            	return false;
        	}
        }
        if (name == 'custpage_2663_eft_batch' && nlapiGetFieldValue(name) == 'F') {
        	if (batchesExist(recId, [1])) {
        		alert('One or more batches are still open. Process Bills Automatically cannot be unchecked.');
        		return false;
        	}
        }
		// check if at least one of the templates is set
        if (!nlapiGetFieldValue('custpage_2663_eft_template') && !nlapiGetFieldValue('custpage_2663_dd_template') && !nlapiGetFieldValue('custpage_2663_pp_template')) {
            alert('Please specify a value for at least one of the templates.');
            return false;
        }
		if (name == 'custpage_2663_eft_template' || name == 'custpage_2663_dd_template' || name == 'custpage_2663_pp_template') {
        	var templateName = 'EFT';
        	var templateValue = '';
        	var action = 'change';
        	if (name == 'custpage_2663_eft_template') {
    	        templateName = 'EFT';
    	    }
    	    else if (name == 'custpage_2663_dd_template') {
    	    	templateName = 'DD';
    	    }
            else if (name == 'custpage_2663_pp_template') {
            	templateName = 'Positive Pay';
            }
        	if (!fldValue) {
        		templateValue = 'to blank ';
        		action = 'remove';
	        }
        	var templateToCheck = {};
        	templateToCheck[templateName] = { value: fldValue, text: nlapiGetFieldText(name) };
        	var multicurrencyFormats = checkMulticurrencyFormat(templateToCheck);
        	var res = false;
        	if (multicurrencyFormats.length > 0) {
        		var baseCurrency = '1';
        		var bankCurrency = nlapiGetFieldValue('custrecord_2663_currency');
        		if (isOneWorld() && bankCurrency) {
            		baseCurrency = nlapiLookupField('subsidiary', nlapiGetFieldValue('custrecord_2663_subsidiary'), 'currency');
            	} 
        		if (baseCurrency == bankCurrency || isValidMultiCurrencyFormat(fldValue, nlapiGetFieldValue('custrecord_2663_currency'))) {
        			res = confirmMulticurrencyFormatUpdate(multicurrencyFormats);	
        		} else {
        			alert("GL Bank Account's currency: " + nlapiGetFieldText('custrecord_2663_currency') + "is not in selected template's list of supported currencies.");
        		}
        	}
        	else {
                var msg = ['Note: Changing the ', templateName, ' template ', templateValue, 'will reload the page to ', action, ' the ', 
                           templateName, ' Template Details tab. Other changes will not be saved.',
                           ' Would you like to continue?'].join('');
                res = confirm(msg);
        	}
            if (res == true) {
                var recName = name.replace('custpage', 'custrecord');
                nlapiSubmitField('customrecord_2663_bank_details', nlapiGetRecordId(), recName, nlapiGetFieldValue(name));
                setWindowChanged(window, false);
                location.reload(true);      
            }
        	return false;
        }
	}
	
    if (paymentFileFormat == 'CBI Payments' || paymentFileFormat == 'AEB - Norma 34' || paymentFileFormat == 'CBI Collections' || 
		paymentFileFormat == 'SEPA Credit Transfer (ABN AMRO)' || paymentFileFormat == 'SEPA Credit Transfer (Germany)' || 
		paymentFileFormat == 'SEPA Credit Transfer (CBI)' || paymentFileFormat == 'SEPA Direct Debit (CBI)') {
        if (name.indexOf('custrecord_2663_iban') > -1) {
        	
        	var ibanString = nlapiGetFieldValue(name);
        	
        	if (paymentFileFormat == 'SEPA Credit Transfer (ABN AMRO)' || paymentFileFormat == 'SEPA Credit Transfer (Germany)' || 
    			paymentFileFormat == 'SEPA Credit Transfer (CBI)' || paymentFileFormat == 'SEPA Direct Debit (CBI)') {
        		if (/[a-z]/.test(ibanString)) {
        			ibanString = ibanString.toUpperCase();
           		 	nlapiSetFieldValue(name, ibanString, false);
           	 	}
        	}
        	
            var iban = new _2663.IBAN(ibanString);
            if (iban.getValue() && iban.isValid()) {
                nlapiSetFieldValue(prefix + 'country_code', iban.getCountryCode(), false);
                nlapiSetFieldValue(prefix + 'iban_check', iban.getCheckDigits(), false);
                //Set derived values
                if (paymentFileFormat == 'CBI Payments' || paymentFileFormat == 'CBI Collections' || paymentFileFormat == 'SEPA Credit Transfer (CBI)'
                	|| paymentFileFormat == 'SEPA Direct Debit (CBI)') {
                    nlapiSetFieldValue(prefix + 'country_check', iban.getDerivedValue(1), false);
                    nlapiSetFieldValue(prefix + 'bank_num', iban.getDerivedValue(2), false);
                    nlapiSetFieldValue(prefix + 'branch_num', iban.getDerivedValue(3), false);
                    nlapiSetFieldValue(prefix + 'acct_num', iban.getDerivedValue(4), false);
                }
                else if (paymentFileFormat == 'AEB - Norma 34') {
                    nlapiSetFieldValue(prefix + 'bank_num', iban.getDerivedValue(1), false);
                    nlapiSetFieldValue(prefix + 'branch_num', iban.getDerivedValue(2), false);
                    nlapiSetFieldValue(prefix + 'country_check', iban.getDerivedValue(3), false);
                    nlapiSetFieldValue(prefix + 'acct_num', iban.getDerivedValue(4), false);
                }
            }
        }
    }
    else if (paymentFileFormat == 'ACH - CCD/PPD' || paymentFileFormat == 'ACH - CTX (Free Text)' || paymentFileFormat == 'ACH - PPD') {
        if (name.indexOf('custrecord_2663_bank_num') > -1) {
    		var ach = new _2663.ACH(nlapiGetFieldValue(name));
    		if (ach.isValidRoutingNumber()) {
    			nlapiSetFieldValue(prefix + 'processor_code', ach.getFederalReserveRoutingSymbol());
    			nlapiSetFieldValue(prefix + 'bank_code', ach.getABAInstitutionIdentifier());
    			nlapiSetFieldValue(prefix + 'country_check', ach.getCheckDigit());
    		}
    		else {
                nlapiSetFieldValue(prefix + 'processor_code', '');
                nlapiSetFieldValue(prefix + 'bank_code', '');
                nlapiSetFieldValue(prefix + 'country_check', '');
    		}
    	}
    }
    else if (paymentFileFormat == 'DTAUS') {
        if (name.indexOf('custrecord_2663_bank_num') > -1 || name.indexOf('custrecord_2663_acct_num') > -1) {
            var bankNumber = nlapiGetFieldValue(prefix + 'bank_num');
            var accountNumber = nlapiGetFieldValue(prefix + 'acct_num');
            
            var iban = '';
            if (bankNumber && accountNumber) {
                var ibanGen = new _2663.IBANGenerator();
                iban = ibanGen.GenerateFromBankAndAccountNum(bankNumber, accountNumber, 'DE');
            }
            nlapiSetFieldValue(prefix + 'iban', iban);
        }
        
    } 
    else if (paymentFileFormat == 'Raiffeisen Domestic Transfer') {
    	if (name.indexOf('custrecord_2663_bban') > -1) {
            var bban = new _2663.BBAN('HU', nlapiGetFieldValue(name));
            if (bban.getValue() && bban.isValid()) {
                //Set derived values
            	nlapiSetFieldValue(prefix + 'bank_num', bban.getDerivedValue('bank_number'), false);
                nlapiSetFieldValue(prefix + 'branch_num', bban.getDerivedValue('branch_number'), false);
                nlapiSetFieldValue(prefix + 'acct_num', bban.getDerivedValue('account_number'), false);
            }
    	}
    } else if (paymentFileFormat == 'BACS') {
    	var bankNum = nlapiGetFieldValue(prefix + 'bank_num');
    	var bankCode = nlapiGetFieldValue(prefix + 'bank_code');
    	var isBankNumChanged = name.indexOf('custrecord_2663_bank_num') > -1;
    	var isBankCodeChanged = name.indexOf('custrecord_2663_bank_code') > -1;
    	
    	//toggle enable/disable of fields
    	if (isBankNumChanged) {
    		if (!isNullorEmpty(bankNum)) {
    			nlapiSetFieldValue(prefix + 'bank_code', '');
    			nlapiDisableField(prefix + 'bank_code', true);
    		} else {
    			nlapiDisableField(prefix + 'bank_code', false);
    		}
    	} else if (isBankCodeChanged) {
    		if (!isNullorEmpty(bankCode)) {
    			nlapiSetFieldValue(prefix + 'bank_num', '');
    			nlapiDisableField(prefix + 'bank_num', true);
    		} else {
    			nlapiDisableField(prefix + 'bank_num', false);
    		}
    	}
    } else if (paymentFileFormat == 'ANZ') {
    	
    	if (name.indexOf('custrecord_2663_bban') > -1) {
    		//pad the account number suffix if length is less than 16
        	var accountNum = nlapiGetFieldValue(prefix + 'bban');
        	if (!isNullorEmpty(accountNum) && accountNum.length == 15) {
        		var newAccountNum = accountNum.substring(0, 13) + '0' + accountNum.substring(13);
        		nlapiSetFieldValue(prefix + 'bban', newAccountNum, false, false);
        	} 
    	}
    } else if (paymentFileFormat == 'ASB' || paymentFileFormat == 'Westpac - Deskbank') {
    	if (name.indexOf('custrecord_2663_bban') > -1) {
    		var accountNum = nlapiGetFieldValue(prefix + 'bban');
    		
    		if (!isNullorEmpty(accountNum)) {
    			
            	//populate other fields
            	var accountNumber = new _2663.NZAccountNumber(accountNum);
    			nlapiSetFieldValue(prefix + 'bank_num', accountNumber.getBankNumber());
    			nlapiSetFieldValue(prefix + 'branch_num', accountNumber.getBranchNumber());
    			nlapiSetFieldValue(prefix + 'acct_num', accountNumber.getUniqueAccountNumber());
    			
    			var suffixField = paymentFileFormat == 'ASB' ? 'bank_code' : 'bank_suffix';
    			nlapiSetFieldValue(prefix + suffixField, accountNumber.getBankAccountSuffix());
    		}
    	}
    } else if ((paymentFileFormat == 'CNAB 240') && name.indexOf('custrecord_2663_opt_fld') > -1) {
    	
    	// toggle pre-filling of Registration Number
        if (nlapiGetFieldValue(prefix + 'opt_fld') == '0') {
        	nlapiSetFieldValue(prefix + 'tax_authorization_num', '00000000000000');
        }
    }
    
    return true;
}

/**
 * Validate Batch Detail fields.
 *
 * @param {Object} type
 * @param {Object} name
 */
function validateLine(type) {
	var lineNum = nlapiGetCurrentLineItemIndex(type);
	if (type == 'recmachcustrecord_2663_bd_bank_acct') {
		if (getNumberOfActiveLines() == 10 && lineNum > nlapiGetLineItemCount(type)) {
			alert('You have exceeded the allowable number of active payment batch filters per bank account.');
			return false;
		}
		var isMain = nlapiGetCurrentLineItemValue(type, 'custrecord_2663_bd_is_main') == 'T';
		var name = nlapiGetCurrentLineItemValue(type, 'name');
		
		if (!name) {
			alert('Please enter value for: Batch Details Name');
			return false;
		} else {
			var usedNames = getOtherUsedValues(type, lineNum, 'name');
			if (isInArray(name, usedNames)) {
				alert('Batch Details Name ' + name + ' is already in use. Please select a different value.');
				return false;
			}
		}
		
		var savedSearch = nlapiGetCurrentLineItemValue(type, 'custrecord_2663_bd_saved_search');
		if (isMain && savedSearch) {
			alert('You may not enter Saved Search value for Main batch.');
			return false;
		} else if (!isMain && !savedSearch) {
			alert('Please enter value for: Saved Search');
			return false;
		} else {
			var usedSavedSearchIds = getOtherUsedValues(type, lineNum, 'custrecord_2663_bd_saved_search');
			if (isInArray(savedSearch, usedSavedSearchIds)) {
				alert('Saved Search is already in use. Please select a different value.');
				return false;
			}
		}
	}
	
	if (type == 'recmachcustrecord_2663_ar_bank_acct') {
		var level = nlapiGetCurrentLineItemValue(type, 'custrecord_2663_ar_level');
		var usedLevels = (getOtherUsedValues(type, lineNum, 'custrecord_2663_ar_level')).sort();
		if (level && usedLevels.length > 0 && isInArray(level, usedLevels)) {
			alert('Level ' + level + ' has already been setup.');
			return false;
		}
		
		var approver = nlapiGetCurrentLineItemValue(type, 'custrecord_2663_ar_approver');
		if (approver) {
			var usedApprovers = getOtherUsedValues(type, lineNum, 'custrecord_2663_ar_approver');
			if (usedApprovers.length > 0) {
				var invalidApprovers = [];
				var approvers = approver.split(MULTISELECT_SEPARATOR);
				var approverNames = (nlapiGetCurrentLineItemText(type, 'custrecord_2663_ar_approver')).split(', ');
				for (var i = 0, ii = approvers.length; i < ii; i++) {
					if (isInArray(approvers[i], usedApprovers)) {
						invalidApprovers.push(approverNames[i]);
					}
				}
				if (invalidApprovers.length > 0) {
					alert('Approver(s): ' + invalidApprovers.join(', ') + ' already in use.');
					return false;
				}
			}	
		}
		
		var limit = nlapiGetCurrentLineItemValue(type, 'custrecord_2663_ar_limit');
		if (limit) {
			// convert to number
			limit = limit * 1;
			var paymentLimit = nlapiGetFieldValue('custrecord_2663_bank_payment_limit') * 1;
			if (limit <= paymentLimit) {
				alert('Payment Approval limit should be greater than Payment Limit: ' + paymentLimit);
				return false;
			}
		}
	}
	return true;
}

/**
 * Returns values that have already been used 
 *
 * @param {String} sublistId
 * @param {Integer} excludedLine
 * @param {String} fldName
 */
function getOtherUsedValues(sublistId, excludedLine, fldName) {
	var usedValues = [];
	var lineCount = nlapiGetLineItemCount(sublistId);
	for (var i = 1; i <= lineCount; i++) {
		if (i != excludedLine && nlapiGetLineItemValue(sublistId, 'custrecord_2663_bd_inactive', i) != 'T') {
			var usedValue = nlapiGetLineItemValue(sublistId, fldName, i);
			if (usedValue) {
				usedValues = usedValues.concat(usedValue.split(MULTISELECT_SEPARATOR));	
			}
		}
	}
	return usedValues;
}

function getNumberOfActiveLines() {
	var noOfActiveLines = 0;
	var noOfLines = nlapiGetLineItemCount('recmachcustrecord_2663_bd_bank_acct');
	
	for (var i = 1; i <= noOfLines; i++) {
		if (nlapiGetLineItemValue('recmachcustrecord_2663_bd_bank_acct', 'custrecord_2663_bd_inactive', i) == 'F') {
			noOfActiveLines++;	
		}
	}
	
	return noOfActiveLines;
}

/**
 * Check if EFT or DD template is set
 * Check for duplicate names when saving the record
 * 
 */
function saveRecord() {
	var res = true;
	var recId = nlapiGetRecordId();
	// set the optional fields specific for each file format
	setOptField_CFONB();
	
	// check if the DCL is set according to accounting preferences during edit
	if (recId) {
		var prefix = isOneWorld() ? 'custpage' : 'custrecord';
		var deptFld = prefix + '_2663_bank_department';
        var classFld = prefix + '_2663_bank_class';
        var locFld = prefix + '_2663_bank_location';
		
		var dclSettings = getDCLSettings();
		var dclToSet = [];
		// to display error when dcl field is changed to mandatory in acctg preferences, field is displayed and mandatory, and field is blank
		if (dclSettings.deptField.isMandatory && nlapiGetField(deptFld) && !nlapiGetField(deptFld).isMandatory() && !nlapiGetFieldValue(deptFld)) {
			dclToSet.push(nlapiGetContext().getPreference('NAMING_DEPARTMENT'));
		}
		if (dclSettings.classField.isMandatory && nlapiGetField(classFld) && !nlapiGetField(classFld).isMandatory() && !nlapiGetFieldValue(classFld)) {
			dclToSet.push(nlapiGetContext().getPreference('NAMING_CLASS'));
		}
		if (dclSettings.locField.isMandatory && nlapiGetField(locFld) && !nlapiGetField(locFld).isMandatory() && !nlapiGetFieldValue(locFld)) {
			dclToSet.push(nlapiGetContext().getPreference('NAMING_LOCATION'));
		}
		if (dclToSet.length > 0) {
			res = false;
			alert('Accounting preferences for classifications were modified. Please enter value(s) for: ' + dclToSet.join(', '));
		}
	}
	
	//set folder
	nlapiSetFieldValue('custrecord_2663_eft_file_cabinet_id', nlapiGetFieldValue('custpage_2663_eft_file_cabinet_id'));
	
	//set Process Bills Automatically flag
	nlapiSetFieldValue('custrecord_2663_eft_batch', nlapiGetFieldValue('custpage_2663_eft_batch') || 'F');
	
    //set Show Summarized flag
    nlapiSetFieldValue('custrecord_2663_summarized', nlapiGetFieldValue('custpage_2663_summarized') || 'F');
    
    // selected templates
    var objTemplates = {
        'EFT': { value: nlapiGetFieldValue('custrecord_2663_eft_template'), text: nlapiGetFieldText('custrecord_2663_eft_template') },
        'DD': { value: nlapiGetFieldValue('custrecord_2663_dd_template'), text: nlapiGetFieldText('custrecord_2663_dd_template') },
        'PP': { value: nlapiGetFieldValue('custrecord_2663_pp_template'), text: nlapiGetFieldText('custrecord_2663_pp_template') }
    };
    
	// check if EFT or DD template is set
	if (!objTemplates.EFT.value && !objTemplates.DD.value && !objTemplates.PP.value) {
		alert('Please specify a value for at least one of the templates.');
		res = false;
	}
	
	// check for duplicate name
	var name = nlapiGetFieldValue('name');
	var filters = [];
	filters.push(new nlobjSearchFilter('name', null, 'is', name));
	if (nlapiGetFieldValue('id')) {
		filters.push(new nlobjSearchFilter('internalid', null, 'noneof', nlapiGetFieldValue('id')));
	}
	var searchResults = nlapiSearchRecord('customrecord_2663_bank_details', null, filters);
	
	if (searchResults) {
        alert(_2663.ResourceMgr.GetString('err_bank_name_exists'));
		res = false;
	}
	
	var multicurrencyFormats = checkMulticurrencyFormat(objTemplates);
	if (!recId && res && multicurrencyFormats.length > 0) {
		var templateTypes = ['eft', 'dd'];
		var baseCurrency = '1';
		var bankCurrency = nlapiGetFieldValue('custrecord_2663_currency');
		if (bankCurrency) {
			if (isOneWorld()) {
	    		baseCurrency = nlapiLookupField('subsidiary', nlapiGetFieldValue('custrecord_2663_subsidiary'), 'currency');
	    	}
			for (var i = 0, ii = templateTypes.length; i < ii; i++) {
				var templateToCheck = {};
				templateToCheck[templateTypes[i].toUpperCase()] = objTemplates[templateTypes[i].toUpperCase()];
				var multicurrencyFormat = checkMulticurrencyFormat(templateToCheck);
				if (multicurrencyFormat.length > 0) {
					var fldValue = nlapiGetFieldValue('custrecord_2663_' + templateTypes[i] + '_template');
					if (baseCurrency != bankCurrency  && !isValidMultiCurrencyFormat(fldValue, bankCurrency)) {
						alert("GL Bank Account's currency: " + nlapiGetFieldText('custrecord_2663_currency') + "is not in selected " + templateTypes[i].toUpperCase() + " template's list of supported currencies.");
						return false;	
					}	
				}
			}
		}
		res = confirmMulticurrencyFormatUpdate(multicurrencyFormats);
	}
	// check for duplicate auto process settings
	if (res && objTemplates.EFT.value && nlapiGetField('custpage_2663_eft_batch')){
	    if (nlapiGetFieldValue('custpage_2663_eft_batch') == 'T') {
	    	var autoAP = nlapiGetFieldValue('custpage_2663_auto_ap');
        	filters = [];
        	if (isOneWorld()) {
        	    filters.push(new nlobjSearchFilter('custrecord_2663_subsidiary', null, 'anyof', nlapiGetFieldValue('custrecord_2663_subsidiary')));
        	}
        	filters.push(new nlobjSearchFilter('custrecord_2663_eft_template', null, 'anyof', objTemplates.EFT.value));
        	filters.push(new nlobjSearchFilter('custrecord_2663_auto_ap', null, 'anyof', autoAP));

            if (recId) {
                filters.push(new nlobjSearchFilter('internalid', null, 'noneof', nlapiGetFieldValue('id')));
            }
            searchResults = nlapiSearchRecord('customrecord_2663_bank_details', null, filters, [new nlobjSearchColumn('name')]);
            if (searchResults) {
                alert('The automatic batch processing setting already exists for another bank: ' + searchResults[0].getValue('name'));
                res = false;
            }
            else {
                // set Auto AP value
                nlapiSetFieldValue('custrecord_2663_auto_ap', autoAP);
                // delete Deferred batch of old AP and Bank combination
                if (recId) {
                    var oldAP = nlapiLookupField('customrecord_2663_bank_details', recId, 'custrecord_2663_auto_ap');
                    if (oldAP) {
                    	if (oldAP != autoAP) {
                    		alert('All existing batches will be processed using the previous Accounts Payable. Only new batches that will be created will use the newly set Accounts Payable.');	
                    	}
                    }
                }
            }
	    }
	    else {
	        nlapiSetFieldValue('custrecord_2663_auto_ap', '');
	    }
	}
	
	// for Edit
	if (recId) {
		// template specfic validation
		// EFT
		var errorMessage = getTemplateSpecificError('eft', objTemplates.EFT.text);
		if (errorMessage) {
			alert(errorMessage);
			return false;
		} 
		// DD
		errorMessage = getTemplateSpecificError('dd', objTemplates.DD.text);
		if (errorMessage) {
			alert(errorMessage);
			return false;
		}
		// validate approval routing setup
		if (!isApprovalRoutingValid()) {
			return false;
		}
	}
	
	return res; 
} 

/**
 * Executes template specific validation and returns corresponding error message 
 *
 * @param {String} templateType
 * @param {String} templateName
 * @returns {String}
 */

function getTemplateSpecificError(templateType, templateName) {
	if (templateType && templateName) {
		var prefix = 'custpage_' + templateType + '_custrecord_2663_';
		if (templateName) {
			//toggle enable/disable of HSBC/SAGE and Service User Number fields
		    if (templateName == 'BACS') {
		    	//check for blank HSBC/SAGE or SUN for BACS formats
		    	//check if neither one is filled
		    	if (!nlapiGetFieldValue(prefix + 'bank_num') && !nlapiGetFieldValue(prefix + 'bank_code')) {
		    		return 'Please specify a value for Service User Number or HSBC/SAGE.';
		    	}
		    } 
		    else if (templateName == 'Barclays MT103') {
		    	//check if neither one is filled
		        if(!nlapiGetFieldValue(prefix + 'iban') && !nlapiGetFieldValue(prefix + 'acct_num')){
		        	return 'Please enter value for IBAN or Account Number.';
		        }
		    }
		}
	}
	return '';
}

/**
 * Checks if Approval Routing setup is valid
 *
 * @returns {Boolean}
 */

function isApprovalRoutingValid() {
	if (_2663.isApprovalRoutingEnabled()) {
		var paymentLimit = nlapiGetFieldValue('custrecord_2663_bank_payment_limit');
		if (paymentLimit && !(parseFloat(paymentLimit) > 0)) {
			alert("Payment Limit must be greater than 0");
			return false;
		}
	    
		var mapApprovalRouting = {};
		var arSublistId = 'recmachcustrecord_2663_ar_bank_acct';
		var lineCount = nlapiGetLineItemCount(arSublistId);
		for (var i = 1; i <= lineCount; i++) {
			var approvalLevel = nlapiGetLineItemValue(arSublistId, 'custrecord_2663_ar_level', i);
			mapApprovalRouting[approvalLevel] = {};
			mapApprovalRouting[approvalLevel].limit = nlapiGetLineItemValue(arSublistId, 'custrecord_2663_ar_limit', i);
		}
		
		var approvalLevels = [];
		for (var aLvl in mapApprovalRouting) {
			approvalLevels.push(aLvl * 1);
		}
		
		if (approvalLevels && approvalLevels.length > 0) {
			approvalLevels.sort();
			for (var i = 1, ii = approvalLevels.length; i <= ii; i++) {
	            if (!isInArray(i, approvalLevels)){
	                alert(['Please setup Level', i, 'Approval Routing'].join(' '));
	                return false;            
	            }
			}
			
			var levelCount = approvalLevels.length;
			for (var i = 0; i < levelCount; i++) {
				var approvalLevel = approvalLevels[i];
				var limit = mapApprovalRouting[approvalLevel + ''].limit;
				if (approvalLevel == levelCount) {
					// check if all levels (lesser than highest level- 3) currently setup have payment limits
					if (limit && approvalLevel < 3) {
						alert(['Please setup Level', approvalLevel + 1, 'Approval Routing'].join(' '));
		                return false;  
					}
				}
				
				//check if lower levels don't have limit
				if (!limit && approvalLevel != levelCount) {
					alert(['Please set Payment Approval Limit for Level', approvalLevel, 'Approval Routing'].join(' '));
					return false;
				}
				
				//check if limit lower levels is less than payment limit 
				if (limit && parseFloat(limit) <= parseFloat(paymentLimit)) {
					alert('Payment Approval limit should be greater than Payment Limit: ' + paymentLimit);
					return false;
				}
				
				if (limit && levelCount > 1) {
					//check if lower levels have >= limit than higher levels
					for (var j = approvalLevel + 1; j <= levelCount && j < HIGHEST_APPROVAL_LEVEL; j++) {
						var nextLvlLimit = mapApprovalRouting[j + ''].limit;
						if (nextLvlLimit && parseFloat(limit) >= parseFloat(nextLvlLimit)) {
							alert(['Payment Approval Limit for Level', j, 'must be greater than Level', approvalLevel].join(' '));
							return false;
						}
					}
					//check if limit for highest level is set 
					if (approvalLevel == HIGHEST_APPROVAL_LEVEL) {
						alert('Highest Approval Level must not have an Approval Limit');
						return false;
					}
				}
			}
		} else {
			//check if there are no approval routing levels setup
			alert('Please setup Approval Routing levels');
			return false;
		}
	}
	
	return true;
}

/**
 * Set the Reserved field to )1 when the SIRET is set
 */
function setOptField_CFONB() {
	if (nlapiGetFieldText('custrecord_2663_eft_template') == 'CFONB') {
		if (nlapiGetFieldValue('custpage_eft_custrecord_2663_bank_comp_id')) {
			nlapiSetFieldValue('custpage_eft_custrecord_2663_opt_fld', ')1');
		}
		else {
			nlapiSetFieldValue('custpage_eft_custrecord_2663_opt_fld', '');
		}
	}
}

function getBatches(bankAcctId, statusArr) {
	if (bankAcctId && statusArr && typeof statusArr == 'object' && statusArr.length > 0) {
		var filters = [
            new nlobjSearchFilter('custrecord_2663_bank_account', null, 'is', bankAcctId),
            new nlobjSearchFilter('custrecord_2663_status', null, 'anyof', statusArr)	//Batch Status Open
        ];
	   	return nlapiSearchRecord('customrecord_2663_file_admin', null, filters);	
	}
	return null;
}

function batchesExist(bankAcctId, statusArr) {
	if (bankAcctId && statusArr && typeof statusArr == 'object' && statusArr.length > 0) {
		var filters = [
            new nlobjSearchFilter('custrecord_2663_bank_account', null, 'is', bankAcctId),
            new nlobjSearchFilter('custrecord_2663_status', null, 'anyof', statusArr)	//Batch Status Open
        ];
		var col = new nlobjSearchColumn('internalid', null, 'count');
		var summary = nlapiSearchRecord('customrecord_2663_file_admin', null, filters, col)[0]; 
		
	   	return 	summary.getValue('internalid', null, 'count') > 0;
	}
	return false;
}

function closeBatches() {
	var recId = nlapiGetRecordId();
	if (batchesExist(recId, [2])) {	//Batch Status: Updating = 2
		alert('There are Open batches that are currently being updated by the Scheduled Script. Please try again later.');
	} else {
		var batches = getBatches(recId, [1]);	//Batch Status: Open = 1 
		if (batches) {
			for (var i = 0, ii = batches.length; i < ii; i++) {
				var batch = nlapiLoadRecord('customrecord_2663_file_admin', batches[i].getId());
				batch.setFieldValue('custrecord_2663_status', 3);	//set status to Closed
				nlapiSubmitRecord(batch);
			}
			alert('Current batches closed!');
			window.location = nlapiResolveURL('record', nlapiGetRecordType(), recId, true);
		} else {
			alert('There are no Open batches!');
		}	
	}
}

function confirmMulticurrencyFormatUpdate(multicurrencyFormats) {
    var res = true;
    if (multicurrencyFormats && multicurrencyFormats.length > 0) {
        var msg = [];
        msg.push('Note: Setting templates to a multi-currency format will set the template as inline and will no longer be editable:');
        msg = msg.concat(multicurrencyFormats);
        msg.push('\nWould you like to continue?');
        res = confirm(msg.join('\n'));
    }
    return res;
}

function checkMulticurrencyFormat(templateValues) {
    var multicurrencyFormats = [];
    if (isMultiCurrency() && templateValues) {
        for (var i in templateValues) {
            var templateValue = templateValues[i].value;
            if (templateValue) {
            	var includeAllCurrencies = nlapiLookupField('customrecord_2663_payment_file_format', templateValue, 'custrecord_2663_include_all_currencies') == 'T';
            	var templateCurrency = nlapiLookupField('customrecord_2663_payment_file_format', templateValue, 'custrecord_2663_format_currency');
                if (includeAllCurrencies || (templateCurrency && templateCurrency != '[]')) {
                    multicurrencyFormats.push(i + ' Template: ' + templateValues[i].text);
                }
            }
        }
    }
    return multicurrencyFormats;
}

function isValidMultiCurrencyFormat(templateId, currencyId) {
	var includeAllCurrencies = nlapiLookupField('customrecord_2663_payment_file_format', templateId, 'custrecord_2663_include_all_currencies') == 'T';
	if (includeAllCurrencies) {
		return true;
	} else {
		var currencies = JSON.parse(nlapiLookupField('customrecord_2663_payment_file_format', templateId, 'custrecord_2663_format_currency') || '[]');
		var currencySymbol = nlapiLookupField('currency', currencyId, 'symbol');
		var currLength = currencies.length; 
		if (currLength > 0 ) {
			for (var i = 0; i <= currLength; i++) {
				if (currencies[i] == currencySymbol) {
					return true;
				}
			}
		}
	}
	return false;
}