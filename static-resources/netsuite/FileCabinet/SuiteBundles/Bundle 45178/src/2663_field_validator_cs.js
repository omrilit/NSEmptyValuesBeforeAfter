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
 * 2011/5/20   198389         1.00.2011.05.20.04      Call suitelet to initialize validators
 * 2011/06/08  199331         1.00.2011.05.27.01      Validator for DD fields
 * 2011/08/09  203186         1.06.2011.07.29.02      Correct access for array items
 * 2011/09/09  205171         1.11.2011.09.15.01      CIRI-FBF Processing
 * 2011/09/12  205175         1.11.2011.09.15.01      Do not place custpage_type_ prefix when
 *                                                    checking for legal name field
 * 2011/09/28  206327         1.14                    Add custom validation for Equens - Clieop                                                     
 * 2011/10/04  206327         1.14                    Fix error on custom validation for Equens - 
 *                                                    Clieop
 * 2011/10/26  208116         1.15.2011.10.20.1       Added alert message for file formats using 
 * 													  IBAN validation 
 * 2011/10/26  208127         1.15.2011.10.20.1       Fixed incorrect validation when a Bank
 * 													  Detail record as both EFT and DD file formats
 * 													  and each has their own custom validation  
 * 2011/10/27  208503         1.15.2011.10.27.4       Add US Market Requirements - AP (ACH - CCD/PPD)
 * 2011/11/03  208574         1.15.2011.10.27.4       Remove use of javascript array method indexOf
 * 2011/12/06  210602         1.17.2011.12.08.2       Add US Market Requirements - AP (ACH - CTX (Free Text))
 * 2012/01/17  212325         1.19.2012.01.12.1       Move checking of DTAUS fields to field validator
 * 2012/01/31  213961         1.19.2012.01.12.1       Rollback Positive Pay code
 * 2012/02/02  212974         1.19.2012.01.19.1       Support for Positive Pay file option
 * 2012/02/13  214597         1.19.2012.02.09.2       Add min and max parameters for checking of numeric values
 *             214600         1.19.2012.02.09.2
 * 2012/03/08  217041         GPM Beta - 1.19.2       Support dynamic entity bank detail form
 * 2012/03/30  218913         1.19.2                  Minor changes for unit test
 * 2012/07/05  223301  		  1.20.1       			  Include Equens - Clieop (ING Bank) format in custom validation
 * 			   225752
 * 2012/07/17  225904         1.22.3       			  Add custom validation for Raiffeisen Domestic Transfer format
 * 2012/08/03  227773		  1.22.5				  Replace use of Array.indexOf with new function isInArray
 * 2012/09/07  230558		  1.22.3       			  Add IBAN validation for SEPA Credit Transfer (Austria) format
 * 2012/09/12  230808		  1.22.3       			  Add BIC validation for SEPA Credit Transfer (Austria) format
 * 2012/09/17  231115		  1.22.8       			  Update BIC validation to allow 0 character on location code
 * 													  except value 00
 * 2012/12/20  238104 		  2.00.5       			  Update IBAN and BIC validation for ABBL VIR 2000 format
 * 2013/01/28  238616 		  2.00.5				  Added validation for BACS Service User Number and HSBC/SAGE field
 * 2013/02/13  240170 		  2.00.7				  Add support for SEPA Credit Transfer (Netherlands)
 * 2013/02/15  243362 	 	  2.00.8				  Add support for SEPA version pain 001.001.002
 * 2013/03/13  245147		  2.00.11.2013.03.07.4	  Added validation for all-zero account numbers for ANZ and ASB
 * 2013/03/14  245147		  2.00.11.2013.03.07.4	  Removed custom validation for all-zero account numbers for ANZ and ASB
 * 2013/05/06  235777		  2.00.2	  			  Add support for ACH - PPD
 * 2013/07/23  254155         2.00.17				  Added support for SEPA Credit Transfer (ABN AMRO) 
 * 2013/08/06  240583 	      1.01.2012.11.29.1		  Add support for SEPA Credit Transfer (Germany) format
 * 2013/10/02  265023 	      3.00.0.2013.10.03.5	  Add iban validation for Original Debtor IBAN field
 * 2013/12/12  256855 		  3.00.00     			  Include SEPA DD (CBI) in  iban validation for Original Debtor IBAN field
 * 2013/12/19  273531    	  3.01.00				  Add Italy specific IBAN validation
 * 2014/03/14  236313 		       			          Add modulo11check1 and modulo11check2 validator tags
 * 2014/03/18  244069 		  3.01.1.2014.03.18.3     Add support for DTAZV format
 * 2014/03/20  283804 		  3.01.1.2014.03.25.3     Add DTAZV format validation of IBAN and BIC
 * 2014/03/20  283957 		  3.01.1.2014.03.25.2     Source validator from template selected in entity bank details page
 * 2014/03/20  229156 		       			          Add support for HSBC ISO 20022 (Singapore) format - BIC validation
 * 2014/03/26  285171 		       			          Created custom validation types to be used by new formats
 * 2014/07/18  288589 		  3.02.3				  Fix custom validations when creating new Entity Bank Detail records
 * 2014/09/12  304369 		  4.00.3     			  Make country param for iban validation type optional
 */

