/**
 * Copyright © 2006, 2017, Oracle and/or its affiliates. All rights reserved. 
 */

var VAT = VAT || {};
VAT.EU = VAT.EU || {};
VAT.EU.ESL = VAT.EU.ESL || {};
VAT.EU.ESL.BE = VAT.EU.ESL.BE || {};

/**
 * Report Class
 */
VAT.EU.ESL.BE.Report = function _BEReport(baseDetails, countryDetails) {
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
        logException(e, 'VAT.EU.ESL.BE.Report');
        throw e;
    }
};

VAT.EU.ESL.BE.Report.prototype = Object.create(VAT.EU.ESL.BaseReport.prototype);


VAT.EU.ESL.BE.ReportAdapter = function _BEReportAdapter() {
};

VAT.EU.ESL.BE.ReportAdapter.prototype = Object.create(VAT.EU.ESL.ReportAdapter.prototype);

VAT.EU.ESL.BE.ReportAdapter.prototype.convertToFields = function _convertToFields(params) {
    if (!params) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToFields: Please provide the required params paramter.');
    }

    if (!params.report) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToFields: Please provide the required params.report paramter.');
    }

    if (!params.report.fields) {
        throw nlapiCreateError('MISSING_REQUIRED_PARAMETER', 'VAT.EU.ESL.ReportAdapter.convertToFields: Please provide the required params.report.fields paramter.');
    }

    var report = params.report;
    var fields = report.fields;
    var context = nlapiGetContext();
    var isOneWorld = context.getFeature('SUBSIDIARIES');
    var isMBA = context.getFeature('MULTIBOOK');
    var validFields = [];

    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];

        if ((!isOneWorld && (field.id == 'subsidiary' || field.id == 'group' || field.id == 'bookid')) || !isMBA && field.id == 'bookid') {
            continue;
        }

        switch(field.id) {
            case 'subsidiary':
                field.value = params.subsidiary;
                field.data = [];

                for (var j = 0; j < params.subsidiarylist.length; j++) {
                    field.data.push({
                        id: params.subsidiarylist[j].id,
                        text: params.subsidiarylist[j].name
                    });
                }
                break;
            case 'group':
                field.data = params.group;
                field.value = params.group;
                break;
            case 'countryform':
                field.data = params.countryformslist;
                field.value = params.countryform;
                break;
            case 'periodfrom':
                field.data = params.taxperiodlist;
                field.value = params.periodfrom;
                break;
            case 'periodto':
                field.data = params.taxperiodlist;
                field.value = params.periodto;
                break;
            case 'constants':
                field.data = JSON.stringify(params.constants);
                break;
            case 'bookid':
                field.value = params.bookid;
                field.data = [];
                for (var book in params.books) {
                    field.data.push({
                        id: book,
                        text: params.books[book].name
                    });
                }
                break;
            case 'help':
                // do nothing
                break;
            case 'refreshflag':
                // do nothing
                break;
            case 'yearperiods' :
                field.value = 'yearperiods';
                var yearPeriods = [];
                for(var i = 0; i < params.taxperiodlist.length; i++){
                    if(params.taxperiodlist[i].GetType() != 'month' &&
                       params.taxperiodlist[i].GetType() != 'quarter'){
                        yearPeriods.push(params.taxperiodlist[i].id);
                    }
                }
                field.data = JSON.stringify(yearPeriods);
                break;
            default:
                nlapiLogExecution('AUDIT', 'VAT.EU.ESL.ReportAdapter.convertToFields: Unsupported field', field.id);
        }

        validFields.push(field);
    }

    return validFields;
};


/**
 * Data Formatter Class
 */
VAT.EU.ESL.BE.DataFormatter = function _BEDataFormatter() {
    VAT.EU.BaseDataFormatter.call(this);
};

VAT.EU.ESL.BE.DataFormatter.prototype = Object.create(VAT.EU.BaseDataFormatter.prototype);

VAT.EU.ESL.BE.DataFormatter.prototype.formatData = function _formatData() {
    try {
        this.setColumnProperty('align');
        this.setDecimalPlaces(2, 'amount');
    } catch (e) {
        logException(e, 'VAT.EU.ESL.BE.DataFormatter.formatData');
        throw e;
    }
};

VAT.EU.ESL.BE.ExportAdapter = function _BEExportAdapter() {
    VAT.EU.ESL.ExportAdapter.call(this);
};
VAT.EU.ESL.BE.ExportAdapter.prototype = Object.create(VAT.EU.ESL.ExportAdapter.prototype);

VAT.EU.ESL.BE.ExportAdapter.prototype.getFileData = function _getFileData(report, header, params) {
    if (!report) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'report is required');
    }
    
    if (!report.data) {
        throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A report.data object is requried.');
    }

    if (!header) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'header is required');
    }

    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    var data = report.data.body;
    var exportData = this.prepareExportData(data, report, params);
    
    var fileData = {fileFormat: params.fileFormat,
                    fileType: this.getFileType(params.fileFormat),
                    fileName: this.getFileName(report, params),
                    folderId: params.folderId,
                    header: this.prepareHeaderData(header, params.subsidiary, report.nexus),
                    data: exportData.data,
                    totalAmount: exportData.totalAmount,
                    totalTransactions: exportData.totalTransactions,
                    totalCustomers: exportData.totalCustomers,
                    hasMissingVatNo: exportData.hasMissingVatNo};
    
    fileData.header = this.getHeaderData(fileData, report, params);
    
    return fileData;
};

