/**
 * Copyright 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Revision History:
 *
 * Date        Fixed Issue    Broken in QA Bundle     Issue Fix Summary
 * =============================================================================================
 * 2011/12/19  210982         1.17.2011.12.08.3       Add DE Market Requirements - AP (DTAUS)
 *             211425         1.17.2011.12.08.3       Add DE Market Requirements - AR (DTAUS)
 * 2012/01/16  212982         1.19.2012.01.19.1       Removed special character appearing at the
 * 													  beginning of this file
 * 2012/03/30  218913         1.19.2                  Minor change for unit test
 * 2012/07/17  225904         1.22.3       			  Add BBAN support
 * 2012/07/24  227215         1.22.3       			  Add bank details/bank check in BBAN validation
 * 2012/08/03  227773		  1.22.5				  Remove use of Array forEach and filter functions
 * 2012/08/03  228019		  1.22.5				  Add validation for BBAN to check if value is 0              
 */

var _2663;

if (!_2663)
    _2663 = {};

// country codes, fixed length for those countries, inner structure, appliance of EU REGULATION 924/2009, IBAN requirement and IBAN example
_2663.IBAN_DEF_PER_COUNTRY = {
    "AD": {length: 24,  structure: "F04F04A12",          applianceOfEUReg: "n", ibanReqt: "n", sample: "AD1200012030200359100100"},
	"AE": {length: 23,  structure: "F03F16",             applianceOfEUReg: "n", ibanReqt:"n",  sample: "AE070331234567890123456"},
	"AL": {length: 28,  structure: "F08A16",             applianceOfEUReg: "n", ibanReqt: "n", sample: "AL47212110090000000235698741"},
	"AT": {length: 20,  structure: "F05F11",             applianceOfEUReg: "y", ibanReqt: "n", sample: "AT611904300234573201"},
	"BA": {length: 20,  structure: "F03F03F08F02",       applianceOfEUReg: "n", ibanReqt: "n", sample: "BA391290079401028494"},
	"BE": {length: 16,  structure: "F03F07F02",          applianceOfEUReg: "y", ibanReqt: "n", sample: "BE68539007547034"},
	"BG": {length: 22,  structure: "U04F04F02A08",       applianceOfEUReg: "y", ibanReqt: "n", sample: "BG80BNBG96611020345678"},
	"BH": {length: 22,  structure: "U04A14",             applianceOfEUReg: "n", ibanReqt: "n", sample: "BH67BMAG00001299123456"},
	"CH": {length: 21,  structure: "F05A12",             applianceOfEUReg: "n", ibanReqt: "n", sample: "CH9300762011623852957"},
	"CY": {length: 28,  structure: "F03F05A16",          applianceOfEUReg: "y", ibanReqt: "n", sample: "CY17002001280000001200527600"},
	"CZ": {length: 24,  structure: "F04F06F10",          applianceOfEUReg: "y", ibanReqt: "n", sample: "CZ6508000000192000145399"},
	"DE": {length: 22,  structure: "F08F10",             applianceOfEUReg: "y", ibanReqt: "n", sample: "DE89370400440532013000"},
	"DK": {length: 18,  structure: "F04F09F01",          applianceOfEUReg: "y", ibanReqt: "n", sample: "DK5000400440116243"},
	"DO": {length: 28,  structure: "A04F20",             applianceOfEUReg: "n", ibanReqt: "n", sample: "DO28BAGR00000001212453611324"},
	"EE": {length: 20,  structure: "F02F02F11F01",       applianceOfEUReg: "y", ibanReqt: "n", sample: "EE382200221020145685"},
	"ES": {length: 24,  structure: "F04F04F02F10",       applianceOfEUReg: "y", ibanReqt: "n", sample: "ES9121000418450200051332"},
	"FI": {length: 18,  structure: "F06F07F01",          applianceOfEUReg: "y", ibanReqt: "n", sample: "FI2112345600000785"},
	"FO": {length: 18,  structure: "F04F09F01",          applianceOfEUReg: "n", ibanReqt: "n", sample: "FO6264600001631634"},
	"FR": {length: 27,  structure: "F05F05A11F02",       applianceOfEUReg: "y", ibanReqt: "n", sample: "FR1420041010050500013M02606"},
	"GB": {length: 22,  structure: "U04F06F08",          applianceOfEUReg: "y", ibanReqt: "n", sample: "GB29NWBK60161331926819"},
	"GE": {length: 22,  structure: "U02F16",             applianceOfEUReg: "n", ibanReqt: "n", sample: "GE29NB0000000101904917"},
	"GI": {length: 23,  structure: "U04A15",             applianceOfEUReg: "y", ibanReqt: "n", sample: "GI75NWBK000000007099453"},
	"GL": {length: 18,  structure: "F04F09F01",          applianceOfEUReg: "n", ibanReqt: "n", sample: "GL8964710001000206"},
	"GR": {length: 27,  structure: "F03F04A16",          applianceOfEUReg: "y", ibanReqt: "n", sample: "GR1601101250000000012300695"},
	"HR": {length: 21,  structure: "F07F10",             applianceOfEUReg: "n", ibanReqt: "n", sample: "HR1210010051863000160"},
	"HU": {length: 28,  structure: "F03F04F01F15F01",    applianceOfEUReg: "y", ibanReqt: "n", sample: "HU42117730161111101800000000"},
	"IE": {length: 22,  structure: "U04F06F08",          applianceOfEUReg: "y", ibanReqt: "n", sample: "IE29AIBK93115212345678"},
	"IL": {length: 23,  structure: "F03F03F13",          applianceOfEUReg: "n", ibanReqt: "n", sample: "IL620108000000099999999"},
	"IS": {length: 26,  structure: "F04F02F06F10",       applianceOfEUReg: "y", ibanReqt: "n", sample: "IS140159260076545510730339"},
	"IT": {length: 27,  structure: "U01F05F05A12",       applianceOfEUReg: "y", ibanReqt: "n", sample: "IT60X0542811101000000123456"},
	"KW": {length: 30,  structure: "U04A22",             applianceOfEUReg: "n", ibanReqt: "y", sample: "KW81CBKU0000000000001234560101"},
	"KZ": {length: 20,  structure: "F03A13",             applianceOfEUReg: "n", ibanReqt: "n", sample: "KZ86125KZT5004100100"},
	"LB": {length: 28,  structure: "F04A20",             applianceOfEUReg: "n", ibanReqt: "n", sample: "LB62099900000001001901229114"},
	"LI": {length: 21,  structure: "F05A12",             applianceOfEUReg: "y", ibanReqt: "n", sample: "LI21088100002324013AA"},
	"LT": {length: 20,  structure: "F05F11",             applianceOfEUReg: "y", ibanReqt: "n", sample: "LT121000011101001000"},
	"LU": {length: 20,  structure: "F03A13",             applianceOfEUReg: "y", ibanReqt: "n", sample: "LU280019400644750000"},
	"LV": {length: 21,  structure: "U04A13",             applianceOfEUReg: "y", ibanReqt: "n", sample: "LV80BANK0000435195001"},
	"MC": {length: 27,  structure: "F05F05A11F02",       applianceOfEUReg: "y", ibanReqt: "n", sample: "MC5811222000010123456789030"},
	"ME": {length: 22,  structure: "F03F13F02",          applianceOfEUReg: "n", ibanReqt: "n", sample: "ME25505000012345678951"},
	"MK": {length: 19,  structure: "F03A10F02",          applianceOfEUReg: "n", ibanReqt: "n", sample: "MK07250120000058984"},
	"MR": {length: 27,  structure: "F05F05F11F02",       applianceOfEUReg: "n", ibanReqt: "n", sample: "MR1300020001010000123456753"},
	"MT": {length: 31,  structure: "U04F05A18",          applianceOfEUReg: "y", ibanReqt: "n", sample: "MT84MALT011000012345MTLCAST001S"},
	"MU": {length: 30,  structure: "U04F02F02F12F03U03", applianceOfEUReg: "n", ibanReqt: "n", sample: "MU17BOMM0101101030300200000MUR"},
	"NL": {length: 18,  structure: "U04F10",             applianceOfEUReg: "y", ibanReqt: "n", sample: "NL91ABNA0417164300"},
	"NO": {length: 15,  structure: "F04F06F01",          applianceOfEUReg: "y", ibanReqt: "n", sample: "NO9386011117947"},
	"PL": {length: 28,  structure: "F08F16",             applianceOfEUReg: "y", ibanReqt: "y", sample: "PL27114020040000300201355387"},
	"PT": {length: 25,  structure: "F04F04F11F02",       applianceOfEUReg: "y", ibanReqt: "n", sample: "PT50000201231234567890154"},
	"RO": {length: 24,  structure: "U04A16",             applianceOfEUReg: "y", ibanReqt: "n", sample: "RO49AAAA1B31007593840000"},
	"RS": {length: 22,  structure: "F03F13F02",          applianceOfEUReg: "n", ibanReqt: "n", sample: "RS35260005601001611379"},
	"SA": {length: 24,  structure: "F02A18",             applianceOfEUReg: "n", ibanReqt: "y", sample: "SA0380000000608010167519"},
	"SE": {length: 24,  structure: "F03F16F01",          applianceOfEUReg: "y", ibanReqt: "n", sample: "SE4550000000058398257466"},
	"SI": {length: 19,  structure: "F05F08F02",          applianceOfEUReg: "y", ibanReqt: "n", sample: "SI56191000000123438"},
	"SK": {length: 24,  structure: "F04F06F10",          applianceOfEUReg: "y", ibanReqt: "n", sample: "SK3112000000198742637541"},
	"SM": {length: 27,  structure: "U01F05F05A12",       applianceOfEUReg: "n", ibanReqt: "n", sample: "SM86U0322509800000000270100"},
	"TN": {length: 24,  structure: "F02F03F13F02",       applianceOfEUReg: "n", ibanReqt: "n", sample: "TN5914207207100707129648"},
	"TR": {length: 26,  structure: "F05A01A16",          applianceOfEUReg: "n", ibanReqt: "y", sample: "TR330006100519786457841326"}
};

