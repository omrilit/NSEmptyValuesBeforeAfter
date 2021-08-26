/**

 * Copyright © 2014, Oracle and/or its affiliates. All rights reserved.

 */



VAT.ReportData = function(params) {

    // Report-specific

    this.languageCode = params.languageCode;

    this.periodFrom = params.periodFrom;

    this.periodTo = params.periodTo;

    this.subId = params.subId;

    this.isConsolidated = params.isConsolidated;

    this.saleCacheId = params.saleCacheId;

    this.purchaseCacheId = params.purchaseCacheId;

    this.className = params.className;

    this.bookId = params.bookId;

    this.locationId = params.locationId;

    params.nexus = this.CountryCode;

    params.taxCodeDefs = new VAT.TaxcodeDefinitions(this.CountryCode, this.TaxDefinition);

	var taxConfig = nlapiLoadConfiguration('taxpreferences');
	var countryCode = null;
	var columns = [];
	columns.push(new nlobjSearchColumn('internalid'));
	columns.push(new nlobjSearchColumn('country'));
	var search = nlapiSearchRecord('nexus', null, new nlobjSearchFilter('country', null, 'is', this.CountryCode), columns);
	countryCode = search[0].getValue('country').toLowerCase();
	params.nexusId = search[0].getValue('internalid');
	params.isCashBasisReporting = taxConfig.getFieldValue('cashbasisreporting' + countryCode);
    
    this.params = params;

    this.otherParams = params.otherParams;

    this.userInfo = params.userInfo;

    //same with Setup Taxes > Rounding options
    this.roundPrecision = params.roundPrecision ? Number(params.roundPrecision) : ''; //.01, .1, 1, 10, 100
    this.roundMethod = params.roundMethod || ''; //roundoff, rounddown, roundup


    this.DataReader = new VAT.DataReader(params);

    this.DataHeader = new VAT.DataHeader(params);
};



VAT.ReportData.prototype.GetReportData = function() {
    var data = this.RoundAmounts(this.GetData());
    var headerData = this.GetHeaderData(this.languageCode);

    return this.ProcessReportData(data, headerData);

};



VAT.ReportData.prototype.ProcessReportData = function(data, headerData) {

    return {};

};



VAT.ReportData.prototype.GetHeaderData = function() {

    return this.DataHeader;

};



VAT.ReportData.prototype.GetData = function() {

    return {};

};

VAT.ReportData.prototype.GetRGLData = function() {
    return {summary: {netAmount: 0}, details: []};
};

VAT.ReportData.prototype.GetAdjustmentMetaData = function() {

    return {

        TaxDefinition: this.TaxDefinition,

        TaxMap: this.TaxMap

    };

};



VAT.ReportData.prototype.GetDrilldownData = function(boxNumber) {

    return {};

};



VAT.ReportData.prototype.GetPrintData = function() {

    var reportData = this.GetReportData();

    return this.ProcessPrintData(reportData);

};



VAT.ReportData.prototype.ProcessPrintData = function(reportData) {

    for (var k in this.otherParams) {

        if (this.otherParams[k]) {

            reportData[k] = this.otherParams[k];

        } else {

            reportData[k] = '&nbsp;';

        }

    }



    reportData.library = _App.GetLibraryFile(VAT.LIB.FORMAT).getValue();



    return reportData;

};



VAT.ReportData.prototype.GetExportData = function() {

    var reportData = this.GetReportData();

    return this.ProcessExportData(reportData);

};



VAT.ReportData.prototype.ProcessExportData = function(reportData) {

    return {};

};

VAT.ReportData.prototype.RoundAmounts = function(data) {
    if (!this.roundPrecision || !this.roundMethod) {
        return data;
    }
    
    var roundMethods = {roundoff: 'round', rounddown: 'floor', roundup: 'ceil'};
    var roundMethod = roundMethods[this.roundMethod];
    var roundPrecisions = {.01: 2, .1: 1, 1: 0, 10: -1, 100: -2};
    var roundPrecision = roundPrecisions[this.roundPrecision];
    var roundedData = {};

    for (var box in data) {
        roundedData[box] = this.RoundAmount(data[box], roundPrecision, roundMethod);
    }
    return roundedData;
};

VAT.ReportData.prototype.RoundAmount = function(amount, roundPrecision, roundMethod) {
    if (isNaN(amount) || ((roundPrecision === null || roundPrecision === undefined) || !roundMethod)) {
        return amount;
    }
    
    var value = Math.abs(amount);
    // Shift
    value = value.toString().split('e');
    value = Math[roundMethod](+(value[0] + 'e' + (value[1] ? (+value[1] + roundPrecision) : +roundPrecision)));
    
    // Shift back
    value = value.toString().split('e');
    value = +(value[0] + 'e' + (value[1] ? (+value[1] - roundPrecision) : -roundPrecision));

    if (amount < 0) {
        value *= -1;
    }

    return value;
};