var _2663;

if (!_2663)
    _2663 = {};

//----- field validation class -----
_2663.FieldValidator = function() {
    // suitelet settings
    var scriptId = 'customscript_2663_field_validator_s';
    var scriptDeployment = 'customdeploy_2663_field_validator_s';

    //--------------------------------------------------------------------------
    function initializeValidators(formatid) {
        this.Flds = callSuitelet(formatid);
    }

    //--------------------------------------------------------------------------
    function callSuitelet(formatid) {
        // set the resources if given as string delimited by "|"
        var postdata = {};
        if (formatid != null && formatid != '') {
            postdata['custparam_formatid'] = formatid;

            // call suitelet that retrieves resources
            var reqUrl = nlapiResolveURL('SUITELET', scriptId, scriptDeployment, true);
            var response = nlapiRequestURL(reqUrl, postdata);

            // parse the response to an array
            return parseResponse(response);
        }
    }

    //--------------------------------------------------------------------------
    function parseResponse(response) {
        var validationFlds = {};
        if (response != null && response.getBody() != null && response.getBody() != '') {
            validationFlds = JSON.parse(response.getBody());
        }
        return validationFlds;
    }
    
    //--------------------------------------------------------------------------
    function isElevenCheckOk(acctNo) {
        var sum = 0;

        for (var i = 0; i < acctNo.length; i++) {
            sum += parseInt(acctNo.charAt(i), 10) * (acctNo.length - i);
        }
        
        return (sum % 11) == 0;
    }

	function validateField(fieldName, str, fieldPrefix) {
		var validatorList = this.Flds[fieldName];
		var errors = {};

		if (validatorList) {
			for (var i in validatorList) {
				var res = checkField(str, fieldPrefix, i, validatorList[i], fieldName);
				if (res != '') {
					errors[i] = res;
				}
			}
		}

		return errors;
	}

	function checkField(str, fieldPrefix, validatorName, params, fieldName) {
        var validator = new _2663.StringValidator();
		var res = '';

		switch (validatorName) {
	        case 'alpha': {
				// with errors for special characters and case
                if (!validator.IsAlpha(str, params['specialChars'], params['mode'])) {
                    res = 'Field must be alphabetic characters';
					if (params['specialChars']) {
						var specialChars = getRegExpChars(params['specialChars']);
                        res += ' and can have special characters: [' + specialChars + ']';
					}
					res += '.';
					if (params['mode']) {
						if (params['mode'] == 1) {
							res += ' Field must be in uppercase.';
						}
						else if (params['mode'] == 2) {
							res += ' Field must be in lowercase.';
						}
					}
                }
                break;
			}
			case 'num': {
				if (!validator.IsNumeric(str, params['decimal'], params['min'], params['max'])) {
					res = 'Field must be numeric.';
					if (params['decimal'] == true) {
						res += ' Decimals are allowed.';
					}
					else {
						res += ' Decimals are not allowed.';
					}
					if (params['min']) {
					    res += ' Minimum value is ' + params['min'] + '.';
					}
                    if (params['max']) {
                        res += ' Maximum value is ' + params['max'] + '.';
                    }
				}
				break;
			}
	        case 'validChars': {
				if (!validator.IsValidChars(str, params['validChars'])) {
                    var validChars = getRegExpChars(params['validChars']);
                    res = 'Field must only contain characters: [' + validChars + ']';
				}
				break;
			}
	        case 'invalidChars': {
				if (validator.HasInvalidChars(str, params['invalidChars'])) {
                    var invalidChars = getRegExpChars(params['invalidChars']);
                    res = 'Field must not contain characters: [' + invalidChars + ']';
				}
				break;
			}
	        case 'validContent': {
				var validContentArr = params['validContent'] ? params['validContent'].split('|') : [];
				
				var isEqual = false;
				
				for (var i = 0; i < validContentArr.length; i++) { 
					if (str == validContentArr[i]) {
						isEqual = true; 
						break;
					} 
				}

				if(!isEqual){
					res = 'Valid values must be ' + joinGrammatically(validContentArr) + '.';
				}
				
				break;
			}
			case 'len': {
				var invalidLenArr = params['invalidLength'] ? params['invalidLength'].split('|') : [];
				var validLenArr = params['validLength'] ? params['validLength'].split('|') : [];
				if (!validator.IsValidLength(str, params['minLength'], params['maxLength'], invalidLenArr, validLenArr)) {
					if (params['invalidLength'] && validator.IsInArray(str.length + '', invalidLenArr)) {
                        res = 'Field length must not be ' + joinGrammatically(invalidLenArr) + ' characters.';
                    } 
                    else if (params['validLength'] && !validator.IsInArray(str.length + '', validLenArr)) {
                    	res = 'Field length must be ' + joinGrammatically(validLenArr) + ' characters.';
                    }
                    else {
                        res = 'Field length must be ';
    					if (params['minLength'] == params['maxLength']) {
    						res += params['minLength'] + ' characters.';
    					}
    					else if (!params['minLength'] || params['minLength'] == 0){
    						res += params['maxLength'] + ' characters or less.';
    					}
    					else {
    						res += 'between ' + params['minLength'] + ' and ' + params['maxLength'] + ' characters.';
    					}    
                    }
					
				}
				break;
		    }
            case 'hankaku': {
                // with errors for special characters and case
                if (!validator.IsHankaku(str, params['specialChars'])) {
                    res = 'Field must be half-width katakana characters';
                    if (params['specialChars']) {
                        var specialChars = getRegExpChars(params['specialChars']);
                        res += ' and can have special characters: [' + specialChars + ']';
                    }
                    res += '.';
                }
                break;
            }
            case 'modulo11check1': {
                if (!validator.PassedMod11Check1(str)) {
                    res = 'Account number is invalid.';
                }                
                break;
            }
            case 'modulo11check2': {
                if (!validator.PassedMod11Check2(str)) {
                    res = 'Enter a valid account number in this format: 123456-1234567890';
                }
                break;
            }
			case 'modulo97':{
				var bankCodeAndAcctNum = parseInt(str.substr(0, 10), 10);
				var checkMod = parseInt(str.substr(-2), 10);
				if (bankCodeAndAcctNum % 97 !== checkMod) {
					res = 'Account number is invalid.';
				}
				break;
			}
			case 'iban':{
				var iban = new _2663.IBAN(str);
				var ibanCountryCode = params['country'];
				if (iban.getValue() && !iban.isValid()) {
					res = 'IBAN code is invalid.';
				} else if (ibanCountryCode && ibanCountryCode + "" != iban.getCountryCode() + "") {
					res = 'The International Bank Account Number (IBAN) you entered is not valid. Please enter a valid IBAN for country code: ' + ibanCountryCode;
				}
				break;
			}
			case 'bic':{
				var bankCode = str.substr(0, 4);
				var countryCode = str.substr(4, 2).toUpperCase();
				var locationCode = str.substr(6, 2);
				var branchCode = str.substr(8);
				
				if (!(/^[a-zA-Z ]+$/.test(bankCode) && validator.IsInArray(countryCode, VALID_COUNTRY_CODES) && locationCode != '00' && 
						/^[0-9a-zA-Z ]+$/.test(locationCode) && /^[0-9a-zA-Z ]*$/.test(branchCode))) {
					res = 'BIC is invalid.';
				}
				break;
			}
			case 'routingNumber':{
				var ach = new _2663.ACH(str);
				if (!ach.isValidRoutingNumber()) {
					res = 'Routing number is invalid.';
				}
				break;
			}
			case 'bban':{
				var ibanCountryCode = params['country'];
				var bban = new _2663.BBAN(ibanCountryCode, str);
				if (bban.getValue() && !bban.isValid()) {
					res = 'BBAN code is invalid.';
				}
				break;
			}
            case 'custom': {
            	var isEFT = fieldPrefix ? (fieldPrefix.indexOf('_eft_') > -1 ? true : false) : null;
            	var paymentFileFormat = nlapiGetFieldText('custpage_2663_' + (fieldPrefix ? (isEFT ? 'eft_template' : 'dd_template') : 'entity_file_format'));
            	
                if (paymentFileFormat == 'CIRI-FBF') {
                    var bankCodeAndAcctNum = parseInt(str.substr(0, 10), 10);
                    var checkMod = parseInt(str.substr(-2), 10);
                    if (bankCodeAndAcctNum % 97 !== checkMod) {
                        res = 'Account number is invalid.';
                    }
                }
                
                if (paymentFileFormat.indexOf('Equens - Clieop') > -1 && str.length > 8) {
                    if (!isElevenCheckOk(str)) {
                        res = 'Account number is invalid.';
                    }
                }
                
                if (fieldName.indexOf('_iban') > -1 && (paymentFileFormat == 'CBI Payments' || paymentFileFormat == 'AEB - Norma 34' || paymentFileFormat == 'CBI Collections' ||
                		paymentFileFormat == 'ABBL VIR 2000' || /SEPA/.test(paymentFileFormat) || paymentFileFormat == 'J.P. Morgan Freeform GMT' || paymentFileFormat == 'DTAZV')) {
            		var iban = new _2663.IBAN(str);
                	if (iban.getValue() && !iban.isValid()) {
                        res = 'IBAN code is invalid.';
                	} else if ((paymentFileFormat == 'SEPA Credit Transfer (CBI)' || paymentFileFormat == 'SEPA Direct Debit (CBI)') && iban.getCountryCode() != 'IT') {
                		res = 'The International Bank Account Number (IBAN) you entered is not valid. Please enter a valid IBAN for Italy.';
                	}
                }
                
                if (fieldName.indexOf('_bic') > -1 && (paymentFileFormat == 'ABBL VIR 2000' ||  /SEPA/.test(paymentFileFormat) || paymentFileFormat == 'J.P. Morgan Freeform GMT' || paymentFileFormat == 'DTAZV' || paymentFileFormat == 'HSBC ISO 20022 (Singapore)')) {
                	var bankCode = str.substr(0, 4);
            		var countryCode = str.substr(4, 2).toUpperCase();
            		var locationCode = str.substr(6, 2);
            		var branchCode = str.substr(8);
            		
            		if (!(/^[a-zA-Z ]+$/.test(bankCode) && validator.IsInArray(countryCode, VALID_COUNTRY_CODES) && locationCode != '00' && 
            				/^[0-9a-zA-Z ]+$/.test(locationCode) && /^[0-9a-zA-Z ]*$/.test(branchCode))) {
            			res = 'BIC is invalid.';
            		}
                }
                
                if (paymentFileFormat == 'ACH - CCD/PPD' || paymentFileFormat == 'ACH - CTX (Free Text)' || paymentFileFormat == 'ACH - PPD') {
            		var ach = new _2663.ACH(str);
                	if (!ach.isValidRoutingNumber()) {
                        res = 'Routing number is invalid.';
                	}
                }
                
                if (paymentFileFormat == 'DTAUS') {
                    if (!isNaN(str) && parseInt(str, 10) == 0) {
                        res = 'Value should be greater than 0.';
                    }
                }
                
                if (paymentFileFormat == 'Raiffeisen Domestic Transfer') {
                	var bban = new _2663.BBAN('HU', str);
                	if (bban.getValue() && !bban.isValid()) {
                        res = 'BBAN code is invalid.';
                	}
                }
                
                if ((paymentFileFormat == 'BACS') && fieldName.indexOf('bank_code') > -1) {
            		var regExp = /(HSBC)|(SAGE)/;
                	if (!regExp.test(str)) {
                		res = 'Please input either HSBC or SAGE only.';
                	}
                }
                
                if ((paymentFileFormat == 'SEPA Direct Debit (Germany)' || paymentFileFormat == 'SEPA Direct Debit (CBI)') && fieldName == 'custrecord_2663_entity_acct_no'){
            		var iban = new _2663.IBAN(str);
                	if (iban.getValue() && !iban.isValid()) {
                        res = 'IBAN code is invalid.';
                	} else if (paymentFileFormat == 'SEPA Direct Debit (CBI)' && iban.getCountryCode() != 'IT') {
                		res = 'The International Bank Account Number (IBAN) you entered is not valid. Please enter a valid IBAN for Italy.';
                	}                
                }
                
                break;
            }
		}

		return res;
	};

	/**
	 * Get characters specified in regular expression
	 *
	 * @param {Object} str
	 */
	function getRegExpChars(str) {
		var regExp = new RegExp("\\\\", "g");
		// remove escape characters
		str = str.replace(regExp, '');
        var chars = '';
        if (str != null && str != '') {
            for (var i = 0; i < str.length; i++) {
				// append each character
                chars += str.charAt(i);
                if (i != str.length - 1) {
					// check for alphabetic/numeric ranges
	                if (str.charAt(i).match('[0-9A-Za-z]')) {
	                    if (str.charAt(i + 1) == '-') {
							chars += str.charAt(i + 1);
	                        i++;
	                        continue;
	                    }
	                }
					// append , if not yet last character
                    chars += ',';
                }
            }
        }

        return chars;
	}

	function getValidationFields(formatID) {
		if (!isNullorEmpty(formatID)) {
			this.InitializeValidators(formatID);
		}

		return this.Flds;
	}
	
	function joinGrammatically(arr, conjunction) {
		var nArr = [].concat(arr);
		var val = '';
		conjunction = conjunction || 'or';
		if (nArr.length > 0) {
			val += nArr[0] || '';
			if (nArr.length > 1) {
				var lastElement = nArr.pop();
				val = [nArr.join(', '), lastElement].join(' ' + conjunction + ' ');
			}	
		}
		return val;
	}
	
	this.Flds = {};
	this.InitializeValidators = initializeValidators;
	this.ValidateField = validateField;
	this.GetValidationFields = getValidationFields;
};

