/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.IE = VAT.EU.ESL.IE || {};

VAT.EU.ESL.IE.DataFormatter = function _IEDataFormatter() {
    VAT.EU.BaseDataFormatter.call(this);
};

VAT.EU.ESL.IE.DataFormatter.prototype = Object.create(VAT.EU.BaseDataFormatter.prototype);

VAT.EU.ESL.IE.DataFormatter.prototype.formatData = function _formatData() {
    try {
        this.setColumnProperty('align');
        this.setDecimalPlaces(0, 'amount');
    } catch (e) {
        logException(e, 'VAT.EU.ESL.IE.DataFormatter.formatData');
        throw e;
    }
};


VAT.EU.ESL.IE.Report = function _IEReport(baseDetails, countryDetails) {
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
        logException(e, 'VAT.EU.ESL.IE.Report');
        throw e;
    }
};
VAT.EU.ESL.IE.Report.prototype = Object.create(VAT.EU.ESL.BaseReport.prototype);

VAT.EU.ESL.IE.ExportAdapter = function _IEExportAdapter() {
	VAT.EU.ESL.ExportAdapter.call(this);
};
VAT.EU.ESL.IE.ExportAdapter.prototype = Object.create(VAT.EU.ESL.ExportAdapter.prototype);

VAT.EU.ESL.IE.ExportAdapter.prototype.getFileData = function _getFileData(report, header, params) {
    if (!report) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'report is required');
    }

    if (!header) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'header is required');
    }

    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }

	var fileData = VAT.EU.ESL.ExportAdapter.prototype.getFileData.call(this, report, header, params);
	fileData.header = this.getHeaderData(fileData, report, params);
    return fileData;
};

VAT.EU.ESL.IE.ExportAdapter.prototype.getHeaderData = function _getHeaderData(fileData, report, params) {
    if (!fileData) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'fileData is required');
    }

    if (!report) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'report is required');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }

    var returnType = 'Monthly';
    if (report.period.from.GetType() == report.period.to.GetType() && report.period.from.GetType() == 'quarter') {
    	returnType = 'Quarterly';
    } else if (report.period.from.GetType() == report.period.to.GetType() && report.period.from.GetType() == 'year') {
    	returnType = 'Annual-A1';
    } else if (report.period.from.GetId() != report.period.to.GetId() && (report.period.from.GetType() == 'month' || report.period.to.GetType() == 'month')) {
    	returnType = 'Quarterly';
    }
    
    var newHeader = fileData.header;
    newHeader.startPeriod = report.period.from.GetStartDate().toString('dd/MM/yyyy');
    newHeader.endPeriod = report.period.to.GetEndDate().toString('dd/MM/yyyy');
    newHeader.period = report.period.from.GetStartDate().toString('dd MMM yy') + ' - ' + report.period.to.GetEndDate().toString('dd MMM yy');
    newHeader.returnType = returnType;
	return newHeader;
};