//country codes, fixed length for those countries, inner structure, component structure
_2663.BBAN_DEF_PER_COUNTRY = {
    "HU": [
       {length: 16,  structure: "F03F04F01F07F01", componentStructure: 'AAABBBBKCCCCCCCL', sample: "1177301611111128"},
       {length: 24,  structure: "F03F04F01F15F01", componentStructure: 'AAABBBBKCCCCCCCCCCCCCCCL', sample: "117730161111101800000000"}
	]
};

_2663.IBAN = function(iban) {
    var ibanDef = _2663.IBAN_DEF_PER_COUNTRY;
    var countryCode = iban.substr(0,2).toUpperCase();
    
    function getTestPattern(pattern,kind) {
    	var testpattern = "(";
    	if (kind == "any") {
    		testpattern += "."; 
        } else {
    		testpattern += "[";
    		if (kind == "reverse") {
    			testpattern += "^"; 
            }
            switch (pattern.substr(0,1)) {
    			case "A": testpattern += "0-9A-Za-z"; break;
    			case "B": testpattern += "0-9A-Z"; break;
    			case "C": testpattern += "A-Za-z"; break;
    			case "F": testpattern += "0-9"; break;
    			case "L": testpattern += "a-z"; break;
    			case "U": testpattern += "A-Z"; break;
    			case "W": testpattern += "0-9a-z"; break; 
            }
    		testpattern += "]"; 
        }
    	if (((pattern.substr(1,2)*1) > 1) && (kind != "reverse")) {
    		testpattern += "{"+String(pattern.substr(1,2)*1)+"}"; 
        }
    	testpattern += ")";
    	return testpattern; 
    }
    
    function buildTest(structure,kind) {
    	var result = "";
    	var testpattern = structure.match(/([ABCFLUW]\d{2})/g);
    	var patterncount = testpattern.length;
    	for (var i = 0; i < patterncount; ++i) {
    		if (((kind >= 0)&&(i != kind))||(kind == -2)) {
    			result += getTestPattern(testpattern[i],"any"); 
            } else {
    			result += getTestPattern(testpattern[i],"standard"); 
            }
        }
        return new RegExp(result); 
    }
    
    function performISOValidation(str) {
    	var isostr = str.toUpperCase();
    	isostr = isostr.substr(4) + isostr.substr(0,4);
    	for (var i = 0; i <= 25; i++) {
    		while (isostr.search(String.fromCharCode(i+65)) != -1) {
    			isostr = isostr.replace(String.fromCharCode(i + 65), String(i + 10)); 
            }
        }
        var parts = Math.ceil(isostr.length / 7);
    	var remainder = "";
    	for (var i = 1; i <= parts; i++) {
    		remainder = String(parseFloat(remainder + isostr.substr((i - 1) * 7, 7)) % 97); 
        }
    	return remainder == "1";
    }
    
    this.getDerivedValue = function (seqNo) {
        if (ibanDef[countryCode] && seqNo > 0) {
            var valuesLengthArr = ('B04' + ibanDef[countryCode].structure).match(/\d{2}/g);
            if (seqNo <= valuesLengthArr.length) {
                var valueLength = parseInt(valuesLengthArr[seqNo], 10);
                var valueIndex = 0;
                for (var i = 0; i < seqNo; i++) {
                    valueIndex += parseInt(valuesLengthArr[i], 10);
                }

                return iban.substr(valueIndex, valueLength);
            }
        }
        return '';
    };

    this.getValue = function() {
        return iban;
    };

    this.getCountryCode = function() {
        return countryCode;
    };

    this.getCheckDigits = function() {
        return iban.substring(2, 4);
    };

    this.isValid = function() {
    	var standard = -1;
    	var illegal = /\W|_/; // contains chars other than (a-zA-Z0-9);
    	if(!illegal.test(iban)) {
    		illegal = /^\D\D\d\d.+/; // first chars are letter letter digit digit
    		if (illegal.test(iban)) {
    			illegal = /^\D\D00.+|^\D\D01.+|^\D\D99.+/; // check if digits are 00 or 01 or 99
    			if(!illegal.test(iban)) {
    				var stdLength = 0;
    				if (ibanDef[countryCode]) {// country is in datastructure
                        stdLength=ibanDef[countryCode].length;
                        if (iban.length == stdLength) {
                            illegal = buildTest("B04" + ibanDef[countryCode].structure, standard);// fetch sub structure of respected country
                        }
                    } else {
                        illegal = /.+/;  
                    }
    				if (illegal.test(iban)) { // fits sub structure of country
    					return performISOValidation(iban);
                    }
                }
            }
        }
        return false;
    };
};