_2663.StringValidator = function() {
	function isBlank(str) {
		var res = false;
		if (!str) {
			res = true;
		}
		return res;
	}

	function isNumeric(str, decimal, min, max) {
		var res = false;
		if (str) {
            str = new String(str);
			// check if number
			res = !isNaN(str);
			if (res) {
				// check for decimal point
				if (!decimal) {
                    res = str.indexOf('.') == -1 ? true : false;
				}
			}
			if (res && min) {
		        res = parseInt(str, 10) >= min;
			}
			if (res && max) {
			    res = parseInt(str, 10) <= max;
			} 
		}
        else {
            res = true;
        }
		return res;
	}

	function isAlpha(str, specialChars, mode) {
		var res = false;

		if (str) {
            str = new String(str);
  	        var uppercase = 'A-Z';
		    var lowercase = 'a-z';
		    var chars = '';

            // if mode is not specified, check as case-insensitive
            mode = (mode == null) ? 0 : mode;

			switch (mode) {
				// case-insensitive
				case 0: chars = uppercase + lowercase + ' '; break;
                // uppercase = 1
                case 1: chars = uppercase + ' '; break;
                // lowercase = 2
                case 2: chars = lowercase + ' '; break;
			}

			// if other special characters are specified (except space - already checked)
			if (specialChars) {
			    chars = chars + specialChars;
			}

			res = isValidChars(str, chars);
		}
        else {
            res = true;
        }

		return res;
	}

	function isValidChars(str, validChars) {
		var res = false;

		if (str) {
            str = new String(str);
            if (validChars) {
                // create a regular expression and match it with string
                validChars = '[' + validChars + ']+';
				var regExp = new RegExp(validChars);
				var validCharResult = str.match(regExp);
				// if the resulting match is the same as the string and index is 0
				if (validCharResult && validCharResult[0] == str && validCharResult.index == 0) {
					res = true;
				}
            }
		}
        else {
            res = true;
        }

		return res;
	}

	function hasInvalidChars(str, invalidChars) {
        var res = false;

        if (str) {
            str = new String(str);
            if (invalidChars) {
                // create a regular expression and match it with string
                invalidChars = '[' + invalidChars + ']+';
                var regExp = new RegExp(invalidChars);
                var invalidCharResult = str.match(regExp);
                // if null is returned, none of the invalid characters are in string
                if (invalidCharResult) {
                    res = true;
                }
            }
        }

        return res;
	}

	function isValidLength(str, minLen, maxLen, invalidLen, validLen) {
		var res = false;
		var noMinMax = !(minLen || maxLen);
        minLen = (minLen == null) ? 0 : minLen;
        maxLen = (maxLen == null) ? str.length : maxLen;
        invalidLen = invalidLen || [];
        validLen = validLen || [];
        if (str) {
			str = new String(str);
			if (validLen.length > 0) {
				if (isInArray(str.length + '', validLen)) {
					res = true;
				}
				if (noMinMax) {
					return res;
				}
			}
			if (str.length >= minLen && str.length <= maxLen) {
				if (!isInArray(str.length + '', invalidLen)) {
					res = true;
				}
			}
		}
		else {
			res = true; // checking if blank is done for mandatory field check
		}
        return res;
	}

	function isHankaku(str, specialChars) {
        var res = false;

        if (str) {
            str = new String(str);
            var hankaku = 'ｧ-ﾝﾞﾟ';
            var chars = hankaku + ' ';

            // if other special characters are specified (except space - already checked)
            if (specialChars) {
                chars = chars + specialChars;
            }

            res = isValidChars(str, chars);
        }
        else {
            res = true;
        }

        return res;
	}
    
	function passedMod11Check1(acctNo) {
        var sum = 0;

        for (var i = 0; i < acctNo.length; i++) {
            sum += parseInt(acctNo.charAt(i), 10) * (acctNo.length - i);
        }
        
        return (sum % 11) == 0;
	}    
    
	function passedMod11Check2(acctNo) {    
    
        var res = true;
            
        // parse two parts of account number
        if (acctNo.indexOf('-') > -1){
            var part1 = acctNo.substr(0,acctNo.indexOf('-'));
            var part2 = acctNo.substr(acctNo.indexOf('-') + 1);                        
            
            // check numeric values
            if (!isNumeric(part1) || !isNumeric(part2)){
                res = false;
            }
            
            // check lengths
            if (part1.length != 6 || part2.length != 10){
                res = false;
            }            

            // proceed with algorithm check              
            if (res){            
            
                // set the weights based on algorithm used for Czech Republic
                var arrPart1Weights = [10, 5, 8, 4, 2, 1];
                var arrPart2Weights = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
                
                // compute for part1 sum
                var sum1 = 0;
                for (var i in arrPart1Weights){
                    var weight = arrPart1Weights[i];
                    sum1 += weight * part1.charAt(i);
                }
                
                // compute for part2 sum
                var sum2 = 0;
                for (var i in arrPart2Weights){
                    var weight = arrPart2Weights[i];
                    sum2 += weight * part2.charAt(i);
                }

                // check that sums are divisible by 11
                if (sum1 % 11 > 0 || sum2 % 11 > 0){
                    res = false;
                }
            }
            
        }
        else{
            res = false;
        }
        
        return res;            
        
	}
	
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

	this.IsBlank = isBlank;
	this.IsNumeric = isNumeric;
	this.IsAlpha = isAlpha;
	this.IsValidChars = isValidChars;
	this.HasInvalidChars = hasInvalidChars;
    this.IsValidLength = isValidLength;
	this.IsHankaku = isHankaku;
	this.IsInArray = isInArray;
    this.PassedMod11Check1 = passedMod11Check1;
    this.PassedMod11Check2 = passedMod11Check2;
};

