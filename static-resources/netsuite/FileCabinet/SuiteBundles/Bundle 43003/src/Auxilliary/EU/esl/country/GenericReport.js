/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.Generic = VAT.EU.ESL.Generic || {};

VAT.EU.ESL.Generic.Report = function _GenericReport(baseDetails, countryDetails) {
    if (!baseDetails) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'baseDetails is required');
    }
    
    if (!countryDetails) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'countryDetails is required');
    }
    
    VAT.EU.ESL.BaseReport.call(this);
    
    try {
        this.initializeBaseDetails(baseDetails);
        this.supplementCountryDetails(countryDetails);
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Generic.Report');
        throw e;
    }
};

VAT.EU.ESL.Generic.Report.prototype = Object.create(VAT.EU.ESL.BaseReport.prototype);

VAT.EU.ESL.Generic.DataFormatter = function _GenericDataFormatter() {
    VAT.EU.BaseDataFormatter.call(this);
};

VAT.EU.ESL.Generic.DataFormatter.prototype = Object.create(VAT.EU.BaseDataFormatter.prototype);

VAT.EU.ESL.Generic.DataFormatter.prototype.formatData = function _formatData() {
    try {
        this.setColumnProperty('align');
        this.setDecimalPlaces(0, 'amount');
    } catch (e) {
        logException(e, 'VAT.EU.ESL.Generic.DataFormatter.formatData');
        throw e;
    }
    
};