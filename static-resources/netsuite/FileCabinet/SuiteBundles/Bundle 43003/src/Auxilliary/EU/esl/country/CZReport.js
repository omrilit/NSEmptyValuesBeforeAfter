/**
 * Copyright © 2015, Oracle and/or its affiliates. All rights reserved.
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.CZ = VAT.EU.ESL.CZ || {};

VAT.EU.ESL.CZ.DataFormatter = function _CZDataFormatter() {
    VAT.EU.BaseDataFormatter.call(this);
};

VAT.EU.ESL.CZ.DataFormatter.prototype = Object.create(VAT.EU.BaseDataFormatter.prototype);

VAT.EU.ESL.CZ.DataFormatter.prototype.formatData = function _formatData() {
    try {
        this.setColumnProperty('align');
        this.setDecimalPlaces(0, 'amount');
    } catch (e) {
        logException(e, 'VAT.EU.ESL.CZ.DataFormatter.formatData');
        throw e;
    }
};


VAT.EU.ESL.CZ.Report = function _CZReport(baseDetails, countryDetails) {
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
        this.initializeSetupTaxFilingDetails();
    } catch (e) {
        logException(e, 'VAT.EU.ESL.CZ.Report');
        throw e;
    }
};

VAT.EU.ESL.CZ.Report.prototype = Object.create(VAT.EU.ESL.BaseReport.prototype);

VAT.EU.ESL.CZ.Report.prototype.initializeSetupTaxFilingDetails = function() {
	this.Name = 'Czech Republic';
	this.CountryCode = 'CZ';
};

VAT.EU.ESL.CZ.ReportAdapter = function _CZReportAdapter() {
};

VAT.EU.ESL.CZ.ReportAdapter.prototype = Object.create(VAT.EU.ESL.ReportAdapter.prototype);

VAT.EU.ESL.CZ.ReportAdapter.prototype.convertToColumns = function _convertToColumns(columns, header) {
    if (!columns) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'columns is required');
    }
    
    if (!header) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'header is required');
    }

    var validColumns = [];
    var column;

    for (var i = 0; i < columns.length; i++) {
        column = columns[i];

        if (column.id == 'cancel' && header.shvies_forma != 'N') {
        	continue;
        }
        validColumns.push(column);
    }

    return validColumns;
};

VAT.EU.ESL.CZ.ReportAdapter.prototype.convertToHeader = function _convertToHeader(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    var header = VAT.EU.ESL.ReportAdapter.prototype.convertToHeader.call(this, params);

	var prepend = params.report.language == 'ENG' ? 'Corrective ' : 'N&#225;sledn&#233; ';

	if (header.shvies_forma == 'N') {
		header.reportName = prepend + header.reportName;
	}
	
	return header;
};


VAT.EU.ESL.CZ.DataAdapter = function _CZDataAdapter() {
    VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.call(this);
};

VAT.EU.ESL.CZ.DataAdapter.prototype = Object.create(VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.prototype);

VAT.EU.ESL.CZ.DataAdapter.prototype.transformData = function _transformData() {
	var output = VAT.EU.ESL.Adapter.SalesTransactionReportAdapter.prototype.transformData.call(this);

	var newoutput = {};
	var objRowList = [];
	var tempOutput;
	var lineNumber = 1;

	for(var irow =  0; irow < output.length; irow++) {
		var row = output[irow];
		var amount = row.amount.value;

		if (newoutput[row.customerName.value] && !newoutput[row.customerName.value][row.indicator.value]) {
			newoutput[row.customerName.value][row.indicator.value] = row;
			
			tempOutput = newoutput[row.customerName.value][row.indicator.value];
			tempOutput.lineNumber.value = lineNumber++;
			tempOutput.amount.value = 0;
			tempOutput.transactionCount.value = 0;
			objRowList.push(tempOutput);
		} else if (!newoutput[row.customerName.value]) {
			newoutput[row.customerName.value] = {};
			newoutput[row.customerName.value][row.indicator.value] = row;

			tempOutput = newoutput[row.customerName.value][row.indicator.value];
			tempOutput.lineNumber.value = lineNumber++;
			tempOutput.amount.value = 0;
			tempOutput.transactionCount.value = 0;
			objRowList.push(tempOutput);
		} else {
			tempOutput = newoutput[row.customerName.value][row.indicator.value];
		}

		if (tempOutput) {
			tempOutput.amount.value += amount; 
			tempOutput.transactionCount.value += 1;
		}
	}

	this.output = objRowList;
	return this.output;
};


VAT.EU.ESL.CZ.ExportAdapter = function _CZExportAdapter() {
	VAT.EU.ESL.ExportAdapter.call(this);
};

VAT.EU.ESL.CZ.ExportAdapter.prototype = Object.create(VAT.EU.ESL.ExportAdapter.prototype);

VAT.EU.ESL.CZ.ExportAdapter.prototype.getFileData = function _getFileData(report, header, params) {
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

VAT.EU.ESL.CZ.ExportAdapter.prototype.getHeaderData = function _getHeaderData(fileData, report, params) {
    if (!fileData) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'fileData is required');
    }

    if (!report) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'report is required');
    }

    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }

    var header = fileData.header;
    var data = fileData.data;
    var startPeriodDate = new SFC.System.TaxPeriod(params.periodfrom);
    var overrideConfig = new VAT.Configuration().getHeaderConfigOverrides(params.subsidiary, report.nexus);

    for (var config in overrideConfig) {
    	if (config == 'vatno') {
    		header.vatNo = overrideConfig.vatno;
    	} else if (overrideConfig[config]) {
    		header[config] = overrideConfig[config];
    	}
    }
    
    header.birthdate = '';
	if (config.zast_birthdate) {
		header.birthdate = ['zast_dat_nar="', Date.parseExact(config.zast_birthdate, 'MM/dd/yyy').toString('dd.MM.yyyy'), '"'].join('');
	}

	header.reportNamePrepend = '';
	if (header.shvies_forma == 'N') {
		header.reportNamePrepend = report.language == 'ENG' ? 'Corrective ' : 'N&#225;sledn&#233; ';
	}
	header.taxMonth = startPeriodDate.GetStartDate().getMonth() + 1;
	header.taxYear = startPeriodDate.GetStartDate().getFullYear();
	header.totalLine = data.length;
	header.totalPage = Math.ceil(header.totalLine / 20);
	header.currentDate = this.getCurrentDate();
	header.taxQuarter = Math.ceil(header.taxMonth / 3);

	return header;
};

VAT.EU.ESL.CZ.ExportAdapter.prototype.getCurrentDate = function _getCurrentDate() {
	return (new Date()).toString("dd.MM.yyyy");
};