//----- client script functions -----
if (!_2663.FieldValidatorEft)
    _2663.FieldValidatorEft = new _2663.FieldValidator();
if (!_2663.FieldValidatorDd)
    _2663.FieldValidatorDd = new _2663.FieldValidator();
if (!_2663.FieldValidatorPp)
    _2663.FieldValidatorPp = new _2663.FieldValidator();

function pageInit_fldValidation(type) {
    // get validation conditions based on record type
    var recType = nlapiGetRecordType();
    if ( (recType == 'customrecord_2663_entity_bank_details' && (type == 'create' || type == 'edit')) ||
	     (recType == 'customrecord_2663_bank_details' && type == 'edit') ) {

		var eftTemplate = '';
		var ddTemplate = '';
		var ppTemplate = '';
		if (recType == 'customrecord_2663_bank_details') {
            eftTemplate = nlapiGetFieldValue('custrecord_2663_eft_template');
			ddTemplate = nlapiGetFieldValue('custrecord_2663_dd_template');
			ppTemplate = nlapiGetFieldValue('custrecord_2663_pp_template');
		}
		else if (recType == 'customrecord_2663_entity_bank_details') {
            eftTemplate = nlapiGetFieldValue('custpage_2663_entity_file_format');
		}        
		if (eftTemplate) {
			_2663.FieldValidatorEft.InitializeValidators(eftTemplate);
		}
        if (ddTemplate) {
            _2663.FieldValidatorDd.InitializeValidators(ddTemplate);
        }
        if (ppTemplate) {
            _2663.FieldValidatorPp.InitializeValidators(ppTemplate);
        }
    }
}