_2663.BBAN = function(countryCode, bban) {
    var bbanDef = getBBANDefinition();
    var structureMap = {
		'bank_check': 'K', 
		'account_check': 'L',
		'bank_number': 'A',
		'branch_number': 'B',
		'account_number': 'C'
    };
    
    function getBBANDefinition() {
    	var bbanDefArr = _2663.BBAN_DEF_PER_COUNTRY[countryCode] || [];
    	var def = '';
    	for (var i = 0, ii = bbanDefArr.length; i < ii; i++) {
    		if (bban.length == bbanDefArr[i].length) {
    			def = bbanDefArr[i];
    			break;
    		}
    	}
    	return def;
    }
    
    function getTestPattern(pattern,kind) {
    	var testpattern = "(";
    	if (kind == "any") {
    		testpattern += "."; 
        } else {
    		testpattern += "[";
    		if (kind == "reverse") {
    			testpattern += "^"; 
            }
            switch (pattern.substr(0,1)) {
    			case "A": testpattern += "0-9A-Za-z"; break;
    			case "B": testpattern += "0-9A-Z"; break;
    			case "C": testpattern += "A-Za-z"; break;
    			case "F": testpattern += "0-9"; break;
    			case "L": testpattern += "a-z"; break;
    			case "U": testpattern += "A-Z"; break;
    			case "W": testpattern += "0-9a-z"; break; 
            }
    		testpattern += "]"; 
        }
    	if (((pattern.substr(1, 2) * 1) > 1) && (kind != "reverse")) {
    		testpattern += "{" + String(pattern.substr(1, 2) * 1) + "}"; 
        }
    	testpattern += ")";
    	return testpattern; 
    }
    
    function buildTest(structure,kind) {
    	var result = "";
    	var testpattern = structure.match(/([ABCFLUW]\d{2})/g);
    	var patterncount = testpattern.length;
    	for (var i = 0; i < patterncount; ++i) {
    		if (((kind >= 0) && (i != kind)) || (kind == -2)) {
    			result += getTestPattern(testpattern[i], "any"); 
            } else {
    			result += getTestPattern(testpattern[i], "standard"); 
            }
        }
        return new RegExp(result); 
    }
    
    function modulo10Validation() {
    	var isValid = false;
    	var componentsForValidation = [
           {number: getDerivedValue('bank_number') + getDerivedValue('branch_number'), check: getDerivedValue('bank_check') * 1},
           {number: getDerivedValue('account_number'), check: getDerivedValue('account_check') * 1}
        ];
    	var constArr = [9, 7, 3, 1];
    	for (var i = 0, ii = componentsForValidation.length; i < ii; i++) {
    		var component = componentsForValidation[i];
    		var sum = 0;
        	for (var j = 0, jj = component.number.length; j < jj; j++) {
        		sum += component.number.charAt(j) * constArr[j % 4];
            }
        	sum += '';
        	var expectedCheck = (10 - parseInt(sum.charAt(sum.length - 1), 10)) % 10;
        	isValid = component.check == expectedCheck;
        	if (!isValid) {
        		break;
        	}
    	}
    	return isValid;
    }
    
    function getDerivedValue(fldName) {
    	if (bbanDef && bbanDef.componentStructure && fldName) {
    		var mappingCode = structureMap[fldName];
        	var regExp = new RegExp(mappingCode + '{1,}');
        	var matchRes = bbanDef.componentStructure.match(regExp);
        	if (matchRes) {
        		var componentDef = matchRes[0];
        		var valueIndex = bbanDef.componentStructure.indexOf(componentDef);
        		var valueLength = componentDef.length;
        		return bban.substr(valueIndex, valueLength);
        	}
        }
        return '';
    };

    function getValue() {
        return bban;
    };

    function isValid() {
    	var standard = -1;
    	var illegal = /\W|_/; // contains chars other than (a-zA-Z0-9);
    	if(!illegal.test(bban)) {
			var stdLength = 0;
			if (bbanDef) {// country is in datastructure
				var legal = buildTest(bbanDef.structure, standard);// fetch sub structure of respected country
                if (legal.test(bban)) { // fits sub structure of country
                	illegal = new RegExp('0{' + bban.length + '}'); 
                	if (!illegal.test(bban)) {	//must not be all zeroes
                		return modulo10Validation();	
    				}
                }
			}
    	}
    	return false;
    };
    
    this.getValue = getValue;
    this.getDerivedValue = getDerivedValue;
    this.isValid = isValid;
};

