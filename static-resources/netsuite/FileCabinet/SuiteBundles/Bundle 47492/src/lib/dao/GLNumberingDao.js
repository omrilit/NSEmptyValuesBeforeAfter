/**
 * Copyright 2016 NetSuite Inc. User may not copy, modify, distribute, or
 * re-bundle or otherwise make available this code.
 */

var TAF = TAF || {};
TAF.DAO = TAF.DAO || {};

TAF.DAO.GLNumberingDao = function _GLNumberingDao(params) {
    this.params = params;
    this.isGLSupportedInPeriod = (params.startDate.getFullYear() >= params.requiredGLYear);
    this.isGLEnabled = nlapiGetContext().getFeature('GLAUDITNUMBERING');
};

TAF.DAO.GLNumberingDao.prototype.isGLNumberingFeatureSupported = function _isGLNumberingFeatureSupported() {
    if (!this.isGLSupportedInPeriod) {
        return true;
    }
    
    return this.isGLEnabled;
};

TAF.DAO.GLNumberingDao.prototype.isGLNumberingCompleted = function _isGLNumberingCompleted(periodId) {
    if (!this.isGLSupportedInPeriod) {
        return true;
    }
    
    if (!this.isGLEnabled) {
        return false;
    }

    try {
        var isValid = true;
        
        nlapiLogExecution('DEBUG', 'GLNumberingDao:periodId', periodId);
        
        var filters = periodId ? [new nlobjSearchFilter('postingperiod', null, 'is', periodId)] : 
            [new nlobjSearchFilter('internalid', 'accountingperiod', 'anyof', this.params.periodIdList)];
        
        if (this.params.subsidiaryIdList && (this.params.subsidiaryIdList.length > 0)) {
            filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', this.params.subsidiaryIdList));
        }
        
        if (this.params.bookId) {
            filters.push(new nlobjSearchFilter('accountingbook', 'accountingtransaction', 'is', this.params.bookId));
        }
        
        var sr = nlapiSearchRecord('transaction', 'customsearch_taf_glnumbering', filters);
        for (var isr = 0; sr && isr < sr.length; isr++) {
            var result = sr[isr];
            if (!result.getValue('glsequenceid', null, 'GROUP') && result.getValue('posting', null, 'GROUP') == 'T') {
                isValid = false;
                break;
            }
        }
        
        return isValid;
    } catch (ex) {
        nlapiLogExecution('ERROR', 'GLNumberingDao.isGLNumberingCompleted', ex.toString());
        throw ex;
    }    
};