VAT.EU.ESL.BE.ExportAdapter.prototype.getHeaderData = function _getHeaderData(fileData, report, params) {
    
    if (!fileData) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'fileData is required');
    }

    if (!report) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'report is required');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_ARGUMENT', 'params is required');
    }
    
    var context = nlapiGetContext();
    var isOneWorld = context.getFeature('SUBSIDIARIES');

    var country = isOneWorld ? new VAT.EU.DAO.SubsidiaryDAO().getByID(params.subsidiary) : new VAT.EU.DAO.CompanyDAO().search();
    var timestamp = new Date();
    var newHeader = fileData.header;
    
    var companyAddress = {}; 
    companyAddress.street = country.addr1 + (country.addr2?' ' + country.addr2 : '');
    companyAddress.city = country.city;
    companyAddress.zip = country.zip;
    companyAddress.countryCode = country.countryCode;
    companyAddress.phone = country.phone;
    companyAddress.email = country.email;
  
    newHeader.address = companyAddress;
    
    var periodDate = report.period.from.GetStartDate();
//    newHeader.endPeriod = report.period.to.GetEndDate().toString('yyyy-MM');

    var periodType = report.period.from.GetType();
    switch(report.period.from.GetType()){
        case 'month'    : 
                newHeader.periodType = 'Month';
                newHeader.periodSeq = periodDate.getMonth() + 1;
                break;
        case 'quarter'  : 
                newHeader.periodType = 'Quarter';
                newHeader.periodSeq = Math.floor(periodDate.getMonth()/3) + 1;
                break;
    }
    
    newHeader.periodYear = periodDate.getFullYear();
    
    var vatConfigData = new VAT.Configuration().getHeaderConfigOverrides(params.subsidiary, report.nexus);
    newHeader.taxno = vatConfigData ? vatConfigData.taxreg : '';
    
    return newHeader;
};

VAT.EU.ESL.BE.ExportAdapter.prototype.prepareExportData = function prepareExportData(data, report, params) {
    if (!data) {
        throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A data object is requried.');
    }
    
    if (!report) {
        throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A report object is requried.');
    }
    
    if (!params) {
        throw nlapiCreateError('MISSING_REQ_PARAMETER', 'A params object is requried.');
    }
    
    var totalAmount = 0;
    var totalTransactions = 0;
    var customerCache = {};
    var excludeCache = JSON.parse(params.excludeCache || '{}');
    var indicatorCache = JSON.parse(params.indicatorCache || '{}');
    var cancelCache = JSON.parse(params.cancelCache || '{}');
    var indicatorMap = this.getIndicatorMap(report);
    var lineNumber = '';
    var exportData = [];
    var hasMissingVatNo = false;
    var actualLineNumber = 0;
    
    for (var i = 0; i < data.length; i++) {
        lineNumber = data[i].lineNumber.value;
        
        if ((excludeCache[lineNumber] == undefined && !data[i].exclude.value) || (excludeCache[lineNumber] != undefined && !excludeCache[lineNumber])) {
            if (!data[i].vatNumber.value) {
                hasMissingVatNo = true;
            }
            
            data[i].indicator.value = indicatorCache[lineNumber] != undefined ? indicatorCache[lineNumber] : data[i].indicator.value;
            data[i].indicator.text = indicatorMap[data[i].indicator.value];
            data[i].cancel.value = cancelCache[lineNumber] != undefined ? cancelCache[lineNumber] : data[i].cancel.value;
            data[i].pageNumber.value = Math.ceil(lineNumber / 20);
            data[i].amount.value = parseFloat(data[i].amount.value).toFixed(2);
            totalAmount += parseFloat(data[i].amount.value);
            totalTransactions += (data[i].transactionCount.value || 0);
            
            data[i].lineNumber.value = ++actualLineNumber;
            if(!customerCache[data[i].customerName.value]){
                customerCache[data[i].customerName.value] = 1;}
            else{
                customerCache[data[i].customerName.value] = ++customerCache[data[i].customerName.value];
            }
            exportData.push(data[i]);
        }
    }
    
    return {
        data: exportData,
        totalAmount: totalAmount.toFixed(2),
        hasMissingVatNo: hasMissingVatNo,
        totalTransactions: totalTransactions,
        totalCustomers: Object.keys(customerCache).length
    };
};

VAT.EU.ESL.BE.ExportAdapter.prototype.getIndicatorMap = function _getIndicatorMap(report) {
    
    var map = {
            "0" : "L",
            "3" : "S",
            "2" : "T"
        }
    
    return map;
};