function fieldChanged_fldValidation(type, name, line) {
    var recType = nlapiGetRecordType();

	if (recType == 'customrecord_2663_bank_details') {
	    if (name == 'custrecord_2663_eft_template') {
			var eftTemplate = nlapiGetFieldValue('custrecord_2663_eft_template');
			if (!isNullorEmpty(eftTemplate)) {
				_2663.FieldValidatorEft.InitializeValidators(eftTemplate);
			}
		}

        if (name == 'custrecord_2663_dd_template') {
            var ddTemplate = nlapiGetFieldValue('custrecord_2663_dd_template');
            if (!isNullorEmpty(ddTemplate)) {
                _2663.FieldValidatorDd.InitializeValidators(ddTemplate);
            }
        }

        if (name == 'custrecord_2663_pp_template') {
            var ppTemplate = nlapiGetFieldValue('custrecord_2663_pp_template');
            if (!isNullorEmpty(ppTemplate)) {
                _2663.FieldValidatorPp.InitializeValidators(ppTemplate);
            }
        }
	}
	else if (recType == 'customrecord_2663_entity_bank_details') {
		if (name == 'custrecord_2663_entity_file_format') {
			var template = nlapiGetFieldValue('custrecord_2663_entity_file_format');
            if (!isNullorEmpty(template)) {
                _2663.FieldValidatorEft.InitializeValidators(template);
            }
		}
	}
}

