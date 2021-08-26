/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.AT = VAT.EU.ESL.AT || {};

VAT.EU.ESL.AT.Report = function _ATReport(baseDetails, countryDetails) {
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
        logException(e, 'VAT.EU.ESL.AT.Report');
        throw e;
    }
};

VAT.EU.ESL.AT.Report.prototype = Object.create(VAT.EU.ESL.BaseReport.prototype);

VAT.EU.ESL.AT.DataAdapter = function _ATDataAdapter() {
    VAT.EU.ESL.Adapter.SalesReportAdapter.call(this);
};

VAT.EU.ESL.AT.DataAdapter.prototype = Object.create(VAT.EU.ESL.Adapter.SalesReportAdapter.prototype);

VAT.EU.ESL.AT.DataAdapter.prototype.createDataRows = function _createDataRows(currentNode, countryNode, countryCode, lineNumber) {
	if (!currentNode) {
		throw nlapiCreateError('MISSING_ARGUMENT', 'currentNode is required');
	}
	
	if (!countryNode) {
		throw nlapiCreateError('MISSING_ARGUMENT', 'countryNode is required');
	}
	
    var params = {
        lineNumber: lineNumber,
        countryCode: countryCode,
        amount: 0,
        indicator: '',
        customerName: currentNode.entityname,
        vatNo: currentNode.vatno,
        tranNo: '',
        tranDate: '',
        tranType: '',
        nexus: this.params.nexus
    };
    
    var servicestotal = parseFloat(countryNode.servicesamount) + parseFloat(countryNode.returnservicesamount);
    var goodstotal = parseFloat(countryNode.goodsamount) + parseFloat(countryNode.returngoodsamount);
    var triangulatedgoodstotal = parseFloat(countryNode.trianglegoodsamount) + parseFloat(countryNode.returntrianglegoodsamount);
    
    if (servicestotal != 0) {
        params.amount = servicestotal;
        params.lineNumber++;
        params.indicator = this.params.indicatorMap.services;
        this.output.push(this.createDataRow(params));
    }
    
    if (goodstotal != 0) {
        params.amount = goodstotal;
        params.lineNumber++;
        params.indicator = this.params.indicatorMap.goods;
        this.output.push(this.createDataRow(params));
    }
    
    if (triangulatedgoodstotal != 0) {
        params.amount = triangulatedgoodstotal;
        params.lineNumber++;
        params.indicator = this.params.indicatorMap.triangulation;
        this.output.push(this.createDataRow(params));
    }
    
    return params.lineNumber;
};

VAT.EU.ESL.AT.DataFormatter = function _ATDataFormatter() {
    VAT.EU.BaseDataFormatter.call(this);
};

VAT.EU.ESL.AT.DataFormatter.prototype = Object.create(VAT.EU.BaseDataFormatter.prototype);

VAT.EU.ESL.AT.DataFormatter.prototype.formatData = function _formatData() {
    try {
        this.setColumnProperty('align');
        this.setDecimalPlaces(0, 'amount');
    } catch (e) {
        logException(e, 'VAT.EU.ESL.AT.DataFormatter.formatData');
        throw e;
    }
};

VAT.EU.ESL.AT.ExportAdapter = function _ATExportAdapter() {
	VAT.EU.ESL.ExportAdapter.call(this);
};
VAT.EU.ESL.AT.ExportAdapter.prototype = Object.create(VAT.EU.ESL.ExportAdapter.prototype);

VAT.EU.ESL.AT.ExportAdapter.prototype.getFileData = function _getFileData(report, header, params) {
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
	
	for(var i = 0; i < fileData.data.length; i++) {
		fileData.data[i].amount.value = padAmount.call(this, fileData.data[i].amount.value, 10);
	}	
	
	return fileData;
	
	function padAmount(amount, size) {
		var str = '0000000000' + Math.abs(amount);
		return amount >= 0? str.substr(str.length-size): '-' + str.substr(str.length-size +1); 
	}
};

VAT.EU.ESL.AT.ExportAdapter.prototype.getHeaderData = function _getHeaderData(fileData, report, params) {
	
    if (!fileData) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'fileData is required');
    }

    if (!report) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'report is required');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }

    var timestamp = new Date();
    var newHeader = fileData.header;
    newHeader.startPeriod = report.period.from.GetStartDate().toString('yyyy-MM');
    newHeader.endPeriod = report.period.to.GetEndDate().toString('yyyy-MM');
    newHeader.datum = timestamp.toString("yyyy-MM-dd");
	newHeader.uhrzeit = timestamp.toString("HH:mm:ss");

	var vatConfigData = new VAT.Configuration().getHeaderConfigOverrides(params.subsidiary, report.nexus);
	newHeader.taxno = vatConfigData ? vatConfigData.taxreg : '';
	
	return newHeader;
};
