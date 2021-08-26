/**
 * © 2017 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

var psa_prm;
if (!psa_prm) psa_prm = {};

psa_prm.ResourceSearchFormCS = new function ResourceSearchFormCS() {
    
    this.clientInit = function(type) {
        this._clientInit(window.opener, window.location);
    };
    
    this._clientInit = function(opener, location) {
        this.translation = opener.PRM.Translation;
        this.raForm = opener.PRM.App.Forms.allocationNS;
        this.taForm = opener.PRM.App.Forms.taskAssignment;
        
        nlapiSetFieldValue('origin', location.origin);
    };
    
    this.selectResource = function(resourceId, isTaskAssignment) {
        if (isTaskAssignment) {
            this.taForm.form.nlapiSetFieldValue('resource', resourceId);
        } else {
            this.raForm.form.nlapiSetFieldValue('allocationresource', resourceId);
        }
        
        window.close();
    };
    
    this.resetFields = function() {
        var resetValues = JSON.parse(nlapiGetFieldValue('reset_values'));
        
        nlapiSetFieldValue('from_date', nlapiDateToString(new Date(resetValues.fromDate)));
        nlapiSetFieldValue('to_date', nlapiDateToString(new Date(resetValues.toDate)));
        nlapiSetFieldValue('percent_available', resetValues.percentAvailable ? resetValues.percentAvailable : '');
        nlapiSetFieldValue('billing_class', resetValues.billingClass ? resetValues.billingClass : '');
        nlapiSetFieldValue('max_labor_cost', resetValues.maxLaborCost ? resetValues.maxLaborCost : '');
        nlapiSetFieldValue('min_yrs_of_exp', resetValues.minYrsOfExp ? resetValues.minYrsOfExp : '');
        nlapiSetFieldValues('skills', resetValues.skills ? resetValues.skills : []);
        nlapiSetFieldValue('skill_names', resetValues.skillNames ? JSON.stringify(resetValues.skillNames) : '[]');
    };
    
    this.clientSave = function() {
        nlapiSetFieldValue('skill_names', JSON.stringify(nlapiGetFieldTexts('skills')));
        
        return true;
    };
    
    this.fieldChange = function(type, name) {
        switch (name) {
            case 'from_date':
                var fromDate = nlapiStringToDate(nlapiGetFieldValue('from_date')),
                    toDate   = nlapiStringToDate(nlapiGetFieldValue('to_date'));
                
                if (fromDate.getTime() > toDate.getTime()) {
                    alert(this.translation.getText('ALERT.INVALID_START_DATE_GREATER_THAN_END_DATE'));
                    nlapiSetFieldValue('from_date', nlapiDateToString(toDate));
                    return false;
                }
                break;
            case 'to_date':
                var fromDate = nlapiStringToDate(nlapiGetFieldValue('from_date')),
                    toDate   = nlapiStringToDate(nlapiGetFieldValue('to_date'));
            
                if (fromDate.getTime() > toDate.getTime()) {
                    alert(this.translation.getText('ALERT.INVALID_END_DATE_LESS_THAN_START_DATE'));
                    nlapiSetFieldValue('to_date', nlapiDateToString(fromDate));
                    return false;
                }
                break;
            case 'max_labor_cost':
            case 'min_yrs_of_exp':
                if (Number(nlapiGetFieldValue(name)) < 0 ) {
                    alert(this.translation.getText('ALERT.INVALID_LESS_THAN_ZERO'));
                    return false;
                }
                break;
            case 'percent_available':
                var percent = Number(nlapiGetFieldValue(name));
                if (percent < 0 || percent > 100) {
                    alert(this.translation.getText('ALERT.INVALID_PERCENTAGE_MUST_BE_BETWEEN_0_AND_100'));
                    return false;
                }
                break;
        }
        
        return true;
    };
};