function saveRecord_fldValidation() {
	var res = true;

	// check all fields that need validation, if one or more are not valid, produce an error
	var consoErrorMsg = '';

    var recType = nlapiGetRecordType();

    if (recType == 'customrecord_2663_bank_details') {
		if (nlapiGetFieldValue('custrecord_2663_eft_template')) {
			var eftDetailErrors = validateFields(_2663.FieldValidatorEft, 'custpage_eft_');
			if (eftDetailErrors) {
				consoErrorMsg += '[EFT Template Details]\n' + eftDetailErrors;
			}
		}
        if (nlapiGetFieldValue('custrecord_2663_dd_template')) {
			var ddDetailErrors = validateFields(_2663.FieldValidatorDd, 'custpage_dd_');
            if (ddDetailErrors) {
                consoErrorMsg += '[DD Template Details]\n' + ddDetailErrors;
            }
        }
        if (nlapiGetFieldValue('custrecord_2663_pp_template')) {
            var ppDetailErrors = validateFields(_2663.FieldValidatorPp, 'custpage_pp_');
            if (ppDetailErrors) {
                consoErrorMsg += '[Positive Pay Template Details]\n' + ppDetailErrors;
            }
        }
	}
	else if (recType == 'customrecord_2663_entity_bank_details') {
		consoErrorMsg += validateFields(_2663.FieldValidatorEft);
	}

    if (!isNullorEmpty(consoErrorMsg)) {
        alert('Please correct the values of the following fields before submitting the form:\n\n' + consoErrorMsg);
        res = false;
    }

	return res;
}

