/**
 * � 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var FAM;
if (!FAM) { FAM = {}; }

FAM.DepreciationMethod_CS = new function () {
    this.messages = {
        ALERT_FAILED_TO_VALIDATE2 : 'client_deprmethod_failedtovalidate2',
        ALERT_FORMULA_VALIDATION_FAILED : 'client_deprmethod_validationfailed',
        ALERT_DP_ANNUALLY_INVALID : 'client_deprmethod_dp_annually_invalid'
    };
    
    /**
     * pageInit event type of client scripts
    **/
    this.pageInit = function (type) {
        this.messages = FAM.Util_CS.fetchMessageObj(this.messages);
    };
    
    /**
     * validateField event type of client scripts
    **/
    this.validateField = function (type, name, linenum) {
        var DEPR_METHOD_FORMULA = "custrecord_deprmethodformula";
        var DEPR_METHOD_HTML_FORMULA = "custrecord_deprmethodhtmlformula";
        var DEPR_METHOD_PERIOD = "custrecord_deprmethoddeprperiod";        
        var DP = "DP";
        
        var formulaTxt = nlapiGetFieldValue(DEPR_METHOD_FORMULA);
        var deprPeriod = nlapiGetFieldValue(DEPR_METHOD_PERIOD);
        var hasDP = formulaTxt && formulaTxt.indexOf(DP) !== -1;
        
        if (name == DEPR_METHOD_FORMULA) {
        	
            if (hasDP && (deprPeriod == FAM.DeprPeriod.Annually)) {
            	alert(this.messages.ALERT_DP_ANNUALLY_INVALID);
            	return false;
            }
            
            if (formulaTxt) {
                var formulaToken = new FAM.FunctionToken();
                
                if (FAM.DeprFormula.parseFormula(formulaTxt, formulaToken)) {
                	var renderredFormula = FAM.DeprFormula.renderFormula(formulaToken);
                    nlapiSetFieldValue(DEPR_METHOD_HTML_FORMULA, renderredFormula);
                }
                else {
                    nlapiSetFieldValue(DEPR_METHOD_HTML_FORMULA,
                        this.messages.ALERT_FORMULA_VALIDATION_FAILED);
                    alert(this.messages.ALERT_FAILED_TO_VALIDATE2);
                    return false;
                }
            }
        }
        
        else if (name == DEPR_METHOD_PERIOD) {
        	if (hasDP && (deprPeriod == FAM.DeprPeriod.Annually)) {
            	alert(this.messages.ALERT_DP_ANNUALLY_INVALID);
            	return false;
            }
        }
        
        return true;
    };
};