//------------------------------------------------------
_2663.IBANGenerator = function() {
    /**
     * Generates the IBAN based on bank number, account number, and 2-character country code
     */
    this.GenerateFromBankAndAccountNum = function(bankNumber, accountNumber, countryCode) {
        var iban = '';
        
        if (bankNumber && accountNumber && countryCode) {
            if (getNumbersFromString(bankNumber) == bankNumber && getNumbersFromString(accountNumber) == accountNumber && countryCode.length == '2' && bankNumber.length <= 8 && accountNumber.length <= 10) {
                // bank and acct num should not be 0
                if (parseInt(bankNumber, 10) != 0 && parseInt(accountNumber, 10) != 0) {
                    bankNumber = strPad(bankNumber, 8);
                    accountNumber = strPad(accountNumber, 10);
                    countryCode = countryCode.toUpperCase();
                    var countryCodeNumericValue = getCountryCodeNumericValue(countryCode);
    
                    // pre-iban = BBBBBBBBCCCCCCCCCCcc00 (B = bank num, C = acct num, c = country code)
                    var preIbanNum = bankNumber + accountNumber + countryCodeNumericValue + '00';
                    var mod97Result = parseInt(modulus(preIbanNum, 97), 10);
                    // kk = 98 - (pre-iban % 97) (k = check num)
                    var mod1097Result = strPad(new String(98 - mod97Result), 2);
                
                    // iban = cckkBBBBBBBBCCCCCCCCCC
                    iban = countryCode + mod1097Result + bankNumber + accountNumber;
                }
            }
        }
        
        return iban;
    };
    
    /**
     * Get the remainder from a division operation; divisor should be within the integer limit
     * 
     * @param dividend
     * @param divisor
     * @returns
     */
    function modulus(dividend, divisor) {
        divisor = parseInt(divisor, 10);
        var remainder = '';
        if (divisor > 0) {
            var currDividend = '';
            for (var i = 0; i < dividend.length; i++) {
                currDividend = remainder + dividend.charAt(i);
                remainder = parseInt(currDividend, 10) % parseInt(divisor, 10);
                remainder = remainder + '';
            }
        }

        return remainder == '' ? '0' : remainder;
    }

    /**
     * Get the numbers from a given string; returns 0 if there are no numbers in the string
     * 
     * @param str
     * @returns {String}
     */
    function getNumbersFromString(str) {
        var newNum = '';

        if (str) {
            str = new String(str);
            for (var i = 0; i < str.length; i++) {
                var currentChar = new String(str.charAt(i));
                var regExp = new RegExp('[0-9]');
                var res = currentChar.match(regExp);
                if (res) {
                    newNum += currentChar;
                }
            }
        }

        return newNum;
    }
    
    /**
     * Get the country code numeric value based on country code string
     * (A = 10 ... Z = 35)
     * 
     * @param countryCode
     * @returns {String}
     */
    function getCountryCodeNumericValue(countryCode) {
        countryCode = (new String(countryCode)).toUpperCase();
        var countryCodeNumericValue = '0000';
        if (countryCode.length == 2) {
            var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            countryCodeNumericValue = new String(alphabet.indexOf(countryCode.charAt(0)) + 10) + new String(alphabet.indexOf(countryCode.charAt(1)) + 10);
        }
        return countryCodeNumericValue;
    }

    /**
     * Pad a string with zeroes based on given length
     * 
     * @param str
     * @param len
     * @returns
     */
    function strPad(str, len){
        str = str == null ? '' : trim(str);
        len = len == null ? str.length : len;
        if (len > str.length) {
            var val = len + 1 - str.length;
            str = Array(val).join('0') + str;
        }
        else {
            str = str.substring(0, len);
        }
        
        return str;
    }

    /**
     * Trim a given string (both sides)
     * 
     * @param str
     * @returns
     */
    function trim(str) {
        if (str) {
            var l = 0;
            var r = str.length - 1;

            while(l < str.length && str[l] == ' ') { l++; }
            while(r > l && str[r] == ' ') { r--; }
            str = str.substring(l, r + 1);
        }

        return str;
    }

};