function validateFields(validatorObj, fieldPrefix) {
	// get the validation fields
	var validationFlds = validatorObj.Flds;

    // check all fields that need validation, if one or more are not valid, produce an error
    var consoErrorMsg = '';

    for (var fldName in validationFlds) {
    	
        // get the field
        var fld = nlapiGetField(fldName);

        // if null, check if customized field
		fieldPrefix = isNullorEmpty(fieldPrefix) ? '' : fieldPrefix;
		// create special case for custrecord_2663_legal_name and custrecord_2663_print_company_name (does not have a prefix custpage_[type]_)
        var tempFldName = (fldName != 'custrecord_2663_legal_name' && fldName != 'custrecord_2663_print_company_name' && fldName != 'custrecord_2663_file_name_prefix') ? 
    		(fieldPrefix + fldName) : fldName;
        fld = nlapiGetField(tempFldName);
        if (isNullorEmpty(fld)) {
            // continue if the current field is not in the form
            continue;
        }
        
        // validate only if the field is enabled
        if (!fld.isDisabled()) {
            var fldValue = nlapiGetFieldValue(tempFldName);
            var fldLabel = fld.getLabel();
            
            if (!isNullorEmpty(fldValue)) {
            	
                var errors = validatorObj.ValidateField(fldName, fldValue, fieldPrefix);
                var errorMessage = '';
                for (var i in errors) {
                    errorMessage += errors[i] + '\n';
                }
                if (errorMessage != '') {
                    if (consoErrorMsg != '') {
                        consoErrorMsg += '\n';
                    }
                    consoErrorMsg += fldLabel + ':\n' + errorMessage;
                }
            }
        }
    }

    return consoErrorMsg;
}